/**
 * @职责: 自动补齐的治理脚本 - PM Agent
 * @版本: v1.0
 */

const fs = require('fs');
const { execSync } = require('child_process');

const args = process.argv.slice(2);
const targetVersion = args.find(a => a.startsWith('--version='))?.split('=')[1];

/**
 * 进度审计
 */
function auditSchedule() {
    const planPath = 'docs/04-management/spec-project-plan.md';
    if (!fs.existsSync(planPath)) return;

    console.log(`🔍 [PM Agent] Auditing Master Schedule...`);
    const content = fs.readFileSync(planPath, 'utf-8');
    const lines = content.split('\n');
    const today = new Date();
    let delays = 0;

    lines.forEach(line => {
        if (line.includes('| **')) {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length < 6) return;
            const planDate = new Date(parts[3]);
            const status = parts[5];
            if (!status.includes('Done') && planDate < today && parts[3] !== '-') {
                console.warn(`⚠️ [DELAY RISK] Milestone ${parts[1]} is overdue! (Plan: ${parts[3]})`);
                delays++;
            }
        }
    });

    if (delays > 0) {
        throw new Error("Schedule audit failed: overdue milestones detected.");
    }
}

/**
 * AI 审计
 */
function auditActionItems() {
    const logPath = 'docs/04-management/spec-decision-log.md';
    if (!fs.existsSync(logPath)) return;
    const content = fs.readFileSync(logPath, 'utf-8');
    const openItems = (content.match(/\| Open \|/g) || []).length;
    if (openItems > 0) console.log(`💡 [PM Agent] ${openItems} action items pending.`);
}

/**
 * 主逻辑
 */
function main() {
    try {
        console.log("🚀 [PM Agent] Starting unified project control...");
        execSync('node scripts/mgr-role-gate.js --action=SRS_GEN', { stdio: 'inherit' });
        
        // 需求同步
        execSync('node scripts/auto-req-sync.js', { stdio: 'inherit' });
        
        auditSchedule();
        auditActionItems();
        
        execSync('make dashboard', { stdio: 'inherit' });
        console.log("✅ [PM Agent] Audit complete.");
    } catch (error) {
        console.error(`❌ [PM Agent] Fatal Error: ${error.message}`);
        process.exit(1);
    }
}

main();
