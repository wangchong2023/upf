const config = require('../core/mgr-config');
/**
 * @职责: 自动补齐的治理脚本 - PM Agent
 * @版本: v1.2 (SMART Time-bound Edition)
 */

const fs = require('fs');
const { execSync } = require('child_process');

/**
 * 进度与逾期审计
 */
function auditSchedule() {
    const planPath = config.PATHS.PLAN;
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
            
            // SMART 拦截：严禁里程碑逾期 (Open 且 日期已过)
            if (!status.includes('Done') && planDate < today && parts[3] !== '-' && !isNaN(planDate)) {
                console.error(`❌ [OVERDUE_BLOCKER] Milestone ${parts[1]} is overdue! (Plan: ${parts[3]})`);
                delays++;
            }
        }
    });

    if (delays > 0) {
        throw new Error(`Schedule audit failed: ${delays} overdue milestones detected.`);
    }
}

/**
 * 行动项逾期审计 (SMART Time-bound)
 */
function auditActionItems() {
    const logPath = config.PATHS.LOG;
    if (!fs.existsSync(logPath)) return;
    
    console.log(`🔍 [PM Agent] Auditing Decision Action Items...`);
    const content = fs.readFileSync(logPath, 'utf-8');
    const lines = content.split('\n');
    const today = new Date();
    let overdueItems = 0;

    lines.forEach(line => {
        if (line.includes('| Open |')) {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length >= 6) {
                const dueDate = new Date(parts[5]);
                if (dueDate < today && !isNaN(dueDate)) {
                    console.error(`❌ [ACTION_OVERDUE] Action item '${parts[2]}' is overdue (Due: ${parts[5]})`);
                    overdueItems++;
                }
            }
        }
    });

    if (overdueItems > 0) {
        throw new Error(`Action item audit failed: ${overdueItems} overdue items detected.`);
    }
}

/**
 * 主逻辑
 */
function main() {
    try {
        console.log("🚀 [PM Agent] Starting SMART project control...");
        execSync('node scripts/core/mgr-role-gate.js --action=SRS_GEN', { stdio: 'inherit' });
        
        execSync('node scripts/tools/auto-req-sync.js', { stdio: 'inherit' });
        
        auditSchedule();
        auditActionItems();
        
        execSync('node scripts/tools/mgr-dashboard-refresh.js', { stdio: 'inherit' });
        console.log("✅ [PM Agent] SMART Audit complete.");
    } catch (error) {
        console.error(`❌ [PM Agent] Fatal Error: ${error.message}`);
        process.exit(1);
    }
}

main();
