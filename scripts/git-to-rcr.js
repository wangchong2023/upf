/**
 * @职责: 自动补齐的治理脚本
 * @版本: v1.0
 */

const { execSync } = require('child_process');
const fs = require('fs');

/**
 * 变更感知审计脚本 v1.0
 * 职责：确保核心架构/代码变更必须伴随 RCR 变更单更新
 */

console.log("🔍 Auditing Architectural Changes vs RCR Records...");

const SENSITIVE_PATHS = ['src/', 'docs/02-design/api/', 'docs/02-design/arch/'];
const RCR_PATH = 'docs/04-management/spec-rcr.md';

try {
    // 1. 获取当前未提交的变更文件列表
    const diff = execSync('git diff --name-only HEAD').toString().split('\n');
    
    // 2. 检查是否有敏感路径变更
    const hasSensitiveChanges = diff.some(file => 
        SENSITIVE_PATHS.some(p => file.startsWith(p))
    );

    // 3. 检查 RCR 文件是否也在本次变更中被修改
    const isRCRUpdated = diff.some(file => file === RCR_PATH);

    if (hasSensitiveChanges && !isRCRUpdated) {
        console.error("\n❌ [BLOCKER] Architectural or Code changes detected without RCR update!");
        console.error(`   Please record your changes in ${RCR_PATH} before proceeding.`);
        console.error("   Affected paths: " + SENSITIVE_PATHS.join(', '));
        process.exit(1);
    } else {
        console.log("✅ Change Sync: Architectural changes are properly matched with RCR updates (or no sensitive changes found).");
        process.exit(0);
    }
} catch (e) {
    // 如果不在 git 环境中，跳过此检查
    console.warn("⚠️ Warning: Not a git repository or git not found. Skipping RCR sync check.");
    process.exit(0);
}
