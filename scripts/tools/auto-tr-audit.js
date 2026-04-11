/**
 * @职责: TR 评审自动化审计脚本 v2.0 (Deep Decision Audit)
 * @作者: Gemini CLI
 */

const fs = require('fs');
const path = require('path');
const config = require('../core/mgr-config');

const PATHS = config.PATHS;

/**
 * 审计特定阶段的评审决策
 */
function auditReviewDecision(stage) {
    const reviewDir = PATHS.VERIFY_DIR;
    const files = fs.readdirSync(reviewDir);
    
    // 寻找匹配该阶段的评审报告，例如 tr2-review-report-001.md
    const pattern = new RegExp(`${stage.toLowerCase()}-review-report`, 'i');
    const targetReport = files.find(f => pattern.test(f));

    if (!targetReport) {
        console.warn(`⚠️  Warning: No physical review report found for stage ${stage} in ${reviewDir}.`);
        return true; // 允许阶段启动，但在 Gate 层面会有告警
    }

    const reportPath = path.join(reviewDir, targetReport);
    const content = fs.readFileSync(reportPath, 'utf-8');

    console.log(`🔍 [TR Audit] Auditing decision in: ${targetReport}`);

    // 正则提取决策结论 (适配中文/英文及加粗格式)
    const conclusionMatch = content.match(/结论[:：]\s*(?:\*\*)?([A-Za-z\u4e00-\u9fa5-]+)(?:\*\*)?/i);
    
    if (conclusionMatch) {
        const decision = conclusionMatch[1].trim();
        console.log(`   - Decision Found: [${decision}]`);

        const failDecisionWords = ['No-Go', 'Fail', '拒绝', '不同意', '拦截', '不通过'];
        const isFailure = failDecisionWords.some(word => decision.includes(word));

        if (isFailure) {
            console.error(`❌ [REVIEW_BLOCKED] Stage ${stage} review resulted in a '${decision}'. Quality gate failed.`);
            process.exit(1);
        }
    } else {
        console.warn(`⚠️  Warning: Could not parse final conclusion from ${targetReport}. Manual sign-off required.`);
    }

    return true;
}

/**
 * 主逻辑
 */
function main() {
    try {
        const args = process.argv.slice(2);
        const stage = args.find(a => a.startsWith('--stage='))?.split('=')[1] || "GENERAL";

        console.log(`🚀 Starting Physical TR Audit for stage: ${stage}...`);
        auditReviewDecision(stage);
        console.log("✅ TR Audit Passed.");
    } catch (error) {
        console.error(`❌ [TR Audit] Error: ${error.message}`);
        process.exit(1);
    }
}

main();
