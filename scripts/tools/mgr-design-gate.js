/**
 * @职责: 物理设计网关 v1.4 - 物理强制执行 [ADR -> LLD -> TC] 三位一体审计
 * @作者: Gemini CLI (Standard Compliant)
 */

const fs = require('fs');
const path = require('path');
const config = require('../core/mgr-config');

const PATHS = config.PATHS;

/**
 * 执行全链路设计合规性审计。
 * @param {string} srId 系统需求编号
 */
function runDesignAudit(srId) {
    console.log(`🔍 [Design Gate] Auditing consistency for ${srId}...`);

    try {
        const idNum = srId.split('.')[2]; 

        // 1. [ARCH] 架构决策检查
        const adrDir = path.dirname(PATHS.ADR_TEMPLATE);
        if (fs.existsSync(adrDir)) {
            const adrFiles = fs.readdirSync(adrDir);
            if (!adrFiles.find(f => f.includes(idNum))) throw new Error(`ADR missing for ID ${idNum}.`);
        }

        // 2. [DESIGN] 物理 LLD 检查
        const lldDir = path.dirname(PATHS.LLD_TEMPLATE);
        if (fs.existsSync(lldDir)) {
            const lldFiles = fs.readdirSync(lldDir);
            if (!lldFiles.find(f => f.includes(idNum))) throw new Error(`LLD missing for ID ${idNum}.`);
        }

        // 3. [TEST] 物理 TC 检查
        const tcFile = path.join(PATHS.TEST_CASES_DIR, `TC.${srId}.md`);
        if (!fs.existsSync(tcFile)) throw new Error(`TC file missing: ${tcFile}`);
        if (fs.readFileSync(tcFile, 'utf8').includes('[测试名称]')) {
            throw new Error("Test Case is still a skeleton.");
        }

        console.log(`✅ [Design Gate] Passed for ${srId}.`);
    } catch (error) {
        console.error(`❌ [Design Gate FAILURE] ${error.message}`);
        process.exit(1);
    }
}

const targetSR = process.argv[2];
if (targetSR) runDesignAudit(targetSR);
