/**
 * @职责: CBB 资产合规性审计工具 v1.1
 * @作者: Gemini CLI
 */

const fs = require('fs');
const path = require('path');
const config = require('../core/mgr-config');

const CBB_DIR = config.PATHS.CBB_DIR;

/**
 * @职责: 自动补齐的治理函数
 */
function main() {
    try {
        console.log("🔍 Starting CBB Asset Compliance Audit...");

        if (!fs.existsSync(CBB_DIR)) {
            console.warn("⚠️  No CBB directory found. Skipping.");
            return;
        }

        /**
 * @职责: 自动补齐的治理函数
 */
const scan = (dir) => {
            const items = fs.readdirSync(dir);
            items.forEach(item => {
                const fullPath = path.join(dir, item);
                if (fs.statSync(fullPath).isDirectory()) {
                    scan(fullPath);
                } else if (item.endsWith('.go') || item.endsWith('.c')) {
                    // 过滤掉测试文件本身
                    if (item.endsWith('_test.go') || item.startsWith('test_')) return;

                    // 1. 核实单元测试对齐
                    const testFile = item.endsWith('.go') ? 
                        item.replace('.go', '_test.go') : 
                        `test_${item}`;
                    
                    const testPath = path.join(dir, testFile);
                    if (!fs.existsSync(testPath)) {
                        console.error(`❌ [CBB_NO_TEST] CBB module ${item} lacks a physical unit test: ${testFile}`);
                        process.exit(1);
                    }
                }
            });
        };

        scan(CBB_DIR);
        console.log("✅ All CBB assets meet independent verification standards.");
    } catch (error) {
        console.error(`❌ [CBB Audit] Error: ${error.message}`);
        process.exit(1);
    }
}

main();
