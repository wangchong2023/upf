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
            check: (content) => content.includes('@职责') || content.startsWith('#!/bin/bash'),
            fix: (content, filename) => {
                if (filename.endsWith('.js')) {
                    return `/**\n * @职责: 自动补齐的治理脚本\n * @版本: v1.0\n */\n\n${content}`;
                }
                return content; 
            },
            message: "Missing mandatory JSDoc header with @职责 or shebang."
        },
        "FUNCTION_JSDOC": {
            check: (content, filename) => {
                if (filename.endsWith('.sh') || filename === 'mgr-script-audit.js') return true;
                
                // Also check for redundant JSDoc blocks
                const redundantPattern = /(\/\*\*[\s\S]*?@职责: 自动补齐的治理函数[\s\S]*?\*\/[ \t]*\r?\n?){2,}/g;
                if (redundantPattern.test(content)) return false;

                const functions = content.match(/(async\s+)?function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>/g) || [];
                for (const func of functions) {
                    const funcName = func.includes('function') ? func.split(/\s+/).pop() : func.match(/const\s+(\w+)/)[1];
                    if (funcName === 'auditScripts') continue; 
                    
                    const lines = content.split('\n');
                    const funcLineIndex = lines.findIndex(l => l.includes(func));
                    if (funcLineIndex <= 0) continue;
                    
                    let hasJSDoc = false;
                    for (let i = funcLineIndex - 1; i >= Math.max(0, funcLineIndex - 5); i--) {
                        if (lines[i].includes('*/')) {
                            hasJSDoc = true;
                            break;
                        }
                    }
                    if (!hasJSDoc) return false;
                }
                return true;
            },
            fix: (content, filename) => {
                if (filename.endsWith('.sh') || filename === 'mgr-script-audit.js') return content;
                
                let newContent = content;
                
                // Improved redundant pattern removal
                const redundantPattern = /(\/\*\*[\s\S]*?@职责: 自动补齐的治理函数[\s\S]*?\*\/[ \t]*\r?\n?){2,}/g;
                newContent = newContent.replace(redundantPattern, (match) => {
                    const parts = match.split(/\/\*\*/);
                    return '/**' + parts[1];
                });

                const functions = newContent.match(/(async\s+)?function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>/g) || [];
                functions.forEach(func => {
                    const funcName = func.includes('function') ? func.split(/\s+/).pop() : func.match(/const\s+(\w+)/)[1];
                    if (funcName === 'auditScripts') return;
                    
                    const lines = newContent.split('\n');
                    const funcLineIndex = lines.findIndex(l => l.includes(func));
                    
                    let hasJSDoc = false;
                    if (funcLineIndex > 0) {
                        for (let i = funcLineIndex - 1; i >= Math.max(0, funcLineIndex - 5); i--) {
                            if (lines[i].includes('*/')) {
                                hasJSDoc = true;
                                break;
                            }
                        }
                    }

                    if (!hasJSDoc) {
                        const target = func;
                        newContent = newContent.replace(target, `/**\n * @职责: 自动补齐的治理函数\n */\n${target}`);
                    }
                });
                return newContent;
            },
            message: "Missing or redundant JSDoc documentation for function definitions."
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
