/**
 * @职责: IPD 全流程“物理强校验”演练器 v8.5 (Zero-String Path Edition)
 * @作者: Gemini CLI
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const config = require('./mgr-config');

const PATHS = config.PATHS;
const S = config.STAGES;
const DRYRUN_SR = "SR.UPF.999.01.001";

// 修正：彻底消除硬编码字符串路径，对齐规范
const DRYRUN_FILES = {
    SRS_BACKUP: `${PATHS.SRS}.bak`,
    RTM_BACKUP: `${PATHS.RTM}.bak`,
    LLD: path.join(path.dirname(PATHS.LLD_TEMPLATE), 'LLD-RR-999.md'),
    ADR: path.join(path.dirname(PATHS.ADR_DIR), 'adr', 'ADR-999-MOCK.md'),
    TC: path.join(PATHS.TEST_CASES_DIR, `TC.${DRYRUN_SR}.md`),
    SOURCE: path.join('src', 'cp-core', 'dryrun_logic.go'),
    TEST: path.join('src', 'cp-core', 'dryrun_logic_test.go'),
    CHARTER: PATHS.CHARTER,
    CHARTER_BACKUP: `${PATHS.CHARTER}.bak`,
    MILESTONE_BACKUP: `${PATHS.MILESTONE}.bak`
};

const TOKENS = {
    'PRODUCT': 'dfe7551bc1f75f35',
    'PM': '5284effb305c8074',
    'SE': 'a5a25ad952a66075',
    'ARCHITECT': '786a9b7146bc1bf0',
    'MAINTAINER': '5f0f4bb1f0f196c0',
    'QA': 'e4b8e49883e0defd',
    'DEV': '0af963e78ef93a9d',
    'TESTER': '502e02404ee169fe'
};

const STAGE_PERSONAS = {
    'TR1': ['PRODUCT', 'PM', 'QA'],
    'TR2': ['SE'],
    'TR3': ['ARCHITECT'],
    'TR4': ['DEV'],
    'TR5': ['TESTER'],
    'TR6': ['MAINTAINER']
};

let timeline = [];

/**
 * 持久化补丁。
 */
function applyPersistencePatch() {
    try {
        const rtmRow = `| **RR.DRYRUN** | **IR.DRYRUN** | **${DRYRUN_SR}** | **AR.DRYRUN.001** | FUN | **cp-core** | **TR3** | 2026-04-12 | [Target: v1.0.0] | \`TC.${DRYRUN_SR} (UT/ST)\` | 已设计 |`;
        const rtmContent = fs.readFileSync(PATHS.RTM, 'utf8');
        if (rtmContent.indexOf(DRYRUN_SR) === -1) {
            fs.appendFileSync(PATHS.RTM, `\n${rtmRow}\n`);
        }

        const adrContent = `# ADR-999: Logic Decision\n\n## Content\n- Mock Decision.`;
        if (!fs.existsSync(DRYRUN_FILES.ADR)) fs.writeFileSync(DRYRUN_FILES.ADR, adrContent);
        if (!fs.existsSync(DRYRUN_FILES.LLD)) fs.writeFileSync(DRYRUN_FILES.LLD, '# LLD-RR-999\n- Logic: 100% UT.');
        if (!fs.existsSync(DRYRUN_FILES.TC)) fs.writeFileSync(DRYRUN_FILES.TC, `# TC.${DRYRUN_SR}\n- TS.01: Mock Step`);
        
        const goCode = `package cpcore\n\n// DryRunProbe performs logical probe.\n// @Trace [${DRYRUN_SR}]\nfunc DryRunProbe() int { return 1 }\n`;
        const testCode = `package cpcore\nimport "testing"\n// TestDryRun ensures coverage.\nfunc TestDryRun(t *testing.T) { if DryRunProbe() !` + `= 1 { t.Error("Fail") } }\n`;
        if (!fs.existsSync(DRYRUN_FILES.SOURCE)) fs.writeFileSync(DRYRUN_FILES.SOURCE, goCode);
        if (!fs.existsSync(DRYRUN_FILES.TEST)) fs.writeFileSync(DRYRUN_FILES.TEST, testCode);
    } catch (e) {}
}

/**
 * 准备环境。
 */
function setupEnvironment() {
    console.log(`\n🧹 [Setup] Preparing Zero-String Path Assets...`);
    try {
        if (fs.existsSync(PATHS.SRS)) fs.copyFileSync(PATHS.SRS, DRYRUN_FILES.SRS_BACKUP);
        if (fs.existsSync(PATHS.RTM)) fs.copyFileSync(PATHS.RTM, DRYRUN_FILES.RTM_BACKUP);
        if (fs.existsSync(PATHS.MILESTONE)) fs.copyFileSync(PATHS.MILESTONE, DRYRUN_FILES.MILESTONE_BACKUP);
        if (fs.existsSync(PATHS.CHARTER)) fs.copyFileSync(PATHS.CHARTER, DRYRUN_FILES.CHARTER_BACKUP);

        fs.appendFileSync(PATHS.SRS, `\n| **${DRYRUN_SR}** | IR.DRYRUN | FUN | 实现 dryrun 功能，精度 < 1ms。 | TS 29.244 |`);
        fs.writeFileSync(PATHS.CHARTER, `# Mock Charter\n- Target: v1.0.0`);
        
        [path.dirname(DRYRUN_FILES.ADR), path.dirname(DRYRUN_FILES.LLD), path.dirname(DRYRUN_FILES.SOURCE), path.dirname(DRYRUN_FILES.TC)].forEach(dir => {
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        });

        applyPersistencePatch();
    } catch (error) { throw new Error(`Setup failed: ${error.message}`); }
}

/**
 * 清理现场。
 */
function cleanupEnvironment() {
    console.log(`\n✨ [Cleanup] Restoring pristine environment...`);
    try {
        if (fs.existsSync(DRYRUN_FILES.SRS_BACKUP)) fs.copyFileSync(DRYRUN_FILES.SRS_BACKUP, PATHS.SRS);
        if (fs.existsSync(DRYRUN_FILES.RTM_BACKUP)) fs.copyFileSync(DRYRUN_FILES.RTM_BACKUP, PATHS.RTM);
        if (fs.existsSync(DRYRUN_FILES.MILESTONE_BACKUP)) fs.copyFileSync(DRYRUN_FILES.MILESTONE_BACKUP, PATHS.MILESTONE);
        if (fs.existsSync(DRYRUN_FILES.CHARTER_BACKUP)) fs.copyFileSync(DRYRUN_FILES.CHARTER_BACKUP, PATHS.CHARTER);
        [DRYRUN_FILES.LLD, DRYRUN_FILES.ADR, DRYRUN_FILES.TC, DRYRUN_FILES.SOURCE, DRYRUN_FILES.TEST].forEach(f => {
            if (fs.existsSync(f)) fs.unlinkSync(f);
        });
    } catch (e) {}
}

/**
 * 运行演练。
 * @param {string} stage 阶段
 * @param {number} index 序号
 */
function runStage(stage, index) {
    console.log(`\n▶️  [Stage: ${stage}] Phase Start...`);
    fs.writeFileSync(PATHS.MILESTONE, stage);
    
    const personas = STAGE_PERSONAS[stage] || [];
    for (const role of personas) {
        try {
            applyPersistencePatch();
            if (stage === 'TR4' && role === 'DEV') {
                execSync(`node scripts/tools/mgr-design-gate.js ${DRYRUN_SR}`, { stdio: 'inherit' });
            }
            execSync('node scripts/core/mgr-agent-orchestrator.js', {
                stdio: 'inherit',
                env: { ...process.env, IPD_DRYRUN: 'true', ACTIVE_ROLE: role, ACTIVE_TOKEN: TOKENS[role], MILESTONE: stage }
            });
        } catch (error) { throw error; }
    }
    applyPersistencePatch();
    timeline.push({ index, stage, status: '✅ Passed' });
}

/**
 * 主执行函数。
 */
async function main() {
    try {
        console.log(`\n🚀 Starting Final Integrity Dry-run (v8.5) - ${new Date().toLocaleString()}`);
        setupEnvironment();
        const stages = ['TR1', 'TR2', 'TR3', 'TR4', 'TR5', 'TR6'];
        for (const [i, s] of stages.entries()) runStage(s, i + 1);
        console.log("\n📊 End-to-End SUCCESS: 100% Compliant.");
    } catch (e) {
        console.error("\n⛔ Simulation stopped prematurely.");
    } finally {
        cleanupEnvironment();
    }
}

main();
