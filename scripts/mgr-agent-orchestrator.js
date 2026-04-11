/**
 * @职责: IPD Agent 编排器 v2.3 (Autopilot) - 纯净增强版
 * @作者: Gemini CLI
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

/**
 * 编排器主入口
 */
function main() {
    try {
        const milestonePath = path.join(__dirname, '../.milestone');
        if (!fs.existsSync(milestonePath)) {
            console.error("❌ [.milestone] file not found.");
            process.exit(1);
        }

        const currentMilestone = fs.readFileSync(milestonePath, 'utf-8').trim();
        console.log(`🚀 [Orchestrator] Current Milestone: ${currentMilestone}`);

        const agentMap = {
            'CDCP': ['mgr-agent-product.js', 'mgr-agent-pm.js', 'mgr-agent-se.js'],
            'TR1':  ['mgr-agent-product.js', 'mgr-agent-pm.js', 'mgr-agent-se.js'],
            'TR2':  ['mgr-agent-se.js'],
            'TR3':  ['mgr-agent-architect.js'],
            'PDCP': ['mgr-agent-architect.js'],
            'TR4':  ['mgr-agent-dev.js'],
            'TR4A': ['mgr-agent-dev.js'],
            'TR5':  ['mgr-agent-tester.js'],
            'ADCP': ['mgr-agent-tester.js'],
            'TR6':  ['mgr-agent-product.js', 'mgr-agent-qa.js', 'mgr-agent-pm.js']
        };

        const agentConfig = {
            'mgr-agent-product.js':   { role: 'PRODUCT',   token: 'dfe7551bc1f75f35' },
            'mgr-agent-pm.js':        { role: 'PM',        token: '5284effb305c8074' },
            'mgr-agent-se.js':        { role: 'SE',        token: 'a5a25ad952a66075' },
            'mgr-agent-architect.js': { role: 'ARCHITECT', token: '786a9b7146bc1bf0' },
            'mgr-agent-dev.js':       { role: 'DEV',       token: '0af963e78ef93a9d' },
            'mgr-agent-tester.js':    { role: 'TESTER',    token: '502e02404ee169fe' },
            'mgr-agent-qa.js':        { role: 'QA',        token: 'e4b8e49883e0defd' }
        };

        const agentsToRun = agentMap[currentMilestone.toUpperCase()] || [];

        if (agentsToRun.length === 0) {
            console.warn(`⚠️ [Orchestrator] No agents mapped for milestone: ${currentMilestone}`);
        } else {
            console.log(`📡 [Orchestrator] Triggering agents: ${agentsToRun.join(', ')}`);
            agentsToRun.forEach(agentScript => {
                const scriptPath = path.join(__dirname, agentScript);
                if (fs.existsSync(scriptPath)) {
                    const config = agentConfig[agentScript] || { role: 'GUEST', token: '' };
                    try {
                        const output = execSync(`node scripts/${agentScript}`, { 
                            stdio: 'pipe',
                            env: { 
                                ...process.env, 
                                ACTIVE_ROLE: config.role, 
                                ACTIVE_TOKEN: config.token 
                            } 
                        }).toString();
                        console.log(`✅ [${config.role}] ${agentScript} execution success.`);
                        if (process.env.IPD_DRYRUN_VERBOSE === 'true') {
                            console.log(output);
                        }
                    } catch (e) {
                        const errorMsg = e.stdout?.toString() + e.stderr?.toString();
                        console.error(`❌ [${config.role}] ${agentScript} execution failed.`);
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
