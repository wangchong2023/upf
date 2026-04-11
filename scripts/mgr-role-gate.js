/**
 * @职责: 自动补齐的治理脚本
 * @版本: v1.0
 */

const fs = require('fs');
const crypto = require('crypto');

/**
 * 角色化门控系统 v2.1 (合规增强版)
 * 职责：校验操作者身份 (支持 Token 验证)，防止跨权操作里程碑决策
 */

try {
    const ROLES = {
        PM: ["SCHEDULE_AUDIT", "RISK_TRACK", "RAT_ACCEPT", "DCP_APPROVE", "REQ_CHANGE", "SRS_GEN", "RTM_MAINTAIN", "PLAN_MANAGE"],
        PRODUCT: ["CHARTER_LOCK", "DCP_PASS", "GTM_AUDIT"],
        SE: ["REQ_DECOMP", "INTF_DEF", "SRS_GEN", "RTM_MAINTAIN"],
        ARCHITECT: ["TR_APPROVE", "API_LOCKED", "HLD_CHANGE", "ADR_REVIEW"],
        MAINTAINER: ["STAGE_TRANS", "DECISION_PASS", "HOTFIX_APPROVE", "CONFIG_MANAGE"],
        QA: ["AUDIT_SIGN", "GATE_INTERCEPT", "QUALITY_AUDIT", "STUB_GEN", "RESULT_SYNC", "UNIT_TEST", "API_LOCKED", "CODE_TRACE"],
        DEV: ["CODE_TRACE", "UNIT_TEST", "MEM_AUDIT"],
        TESTER: ["IT_TEST", "ST_TEST", "RESULT_SYNC", "STUB_GEN"]
    };

    // 优先从环境变量读取私钥，避免硬编码
    const SYSTEM_SECRET = process.env.UPF_SYSTEM_SECRET || "upf-cloud-native-2026"; 

    const args = process.argv.slice(2);
    const action = args.find(a => a.startsWith('--action='))?.split('=')[1];
    const token = process.env.ACTIVE_TOKEN || ''; 
    const currentRole = process.env.ACTIVE_ROLE || 'GUEST';

    console.log(`👤 Identifying Role: [${currentRole}]`);

    if (!action) {
        console.error("❌ No action specified for role-gate.");
        process.exit(1);
    }

    // 简单的 Token 校验逻辑 (模拟身份认证)
    // Token 生成逻辑：HMAC_SHA256(Role, Secret)
    /**
 * @职责: 自动补齐的治理函数
 */
const verifyToken = (role, token) => {
        if (role === 'GUEST') return false;
        const expected = crypto.createHmac('sha256', SYSTEM_SECRET).update(role.toUpperCase()).digest('hex').substring(0, 16);
        return token === expected;
    };

    const isAuthorized = verifyToken(currentRole, token);

    if (!isAuthorized && currentRole !== 'GUEST') {
        console.warn(`⚠️  [SECURITY] Role [${currentRole}] provided an invalid or missing token. Falling back to read-only guest mode.`);
    }

    const activeRole = isAuthorized ? currentRole.toUpperCase() : 'GUEST';

    // 检查角色是否有权执行该动作
    const allowedActions = ROLES[activeRole] || [];
    if (allowedActions.includes(action.toUpperCase())) {
        console.log(`✅ Authorization Success: ${activeRole} is permitted to perform ${action}.`);
        process.exit(0);
    } else {
        console.error(`\n🚫 Authorization Denied: Role [${activeRole}] is NOT authorized for [${action}].`);
        console.error(`   Required Roles: ${Object.keys(ROLES).filter(r => ROLES[r].includes(action.toUpperCase())).join(', ')}`);
        process.exit(1);
    }
} catch (error) {
    console.error(`❌ [Role Gate] Critical Error: ${error.message}`);
    process.exit(1);
}
