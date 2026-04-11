/**
 * @职责: 自动补齐的治理脚本 - TESTER Agent
 * @版本: v1.0
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log("🚀 [Tester Agent] Starting testing audit...");

// Role Gate Check
try {
    execSync('node scripts/mgr-role-gate.js --action=ST_TEST', { stdio: 'inherit' });
} catch (e) {
    process.exit(1);
}

try {
    // 1. 生成测试骨架
    console.log("🏗️  [Tester Agent] Generating test skeletons...");
    execSync('make gen-test-cases', { stdio: 'inherit' });

    // 2. 同步测试结果
    console.log("🔄 [Tester Agent] Syncing test results...");
    execSync('make sync-results', { stdio: 'inherit' });

    // 3. 分析 RAT 矩阵
    console.log("📊 [Tester Agent] Analyzing RAT acceptance matrix...");
    const ratPath = 'docs/03-traceability/spec-rat.md';
    if (fs.existsSync(ratPath)) {
        const ratContent = fs.readFileSync(ratPath, 'utf-8');
        const rows = ratContent.split('\n').filter(l => l.includes('| **RR.UPF.'));
        
        const total = rows.length;
        const accepted = rows.filter(l => l.includes('Accepted')).length;
        const passRate = total > 0 ? (accepted / total) * 100 : 0;

        console.log(`📈 [Tester Agent] Pass Rate: ${passRate.toFixed(2)}% (${accepted}/${total})`);

        if (passRate < 100) {
            console.error(`❌ [Tester Agent] Acceptance audit failed: Pass rate is not 100%.`);
            process.exit(1);
        }
        console.log("✅ [Tester Agent] Acceptance audit passed: 100% requirements accepted.");
    } else {
        console.warn("⚠️ [Tester Agent] No RAT matrix found.");
    }
} catch (e) {
    console.error(`❌ [Tester Agent] Audit failed: ${e.message}`);
    process.exit(1);
}
