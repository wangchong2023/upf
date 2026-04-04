const fs = require('fs');
const path = require('path');

/**
 * 脚本编码规范审计工具 (v1.0)
 * 职责：强制校验 JavaScript/Shell 脚本的设计与开发规范性
 */

console.log("🔍 Starting Script Specification Audit...");

const SCRIPT_DIR = 'scripts';
const rules = {
    // 规则 1: 必须包含规范的 JSDoc 或头部注释
    "HEADER_COMMENT": {
        check: (content) => content.includes('/**') || content.startsWith('#!/bin/bash'),
        message: "Missing mandatory JSDoc header or shebang."
    },
    // 规则 2: 严禁使用 eval (安全性)
    "NO_EVAL": {
        check: (content) => !content.includes('eval('),
        message: "Found unsafe use of eval()."
    },
    // 规则 3: 必须包含错误处理 try-catch (健壮性)
    "ERROR_HANDLING": {
        check: (content) => content.includes('try {') || content.startsWith('#!/bin/bash'),
        message: "Missing try-catch error handling in JS script."
    },
    // 规则 4: 严禁硬编码敏感信息 (安全性)
    "NO_HARDCODED_SECRETS": {
        check: (content) => !content.match(/password|secret|key|token\s*=\s*['"][a-zA-Z0-9]{8,}/i),
        message: "Potential hardcoded secret detected."
    }
};

let errors = 0;

function auditScripts(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            auditScripts(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.sh')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            console.log(`  - Auditing: ${file}`);
            
            Object.keys(rules).forEach(ruleName => {
                const rule = rules[ruleName];
                if (!rule.check(content)) {
                    console.error(`    ❌ [${ruleName}] ${rule.message}`);
                    errors++;
                }
            });
        }
    });
}

try {
    auditScripts(SCRIPT_DIR);
    if (errors > 0) {
        console.error(`\n🚨 Audit Failed: ${errors} specification violations found.`);
        process.exit(1);
    } else {
        console.log("\n✅ Audit Passed: All scripts follow the design and development specifications.");
        process.exit(0);
    }
} catch (e) {
    console.error(`❌ Audit Error: ${e.message}`);
    process.exit(1);
}
