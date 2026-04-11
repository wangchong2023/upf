/**
 * @职责: IPD Agent 编排器 v2.4 (元数据语义化版)
 * @作者: Gemini CLI
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const config = require('./mgr-config');

/**
 * 编排器主入口
 */
function main() {
    try {
        const milestonePath = config.PATHS.MILESTONE;
        if (!fs.existsSync(milestonePath)) {
            console.error(`❌ [${milestonePath}] file not found.`);
            process.exit(1);
        }

        const currentMilestone = fs.readFileSync(milestonePath, 'utf-8').trim().toUpperCase();
        console.log(`🚀 [Orchestrator] Current Milestone: ${currentMilestone}`);

        const S = config.STAGES;
        const R = config.ROLES;

        const agentMap = {
            [S.CDCP]: ['mgr-agent-product.js', 'mgr-agent-pm.js', 'mgr-agent-se.js'],
            [S.TR1]:  ['mgr-agent-product.js', 'mgr-agent-pm.js', 'mgr-agent-se.js'],
            [S.TR2]:  ['mgr-agent-se.js'],
            [S.TR3]:  ['mgr-agent-architect.js'],
            [S.PDCP]: ['mgr-agent-architect.js'],
            [S.TR4]:  ['mgr-agent-dev.js'],
            [S.TR4A]: ['mgr-agent-dev.js'],
            [S.TR5]:  ['mgr-agent-tester.js'],
            [S.ADCP]: ['mgr-agent-tester.js'],
            [S.TR6]:  ['mgr-agent-product.js', 'mgr-agent-qa.js', 'mgr-agent-pm.js']
        };

        const agentConfig = {
            'mgr-agent-product.js':   { role: R.PRODUCT,   token: 'dfe7551bc1f75f35' },
            'mgr-agent-pm.js':        { role: R.PM,        token: '5284effb305c8074' },
            'mgr-agent-se.js':        { role: R.SE,        token: 'a5a25ad952a66075' },
            'mgr-agent-architect.js': { role: R.ARCHITECT, token: '786a9b7146bc1bf0' },
            'mgr-agent-dev.js':       { role: R.DEV,       token: '0af963e78ef93a9d' },
            'mgr-agent-tester.js':    { role: R.TESTER,    token: '502e02404ee169fe' },
            'mgr-agent-qa.js':        { role: R.QA,        token: 'e4b8e49883e0defd' }
        };

        const agentsToRun = agentMap[currentMilestone] || [];

        if (agentsToRun.length === 0) {
            console.warn(`⚠️ [Orchestrator] No agents mapped for milestone: ${currentMilestone}`);
        } else {
            console.log(`📡 [Orchestrator] Triggering agents: ${agentsToRun.join(', ')}`);
            agentsToRun.forEach(agentScript => {
                const scriptPath = path.join(__dirname, '../agents', agentScript);
                if (fs.existsSync(scriptPath)) {
                    const agentCfg = agentConfig[agentScript] || { role: R.GUEST, token: '' };
                    try {
                        const output = execSync(`node ${scriptPath}`, { 
                            stdio: 'pipe',
                            env: { 
                                ...process.env, 
                                ACTIVE_ROLE: agentCfg.role, 
                                ACTIVE_TOKEN: agentCfg.token 
                            } 
                        }).toString();
                        console.log(`✅ [${agentCfg.role}] ${agentScript} execution success.`);
                        if (process.env.IPD_DRYRUN_VERBOSE === 'true') {
                            console.log(output);
                        }
                    } catch (e) {
                        const errorMsg = e.stdout?.toString() + e.stderr?.toString();
                        console.error(`❌ [${agentCfg.role}] ${agentScript} execution failed.`);
                        console.error(errorMsg);
                        throw new Error(`Agent ${agentScript} failed: ${errorMsg}`);
                    }
                } else {
                    throw new Error(`Agent script ${agentScript} not found at ${scriptPath}`);
                }
            });
        }

        console.log(`\n✅ [Orchestrator] Milestone ${currentMilestone} execution complete.`);
        process.exit(0);
    } catch (error) {
        console.error(`❌ [Orchestrator] Fatal Error: ${error.message}`);
        process.exit(1);
    }
}

// 执行主函数
main();
