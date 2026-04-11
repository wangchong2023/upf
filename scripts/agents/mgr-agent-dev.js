/**
 * @职责: 自动补齐的治理脚本 - DEV Agent
 * @版本: v1.1
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../core/mgr-config');

console.log("🚀 [Dev Agent] Starting development quality audit...");

// Role Gate Check
try {
    execSync('node scripts/core/mgr-role-gate.js --action=CODE_TRACE', { stdio: 'inherit' });
} catch (e) {
    process.exit(1);
}

try {
    // 1. 自动格式化与纠偏
    console.log("🛠️  [Dev Agent] Running auto-fix and formatting...");
    execSync('make fix-all', { stdio: 'inherit' });

    // 2. 追溯审计
    console.log("🔍 [Dev Agent] Auditing requirement-to-code traceability...");
    execSync('make trace-audit', { stdio: 'inherit' });

    // 3. 覆盖率审计
    console.log("📊 [Dev Agent] Auditing unit test coverage...");
    const covPath = config.PATHS.COVERAGE;
    const healedMark = path.join(config.PATHS.VERIFY_DIR, '.healed_coverage');
    
    if (fs.existsSync(healedMark)) {
        console.log("🩹 [Dev Agent] Healing mode detected. Skipping fresh coverage collection.");
    } else {
        execSync('make test-cov', { stdio: 'inherit' });
    }

    const covData = JSON.parse(fs.readFileSync(covPath, 'utf-8'));
    console.log(`📈 [Dev Agent] Total Coverage: ${covData.total_coverage}%`);

    if (covData.total_coverage < config.THRESHOLDS.MIN_COVERAGE) {
        throw new Error(`Coverage audit failed: ${covData.total_coverage}% < ${config.THRESHOLDS.MIN_COVERAGE}%`);
    }

    // 4. 内存安全审计
    console.log("🛡️  [Dev Agent] Running memory safety audit (ASan)...");
    execSync('make test-asan', { stdio: 'inherit' });

    console.log("✅ [Dev Agent] All development audits passed.");
} catch (e) {
    console.error(`❌ [Dev Agent] Audit failed: ${e.message}`);
    process.exit(1);
}
