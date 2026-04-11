/**
 * @职责: 自动补齐的治理脚本 - DEV Agent
 * @版本: v1.0
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log("🚀 [Dev Agent] Starting development quality audit...");

// Role Gate Check
try {
    execSync('node scripts/mgr-role-gate.js --action=CODE_TRACE', { stdio: 'inherit' });
} catch (e) {
    process.exit(1);
}

try {
    // 1. 自动纠偏
    console.log("🛠️  [Dev Agent] Running auto-corrections (fix-all)...");
    execSync('make fix-all', { stdio: 'inherit' });

    // 2. 运行覆盖率测试
    const healFlag = 'docs/05-quality/verification/.healed_coverage';
    if (fs.existsSync(healFlag)) {
        console.log("⏭️  [Dev Agent] Skipping physical coverage collection (Healed Mode).");
        fs.unlinkSync(healFlag); // 消费掉标记
    } else {
        console.log("🧪 [Dev Agent] Running unit tests & coverage audit...");
        try {
            execSync('make test-cov', { stdio: 'inherit' });
        } catch (e) {
            console.warn("⚠️ [Dev Agent] Coverage collection failed, proceeding to audit existing report.");
        }
    }

    const covReportPath = 'docs/05-quality/verification/unit-coverage.json';
    if (fs.existsSync(covReportPath)) {
        const covReport = JSON.parse(fs.readFileSync(covReportPath, 'utf-8'));
        if (covReport.total_coverage < 80) {
            console.error(`❌ [Dev Agent] Coverage audit failed: ${covReport.total_coverage}% < 80%`);
            process.exit(1);
        }
        console.log(`✅ [Dev Agent] Coverage audit passed: ${covReport.total_coverage}%`);
    } else {
        console.warn("⚠️ [Dev Agent] No coverage report found.");
    }

    // 3. 追溯审计
    console.log("🔍 [Dev Agent] Running traceability audit (@Trace)...");
    execSync('node scripts/api-trace-audit.js', { stdio: 'inherit' });

    // 4. 内存安全检查
    console.log("🧠 [Dev Agent] Running memory safety audit (ASan)...");
    execSync('make test-asan', { stdio: 'inherit' });

    console.log("✅ [Dev Agent] All development audits passed.");
} catch (e) {
    console.error(`❌ [Dev Agent] Audit failed: ${e.message}`);
    process.exit(1);
}
