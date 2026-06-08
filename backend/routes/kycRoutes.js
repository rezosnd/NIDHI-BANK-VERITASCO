const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// ==========================================
// KYC Verification API
// ==========================================

router.get('/kyc/verify/:memberId', async (req, res) => {
  const { memberId } = req.params;
  const { documentId } = req.query;
  
  try {
    const { rows } = await pool.query("SELECT * FROM customers WHERE cif_number = $1", [memberId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Member ID not found' });
    }
    const customer = rows[0];
    let details = {};
    try { details = JSON.parse(customer.details) || {}; } catch(e) {}
    
    let isVerified = false;
    let documentName = '';
    
    if (documentId === '32') { // Aadhar
      documentName = 'Aadhar Card';
      if (customer.aadhar_number || details.aadhar || details.kycAadhaar) isVerified = true;
    } else if (documentId === '7') { // PAN
      documentName = 'PAN Card';
      if (customer.pan_number || details.panNo || details.kycPan) isVerified = true;
    } else if (documentId === '10') { // Driving License
      documentName = 'Driving License';
      if (details.kycDriving || details.drivingLicense) isVerified = true;
    } else if (documentId === '6') { // Voter ID
      documentName = 'Voter ID Card';
      if (details.kycVoterId || details.voterId) isVerified = true;
    } else {
      return res.status(400).json({ success: false, message: 'Invalid Document ID' });
    }
    
    if (isVerified) {
      res.json({ success: true, message: \`KYC for \${documentName} is Verified\`, memberName: \`\${customer.first_name} \${customer.last_name}\` });
    } else {
      res.json({ success: false, message: \`\${documentName} details not found for this member.\` });
    }
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/kyc/pending-documents', async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT id, cif_number, first_name, last_name, phone_number, created_at, aadhar_number, pan_number, details FROM customers ORDER BY created_at DESC");
    const formattedData = rows.map((customer, index) => {
      let details = {};
      try { details = JSON.parse(customer.details) || {}; } catch(e) {}
      
      let uploadedKYC = [];
      if (details.kycPassport) uploadedKYC.push('Passport');
      if (details.kycVoterId || details.voterId) uploadedKYC.push('Voter ID');
      if (details.kycPan || customer.pan_number || details.panNo) uploadedKYC.push('PAN Card');
      if (details.kycAadhaar || customer.aadhar_number || details.aadhar) uploadedKYC.push('Aadhaar Card');
      if (details.kycDriving || details.drivingLicense) uploadedKYC.push('Driving License');
      if (details.kycRation) uploadedKYC.push('Ration Card');
      if (details.kycElec) uploadedKYC.push('Electricity Bill');
      // Add Photo and Signature as they seem to be standard
      uploadedKYC.unshift('Photo', 'Signature1'); 
      
      // Remove duplicates
      uploadedKYC = [...new Set(uploadedKYC)];
      
      return {
        id: customer.id,
        slNo: index + 1,
        memberId: customer.cif_number,
        name: \`\${customer.first_name} \${customer.last_name}\`.trim(),
        regDate: new Date(customer.created_at || Date.now()).toLocaleDateString('en-GB'),
        contactNo: customer.phone_number || 'N/A',
        totalKyc: uploadedKYC.length, 
        uploadedKyc: uploadedKYC.join(','),
        uploadedKycCount: uploadedKYC.length,
        status: uploadedKYC.length >= 4 ? 'APPROVED' : 'Pending',
      };
    });
    
    res.json(formattedData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
