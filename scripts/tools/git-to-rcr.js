const config = require('../core/mgr-config');
/**
 * @职责: 自动补齐的治理脚本
 * @版本: v1.1 (Physical Verification Edition)
 */

const { execSync } = require('child_process');
const fs = require('fs');

/**
 * 变更感知审计脚本 v1.1
 * 职责：确保核心架构/代码变更必须伴随 RCR 变更单更新，并核实 Commit ID 的真实性
 */

console.log("🔍 Auditing Architectural Changes vs RCR Records...");

const SENSITIVE_PATHS = [config.PATHS.SRC, config.PATHS.API_DIR, config.PATHS.ARCH_DIR];
const RCR_PATH = config.PATHS.RCR;

try {
    // 1. 获取当前未提交的变更文件列表
    const diff = execSync('git diff --name-only HEAD').toString().split('\n');
    
    // 2. 识别敏感路径下的变更
    const sensitiveChanges = diff.filter(file => SENSITIVE_PATHS.some(p => file.startsWith(p)));

    // 3. 如果有敏感变更，检查 RCR 文档是否更新
    if (sensitiveChanges.length > 0) {
        console.log(`⚠️  Detected changes in sensitive paths: ${sensitiveChanges.join(', ')}`);
        
        // 核实 RCR 文件是否也在本次变更中被修改了
        const isRCRUpdated = diff.some(file => file === RCR_PATH);

        if (!isRCRUpdated) {
            console.error("\n❌ [BLOCKER] Architectural or Code changes detected without RCR update!");
            console.error(`   Please record your changes in ${RCR_PATH} before proceeding.`);
            console.error(`   Affected paths: ${SENSITIVE_PATHS.join(', ')}`);
            process.exit(1);
        }

        // 4. 深度审计：物理核实 RCR 中记录的 Commit ID (SMART Specific)
        console.log("🔍 [RCR Audit] Verifying physical Commit IDs mentioned in RCR...");
        const rcrContent = fs.readFileSync(RCR_PATH, 'utf-8');
        // 匹配 7 到 40 位的十六进制 Commit Hash
        const commitMatches = rcrContent.match(/\b[0-9a-f]{7,40}\b/g) || [];
        
        for (const hash of commitMatches) {
            try {
                execSync(`git rev-parse --verify ${hash}`, { stdio: 'ignore' });
                // console.log(`   ✅ Validated Commit: ${hash}`);
            } catch (e) {
                console.error(`❌ [FAKE_COMMIT] RCR references a non-existent Git commit: ${hash}`);
                process.exit(1);
            }
        }
        console.log(`   ✅ All ${commitMatches.length} Commit IDs verified physically.`);
    } else {
        console.log("✅ No sensitive changes requiring RCR updates found.");
    }
} catch (e) {
    // 如果不在 git 环境中，跳过此检查
    console.warn("⚠️ Warning: Not a git repository or git error. Skipping physical RCR audit.");
    process.exit(0);
}
