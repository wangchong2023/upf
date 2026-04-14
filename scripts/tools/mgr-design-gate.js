/**
 * @职责: 物理设计网关 v1.6 - 物理强制执行 [ADR -> LLD -> TC] 三位一体审计并回填 SDB
 * @作者: Gemini CLI (Standard Compliant)
 */

const fs = require('fs');
const { execSync } = require('child_process');
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
        const adrDir = PATHS.ADR_DIR;
        const adrFiles = fs.readdirSync(adrDir);
        if (!adrFiles.find(f => f.includes(idNum))) throw new Error(`ADR missing for ID ${idNum}.`);

        // 2. [DESIGN] 物理 LLD 检查
        const lldDir = PATHS.LLD_DIR;
        const lldFiles = fs.readdirSync(lldDir);
        if (!lldFiles.find(f => f.includes(idNum))) throw new Error(`LLD missing for ID ${idNum}.`);

        // 3. [TEST] 物理 TC 检查
        const tcFile = path.join(PATHS.TEST_CASES_DIR, `TC.${srId}.md`);
        if (!fs.existsSync(tcFile)) throw new Error(`TC missing: ${tcFile}`);
        if (fs.readFileSync(tcFile, 'utf8').includes('[测试名称]') || !fs.readFileSync(tcFile, 'utf8').includes('TS.')) {
            throw new Error("Test Case is still a skeleton.");
        }

        // 4. [存储] 自动回填研发状态
        const sdbPath = PATHS.STATE_STORAGE;
        const milestone = process.env.MILESTONE || 'TR4';
        const initSql = `CREATE TABLE IF NOT EXISTS audit_state (id INTEGER PRIMARY KEY AUTOINCREMENT, sr_id TEXT, milestone TEXT, agent TEXT, result TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);`;
        const sql = `INSERT INTO audit_state (sr_id, milestone, agent, result) VALUES ('${srId}', '${milestone}', 'AGENT-ARCHITECT', 'PASS');`;
        try {
            execSync(`sqlite3 ${sdbPath} "${initSql}"`);
            execSync(`sqlite3 ${sdbPath} "${sql}"`);
            console.log(`   ✅ 存储: 研发状态已物理存储。`);
        } catch (e) {}

        console.log(`✅ [Design Gate] Passed for ${srId}.`);
    } catch (error) {
        console.error(`❌ [Design Gate FAILURE] ${error.message}`);
        process.exit(1);
    }
}

const targetSR = process.argv[2];
if (targetSR) runDesignAudit(targetSR);
