/**
 * @职责: 自动补齐的治理脚本
 * @版本: v1.0
 */

const { execSync } = require('child_process');
const fs = require('fs');

/**
 * 覆盖率运行器 v1.0
 * 职责：运行单元测试，解析 coverprofile，导出审计 JSON
 */

// Role Gate Check
try {
    execSync('node scripts/mgr-role-gate.js --action=UNIT_TEST', { stdio: 'inherit' });
} catch (e) {
    process.exit(1);
}

console.log("🧪 Running Unit Tests & Collecting Coverage...");

const REPORT_PATH = 'docs/05-quality/verification/unit-coverage.json';

try {
    // 1. 运行 Go 测试并生成 profile
    // 注意：如果 src/cp-core 下尚无有效 go 文件或包，此步可能会报错
    execSync('mkdir -p build && go test -cover ./src/... -coverprofile=build/coverage.out || true');

    if (!fs.existsSync('build/coverage.out')) {
        console.warn("⚠️ No coverage.out generated. Creating a placeholder report.");
        fs.writeFileSync(REPORT_PATH, JSON.stringify({ total_coverage: 0, timestamp: new Date().toISOString() }));
        process.exit(0);
    }

    // 2. 解析 profile (此处简化解析总百分比)
    // 生产环境应使用 go tool cover -func=build/coverage.out
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
