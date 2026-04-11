/**
 * @职责: 自动补齐的治理脚本
 * @版本: v1.0
 */

const fs = require('fs');
const path = require('path');

const README = path.join(__dirname, '..', 'README.md');
const GEMINI = path.join(__dirname, '..', 'GEMINI.md');

/**
 * @职责: 提取 Makefile 中的指令及其注释
 */
function extractMakefileTargets() {
    const makefilePath = path.join(__dirname, '..', 'Makefile');
    const content = fs.readFileSync(makefilePath, 'utf-8');
    const lines = content.split('\n');
    const targets = [];
    let lastComment = "";

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#')) {
            // 累加注释
            const comment = line.substring(1).trim();
            if (lastComment) {
                lastComment += " " + comment;
            } else {
                lastComment = comment;
            }
        } else if (line.includes(':') && !line.startsWith('.') && !line.startsWith('\t') && !line.startsWith('@')) {
            const target = line.split(':')[0].trim();
            if (target && !target.includes('=') && !target.includes('$')) {
                targets.push({ target, desc: lastComment || "执行 " + target + " 指令" });
                lastComment = "";
            }
        } else if (line === "") {
            lastComment = "";
        }
    }
    return targets;
}

/**
 * @职责: 自动补齐的治理函数
 */
function updateREADME(targets) {
    let content = fs.readFileSync(README, 'utf-8');
    
    // 生成指令列表 Markdown
    let cmdMarkdown = "## 🚀 关键指令\n";
    // 过滤出核心指令
    const coreTargets = targets.filter(t => t.target.startsWith('agent-') || t.target.startsWith('parallel-') || t.target.startsWith('branch-') || t.target === 'quality-gate' || t.target === 'stage-next' || t.target === 'fix-all' || t.target === 'release' || t.target === 'changelog' || t.target === 'backport' || t.target === 'release-report');
    
    coreTargets.forEach(t => {
        cmdMarkdown += `- **${t.target}**: ${t.desc}\n`;
    });

    const regex = /## 🚀 关键指令[\s\S]*?(?=\n---|\n\*|$)/;
    if (regex.test(content)) {
        content = content.replace(regex, cmdMarkdown);
        fs.writeFileSync(README, content);
        console.log(`✅ README.md commands synchronized.`);
    }
}

// 3. 更新 GEMINI.md 中的角色定义部分 (基于 mgr-role-gate.js 的配置)
/**
 * @职责: 自动补齐的治理函数
 */
function updateGEMINI() {
    const roleGateContent = fs.readFileSync('scripts/mgr-role-gate.js', 'utf-8');
    const rolesMatch = roleGateContent.match(/const ROLES = (\{[\s\S]*?\});/);
    if (!rolesMatch) return;

    const rolesRaw = rolesMatch[1].replace(/const ROLES = /, '').trim();
    const roles = JSON.parse(rolesRaw.replace(/(\w+):/g, '"$1":').replace(/'/g, '"').replace(/,(\s*[\}\]])/g, '$1')); 
    
    let geminiContent = fs.readFileSync(GEMINI, 'utf-8');
    let roleMarkdown = "## 角色化治理与 Agent 协同\n项目采用基于角色的门控系统 (`scripts/mgr-role-gate.js`)，确保操作的原子性与合规性：\n";
    
    for (const [role, perms] of Object.entries(roles)) {
        if (role === 'GUEST') continue;
        let desc = `负责 ${perms.slice(0, 3).join(', ')} 等核心治理任务。`;
        if (role === 'PM') desc = "负责项目的 **“统一管控”**，包括 SRS 生成、RTM 维护、主进度计划管理 (`agent-pm`) 及风险闭环。";
        if (role === 'SE') desc = "负责需求分解、子系统接口定义及规格同步。";
        if (role === 'ARCHITECT') desc = "负责架构决策 (ADR)、方案评审 (TR2/TR3) 及契约锁定。";
        if (role === 'MAINTAINER') desc = "负责里程碑物理切换、**版本定位与变更同步 (`mgr-ipd-release`)** 及配置管理。";
        
        roleMarkdown += `- **${role}**: ${desc}\n`;
    }

    const regex = /## 角色化治理与 Agent 协同[\s\S]*?(?=\n---|$)/;
    if (regex.test(geminiContent)) {
        geminiContent = geminiContent.replace(regex, roleMarkdown);
        fs.writeFileSync(GEMINI, geminiContent);
        console.log(`✅ GEMINI.md roles synchronized.`);
    }
}

try {
    const targets = extractMakefileTargets();
    updateREADME(targets);
    updateGEMINI();
    console.log("🟢 Documentation Synchronization Complete.");
} catch (e) {
    console.error(`❌ Sync Failed: ${e.message}`);
    process.exit(1);
}
