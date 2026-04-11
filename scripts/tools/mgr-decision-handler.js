const config = require('../core/mgr-config');
/**
 * @职责: 自动补齐的治理脚本
 * @版本: v1.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * 决策处理器 v1.0
 * 指令示例: node scripts/tools/mgr-decision-handler.js --stage=TR3 --result=Go --expert="Arch-Team"
 */

// Role Gate Check
try {
    execSync('node scripts/core/mgr-role-gate.js --action=DECISION_PASS', { stdio: 'inherit' });
} catch (e) {
    process.exit(1);
}

const args = process.argv.slice(2);
const stage = args.find(a => a.startsWith('--stage='))?.split('=')[1];
const result = args.find(a => a.startsWith('--result='))?.split('=')[1];
const expert = args.find(a => a.startsWith('--expert='))?.split('=')[1] || "TBD";

const logPath = config.PATHS.LOG;

if (!stage || !result) {
    console.error("❌ Usage: node mgr-decision-handler.js --stage=<Stage> --result=<Go/No-Go> [--expert=<Name>]");
    process.exit(1);
}

console.log(`📝 Recording decision for ${stage}: [${result}] by ${expert}...`);

if (!fs.existsSync(logPath)) {
    console.error("❌ Decision log file not found.");
    process.exit(1);
}

let content = fs.readFileSync(logPath, 'utf-8');
const date = new Date().toISOString().split('T')[0];

// 匹配并更新表格行
const rowPattern = new RegExp(`\\| \\*\\*${stage}\\*\\* \\|.*?\\|`, 'g');
const newRow = `| **${stage}** | ${date} | **${result}** | ${expert} | ✅ Closed | [auto-report] |`;

if (content.match(rowPattern)) {
    content = content.replace(rowPattern, newRow);
} else {
    // 如果没有找到对应阶段，则在看板底部追加一行
    const tableHeaderEnd = content.indexOf('| --- | :--- | :--- | :--- | :--- | :--- |') + 45;
    content = content.slice(0, tableHeaderEnd) + '\n' + newRow + content.slice(tableHeaderEnd);
}

fs.writeFileSync(logPath, content);
console.log(`✅ ${stage} decision has been recorded in ${logPath}`);
