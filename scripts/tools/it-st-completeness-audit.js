/**
 * @职责: 集成与系统测试完备性审计工具 v1.3 (SMART Validity Edition)
 * @作者: Gemini CLI
 */

const fs = require('fs');
const path = require('path');
const config = require('../core/mgr-config');

const PATHS = config.PATHS;

/**
 * 核实用例内容的语义密度 (SMART Specific)
 */
function isTestCaseValid(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    
    // 1. 检查是否保留了原始模板占位符
    if (content.includes('[TC_ID]') || content.includes('[SR_ID]')) return false;

    // 2. 检查“测试步骤”部分的物理长度 (语义密度)
    const stepSection = content.split('## 3. 测试步骤')[1] || "";
    const cleanSteps = stepSection.split('##')[0].replace(/[\s\-\|]/g, '');
    
    if (cleanSteps.length < 20) {
        console.error(`❌ [LOW_DENSITY] Test case at ${path.basename(filePath)} has insufficient step detail (${cleanSteps.length} chars).`);
        return false;
    }

    return true;
}

/**
 * 主逻辑
 */
function main() {
    try {
        console.log("🔍 Starting SMART IT/ST Traceability & Validity Audit...");

        if (!fs.existsSync(PATHS.RTM)) throw new Error("RTM file missing.");
        if (!fs.existsSync(PATHS.RESULTS)) throw new Error("Test results file missing.");

        const rtmContent = fs.readFileSync(PATHS.RTM, 'utf-8');
        const results = JSON.parse(fs.readFileSync(PATHS.RESULTS, 'utf-8'));
        
        const resultMap = new Map();
        results.forEach(r => {
            if (r.id) resultMap.set(r.id, r.status);
            if (r.tc_id) resultMap.set(r.tc_id, r.status);
        });

        const lines = rtmContent.split('\n');
        const requiredIds = [];
        lines.forEach(line => {
            if (line.includes('|') && line.includes('TR5') && line.includes('SR.UPF.')) {
                const match = line.match(/SR\.UPF\.[\d\.]+/);
                if (match) requiredIds.push(match[0]);
            }
        });

        console.log(`📊 Audit Scope: ${requiredIds.length} required SRs identified.`);

        let errors = 0;

        requiredIds.forEach(id => {
            const tcId = `TC.${id}`;
            const status = resultMap.get(id) || resultMap.get(tcId);

            // 1. ID 与状态校验
            if (!status) {
                console.error(`❌ [MISSING_RESULT] No execution record for: ${id}`);
                errors++;
            } else if (status !== 'Pass') {
                console.error(`❌ [TEST_FAILURE] ID: ${id} failed.`);
                errors++;
            }

            // 2. SMART 内容有效性校验
            const tcPath = path.join(PATHS.TEST_CASES_DIR, `TC.${id}.md`);
            if (!fs.existsSync(tcPath)) {
                console.error(`❌ [MISSING_CASE] No physical file for ${id}`);
                errors++;
            } else if (!isTestCaseValid(tcPath)) {
                console.error(`❌ [INVALID_CONTENT] Test case ${tcId} is just an empty template or lacks detail.`);
                errors++;
            }
        });

        if (errors > 0) {
            console.error(`\n🚨 SMART Deep Audit Failed: ${errors} integrity violations found.`);
            process.exit(1);
        }

        console.log("✅ All required IDs are matched, 100% Passed, and SMARt-ly Valid.");
    } catch (error) {
        console.error(`❌ [Deep Audit] Error: ${error.message}`);
        process.exit(1);
    }
}

main();
