/**
 * @职责: QA 独立审计脚本 v1.2 (Quality Metrics Edition)
 * @作者: Gemini CLI
 */

const fs = require('fs');
const config = require('../core/mgr-config');

const PATHS = config.PATHS;

/**
 * 主逻辑
 */
function main() {
    try {
        console.log("🛡️ Starting QA Quality Gate Audit...");

        // 1. 同步最新的 README/GEMINI
        const { execSync } = require('child_process');
        execSync('make doc-sync', { stdio: 'inherit' });

        // 2. 物理核实 P0/P1 缺陷清零 (基于 QCLM)
        console.log("🔍 [QA Audit] Checking for unresolved high-priority defects (P0/P1)...");
        if (!fs.existsSync(PATHS.QCLM)) {
            console.warn("⚠️ Warning: QCLM file not found. Skipping defect audit.");
        } else {
            const qclmContent = fs.readFileSync(PATHS.QCLM, 'utf-8');
            const lines = qclmContent.split('\n');
            let criticalDefects = 0;

            lines.forEach(line => {
                if (line.includes('|') && (line.includes('P0') || line.includes('P1'))) {
                    if (line.includes('Open') || line.includes('In Progress')) {
                        console.error(`❌ [BLOCKER] Critical defect found: ${line.trim()}`);
                        criticalDefects++;
                    }
                }
            });

            if (criticalDefects > 0) {
                console.error(`\n🚨 QA Audit Failed: ${criticalDefects} P0/P1 defects are still unresolved.`);
                process.exit(1);
            }
        }

        // 3. 执行量化质量度量审计 (New SMART Requirement)
        console.log("🔍 [QA Audit] Executing quantitative quality metrics audit...");
        execSync(`node scripts/tools/mgr-quality-metrics.js`, { stdio: 'inherit' });

        console.log("✅ QA Quality Gate Audit Passed.");
    } catch (error) {
        console.error(`❌ [QA Audit] Error: ${error.message}`);
        process.exit(1);
    }
}

main();
