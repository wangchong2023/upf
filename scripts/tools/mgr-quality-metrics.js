/**
 * @职责: 全维度质量度量引擎 v2.2 (Categorized Test Edition)
 * @作者: Gemini CLI
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const config = require('../core/mgr-config');

const PATHS = config.PATHS;
const T = config.METRICS_THRESHOLDS;

/**
 * 递归计算目录下的总代码行数
 */
function getLOC(dir) {
    if (!fs.existsSync(dir)) return 0;
    try {
        const raw = execSync(`find ${dir} -name "*.go" -o -name "*.c" | xargs wc -l | tail -n 1`, { stdio: 'pipe' }).toString();
        return parseInt(raw.trim().split(' ')[0]) || 0;
    } catch (e) { return 0; }
}

/**
 * 统计特定目录下的测试文件数
 */
function getTestCount(dir) {
    if (!fs.existsSync(dir)) return 0;
    try {
        const raw = execSync(`find ${dir} -name "*_test.go" -o -name "test_*.c" | wc -l`, { stdio: 'pipe' }).toString();
        return parseInt(raw.trim()) || 0;
    } catch (e) { return 0; }
}

/**
 * @职责: 自动补齐的治理函数
 */
function main() {
    try {
        console.log("📊 Starting Categorized Quality Metrics Audit...");

        // 1. 物理区分：业务代码 vs CBB 代码
        const totalLoc = getLOC(PATHS.SRC);
        const cbbLoc = getLOC(PATHS.CBB_DIR);
        const businessLoc = totalLoc - cbbLoc;

        // 2. 物理区分：业务测试 vs CBB 测试
        const totalTests = getTestCount(PATHS.SRC);
        const cbbTests = getTestCount(PATHS.CBB_DIR);
        const businessTests = totalTests - cbbTests;

        const reuseRate = totalLoc > 0 ? (cbbLoc / totalLoc).toFixed(2) : 0;

        console.log(`\n--- Quality Profile Summary ---`);
        console.log(`- [Business] Code Volume: ${businessLoc} LOC | Unit Tests: ${businessTests}`);
        console.log(`- [Platform] CBB Volume: ${cbbLoc} LOC | Unit Tests: ${cbbTests}`);
        console.log(`- [Metrics ] CBB Reuse Rate: ${(reuseRate * 100).toFixed(1)}% (Target: >${T.MIN_CBB_REUSE_RATE * 100}%)`);

        // 3. 统计需求与用例
        const testCases = fs.existsSync(PATHS.TEST_CASES_DIR) ? 
            fs.readdirSync(PATHS.TEST_CASES_DIR).filter(f => f.endsWith('.md')).length : 0;
        const tcDensity = totalLoc > 0 ? (testCases / (totalLoc / 1000)).toFixed(1) : 0;
        console.log(`- [Metrics ] Test Case Density: ${tcDensity}/KLOC (Target: ${T.MIN_TC_DENSITY})`);

        let errors = 0;
        if (parseFloat(tcDensity) < T.MIN_TC_DENSITY) {
            console.error(`❌ [LOW_TC_DENSITY] Test case density is too low.`);
            errors++;
        }

        if (errors > 0) {
            process.exit(1);
        }

        console.log("\n✅ Quality Metrics Audit Passed.");
    } catch (error) {
        console.error(`❌ [Metrics Engine] Error: ${error.message}`);
        process.exit(1);
    }
}

main();
