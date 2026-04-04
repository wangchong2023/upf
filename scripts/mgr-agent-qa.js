const { execSync } = require('child_process');

/**
 * QA Agent v1.0
 * 职责：独立执行 make quality-gate 审计
 */

console.log("🚀 [QA Agent] Starting quality-gate audit...");

// Role Gate Check
try {
    execSync('node scripts/mgr-role-gate.js --action=QUALITY_AUDIT', { stdio: 'inherit' });
} catch (e) {
    process.exit(1);
}

try {
    process.env.ACTIVE_ROLE = 'QA';
    execSync('make quality-gate', { stdio: 'inherit' });
    console.log("✅ [QA Agent] Quality-gate audit passed.");
    console.log("   💡 DEEP_DIVE: Suggest calling activate_skill(name='code-reviewer') for idiomatic pattern checks.");
    console.log("   💡 SKILL_AUDIT: Call activate_skill(name='skill-security-auditor') to scan custom governance scripts.");
} catch (error) {
    console.error("❌ [QA Agent] Quality-gate audit failed.");
    process.exit(1);
}
