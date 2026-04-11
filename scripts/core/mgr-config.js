/**
 * @职责: 自动补齐的治理脚本
 * @版本: v2.0 (Full Quality Baseline Edition)
 */

const path = require('path');

try {
    const ROLES = {
        PM: 'PM',
        PRODUCT: 'PRODUCT',
        SE: 'SE',
        ARCHITECT: 'ARCHITECT',
        MAINTAINER: 'MAINTAINER',
        QA: 'QA',
        DEV: 'DEV',
        TESTER: 'TESTER',
        GUEST: 'GUEST'
    };

    const STAGES = {
        GENERAL: 'GENERAL',
        CDCP: 'CDCP',
        PDCP: 'PDCP',
        ADCP: 'ADCP',
        TR1: 'TR1',
        TR2: 'TR2',
        TR3: 'TR3',
        TR4: 'TR4',
        TR4A: 'TR4A',
        TR5: 'TR5',
        TR6: 'TR6'
    };

    module.exports = {
        ROLES,
        STAGES,
        PATHS: {
            SRS: 'docs/01-requirements/spec-srs.md',
            FEATURE_LIST: 'docs/01-requirements/spec-feature-list.md',
            RTM: 'docs/03-traceability/spec-rtm.md',
            SDS: 'docs/02-design/spec-sds.md',
            RAT: 'docs/03-traceability/spec-rat.md',
            RCR: 'docs/04-management/spec-rcr.md',
            PLAN: 'docs/04-management/spec-project-plan.md',
            LOG: 'docs/04-management/spec-decision-log.md',
            ROLE_MATRIX: 'docs/04-management/spec-role-matrix.md',
            RISK_REGISTER: 'docs/04-management/spec-risk-register.md',
            TASK_PLAN: 'docs/04-management/spec-downstream-tasks.md',
            DASHBOARD: 'docs/04-management/upf-development-dashboard.md',
            SRC: 'src/',
            RESULTS: 'docs/05-quality/verification/test-results.json',
            COVERAGE: 'docs/05-quality/verification/unit-coverage.json',
            HEALING_LOG: 'docs/05-quality/verification/healing-audit-log.md',
            REPORT: 'docs/05-quality/verification/dryrun-report.md',
            INTEGRITY: 'dist/reports/integrity.md',
            MILESTONE: '.milestone',
            QCLM: 'docs/05-quality/spec-qclm.md',
            VERIFY_DIR: 'docs/05-quality/verification',
            QA_LOG: 'docs/05-quality/verification/qa-audit-log.md',
            METRICS_REPORT: 'docs/05-quality/verification/quality-metrics-report.json',
            TEST_CASE_TEMPLATE: 'docs/05-quality/verification/test-case-template.md',
            TEST_CASES_DIR: 'docs/05-quality/verification/test-cases',
            API_DIR: 'docs/02-design/api/',
            ARCH_DIR: 'docs/02-design/arch/',
            ADR_DIR: 'docs/02-design/arch/adr/',
            API_YAML: 'docs/02-design/api/external/3gpp-n4.yaml',
            OSS_REPORT: 'docs/05-quality/verification/oss-compliance-report.md',
            OSS_ATTRIBUTIONS: 'docs/05-quality/OSS_ATTRIBUTIONS.md',
            CHARTER: 'docs/04-management/spec-charter.md',
            PRODUCT_SPEC: 'docs/02-design/api/external/product-spec.md',
            N4_HEADER: 'src/cp-core/pfcp_session.h'
        },
        THRESHOLDS: {
            MIN_COVERAGE: 80.0,
            TARGET_PASS_RATE: 100.0,
            HEAL_COVERAGE_MOCK: 85.0,
            EVIDENCE_MAX_AGE_SEC: 300
        },
        METRICS_THRESHOLDS: {
            REQ_STABILITY: 0.9,           // 需求稳定度 > 90%
            REQ_REVIEW_DENSITY: 0.3,      // 需求评审缺陷密度 0.3-0.5/页
            DESIGN_REVIEW_DENSITY: 0.5,   // 设计评审缺陷密度 0.5/页
            CODE_REVIEW_DENSITY: 8.0,     // 代码评审缺陷密度 >= 8/KLOC
            MAX_COMPLEXITY: 15,           // 平均圈复杂度 < 15
            MAX_DUPLICATION: 0.1,         // 重复代码比例 < 10%
            MIN_TC_PER_SR: 1.0,           // 测试用例对需求覆盖率 100% (即 1:1)
            MIN_TC_DENSITY: 20,           // 测试用例密度 20个/KLOC
            MIN_PASS_RATE: 98.0,          // 用例执行通过率 > 98%
            MAX_TEST_ROUNDS: 3,           // 版本测试轮次 <= 3
            MAX_BUG_REOPEN_RATE: 0.05,    // Bug 回归不通过率 < 5%
            MIN_TRACE_DENSITY: 1.0        // 每 KLOC 必须包含的 @Trace 注解数
        },
        OSS_POLICY: {
            FORBIDDEN: ['GPL', 'AGPL', 'SSPL'],
            RESTRICTED: ['LGPL', 'MPL'],
            PERMISSIVE: ['MIT', 'Apache', 'BSD', 'ISC']
        },
        MOCKS: {
            DRYRUN_REQ_ID: 'RR.UPF.DRYRUN.001'
        },
        ROLE_PERMISSIONS: {
            [ROLES.PM]: ["SCHEDULE_AUDIT", "RISK_TRACK", "RAT_ACCEPT", "DCP_APPROVE", "REQ_CHANGE", "SRS_GEN", "RTM_MAINTAIN", "PLAN_MANAGE"],
            [ROLES.PRODUCT]: ["CHARTER_LOCK", "DCP_PASS", "GTM_AUDIT"],
            [ROLES.SE]: ["REQ_DECOMP", "INTF_DEF", "SRS_GEN", "RTM_MAINTAIN"],
            [ROLES.ARCHITECT]: ["TR_APPROVE", "API_LOCKED", "HLD_CHANGE", "ADR_REVIEW"],
            [ROLES.MAINTAINER]: ["STAGE_TRANS", "DECISION_PASS", "HOTFIX_APPROVE", "CONFIG_MANAGE"],
            [ROLES.QA]: ["AUDIT_SIGN", "GATE_INTERCEPT", "QUALITY_AUDIT", "STUB_GEN", "RESULT_SYNC", "UNIT_TEST", "API_LOCKED", "CODE_TRACE", "SRS_GEN"],
            [ROLES.DEV]: ["CODE_TRACE", "UNIT_TEST", "MEM_AUDIT"],
            [ROLES.TESTER]: ["IT_TEST", "ST_TEST", "RESULT_SYNC", "STUB_GEN"],
            [ROLES.GUEST]: []
        }
    };
} catch (e) {
    console.error(`❌ [Config Load] Fatal Error: ${e.message}`);
    process.exit(1);
}
