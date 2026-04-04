const fs = require('fs');
const { execSync } = require('child_process');

/**
 * PM Agent v2.0 (Enhanced)
 * 职责：
 * 1. 自动生成 SRS 并维护 RTM 需求矩阵
 * 2. 自动监控主进度计划 (docs/spec-project-plan.md) 并执行进度审计
 * 3. 协调跨角色任务项的统一管控
 */

console.log("🚀 [PM Agent] Starting unified project control & progress audit...");

// 1. Role Gate Check
try {
    execSync('node scripts/mgr-role-gate.js --action=SRS_GEN', { stdio: 'inherit' });
} catch (e) {
    process.exit(1);
}

// 2. 需求同步逻辑 (RTM Maintenance)
try {
    process.env.ACTIVE_ROLE = 'PM';
    execSync('node scripts/auto-req-sync.js', { stdio: 'inherit' });
    console.log("✅ [PM Agent] SRS and RTM updated successfully.");
} catch (error) {
    console.error("❌ [PM Agent] Failed to update SRS/RTM.");
}

// 3. 进度审计逻辑 (Schedule Audit)
function auditSchedule() {
    const planPath = 'docs/spec-project-plan.md';
    if (!fs.existsSync(planPath)) return;

    console.log("🔍 [PM Agent] Auditing Master Schedule...");
    const content = fs.readFileSync(planPath, 'utf-8');
    const lines = content.split('\n');
    const today = new Date();
    let delays = 0;

    lines.forEach(line => {
        if (line.includes('| **')) {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length < 6) return;

            const milestone = parts[1];
            const planDate = new Date(parts[3]);
            const actualDate = parts[4];
            const status = parts[5];

            // 检查延期：状态不是 Done 且当前日期已超过计划日期
            if (!status.includes('Done') && planDate < today && parts[3] !== '-') {
                console.warn(`⚠️ [DELAY RISK] Milestone ${milestone} is overdue! (Plan: ${parts[3]})`);
                delays++;
            }
        }
    });

    if (delays > 0) {
        console.error(`❌ [PM Agent] Schedule audit failed: ${delays} delayed milestones detected.`);
    } else {
        console.log("🟢 [PM Agent] Schedule is on track.");
    }
}

// 4. 决策遗留问题审计 (Action Item Audit)
function auditActionItems() {
    const logPath = 'docs/spec-decision-log.md';
    if (!fs.existsSync(logPath)) return;

    console.log("🔍 [PM Agent] Auditing Decision Log Action Items...");
    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.split('\n');
    let openItems = 0;

    lines.forEach(line => {
        if (line.includes('| **AI.')) {
            if (line.includes('| Open |') || line.includes('| ⚪️ Open |')) {
                const parts = line.split('|').map(p => p.trim());
                console.warn(`⚠️ [OPEN ACTION ITEM] ${parts[1]}: ${parts[3]} (Owner: ${parts[4]})`);
                openItems++;
            }
        }
    });

    if (openItems > 0) {
        console.log(`💡 [PM Agent] Total ${openItems} action items still pending.`);
    }
}

try {
    auditSchedule();
    auditActionItems();
    // 5. 刷新仪表盘
    execSync('make dashboard', { stdio: 'inherit' });
} catch (e) {
    console.error("❌ [PM Agent] Progress audit or dashboard refresh failed.");
}
