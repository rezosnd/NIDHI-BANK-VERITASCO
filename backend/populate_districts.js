require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function populateDistricts() {
  console.log('Fetching Indian states and districts from API...');
  try {
    const response = await fetch('https://raw.githubusercontent.com/sab99r/Indian-States-And-Districts/master/states-and-districts.json');
    const data = await response.json();
    
    // data is an object: { "states": [ { "state": "...", "districts": ["...", "..."] }, ... ] }
    const statesData = data.states;
    
    console.log(`Fetched ${statesData.length} states/UTs data. Populating...`);
    let totalDistricts = 0;
    
    for (const stateObj of statesData) {
      let stateName = stateObj.state;
      // Some names might need mapping to match what's in our DB
      if (stateName === 'Andaman and Nicobar Islands') stateName = 'Andaman and Nicobar Islands';
      // Just try to find the state in the DB
      const stateRes = await pool.query('SELECT id FROM states WHERE state_name ILIKE $1 LIMIT 1', [stateName]);
      
      let stateId;
      if (stateRes.rows.length === 0) {
        // If state doesn't exist, insert it
        const newSt = await pool.query("INSERT INTO states (state_name, type) VALUES ($1, 'State') RETURNING id", [stateName]);
        stateId = newSt.rows[0].id;
      } else {
        stateId = stateRes.rows[0].id;
      }
      
      const districts = stateObj.districts;
      for (const dist of districts) {
        await pool.query(
          "INSERT INTO districts (district_name, state_id) VALUES ($1, $2) ON CONFLICT (district_name, state_id) DO NOTHING",
          [dist, stateId]
        );
        totalDistricts++;
      }
    }
    
    console.log(`Successfully populated ${totalDistricts} districts in India!`);
    process.exit(0);
  } catch (error) {
    console.error('Error populating districts:', error);
    process.exit(1);
  }
}

populateDistricts();
