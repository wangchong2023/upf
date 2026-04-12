/**
 * @职责: 风险准入网关 v1.1 - 物理拦截未闭环的 Critical 风险
 * @作者: Gemini CLI (QA-Expert)
 */

const fs = require('fs');
const config = require('../core/mgr-config');

const RISK_FILE = config.PATHS.RISK_REGISTER;

/**
 * 执行风险审计。
 */
function auditRisks() {
    console.log("🔍 [Risk Gate] Auditing Critical Risks...");

    try {
        if (!fs.existsSync(RISK_FILE)) {
            console.log("✅ No risk register found. Skipping.");
            return;
        }

        const content = fs.readFileSync(RISK_FILE, 'utf8');
        const lines = content.split('\n');
        let openCriticalRisks = [];

        lines.forEach(line => {
            if (line.includes('|') && line.includes('Critical') && !line.includes('Closed')) {
                openCriticalRisks.push(line.trim());
            }
        });

        if (openCriticalRisks.length > 0) {
            console.error(`❌ [BLOCKER] Found ${openCriticalRisks.length} unclosed Critical risks.`);
            process.exit(1);
        }

        console.log("✅ Risk Audit Passed.");
    } catch (error) {
        console.error(`❌ [Risk Gate ERROR] ${error.message}`);
        process.exit(1);
    }
}

auditRisks();
