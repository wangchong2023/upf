/**
 * @职责: 自动补齐的治理脚本
 * @版本: v2.2
 */

const fs = require('fs');
const crypto = require('crypto');
const config = require('./mgr-config');

/**
 * 角色化门控系统 v2.2 (元数据语义化版)
 * 职责：校验操作者身份 (支持 Token 验证)，防止跨权操作里程碑决策
 */

try {
    const ROLE_PERMISSIONS = config.ROLE_PERMISSIONS;

    // 优先从环境变量读取私钥，避免硬编码
    const SYSTEM_SECRET = process.env.UPF_SYSTEM_SECRET || "upf-cloud-native-2026"; 

    const args = process.argv.slice(2);
    const action = args.find(a => a.startsWith('--action='))?.split('=')[1];
    const token = process.env.ACTIVE_TOKEN || ''; 
    const currentRole = (process.env.ACTIVE_ROLE || config.ROLES.GUEST).toUpperCase();

    console.log(`👤 Identifying Role: [${currentRole}]`);

    if (!action) {
        console.error("❌ No action specified for role-gate.");
        process.exit(1);
    }

    /**
     * @职责: 自动补齐的治理函数
     */
    const verifyToken = (role, token) => {
        if (role === config.ROLES.GUEST) return false;
        const expected = crypto.createHmac('sha256', SYSTEM_SECRET).update(role).digest('hex').substring(0, 16);
        return token === expected;
    };

    const isAuthorized = verifyToken(currentRole, token);

    if (!isAuthorized && currentRole !== config.ROLES.GUEST) {
        console.warn(`⚠️  [SECURITY] Role [${currentRole}] provided an invalid or missing token. Falling back to read-only guest mode.`);
    }

    const activeRole = isAuthorized ? currentRole : config.ROLES.GUEST;

    // 检查角色是否有权执行该动作
    const allowedActions = ROLE_PERMISSIONS[activeRole] || [];
    if (allowedActions.includes(action.toUpperCase())) {
        console.log(`✅ Authorization Success: ${activeRole} is permitted to perform ${action}.`);
        process.exit(0);
    } else {
        console.error(`\n🚫 Authorization Denied: Role [${activeRole}] is NOT authorized for [${action}].`);
        const requiredRoles = Object.keys(ROLE_PERMISSIONS).filter(r => ROLE_PERMISSIONS[r].includes(action.toUpperCase()));
        console.error(`   Required Roles: ${requiredRoles.join(', ')}`);
        process.exit(1);
    }
} catch (error) {
    console.error(`❌ [Role Gate] Critical Error: ${error.message}`);
    process.exit(1);
}
