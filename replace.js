const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const files = fs.readdirSync(srcDir);

const targetFiles = [
  'ShareParameters.jsx',
  'ServiceDeduction.jsx',
  'SbAccountType.jsx',
  'SbAccountsParameters.jsx',
  'PlanPrematuritySlabs.jsx',
  'PlanParameters.jsx',
  'OdAccountParameters.jsx',
  'ManageRelationship.jsx',
  'LateFeesSettings.jsx',
  'HolidayList.jsx',
  'FeeParameter.jsx',
  'DepositTDSParameter.jsx',
  'ApprovalLimitParameters.jsx',
  'AddUpdateParameter.jsx',
  'AddServiceCharge.jsx'
];

targetFiles.forEach(file => {
  const filePath = path.join(srcDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already imported
  if (!content.includes('import { DotLottiePlayer }')) {
    content = content.replace(
      "import './ShareParameters.css';",
      "import './ShareParameters.css';\nimport { DotLottiePlayer } from '@dotlottie/react-player';\nimport '@dotlottie/react-player/dist/index.css';"
    );
  }

  // Replace Clock usage
  content = content.replace(/<Clock className="icon-sm share-spin" \/>/g, '<div style={{ width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}><DotLottiePlayer src="/36038e50-1178-11ee-9eeb-932b0ace7009.lottie" autoplay loop style={{ width: "45px", height: "45px" }} /></div>');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
