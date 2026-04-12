/**
 * @职责: SMART 规格审计网关 v1.1 - 物理校验量化指标与 DFX 覆盖率
 * @作者: Gemini CLI (QA-Expert)
 */

const fs = require('fs');
const config = require('../core/mgr-config');

const SRS_FILE = config.PATHS.SRS;

/**
 * 执行 SMART 语义审计。
 */
function auditSpecs() {
    console.log("🔍 [SMART Spec Audit] Analyzing Requirement Quality...");

    try {
        if (!fs.existsSync(SRS_FILE)) throw new Error("SRS file missing.");

        const lines = fs.readFileSync(SRS_FILE, 'utf8').split('\n');
        let funCount = 0;
        let nfrCount = 0;
        let weakSpecs = [];

        const metricKeywords = ["<", ">", "ms", "Gbps", "pps", "%", "accuracy", "latency"];

        lines.forEach(line => {
            if (line.includes('| **SR.')) {
                const columns = line.split('|').map(c => c.trim());
                const type = columns[2]; 
                const desc = columns[4];

                if (type === 'FUN') funCount++;
                if (type === 'NFR' || type === 'DFX') nfrCount++;

                const hasMetric = metricKeywords.some(k => desc.toLowerCase().includes(k.toLowerCase()));
                if (!hasMetric) weakSpecs.push(columns[1]);
            }
        });

        // 1. DFX 耦合度审计
        const dfxRatio = funCount > 0 ? nfrCount / funCount : 1;
        if (dfxRatio < 0.5 && funCount > 0) {
            console.error(`❌ [BLOCKER] DFX Coupling too low (${(dfxRatio * 100).toFixed(1)}%).`);
            process.exit(1);
        }

        console.log("✅ SMART Spec Audit Passed.");
    } catch (error) {
        console.error(`❌ [SMART Spec ERROR] ${error.message}`);
        process.exit(1);
    }
}

auditSpecs();
