const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Architect Agent v1.0
 * 职责：自动执行 ADR 决策评审
 */

console.log("🚀 [Architect Agent] Starting ADR decision reviews...");

// Role Gate Check
try {
    execSync('node scripts/mgr-role-gate.js --action=ADR_REVIEW', { stdio: 'inherit' });
} catch (e) {
    process.exit(1);
}

const adrPath = 'docs/arch/adr/';
if (!fs.existsSync(adrPath)) {
    console.error("❌ [Architect Agent] ADR path missing.");
    process.exit(1);
}

const adrFiles = fs.readdirSync(adrPath);
const reviews = [];

adrFiles.forEach(file => {
    if (file.endsWith('.md')) {
        const content = fs.readFileSync(path.join(adrPath, file), 'utf-8');
        const status = content.match(/Status:\s+(\w+)/i)?.[1];
        if (status === 'Proposed' || status === 'Draft') {
            reviews.push(`[ADR_REVIEW] File ${file} has Status: ${status}. Automated review triggered.`);
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
