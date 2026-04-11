/**
 * @职责: 自动补齐的治理脚本 - TESTER Agent
 * @版本: v1.4 (Traceability Alignment Edition)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../core/mgr-config');

const PATHS = config.PATHS;

console.log("🚀 [Tester Agent] Starting Traceability Alignment testing audit...");

// Role Gate Check
try {
    execSync('node scripts/core/mgr-role-gate.js --action=ST_TEST', { stdio: 'inherit' });
} catch (e) {
    process.exit(1);
}

try {
    // 1. 强制执行物理测试命令 (真值执行)
    console.log("🏃 [Tester Agent] Mandating physical test execution (make test-it-st)...");
    execSync('make test-it-st', { stdio: 'inherit' });

    // 2. 证据新鲜度审计 (Freshness Audit)
    console.log("🔍 [Tester Agent] Auditing evidence freshness...");
    if (!fs.existsSync(PATHS.RESULTS)) {
        throw new Error("Physical test results file missing after execution.");
    }
    
    const stats = fs.statSync(PATHS.RESULTS);
    const ageSec = (Date.now() - stats.mtime.getTime()) / 1000;
    console.log(`   - Evidence Age: ${ageSec.toFixed(1)}s (Max allowed: ${config.THRESHOLDS.EVIDENCE_MAX_AGE_SEC}s)`);

    if (ageSec > config.THRESHOLDS.EVIDENCE_MAX_AGE_SEC) {
        throw new Error(`❌ [STALE_EVIDENCE] Test results are too old. Must run tests fresh.`);
    }

    // 3. 完备性审计 (Completeness Audit - ID 对齐)
    console.log("🔍 [Tester Agent] Auditing traceability completeness (ID Alignment)...");
    execSync('node scripts/tools/it-st-completeness-audit.js', { stdio: 'inherit' });

    // 4. 生成测试骨架与同步结果
    console.log("🏗️  [Tester Agent] Syncing results to RAT matrix...");
    execSync('make sync-results', { stdio: 'inherit' });

    // 5. 生成正式 IT/ST 报告
    console.log("📝 [Tester Agent] Generating formal test report...");
    execSync(`node scripts/tools/gen-test-report.js`, { stdio: 'inherit' });

    // 6. 最终通过率审计
    console.log("📊 [Tester Agent] Analyzing final pass rates...");
    const ratContent = fs.readFileSync(PATHS.RAT, 'utf-8');
    const rows = ratContent.split('\n').filter(l => l.includes('| **RR.UPF.'));
    const total = rows.length;
    const accepted = rows.filter(l => l.includes('Accepted')).length;
    const passRate = total > 0 ? (accepted / total) * 100 : 0;

    console.log(`📈 [Tester Agent] Final Pass Rate: ${passRate.toFixed(2)}% (${accepted}/${total})`);

    if (passRate < config.THRESHOLDS.TARGET_PASS_RATE) {
        throw new Error(`Acceptance audit failed: Pass rate ${passRate.toFixed(2)}% < ${config.THRESHOLDS.TARGET_PASS_RATE}%`);
    }

    console.log("✅ [Tester Agent] All Traceability Alignment audits passed.");
} catch (e) {
    console.error(`❌ [Tester Agent] Audit failed: ${e.message}`);
    process.exit(1);
}
