/**
 * @职责: 研发状态存储查看器 v1.2
 * @作者: Gemini CLI
 */

const { execSync } = require('child_process');
const path = require('path');
const config = require('../core/mgr-config');

const STORAGE_PATH = config.PATHS.STATE_STORAGE;

/**
 * 执行 SQL 并打印美化后的表格。
 * @param {string} title 模块标题
 * @param {string} query SQL 语句
 */
function displayTable(title, query) {
    console.log(`\n=== ${title} ===`);
    try {
        const output = execSync(`sqlite3 -header -table ${STORAGE_PATH} "${query}"`, { encoding: 'utf8' });
        console.log(output || "(暂无状态数据)");
    } catch (e) {
        console.error(`❌ [状态查看器] 读取 ${title} 失败: ${e.message}`);
    }
}

/**
 * 主执行函数。
 */
function main() {
    console.log(`📊 5G UPF 研发状态存储中心 (R&D State Storage)`);
    console.log(`📍 物理存储文件: ${STORAGE_PATH}`);

    // 0. 初始化 Schema (物理存证对齐)
    const initSql = `
        CREATE TABLE IF NOT EXISTS audit_state (id INTEGER PRIMARY KEY AUTOINCREMENT, sr_id TEXT, milestone TEXT, agent TEXT, result TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP);
        CREATE TABLE IF NOT EXISTS dependency_map (id INTEGER PRIMARY KEY AUTOINCREMENT, sr_id TEXT, adr_id TEXT, lld_path TEXT, tc_id TEXT);
        CREATE TABLE IF NOT EXISTS checkpoints (id INTEGER PRIMARY KEY AUTOINCREMENT, thread_id TEXT, checkpoint_id TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
    `;
    try { execSync(`sqlite3 ${STORAGE_PATH} "${initSql}"`); } catch (e) {}

    // 1. 研发活动状态
    displayTable("研发状态存储记录 (R&D State Records)", "SELECT sr_id AS 需求ID, milestone AS 里程碑, agent AS 执行角色, result AS 状态, timestamp AS 变更时间 FROM audit_state ORDER BY timestamp DESC LIMIT 5;");

    // 2. 资产依赖映射
    displayTable("三位一体资产映射 (R&D Asset Mapping)", "SELECT sr_id AS 需求ID, adr_id AS 架构决策, lld_path AS 详细设计, tc_id AS 测试用例 FROM dependency_map LIMIT 10;");

    // 3. 图快照记录
    displayTable("LangGraph 流程快照 (Process Checkpoints)", "SELECT thread_id AS 线程ID, checkpoint_id AS 快照ID, created_at AS 记录时间 FROM checkpoints ORDER BY created_at DESC LIMIT 5;");
}

main();
