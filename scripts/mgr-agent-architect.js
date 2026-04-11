/**
 * @职责: 自动补齐的治理脚本
 * @版本: v1.0
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Architect Agent v1.0
 * 职责：自动执行 ADR 决策评审
 */

const args = process.argv.slice(2);
const targetVersion = args.find(a => a.startsWith('--version='))?.split('=')[1];

console.log(`🚀 [Architect Agent] Starting ADR decision reviews ${targetVersion ? `for version ${targetVersion}` : ''}...`);

// Role Gate Check
try {
    execSync('node scripts/mgr-role-gate.js --action=ADR_REVIEW', { stdio: 'inherit' });
} catch (e) {
    process.exit(1);
}

const adrPath = 'docs/02-design/arch/adr/';
if (!fs.existsSync(adrPath)) {
    console.error("❌ [Architect Agent] ADR path missing.");
    process.exit(1);
}

const adrFiles = fs.readdirSync(adrPath);
const reviews = [];

adrFiles.forEach(file => {
    if (file.endsWith('.md')) {
        const content = fs.readFileSync(path.join(adrPath, file), 'utf-8');
        
        // 过滤逻辑：如果指定了版本，且 ADR 内容中不包含该版本标识，则跳过
        if (targetVersion && !content.includes(targetVersion)) return;

        const status = content.match(/Status:\s+(\w+)/i)?.[1];
        if (status === 'Proposed' || status === 'Draft') {
            reviews.push(`[ADR_REVIEW] File ${file} has Status: ${status}.`);
            reviews.push(`   💡 ACTION: Please activate_skill(name="senior-architect") to review high-concurrency patterns.`);
            reviews.push(`   💡 SECURITY: Please activate_skill(name="ai-security") to audit interface exposure.`);
        }
    }
});

if (reviews.length > 0) {
    console.log(`🔍 [Architect Agent] Found ${reviews.length} ADRs to review.`);
    reviews.forEach(review => console.log(`  - ${review}`));
} else {
    console.log("🟢 [Architect Agent] No pending ADRs found.");
}

console.log("✅ [Architect Agent] ADR decision review analysis complete.");
