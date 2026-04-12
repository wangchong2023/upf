/**
 * @职责: 测试结果物理同步工具 v2.0
 * @作者: Gemini CLI
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const config = require('../core/mgr-config');

const PATHS = config.PATHS;

/**
 * 主逻辑
 */
function main() {
    try {
        console.log("🔄 Starting Physical Test Result Back-filling...");

        if (!fs.existsSync(PATHS.RESULTS)) {
            console.warn(`⚠️ No test results found at ${PATHS.RESULTS}. Skipping sync.`);
            return;
        }

        // 1. 读取原始测试产物 (JSON)
        const results = JSON.parse(fs.readFileSync(PATHS.RESULTS, 'utf-8'));
        const passedIds = new Set(results.filter(r => r.status === 'Pass').map(r => r.id));

        // 2. 物理更新 RAT 验收矩阵
        if (fs.existsSync(PATHS.RAT)) {
            let ratContent = fs.readFileSync(PATHS.RAT, 'utf-8');
            let updated = false;

            passedIds.forEach(id => {
                // 将匹配到的行从 Pending 改为 Accepted
                const regex = new RegExp(`(\\| \\*\\*${id}\\*\\* \\| [^|]+ \\| [^|]+ \\| )\\*\\*Pending\\*\\*`, 'g');
                if (regex.test(ratContent)) {
                    ratContent = ratContent.replace(regex, `$1**Accepted**`);
                    updated = true;
                    console.log(`   ✅ Synced: ${id} -> Accepted`);
                }
            });

            if (updated) {
                fs.writeFileSync(PATHS.RAT, ratContent);
                console.log("✨ Physical RAT matrix updated.");
            }
        }

        // 3. 物理更新 RTM 状态
        if (fs.existsSync(PATHS.RTM)) {
            let rtmContent = fs.readFileSync(PATHS.RTM, 'utf-8');
            passedIds.forEach(id => {
                const regex = new RegExp(`(\\| \\*\\*${id}\\*\\* \\| [^|]+ \\| [^|]+ \\| [^|]+ \\| [^|]+ \\| [^|]+ \\| [^|]+ \\| [^|]+ \\| [^|]+ \\| )待开发`, 'g');
                if (regex.test(rtmContent)) {
                    rtmContent = rtmContent.replace(regex, `$1已验证 ✅`);
                }
            });
            fs.writeFileSync(PATHS.RTM, rtmContent);
        }

        console.log("✅ Physical Result Synchronization Complete.");
    } catch (error) {
        console.error(`❌ [Result Sync] Error: ${error.message}`);
        process.exit(1);
    }
}

main();
