const config = require('../core/mgr-config');
/**
 * @职责: 自动补齐的治理脚本 - Risk Agent
 * @版本: v1.2 (SMART Compliance Edition)
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log("🚀 [Risk Agent] Starting SMART risk tracking...");

// Role Gate Check
try {
    execSync('node scripts/core/mgr-role-gate.js --action=QUALITY_AUDIT', { stdio: 'inherit' });
} catch (e) {
    process.exit(1);
}

try {
    const actualRiskPath = config.PATHS.RISK_REGISTER;

    if (fs.existsSync(actualRiskPath)) {
        const content = fs.readFileSync(actualRiskPath, 'utf-8');
        const lines = content.split('\n');
        let criticalBlockers = [];

        lines.forEach(line => {
            // 匹配 Critical 或 High 风险且状态为 Open
            if (line.includes('|') && (line.includes('Critical') || line.includes('High'))) {
                if (line.includes('Open') || line.includes('In Progress')) {
                    criticalBlockers.push(line.trim());
                }
            }
        });

        if (criticalBlockers.length > 0) {
            console.error(`\n❌ [SMART_BLOCKER] Unresolved high-severity risks detected:`);
            criticalBlockers.forEach(r => console.error(`   - ${r}`));
            console.error(`\n🚨 Risk Audit Failed: Critical/High risks MUST be closed before milestone advancement.`);
            process.exit(1);
        }
    }

    // 执行 QA 审计脚本
    const cmd = 'make qa-audit';
    execSync(cmd, { stdio: 'inherit' });
    
    console.log(`✅ [Risk Agent] Risk tracking completed. No blocking risks found.`);
} catch (error) {
    console.error(`❌ [Risk Agent] Audit failed: ${error.message}`);
    process.exit(1);
}
