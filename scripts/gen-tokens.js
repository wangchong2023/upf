/**
 * @职责: 自动补齐的治理脚本
 * @版本: v1.0
 */

const crypto = require('crypto');

/**
 * CI/CD 角色令牌生成器 (v1.1)
 * 职责：为 CI/CD 流水线自动化生成合法的 ACTIVE_TOKEN
 */

try {
    const roles = ["PM", "SE", "ARCHITECT", "MAINTAINER", "QA", "DEV", "TESTER"];
    const secret = process.env.UPF_SYSTEM_SECRET || "upf-cloud-native-2026";

    console.log("# Role Token Generator for CI/CD");
    roles.forEach(role => {
        const tokenValue = crypto.createHmac('sha256', secret).update(role).digest('hex').substring(0, 16);
        console.log(`export ACTIVE_ROLE=${role} && export ACTIVE_TOKEN=${tokenValue}`);
    });
} catch (error) {
    console.error(`❌ [Token Gen] Error: ${error.message}`);
    process.exit(1);
}
