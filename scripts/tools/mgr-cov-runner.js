const config = require('../core/mgr-config');
/**
 * @职责: 自动补齐的治理脚本
 * @版本: v1.1
 */

const { execSync } = require('child_process');
const fs = require('fs');

/**
 * 覆盖率运行器 v1.1
 * 职责：运行单元测试，解析 coverprofile，导出审计 JSON
 */

// Role Gate Check
try {
    execSync('node scripts/core/mgr-role-gate.js --action=UNIT_TEST', { stdio: 'inherit' });
} catch (e) {
    process.exit(1);
}

console.log("🧪 Running Unit Tests & Collecting Coverage...");

const REPORT_PATH = config.PATHS.COVERAGE;

try {
    // 1. 运行 Go 测试并生成 profile
    // 强制使用配置中的 SRC 路径
    execSync(`mkdir -p build && go test -cover ./${config.PATHS.SRC}... -coverprofile=build/coverage.out || true`);

    if (!fs.existsSync('build/coverage.out')) {
        console.warn("⚠️ No coverage.out generated. Creating a placeholder report.");
        fs.writeFileSync(REPORT_PATH, JSON.stringify({ total_coverage: 0, timestamp: new Date().toISOString() }));
        process.exit(0);
    }

    // 2. 解析 profile
    const output = execSync('go tool cover -func=build/coverage.out').toString();
    const totalMatch = output.match(/total:\s+\(statements\)\s+([0-9.]+)%/);
    const totalCoverage = totalMatch ? parseFloat(totalMatch[1]) : 0;

    const report = {
        total_coverage: totalCoverage,
        timestamp: new Date().toISOString(),
        raw_output: output.split('\n').slice(-2)[0]
    };

    fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));
    console.log(`✅ Coverage report generated: ${totalCoverage}% -> ${REPORT_PATH}`);

} catch (e) {
    console.error("❌ Failed to run tests or parse coverage:", e.message);
    process.exit(1);
}
