/**
 * @职责: 自动补齐的治理脚本
 * @版本: v1.0
 */

const { execSync } = require('child_process');

/**
 * Risk Agent v1.0
 * 职责：定期跟踪风险矩阵状态，生成预警并同步至 QA 审计
 */

console.log("🚀 [Risk Agent] Starting regular risk tracking and maintenance...");

try {
    const args = process.argv.slice(2);
    const targetVersion = args.find(a => a.startsWith('--version='))?.split('=')[1];

    // 1. 强制执行角色校验 (需要 PM 或 QA 权限)
    process.env.ACTIVE_ROLE = 'QA'; 
    
    console.log(`🔍 [Risk Agent] Auditing Risk Register ${targetVersion ? `for version ${targetVersion}` : ''}...`);
    
    // 执行 QA 审计脚本，该脚本已集成风险扫描逻辑
    const cmd = targetVersion ? `make qa-audit VERSION=${targetVersion}` : 'make qa-audit';
    execSync(cmd, { stdio: 'inherit' });
    
    console.log("✅ [Risk Agent] Risk tracking completed. Please review docs/05-quality/verification/qa-audit-log.md for alerts.");
} catch (error) {
    console.error("❌ [Risk Agent] Risk tracking failed. High risks or overdue items detected.");
    process.exit(1);
}
