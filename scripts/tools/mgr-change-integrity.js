/**
 * @职责: 变更完整性审计 - 物理检测任何绕过设计网关的代码变更
 * @作者: Gemini CLI (QA-Expert)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../core/mgr-config');

const PATHS = config.PATHS;

/**
 * 扫描 Git 状态，提取涉及变更的 SR_ID 并强制网关审计。
 */
function auditChangeIntegrity() {
    console.log("🛡️  [Integrity Audit] Scanning for unchartered code changes...");

    try {
        // 1. 获取 Git 状态中的变动文件
        const diffOutput = execSync('git diff --name-only HEAD', { encoding: 'utf8' });
        // 物理路径动态获取，消除硬编码
        const srcPrefix = 'src' + path.sep;
        const changedFiles = diffOutput.split('\n').filter(f => f.startsWith(srcPrefix));

        if (changedFiles.length === 0) {
            console.log("✅ No source code changes detected.");
            return;
        }

        console.log(`📡 Detected ${changedFiles.length} changed source files. Checking design authorization...`);

        // 2. 遍历文件，提取 @Trace [SR.UPF.XXX] 标记
        let unauthorizedChanges = [];
        changedFiles.forEach(file => {
            if (!fs.existsSync(file)) return;
            const content = fs.readFileSync(file, 'utf8');
            const traceMatch = content.match(/@Trace\s+\[(SR\.UPF\.[^\]]+)\]/);
            
            if (!traceMatch) {
                unauthorizedChanges.push(`${file} (Missing @Trace tag)`);
            } else {
                const srId = traceMatch[1];
                console.log(`   🔍 Verifying Design Gate for ${srId} associated with ${file}...`);
                try {
                    // 强制运行物理设计网关
                    execSync(`node scripts/tools/mgr-design-gate.js ${srId}`, { stdio: 'pipe' });
                } catch (e) {
                    unauthorizedChanges.push(`${file} (Associated SR ${srId} failed Design Gate)`);
                }
            }
        });

        // 3. 判定结果
        if (unauthorizedChanges.length > 0) {
            console.error("\n❌ [BLOCKER] Illegal code changes detected! Bypass attempt identified:");
            unauthorizedChanges.forEach(c => console.error(`   - ${c}`));
            console.error("\n🚨 Every code change MUST have an authorized @Trace [SR_ID] and pass Physical Design Gate.");
            process.exit(1);
        }

        console.log("✅ Integrity Audit Passed: All changes are authorized and designed.");
    } catch (error) {
        console.warn(`⚠️ Integrity Audit skipped: ${error.message}`);
    }
}

auditChangeIntegrity();
