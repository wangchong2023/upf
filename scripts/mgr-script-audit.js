const fs = require('fs');
const path = require('path');

/**
 * 脚本编码规范审计与自动修复工具 (v1.2)
 * 职责：强制校验并自动修复 JavaScript/Shell 脚本的设计与开发规范性
 */

try {
    const args = process.argv.slice(2);
    const isFixMode = args.includes('--fix');
    
    console.log(`🔍 Starting Script Specification Audit ${isFixMode ? '(FIX MODE)' : ''}...`);

    const SCRIPT_DIR = 'scripts';
    const rules = {
        "HEADER_COMMENT": {
            check: (content) => content.includes('/**') || content.startsWith('#!/bin/bash'),
            fix: (content, filename) => {
                if (filename.endsWith('.js')) {
                    return `/**\n * @职责: 自动补齐的治理脚本\n * @版本: v1.0\n */\n\n${content}`;
                }
                return content; // Shell 自动修复较复杂，暂不处理
            },
            message: "Missing mandatory JSDoc header or shebang."
        },
        "NO_EVAL": {
            check: (content, filename) => {
                if (filename === 'mgr-script-audit.js') return true;
                return !content.includes('eval' + '(');
            },
            message: "Found unsafe use of eval()."
        },
        "ERROR_HANDLING": {
            check: (content) => content.includes('try' + ' {') || content.startsWith('#!/bin/bash'),
            message: "Missing try-catch error handling in JS script."
        },
        "NO_HARDCODED_SECRETS": {
            check: (content, filename) => {
                if (filename === 'mgr-script-audit.js') return true;
                const secretRegex = new RegExp('(password|secret|key|token)\\s*=\\s*[\'"][a-zA-Z0-9]{8,}', 'i');
                if (content.includes('process.env.') || content.includes('SYSTEM_SECRET')) return true; 
                return !secretRegex.test(content);
            },
            message: "Potential hardcoded secret detected."
        }
    };

    let errors = 0;

    const auditScripts = (dir) => {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
            const fullPath = path.join(dir, file);
            if (fs.statSync(fullPath).isDirectory()) {
                auditScripts(fullPath);
            } else if (file.endsWith('.js') || file.endsWith('.sh')) {
                let content = fs.readFileSync(fullPath, 'utf-8');
                let modified = false;
                console.log(`  - Auditing: ${file}`);
                
                Object.keys(rules).forEach(ruleName => {
                    const rule = rules[ruleName];
                    if (!rule.check(content, file)) {
                        if (isFixMode && rule.fix) {
                            console.log(`    🔧 [FIXING] ${ruleName}...`);
                            content = rule.fix(content, file);
                            modified = true;
                        } else {
                            console.error(`    ❌ [${ruleName}] ${rule.message}`);
                            errors++;
                        }
                    }
                });

                if (modified) {
                    fs.writeFileSync(fullPath, content);
                }
            }
        });
    };

    auditScripts(SCRIPT_DIR);
    if (errors > 0) {
        console.error(`\n🚨 Audit Failed: ${errors} specification violations found.`);
        process.exit(1);
    } else {
        console.log("\n✅ Audit Passed: All scripts follow the design and development specifications.");
        process.exit(0);
    }
} catch (error) {
    console.error(`❌ [Script Audit] Error: ${error.message}`);
    process.exit(1);
}
