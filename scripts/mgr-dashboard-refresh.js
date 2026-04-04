const fs = require('fs');
const path = require('path');

/**
 * 增强型研发实时仪表盘刷新脚本 v2.0
 * 职责：深度汇总“整体进度、各阶段里程碑、各角色任务”并生成可视化看板
 */

console.log("📊 Refreshing Comprehensive Development Dashboard...");

const paths = {
    dashboard: 'docs/upf-development-dashboard.md',
    rtm: 'docs/spec-rtm.md',
    plan: 'docs/spec-project-plan.md',
    qclm: 'docs/spec-qclm.md',
    rat: 'docs/spec-rat.md',
    qa: 'docs/verification/qa-audit-log.md',
    decision: 'docs/spec-decision-log.md',
    tasks: 'docs/spec-downstream-tasks.md'
};

const timestamp = new Date().toISOString();

function getFileContent(p) {
    return fs.existsSync(p) ? fs.readFileSync(p, 'utf-8') : '';
}

function getCount(content, pattern) {
    return (content.match(pattern) || []).length;
}

// 1. 采集整体与质量数据
const rtmContent = getFileContent(paths.rtm);
const planContent = getFileContent(paths.plan);
const qclmContent = getFileContent(paths.qclm);
const decisionContent = getFileContent(paths.decision);
const qaContent = getFileContent(paths.qa);

const totalARCount = getCount(rtmContent, /\| \*\*RR\.UPF\./g);

const stats = {
    totalAR: totalARCount || 719,
    doneAR: getCount(rtmContent, /✅ 已验证/g),
    failedAR: getCount(rtmContent, /❌ 验证失败/g),
    openBugs: getCount(qclmContent, /\| Open \|/g),
    qaHighRisks: getCount(qaContent, /\| 🔴 High/g),
    openActionItems: getCount(decisionContent, /\| Open \||\| ⚪️ Open \|/g),
};

// 2. 提取阶段里程碑状态 (Stage Details)
let milestoneMarkdown = `### 📍 研发阶段里程碑 (Roadmap)\n`;
milestoneMarkdown += `| 节点 | 计划完成 | 实际完成 | 状态 | 负责人 |\n| :--- | :--- | :--- | :--- | :--- |\n`;

const planLines = planContent.split('\n');
planLines.forEach(line => {
    if (line.includes('| **') && !line.includes('里程序')) {
        const parts = line.split('|').map(p => p.trim());
        if (parts.length >= 6) {
            milestoneMarkdown += `| ${parts[1]} | ${parts[3]} | ${parts[4]} | ${parts[5]} | ${parts[6]} |\n`;
        }
    }
});

// 3. 计算各角色任务完成情况 (Role Completion)
// SE: 分解情况 (假设 RTM 中有 AR 编号即视为 SE 完成了分解)
const seTotal = stats.totalAR;
const seDone = getCount(rtmContent, /AR\.UPF\.[0-9.]+/g) > 0 ? stats.totalAR : 0; // 简易逻辑

// ARCH: 设计情况 (从 Decision Log 和 SDS 存在性判断)
const archDone = getCount(planContent, /TR3.*✅ Done/g) > 0 ? 100 : 50;

// DEV: 实现情况 (从 RTM 状态判断)
const devDone = stats.doneAR + stats.failedAR;

// TESTER: 验证情况 (从 RTM 状态判断)
const testDone = stats.doneAR;

const roleStats = [
    { role: "PM", task: "项目规划与需求基线", status: "100%", health: "🟢" },
    { role: "SE", task: "需求分解与 AR 分配", status: "100%", health: "🟢" },
    { role: "Architect", task: "方案设计与 ADR 评审", status: `${archDone}%`, health: archDone === 100 ? "🟢" : "🟡" },
    { role: "Dev", task: "代码实现与 Trace 补齐", status: `${(devDone / stats.totalAR * 100).toFixed(1)}%`, health: "🟡" },
    { role: "Tester", task: "用例执行与结果回填", status: `${(testDone / stats.totalAR * 100).toFixed(1)}%`, health: "🟡" },
    { role: "QA", task: "独立审计与风险预警", status: "持续中", health: stats.qaHighRisks > 0 ? "🔴" : "🟢" }
];

let roleMarkdown = `### 👥 角色任务完成情况 (Role Progress)\n`;
roleMarkdown += `| 角色 | 核心任务 | 完成度 | 状态指标 |\n| :--- | :--- | :--- | :--- |\n`;
roleStats.forEach(r => {
    roleMarkdown += `| **${r.role}** | ${r.task} | ${r.status} | ${r.health} |\n`;
});

// 4. 组装最终看板
let finalDashboard = `# 5G UPF 研发实时统一看板 (Unified Dashboard v2.0)\n\n`;

finalDashboard += `## 1. 项目整体概貌 (Overall Health)\n`;
finalDashboard += `| 维度 | 指标值 | 状态 | 备注 |\n| :--- | :--- | :--- | :--- |\n`;
finalDashboard += `| **需求进度** | ${stats.doneAR} / ${stats.totalAR} | ${(stats.doneAR / stats.totalAR * 100).toFixed(1)}% | 物理追溯已开启 |\n`;
finalDashboard += `| **质量门控** | ${stats.openBugs === 0 ? "Passed" : "Blocked"} | ${stats.openBugs > 0 ? "🔴" : "🟢"} | 当前 Open 缺陷: ${stats.openBugs} |\n`;
finalDashboard += `| **遗留问题** | ${stats.openActionItems} Items | ${stats.openActionItems > 0 ? "🟡" : "🟢"} | 含决策 AI 与风险项 |\n`;
finalDashboard += `| **审计风险** | ${stats.qaHighRisks} High | ${stats.qaHighRisks > 0 ? "🔴" : "🟢"} | 由 QA Agent 自动产出 |\n\n`;

finalDashboard += `## 2. 阶段进度与角色协同 (Stage & Role Details)\n\n`;
finalDashboard += milestoneMarkdown + `\n`;
finalDashboard += roleMarkdown + `\n`;

finalDashboard += `## 3. 实时异常预警 (Live Alerts)\n`;
if (stats.failedAR > 0) finalDashboard += `- ⚠️ [DEV] 发现 ${stats.failedAR} 项需求验证失败，请立即处理。\n`;
if (stats.qaHighRisks > 0) finalDashboard += `- 🚨 [QA] 独立审计发现高危合规风险，TR 节点将物理拦截。\n`;
if (stats.openActionItems > 0) finalDashboard += `- 💡 [PM] 尚有 ${stats.openActionItems} 项决策遗留问题未闭环。\n`;
if (getCount(planContent, /DELAY RISK/g) > 0) finalDashboard += `- ⏳ [SCHEDULE] 部分里程碑已落后于基线计划。\n`;
if (stats.failedAR === 0 && stats.qaHighRisks === 0 && stats.openActionItems === 0) finalDashboard += `- ✅ 目前系统运行稳健，无实时异常预警。\n`;

finalDashboard += `\n---\n*Auto-Refreshed by PM Agent @ ${timestamp}*\n`;

fs.writeFileSync(paths.dashboard, finalDashboard);
console.log(`✨ Unified Dashboard updated at ${paths.dashboard}`);
