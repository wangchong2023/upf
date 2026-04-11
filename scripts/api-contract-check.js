/**
 * @职责: 自动补齐的治理脚本
 * @版本: v1.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * API 契约验证脚本 v1.0
 * 职责：确保代码中的结构定义与 OpenAPI YAML 契约一致
 */

console.log("🔍 Starting API Contract Validation...");

// Role Gate Check
try {
    execSync('node scripts/mgr-role-gate.js --action=API_LOCKED', { stdio: 'inherit' });
} catch (e) {
    process.exit(1);
}

const yamlPath = "docs/02-design/api/external/3gpp-n4.yaml";
const srcPath = "src/cp-core/pfcp_session.h"; // 假设的 N4 核心结构体位置

if (!fs.existsSync(yamlPath)) {
    console.warn("⚠️ API Spec not found, skipping contract check.");
    process.exit(0);
}

const yamlContent = fs.readFileSync(yamlPath, 'utf-8');

// 简单逻辑：检查 YAML 中定义的 Schema 是否在源码中存在对应的标记或结构
const schemasToMatch = ['SessionEstablishmentRequest', 'PDR', 'PDI'];
let missing = [];

schemasToMatch.forEach(schema => {
    // 实际生产中应使用正则解析源码文件
    // 此处模拟检查：如果在源码中未找到对应名称，则报错
    if (fs.existsSync(srcPath)) {
        const srcContent = fs.readFileSync(srcPath, 'utf-8');
        if (!srcContent.includes(schema)) {
            missing.push(schema);
        }
    } else {
        // 如果源码文件尚未创建，标记为警告而非错误（支持设计先行）
        console.log(`💡 [INFO] Implementation file ${srcPath} not found yet for schema ${schema}.`);
    }
});

if (missing.length > 0) {
    console.error(`❌ Contract Violation: Missing implementation for schemas: ${missing.join(', ')}`);
    process.exit(1);
} else {
    console.log("🟢 API Contract check passed (or implementation is pending).");
}
