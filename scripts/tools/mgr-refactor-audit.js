/**
 * @职责: 架构演进与重复逻辑扫描工具 v1.0
 * @作者: Gemini CLI
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const config = require('../core/mgr-config');

const SRC_DIR = config.PATHS.SRC;
const CBB_DIR = config.PATHS.CBB_DIR;

/**
 * 扫描重复的结构体定义 (模拟高阶重构审计)
 */
function scanTechnicalDebt() {
    try {
        console.log("🔍 Scanning for duplicate logic across business modules...");
        
        // 简单启发式：寻找在多个文件中出现的相同 struct 定义
        const grepOutput = execSync(`grep -r "type .* struct" ${SRC_DIR} | awk -F: '{print $2}' | sort | uniq -c | sort -nr`, { stdio: 'pipe' }).toString();
        const duplicates = grepOutput.split('\n').filter(line => {
            const count = parseInt(line.trim().split(' ')[0]);
            return count > 1;
        });

        if (duplicates.length > 0) {
            console.log("\n⚠️  [REFACTOR_OPPORTUNITY] Potential technical debt detected:");
            duplicates.forEach(d => console.log(`   - Found duplicate candidate: ${d.trim()}`));
            console.log(`\n💡 ADVICE: Promote these common structures to ${CBB_DIR}`);
        } else {
            console.log("✅ No significant logic duplication found between modules.");
        }
    } catch (e) { console.warn("⚠️  Heuristic refactor scan skipped."); }
}

/**
 * @职责: 自动补齐的治理函数
 */
function main() {
    try {
        console.log("🚀 Starting Evolutionary Refactoring Audit...");
        
        // 1. 扫描重复逻辑
        scanTechnicalDebt();

        // 2. 物理核实 CBB 复用率 (调用度量引擎)
        execSync(`node scripts/tools/mgr-quality-metrics.js`, { stdio: 'inherit' });

        console.log("✅ Evolutionary Refactoring Audit Complete.");
    } catch (error) {
        console.error(`❌ [Refactor Audit] Error: ${error.message}`);
        process.exit(1);
    }
}

main();
