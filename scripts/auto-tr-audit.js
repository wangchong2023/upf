const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * IPD TR 自动化审计脚本 v5.0 - 确定性流程版
 * 职责：自动感知里程碑、执行全节点硬门控、输出异常修复 SoP
 */

// Role Gate Check
try {
    execSync('node scripts/mgr-role-gate.js --action=TR_APPROVE', { stdio: 'inherit' });
} catch (e) {
    process.exit(1);
}

// 1. 自动获取当前里程碑状态
function getCurrentStage() {
    if (fs.existsSync('.milestone')) {
        return fs.readFileSync('.milestone', 'utf-8').trim();
    }
    return 'GENERAL';
}

const stage = getCurrentStage();
console.log(`🚀 Starting Deterministic IPD Audit [Milestone: ${stage}]...`);

const paths = {
    srs: "docs/spec-srs.md",
    rtm: "docs/spec-rtm.md",
    qclm: "docs/spec-qclm.md",
    sds: "docs/spec-sds.md",
    rat: "docs/spec-rat.md",
    api: "docs/api/external/3gpp-n4.yaml",
    coverage: "docs/verification/unit-coverage.json",
    report: "docs/verification/auto-tr-audit-report.md",
    risk: "docs/spec-risk-register.md"
};

const THRESHOLDS = { TR4_COVERAGE_MIN: 80.0 };
let exitCode = 0;
let checks = [];

// 0. 通用风险审计 (所有阶段强制检查 Critical 风险)
function auditCriticalRisks() {
    if (fs.existsSync(paths.risk)) {
        const args = process.argv.slice(2);
        const targetVersion = args.find(a => a.startsWith('--version='))?.split('=')[1];
        
        const content = fs.readFileSync(paths.risk, 'utf-8');
        const lines = content.split('\n');
        let openCriticals = 0;

        lines.forEach(line => {
            if (line.includes('| **RK.')) {
                const parts = line.split('|').map(p => p.trim());
                if (parts.length < 10) return;

                const level = parts[3];
                const version = parts[7];
                const status = parts[9];

                // 过滤逻辑：如果指定了版本且风险不属于该版本，则跳过
                if (targetVersion && version !== targetVersion) return;

                if ((level === '高' || level === 'Critical' || level === 'High') && (status === 'Open' || status === 'In Progress' || status === '**Open**')) {
                    openCriticals++;
                }
            }
        });

        logCheck("GLOBAL_RISK", openCriticals === 0, `Open Critical Risks ${targetVersion ? `for ${targetVersion}` : ''}: ${openCriticals}`, "Close all Critical/High risks in docs/spec-risk-register.md before milestone transition");
        if (openCriticals > 0) exitCode = 1;
    }
}

function logCheck(name, passed, message, fixSoP = "") {
    checks.push({ name, passed, message, fixSoP });
    if (!passed) {
        console.error(`❌ [${name}] ${message}`);
        if (fixSoP) console.log(`   💡 FIX GUIDELINE: ${fixSoP}`);
    } else {
        console.log(`✅ [${name}] ${message}`);
    }
}

const getFileContent = (p) => fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : '';

// 2. 执行审计逻辑
auditCriticalRisks();

switch (stage.toUpperCase()) {
    case 'TR1':
        logCheck("TR1_SRS", !getFileContent(paths.srs).includes('TBD'), "SRS is complete", "Remove all 'TBD' placeholders in docs/spec-srs.md");
        break;

    case 'TR3':
        logCheck("TR3_SDS", fs.existsSync(paths.sds), "SDS document exists", "Create docs/spec-sds.md using arch-hld-expert skill");
        logCheck("TR3_API", fs.existsSync(paths.api), "N4 API Contract locked", "Define N4 interface in docs/api/external/3gpp-n4.yaml");
        break;

    case 'TR4':
        const hasDetailedDesign = getFileContent(paths.sds).includes('Detailed Design') || getFileContent(paths.sds).includes('详设');
        logCheck("TR4_LLD", hasDetailedDesign, "Detailed design (LLD) present", "Add 'Detailed Design' section to docs/spec-sds.md");
        
        if (fs.existsSync(paths.coverage)) {
            const currentCov = JSON.parse(fs.readFileSync(paths.coverage, 'utf-8')).total_coverage || 0;
            const covPassed = currentCov >= THRESHOLDS.TR4_COVERAGE_MIN;
            logCheck("TR4_COV", covPassed, `Coverage: ${currentCov}%`, `Run 'make test-cov' and add unit tests to meet ${THRESHOLDS.TR4_COVERAGE_MIN}%`);
            if (!covPassed) exitCode = 1;
        } else {
            logCheck("TR4_COV", false, "Missing coverage report", "Run 'make test-cov' to generate docs/verification/unit-coverage.json");
            exitCode = 1;
        }
        break;

    case 'TR5':
        const qclm = getFileContent(paths.qclm);
        const openIssues = (qclm.match(/\| Open \|/g) || []).length;
        logCheck("TR5_QCLM", openIssues === 0, `Open issues: ${openIssues}`, "Close all P0/P1 issues in docs/spec-qclm.md");
        if (openIssues > 0) exitCode = 1;
        break;

    default:
        logCheck("SANITY_RTM", fs.existsSync(paths.rtm), "Basic RTM exists");
}

// 3. 生成报告并执行物理拦截
let report = `# IPD Deterministic Milestone Report: ${stage}\n\n`;
report += `| Checkpoint | Status | Details | Fix SoP |\n| :--- | :--- | :--- | :--- |\n`;
checks.forEach(c => {
    report += `| ${c.name} | ${c.passed ? "🟢 Pass" : "🔴 Fail"} | ${c.message} | ${c.fixSoP || '-'} |\n`;
});

fs.writeFileSync(paths.report, report);

if (exitCode !== 0) {
    console.error(`\n❌ [BLOCKER] Milestone ${stage} NOT satisfied. Follow the FIX GUIDELINES above.`);
    process.exit(exitCode);
} else {
    console.log(`\n✨ Stage ${stage} audit passed.`);
}
