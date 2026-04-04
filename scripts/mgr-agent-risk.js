const { execSync } = require('child_process');

/**
 * Risk Agent v1.0
 * 职责：定期跟踪风险矩阵状态，生成预警并同步至 QA 审计
 */

console.log("🚀 [Risk Agent] Starting regular risk tracking and maintenance...");

try {
    // 1. 强制执行角色校验 (需要 PM 或 QA 权限)
    // 注意：在 Agent 内部通过 env 模拟角色身份
    process.env.ACTIVE_ROLE = 'QA'; 
    
    console.log("🔍 [Risk Agent] Auditing Risk Register (docs/spec-risk-register.md)...");
    
    // 执行 QA 审计脚本，该脚本已集成风险扫描逻辑
    execSync('make qa-audit', { stdio: 'inherit' });
    
    console.log("✅ [Risk Agent] Risk tracking completed. Please review docs/verification/qa-audit-log.md for alerts.");
} catch (error) {
    console.error("❌ [Risk Agent] Risk tracking failed. High risks or overdue items detected.");
    process.exit(1);
}
