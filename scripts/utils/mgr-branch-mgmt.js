/**
 * @职责: 自动补齐的治理脚本
 * @版本: v1.0
 */

const { execSync } = require('child_process');

/**
 * 分支管理助手 v1.0
 * 职责：强制执行 5G UPF 分支策略 (Feature/Release/Hotfix)
 */

const args = process.argv.slice(2);
const action = args.find(a => a.startsWith('--action='))?.split('=')[1];
const name = args.find(a => a.startsWith('--name='))?.split('=')[1];

if (!action || !name) {
    console.error("❌ Usage: node scripts/utils/mgr-branch-mgmt.js --action=[feature|release|hotfix] --name=[ID]");
    process.exit(1);
}

try {
    let branchName = "";
    let baseBranch = "develop";

    switch (action) {
        case 'feature':
            branchName = `feature/AR.${name}`;
            break;
        case 'release':
            branchName = `release/v${name}`;
            break;
        case 'hotfix':
            branchName = `hotfix/IS.${name}`;
            baseBranch = "main";
            break;
        default:
            console.error("❌ Invalid action.");
            process.exit(1);
    }

    console.log(`🚀 Creating ${action} branch: ${branchName} from ${baseBranch}...`);
    execSync(`git checkout ${baseBranch} && git pull origin ${baseBranch}`, { stdio: 'inherit' });
    execSync(`git checkout -b ${branchName}`, { stdio: 'inherit' });
    console.log(`✅ Branch ${branchName} created successfully.`);
} catch (error) {
    console.error(`❌ Branch creation failed: ${error.message}`);
    process.exit(1);
}
