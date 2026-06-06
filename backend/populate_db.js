require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const cleanData = {
    // Basic Info
    companyshortname: 'VeritasCo',
    companyfullname: 'VeritasCo Nidhi Bank Limited',
    distname: '',
    StateName: '',
    office_timings: '9:30 AM to 5:30 PM',
    Working_City_ForSeo: '',
    Services_Area_ForSeo: 'Secured Deposits, Secured Loans',
    board_of_directors: '',
    our_channel_partners: '',
    Our_Branches: '',
    Recruitment_Career: '',
    vision_Mission: 'Yes',

    // Contact Details
    headermobileno: '',
    headeremailid: 'info@veritasco.in',
    callusphone1: '',
    callusphone2: '',
    callusphone3: '',
    contactemail1: '',
    enquirymail: 'support@veritasco.in',
    contactemail2: '',
    contactAddressheadoffice: 'VeritasCo Head Office',
    contactAddresscurrentline1: '',
    contactAddresscurrentline2: '',
    contactAddresscurrentline3: '',
    contactAddresscurrentline4: '',
    contactAddressregisteredoffice: 'VeritasCo Registered Office',
    contactAddressregisteredofficeline1: '',
    contactAddressregisteredofficeline2: '',
    contactAddressregisteredofficeline3: '',
    contactAddressregisteredofficeline4: '',
    googlemapadress: '',

    // Social & Links
    websiteurl: 'https://veritasco.in/',
    logo: '/veritasco.png',
    facebookurl: '',
    twiterurl: '',
    gplusurl: '',
    instagramurl: '',
    linkedinurl: '',
    skypeurl: '',
    youtubeurl: '',
    pinteresturl: '',
    Collection_Mobile_App_Url: '',
    Customer_Mobile_App_Url: '',

    // Legal & Security
    copyrighttxt: 'Copyright © 2026 VeritasCo Nidhi Bank. All Rights Reserved.',
    privacy_policy: 'VeritasCo Privacy Policy...',
    terms_conditions: 'No',
    legal_Doc: 'Hide',
    Security_Tips: 'Never share your OTP or password with anyone calling from the bank.',

    // SEO (Sampled, otherwise it's too long, but we map them)
    Index_Title: 'VeritasCo Nidhi Bank - Secure Deposits & Loans',
    Index_Description: 'VeritasCo offers highly secure fixed deposits, recurring deposits, and property loans with attractive interest rates.',
    Index_Keywords: 'VeritasCo, Nidhi Bank, Fixed Deposit, Loan, Banking',

    // Theme Settings
    topbordercolor: '#024eb9',
    navbgcolor: '#1a73e8',
    navcolor: 'WHITE',
    navhovercolor: 'white',
    navhoverbgcolor: '#024eb9',
    subnavbgcolor: '#024eb9',
    subnavcolor: 'white',
    bannercolor1: '#45d9f9',
    bannercolor2: '#45f993',
    footerbgcolor: '#024eb9',
    footerbtmbgcolor: '#45d9f9',
    News_BG_Color: '#1a73e8',
    news_text_color: '#FFFFFF',
    Home_Box_BG_Color1: '#1E3C94',
    Home_Box_BG_Color2: '#D32384',
    index_view_bgcolor: '#1a73e8',
    header_phone_color: '#1a73e8',

    // Feature Flags
    Show_Customer_Login: 'Yes',
    Show_Branch_Login: 'Yes',
    Show_Staff_Login: 'Yes',
    Website_Display: 'No',
    Deposit_Menu: 'Yes',
    saving_deposit_scheme: 'yes',
    fixed_deposit_scheme: 'yes',
    pigmy_deposit_scheme: 'yes',
    recurring_deposit_scheme: 'yes',
    daily_deposit_scheme: 'yes',
    monthly_interest_scheme: 'yes',
    Loan_Menu: 'Yes',
    general_loan: 'Yes',
    property_loan: 'Yes',
    vehicle_loan: 'Yes',
    secured_loan: 'Yes',
    education_loan: 'Yes',
    business_loan: 'Yes',
    mortgage_loan: 'Yes',
    loan_against_deposit: 'Yes',
    gold_silver_diamond: 'Yes',
    Calculator_Menu: 'hide',
    FD_Calculator: 'hide',
    RD_Calculator: 'hide',
    Pigmy_Calculator: 'hide',
    MIS_Calculator: 'hide',
    Loan_Calculator: 'hide',
};

pool.query("UPDATE system_settings SET settings_data = $1", [cleanData]).then(() => {
  console.log('Populated cleanly');
  pool.end();
}).catch(e => {
  console.error(e);
  pool.end();
});
