const fs = require('fs');
const path = require('path');

/**
 * IPD TR 自动化审计脚本 v4.1 - 深度自定义版
 * 职责：引入 TR4 代码覆盖率阈值校验逻辑
 */

const args = process.argv.slice(2);
const stage = args.find(a => a.startsWith('--stage='))?.split('=')[1] || 'GENERAL';

console.log(`🚀 Starting Custom IPD Audit [Stage: ${stage}]...`);

const paths = {
    srs: "docs/spec-srs.md",
    rtm: "docs/spec-rtm.md",
    qclm: "docs/spec-qclm.md",
    sds: "docs/spec-sds.md",
    coverage: "docs/verification/unit-coverage.json",
    report: "docs/verification/auto-tr-audit-report.md"
};

const THRESHOLDS = {
    TR4_COVERAGE_MIN: 80.0 // 80% 覆盖率门槛
};

let exitCode = 0;
let checks = [];

function logCheck(name, passed, message) {
    checks.push({ name, passed, message });
    if (!passed) console.error(`❌ [${name}] ${message}`);
    else console.log(`✅ [${name}] ${message}`);
}

const getFileContent = (p) => fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : '';

// --- 基础核查 ---
logCheck("PHYSICAL_SRS", fs.existsSync(paths.srs), "SRS specification exists");

// --- 阶段化自定义逻辑 ---
switch (stage.toUpperCase()) {
    case 'TR4':
        // 1. 详设核查
        logCheck("TR4_LLD", getFileContent(paths.sds).includes('Detailed Design'), "Detailed design present in SDS");
        
        // 2. 覆盖率硬拦截
        if (fs.existsSync(paths.coverage)) {
            try {
                const covData = JSON.parse(fs.readFileSync(paths.coverage, 'utf-8'));
                const currentCov = covData.total_coverage || 0;
                const passed = currentCov >= THRESHOLDS.TR4_COVERAGE_MIN;
                logCheck("TR4_UNIT_COVERAGE", passed, `Unit test coverage: ${currentCov}% (Threshold: ${THRESHOLDS.TR4_COVERAGE_MIN}%)`);
                if (!passed) exitCode = 1;
            } catch (e) {
                logCheck("TR4_UNIT_COVERAGE", false, "Failed to parse coverage report JSON");
                exitCode = 1;
            }
        } else {
            logCheck("TR4_UNIT_COVERAGE", false, "Missing unit coverage report (docs/verification/unit-coverage.json)");
            exitCode = 1;
        }
        break;

    default:
        console.log("ℹ️  Standard stage checks running...");
}

// --- 生成报告 ---
let report = `# IPD Custom Milestone Audit Report: ${stage}\n\n`;
report += `| Checkpoint | Status | Details |\n| :--- | :--- | :--- |\n`;
checks.forEach(c => {
    report += `| ${c.name} | ${c.passed ? "🟢 Pass" : "🔴 Fail"} | ${c.message} |\n`;
});
report += `\n\n---\n*Threshold Config: TR4_COV >= ${THRESHOLDS.TR4_COVERAGE_MIN}%*\n`;
fs.writeFileSync(paths.report, report);

if (exitCode !== 0) {
    console.error(`\n❌ [BLOCKER] Quality Gate Failure: Stage ${stage} criteria not met.`);
    process.exit(exitCode);
} else {
    console.log(`\n✨ Audit for ${stage} passed successfully.`);
}
