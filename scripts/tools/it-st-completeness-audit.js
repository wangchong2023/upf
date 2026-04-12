/**
 * @职责: SMART IT/ST 完整性审计器 v2.1 (Standard Compliant)
 * @作者: Gemini CLI
 */

const fs = require('fs');
const path = require('path');
const config = require('../core/mgr-config');

const PATHS = config.PATHS;

/**
 * 执行深度完整性审计。
 */
function auditCompleteness() {
    console.log("🔍 Starting SMART IT/ST Traceability & Validity Audit...");

    try {
        if (!fs.existsSync(PATHS.RTM)) {
            throw new Error("RTM file missing.");
        }

        const content = fs.readFileSync(PATHS.RTM, 'utf8');
        const lines = content.split('\n');
        let violations = [];
        let auditCount = 0;

        lines.forEach(line => {
            if (line.includes('|') && line.includes('SR.UPF')) {
                const columns = line.split('|').map(c => c.trim());
                const srId = columns[3]; 
                const status = columns[11]; 

                if (status !== '待开发' && status !== 'Pending' && status !== '-') {
                    auditCount++;
                    // 修正：使用正则提取 SR.UPF.X.X.X 格式的 ID，忽略所有前后缀及括注
                    const idMatch = columns[3].match(/SR\.UPF\.[0-9.]+/);
                    const baseId = idMatch ? idMatch[0] : columns[3];
                    const tcFile = path.join(PATHS.TEST_CASES_DIR, `TC.${baseId}.md`);
                    
                    if (!fs.existsSync(tcFile)) {
                        violations.push(`[MISSING_CASE] ${baseId} (${status}) at ${tcFile}`);
                    }
                }
            }
        });

        console.log(`📊 Audit Scope: ${auditCount} active requirements.`);

        if (violations.length > 0) {
            console.error(`❌ [BLOCKER] Found ${violations.length} violations.`);
            process.exit(1);
        }

        console.log("✅ Integrity Audit Passed.");
    } catch (error) {
        console.error(`❌ [Integrity Audit ERROR] ${error.message}`);
        process.exit(1);
    }
}

auditCompleteness();
