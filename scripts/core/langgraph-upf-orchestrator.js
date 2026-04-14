/**
 * @职责: 5G UPF 研发流程 LangGraph 驱动编排器 v2.1 (IPD Precision Edition)
 * @设计模式: 声明式图拓扑 (Declarative Topology)
 * @特性: 全生命周期节点 (Charter->TR->DCP)、多代理共识博弈、物理网关拦截、精准 Rework 路由
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('./mgr-config');

/**
 * 1. 定义全局状态 Schema (AgentState)
 */
let STATE = {
    milestone: process.env.MILESTONE || fs.readFileSync(config.PATHS.MILESTONE, 'utf8').trim() || "TR1",
    sr_id: process.env.SR_ID || "SR.UPF.001.02.001",
    active_role: "GUEST",
    results: {}, 
    rework_count: 0,
    last_error: null,
    status: "START"
};

/**
 * 2. 仿真令牌助手
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
 * 3. 辅助函数：调用物理 Agent
 * @param {string} agentName Agent 脚本名称
 * @param {string} role 执行角色
 * @returns {object} 执行结果对象 { success: boolean, error?: string }
 */
function invokeAgent(agentName, role) {
    console.log(`\n▶️  [Invoke] Running ${agentName} as [${role}]...`);
    const token = SIM_TOKENS[role] || "";
    try {
        execSync(`node scripts/agents/${agentName}`, {
            stdio: 'inherit',
            env: { ...process.env, ACTIVE_ROLE: role, ACTIVE_TOKEN: token, SR_ID: STATE.sr_id }
        });
        return { success: true };
    } catch (e) {
        console.error(`   ❌ [${agentName}] Failed.`);
        const errorOutput = e.stderr ? e.stderr.toString() : e.message;
        return { success: false, error: errorOutput };
    }
}

/**
 * 4. 辅助函数：状态持久化 (Checkpoint)
 * @param {object} state 当前流程状态对象
 */
function saveCheckpoint(state) {
    const sdbPath = config.PATHS.STATE_STORAGE;
    const checkpointId = `chk_${Date.now()}`;
    const stateBlob = Buffer.from(JSON.stringify(state)).toString('hex');
    const sql = `INSERT INTO checkpoints (thread_id, checkpoint_id, checkpoint) VALUES ('${state.sr_id}', '${checkpointId}', x'${stateBlob}');`;
    try {
        execSync(`sqlite3 ${sdbPath} "${sql}"`);
        fs.writeFileSync(config.PATHS.MILESTONE, state.milestone);
    } catch (e) {
        console.error(`   ⚠️  [Checkpoint Save Error] ${e.message}`);
    }
}

/**
 * 5. 定义节点 (Nodes)
 */

/**
 * Phase 0: Charter 立项节点
 * @param {object} state 当前流程状态对象
 * @returns {object} 更新后的状态对象
 */
function charter_node(state) {
    console.log("\n📍 [Node: CHARTER] 正在执行 Charter 移交与商业目标锁定...");
    const res = invokeAgent("mgr-agent-product.js", "PRODUCT");
    return { ...state, results: { ...state.results, CHARTER: res.success }, status: res.success ? "CHARTER_COMPLETE" : "CHARTER_FAILED" };
}

/**
 * TR1: 需求基线节点
 * @param {object} state 当前流程状态对象
 * @returns {object} 更新后的状态对象
 */
function tr1_node(state) {
    console.log("\n📍 [Node: TR1] 正在进行需求规格定义与基线化...");
    const agents = config.MILESTONE_AGENTS["TR1"];
    let allPassed = true;
    agents.forEach(agent => {
        const role = agent.includes('product') ? 'PRODUCT' : (agent.includes('pm') ? 'PM' : 'SE');
        if (!invokeAgent(agent, role).success) allPassed = false;
    });
    return { ...state, results: { ...state.results, TR1: allPassed }, status: allPassed ? "TR1_COMPLETE" : "TR1_FAILED" };
}

/**
 * DCP 决策节点模板 (CDCP, PDCP, ADCP)
 * @param {object} state 当前流程状态对象
 * @param {string} type 决策评审类型
 * @returns {object} 更新后的状态对象
 */
function dcp_node(state, type) {
    console.log(`\n⚖️  [Node: ${type}] 正在执行多角色决策评审 (Consensus Mode)...`);
    // DCP 需要 PRODUCT (商业), PM (进度), QA (质量) 三方达成共识
    const resProduct = invokeAgent("mgr-agent-product.js", "PRODUCT");
    const resPM = invokeAgent("mgr-agent-pm.js", "PM");
    const resQA = invokeAgent("mgr-agent-qa.js", "QA");
    
    const allPassed = resProduct.success && resPM.success && resQA.success;
    return { ...state, results: { ...state.results, [type]: allPassed }, status: allPassed ? `${type}_COMPLETE` : `${type}_FAILED` };
}

/**
 * TR2: 子系统方案评审节点
 * @param {object} state 当前流程状态对象
 * @returns {object} 更新后的状态对象
 */
function tr2_node(state) {
    console.log("\n📍 [Node: TR2] 正在进行子系统方案评审...");
    const res = invokeAgent("mgr-agent-se.js", "SE");
    return { ...state, results: { ...state.results, TR2: res.success }, status: res.success ? "TR2_COMPLETE" : "TR2_FAILED" };
}

/**
 * TR3: 架构决策评审节点
 * @param {object} state 当前流程状态对象
 * @returns {object} 更新后的状态对象
 */
function tr3_node(state) {
    console.log("\n📍 [Node: TR3] 正在进行架构决策与 LLD 审计...");
    const res = invokeAgent("mgr-agent-architect.js", "ARCHITECT");
    return { ...state, results: { ...state.results, TR3: res.success }, status: res.success ? "TR3_COMPLETE" : "TR3_FAILED" };
}

/**
 * 物理设计网关节点
 * @param {object} state 当前流程状态对象
 * @returns {object} 更新后的状态对象
 */
function design_gate_node(state) {
    console.log(`\n🛡️  [Node: DESIGN_GATE] 物理执行设计资产审计: ${state.sr_id}`);
    try {
        execSync(`node scripts/tools/mgr-design-gate.js ${state.sr_id}`, { stdio: 'inherit' });
        return { ...state, status: "GATE_PASS" };
    } catch (e) {
        return { ...state, status: "GATE_BLOCK", rework_count: state.rework_count + 1 };
    }
}

/**
 * TR4: 开发与单元测试节点
 * @param {object} state 当前流程状态对象
 * @returns {object} 更新后的状态对象
 */
function tr4_node(state) {
    console.log("\n📍 [Node: TR4] 正在执行高质量编码与 TDD 验证...");
    const res = invokeAgent("mgr-agent-dev.js", "DEV");
    return { ...state, results: { ...state.results, TR4: res.success }, status: res.success ? "TR4_COMPLETE" : "TR4_FAILED" };
}

/**
 * TR5: 集成验收节点
 * @param {object} state 当前流程状态对象
 * @returns {object} 更新后的状态对象
 */
function tr5_node(state) {
    console.log("\n📍 [Node: TR5] 正在执行集成测试与需求验收 (RAT)...");
    const res = invokeAgent("mgr-agent-tester.js", "TESTER");
    return { ...state, results: { ...state.results, TR5: res.success }, status: res.success ? "TR5_COMPLETE" : "TR5_FAILED" };
}

/**
 * TR6: 发布决策节点
 * @param {object} state 当前流程状态对象
 * @returns {object} 更新后的状态对象
 */
function tr6_node(state) {
    console.log("\n📍 [Node: TR6] 正在执行发布审计与 GTM 准备度检查...");
    const agents = config.MILESTONE_AGENTS["TR6"];
    let allPassed = true;
    agents.forEach(agent => {
        const role = agent.includes('product') ? 'PRODUCT' : (agent.includes('qa') ? 'QA' : 'PM');
        if (!invokeAgent(agent, role).success) allPassed = false;
    });
    return { ...state, results: { ...state.results, TR6: allPassed }, status: allPassed ? "TR6_COMPLETE" : "TR6_FAILED" };
}

/**
 * 定义图拓扑与流转引擎 (The Graph Engine)
 * @职责: 驱动全生命周期状态机流转
 */
async function main() {
    let state = { ...STATE };
    console.log(`🚀 [UPF Orchestrator v2.1] Starting IPD Flow | Target: ${state.sr_id}`);

    // 全生命周期流水线
    const MASTER_FLOW = [
        { name: "CHARTER", node: charter_node },
        { name: "TR1", node: tr1_node },
        { name: "CDCP", node: (s) => dcp_node(s, "CDCP") },
        { name: "TR2", node: tr2_node },
        { name: "TR3", node: tr3_node },
        { name: "PDCP", node: (s) => dcp_node(s, "PDCP") },
        { name: "GATE", node: design_gate_node },
        { name: "TR4", node: tr4_node },
        { name: "TR5", node: tr5_node },
        { name: "ADCP", node: (s) => dcp_node(s, "ADCP") },
        { name: "TR6", node: tr6_node }
    ];

    // 里程碑索引映射
    const MILESTONE_MAP = {
        "CHARTER": 0, "TR1": 1, "CDCP": 2, "TR2": 3, "TR3": 4, 
        "PDCP": 5, "TR4": 7, "TR5": 8, "ADCP": 9, "TR6": 10
    };

    // 精准回跳逻辑 (IPD Rework Targets)
    const REWORK_TARGETS = {
        "CHARTER_FAILED": "CHARTER",
        "TR1_FAILED": "CHARTER",
        "CDCP_FAILED": "TR1",
        "TR2_FAILED": "CDCP",
        "TR3_FAILED": "TR2",
        "PDCP_FAILED": "TR3",
        "GATE_BLOCK": "TR3",
        "TR4_FAILED": "PDCP", // 编码审计不通过，可能是计划/设计问题，回退到 PDCP 重新审视
        "TR5_FAILED": "TR4",  // 测试不通过，回跳至开发
        "ADCP_FAILED": "TR5",  // 商业决策否决，通常是由于实测性能不达标，回跳至集成验证
        "TR6_FAILED": "ADCP"
    };

    let currentIndex = MILESTONE_MAP[state.milestone] || 0;

    while (currentIndex < MASTER_FLOW.length) {
        const stage = MASTER_FLOW[currentIndex];
        state = stage.node(state);

        // 处理失败与自愈
        if (state.status.endsWith("_FAILED") || state.status === "GATE_BLOCK") {
            const targetName = REWORK_TARGETS[state.status];
            console.log(`\n🔄 [LangGraph Loop] ${state.status} detected. Routing back to ${targetName}...`);
            
            // 触发物理自愈
            try {
                execSync(`node scripts/core/mgr-healer.js --milestone=${state.milestone}`, { stdio: 'inherit' });
            } catch (e) {}

            currentIndex = MILESTONE_MAP[targetName];
            state.rework_count++;
            if (state.rework_count > 10) {
                console.error("❌ [FATAL] Too many reworks. Human intervention required.");
                process.exit(1);
            }
            continue;
        }

        // 推进里程碑
        const milestoneMatch = state.status.match(/^([A-Z0-9]+)_COMPLETE/);
        const passMatch = state.status.match(/^([A-Z0-9]+)_PASS/);
        const currentMilestone = milestoneMatch ? milestoneMatch[1] : (passMatch ? passMatch[1] : null);

        if (currentMilestone) {
            state.milestone = currentMilestone;
            saveCheckpoint(state);
            console.log(`✅ [Milestone Advanced] -> ${state.milestone}`);
        }

        currentIndex++;
    }

    console.log("\n🏁 [Graph Success] IPD Lifecycle for " + state.sr_id + " is 100% COMPLETE.");
    console.table(state.results);
}

main();
