/**
 * IPD Pipeline Centralized Configuration
 * 职责：统一管理物理路径、度量阈值及演练元数据
 */
const path = require('path');

module.exports = {
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
        TASK_PLAN: 'docs/04-management/spec-downstream-tasks.md',
        SRC: 'src/',
        RESULTS: 'docs/05-quality/verification/test-results.json',
        COVERAGE: 'docs/05-quality/verification/unit-coverage.json',
        HEALING_LOG: 'docs/05-quality/verification/healing-audit-log.md',
        REPORT: 'docs/05-quality/verification/dryrun-report.md',
        INTEGRITY: 'dist/reports/integrity.md',
        MILESTONE: '.milestone',
        QCLM: 'docs/05-quality/spec-qclm.md',
        VERIFY_DIR: 'docs/05-quality/verification',
        TEST_CASE_TEMPLATE: 'docs/05-quality/verification/test-case-template.md',
        TEST_CASES_DIR: 'docs/05-quality/verification/test-cases'
    },
    THRESHOLDS: {
        MIN_COVERAGE: 80.0,
        TARGET_PASS_RATE: 100.0,
        HEAL_COVERAGE_MOCK: 85.0
    },
    MOCKS: {
        DRYRUN_REQ_ID: 'RR.UPF.DRYRUN.001'
    }
};
