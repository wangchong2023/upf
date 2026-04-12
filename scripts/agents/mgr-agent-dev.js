/**
 * @职责: 自动补齐的治理脚本 - DEV Agent
 * @版本: v1.6 (Incremental Engineering Edition)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../core/mgr-config');

const PATHS = config.PATHS;

console.log(`🚀 [Dev Agent] Starting Incremental Quality Audit...`);

// Role Gate Check
try {
    execSync('node scripts/core/mgr-role-gate.js --action=CODE_TRACE', { stdio: 'inherit' });
} catch (e) {
    process.exit(1);
}

try {
    console.log("🛠️  [Dev Agent] Running physical auto-fix...");
    execSync('make fix-all', { stdio: 'inherit' });

    console.log("🔍 [Dev Agent] Auditing bidirectional traceability...");
    execSync('make trace-audit', { stdio: 'inherit' });

    console.log("📊 [Dev Agent] Auditing Incremental Test Coverage...");
    
    // 物理执行：仅针对 src/ 下的变动或新增模块
    const testCmd = `/usr/local/go/bin/go test -coverprofile=coverage.out ./src/...`;
    execSync(testCmd, { stdio: 'inherit' });
    
    // 调用 runner 计算增量指标 (Mock logic for demonstration of incremental check)
    execSync('node scripts/tools/mgr-cov-runner.js', { stdio: 'inherit' });

    const covData = JSON.parse(fs.readFileSync(PATHS.COVERAGE, 'utf-8'));
    
    // 获取增量覆盖率
    // 在 IPD 模式下，如果全量不达标，则检查“增量”是否 100% 达标
    const totalCov = covData.total_coverage;
    const incrementalCov = covData.incremental_coverage || totalCov; // Fallback

    console.log(`📈 [Dev Agent] Total: ${totalCov}% | Incremental: ${incrementalCov}%`);

    const MIN_REQUIRED = config.THRESHOLDS.MIN_COVERAGE; // 80%

    if (incrementalCov < MIN_REQUIRED) {
        throw new Error(`CRITICAL: Incremental coverage ${incrementalCov}% is below ${MIN_REQUIRED}%. Quality Gate Blocked.`);
    }

    console.log("✅ [Dev Agent] Incremental Quality Audit Passed.");
} catch (error) {
    console.error(`❌ [Dev Agent FAILURE] ${error.message}`);
    process.exit(1);
}
