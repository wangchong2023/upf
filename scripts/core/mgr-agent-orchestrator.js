/**
 * @职责: IPD 全流程编排器 v4.3 (Final Master Edition)
 * @作者: Gemini CLI
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const config = require('./mgr-config');

const PATHS = config.PATHS;
const MILESTONE = process.env.MILESTONE || 'TR1';

/**
 * 仿真令牌字典。
 */
const SIM_TOKENS = {
    'PRODUCT': 'dfe7551bc1f75f35',
    'PM': '5284effb305c8074',
    'SE': 'a5a25ad952a66075',
    'ARCHITECT': '786a9b7146bc1bf0',
    'MAINTAINER': '5f0f4bb1f0f196c0',
    'QA': 'e4b8e49883e0defd',
    'DEV': '0af963e78ef93a9d',
    'TESTER': '502e02404ee169fe'
};

/**
 * 执行全链路治理网关审计。
 * @throws {Error} 审计失败抛出异常
 */
function runGuardAudits() {
    console.log(`🛡️  [Orchestrator] Starting Integrity Guard for ${MILESTONE}...`);
    try {
        execSync(`node scripts/tools/mgr-risk-gate.js`, { stdio: 'inherit' });
        if (MILESTONE === 'TR1') execSync(`node scripts/tools/mgr-spec-smart-audit.js`, { stdio: 'inherit' });
        execSync(`make lint-scripts`, { stdio: 'inherit' });
        console.log(`✅ [Orchestrator] Integrity Guard Passed.`);
    } catch (e) {
        throw new Error("Integrity Guard failed.");
    }
}

/**
 * 获取 Agent 对应的角色。
 * @param {string} agentName 文件名
 * @returns {string} 角色名
 */
function getRoleForAgent(agentName) {
    if (agentName.includes('product')) return 'PRODUCT';
    if (agentName.includes('pm')) return 'PM';
    if (agentName.includes('se')) return 'SE';
    if (agentName.includes('architect')) return 'ARCHITECT';
    if (agentName.includes('dev')) return 'DEV';
    if (agentName.includes('tester')) return 'TESTER';
    if (agentName.includes('qa')) return 'QA';
    return 'GUEST';
}

/**
 * 触发对应的专家 Agent。
 */
function triggerAgents() {
    const stageAgents = config.MILESTONE_AGENTS[MILESTONE] || [];
    console.log(`📡 [Orchestrator] Triggering agents: ${stageAgents.join(', ')}`);

    stageAgents.forEach(agent => {
        const role = getRoleForAgent(agent);
        const token = SIM_TOKENS[role] || process.env.ACTIVE_TOKEN;

        try {
            console.log(`▶️  Running Agent: ${agent} as [${role}]...`);
            execSync(`node scripts/agents/${agent}`, {
                stdio: 'inherit',
                env: { ...process.env, ACTIVE_ROLE: role, ACTIVE_TOKEN: token }
            });
            console.log(`   ✅ [${agent}] Passed.`);
        } catch (e) {
            process.exit(1);
        }
    });
}

/**
 * Orchestrator 主执行入口。
 * 驱动研发全生命周期流水线。
 */
function startOrchestration() {
    try {
        console.log(`🚀 [Orchestrator] Milestone: ${MILESTONE}`);
        runGuardAudits();
        triggerAgents();
    } catch (error) {
        console.error(`❌ [Orchestrator FATAL] ${error.message}`);
        process.exit(1);
    }
}

// 启动编排程序
startOrchestration();
