/**
 * @职责: 自动化测试用例骨架生成工具 v1.2 (Completeness Edition)
 * @作者: Gemini CLI
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const config = require('../core/mgr-config');

// Role Gate Check
try {
    execSync('node scripts/core/mgr-role-gate.js --action=STUB_GEN', { stdio: 'inherit' });
} catch (e) {
    process.exit(1);
}

const rtmPath = config.PATHS.RTM;
const outputDir = config.PATHS.TEST_CASES_DIR;
const templatePath = config.PATHS.TEST_CASE_TEMPLATE;

console.log("🚀 Syncing test case skeletons with RTM (TR5 scope)...");

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

/**
 * @职责: 自动补齐的治理函数
 */
function generateSkeleton(id) {
    const fileName = `TC.${id}.md`;
    const targetPath = path.join(outputDir, fileName);

    if (fs.existsSync(targetPath)) return false;

    let template = fs.existsSync(templatePath) ? fs.readFileSync(templatePath, 'utf-8') : "# Test Case Skeleton";
    template = template.replace(/\[TC_ID\]/g, `TC.${id}`);
    template = template.replace(/\[SR_ID\]/g, id);
    
    fs.writeFileSync(targetPath, template);
    return true;
}

try {
    if (!fs.existsSync(rtmPath)) throw new Error("RTM file missing.");
    const content = fs.readFileSync(rtmPath, 'utf-8');
    const lines = content.split('\n');
    
    let createdCount = 0;
    let totalFound = 0;

    lines.forEach(line => {
        // 匹配 TR5 节点的 SR ID
        if (line.includes('TR5') && line.includes('SR.UPF.')) {
            const match = line.match(/SR\.UPF\.[\w\.]+/);
            if (match) {
                const id = match[0];
                totalFound++;
                if (generateSkeleton(id)) {
                    createdCount++;
                }
            }
        }
    });

    console.log(`✅ Success: Found ${totalFound} TR5 requirements, created ${createdCount} new skeletons.`);
} catch (error) {
    console.error(`❌ [Skeleton Gen] Error: ${error.message}`);
    process.exit(1);
}
