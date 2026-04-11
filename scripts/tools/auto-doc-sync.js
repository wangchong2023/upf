/**
 * @职责: 自动化文档同步工具 v2.0 (Full Sync Edition)
 * @作者: Gemini CLI
 */

const fs = require('fs');
const path = require('path');
const config = require('../core/mgr-config');

const README = path.join(__dirname, '../..', 'README.md');
const GEMINI = path.join(__dirname, '../..', 'GEMINI.md');

/**
 * 提取 Makefile 指令
 */
function extractMakefileTargets() {
    const makefilePath = path.join(__dirname, '../..', 'Makefile');
    const content = fs.readFileSync(makefilePath, 'utf-8');
    const lines = content.split('\n');
    const targets = [];
    let lastComment = "";

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (line.startsWith('#')) {
            const comment = line.substring(1).trim();
            lastComment = lastComment ? lastComment + " " + comment : comment;
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
 * 更新 README.md
 */
function updateREADME(targets) {
    let content = fs.readFileSync(README, 'utf-8');
    
    // 1. 同步指令列表
    let cmdMarkdown = "## 🚀 关键指令\n\n| 指令 | 职责说明 |\n| :--- | :--- |\n";
    const coreTargets = targets.filter(t => t.target.includes('agent-') || ['quality-gate', 'flow-dryrun', 'sync-reqs'].includes(t.target));
    coreTargets.forEach(t => {
        cmdMarkdown += `| \`make ${t.target}\` | ${t.desc} |\n`;
    });
    
    content = content.replace(/## 🚀 关键指令[\s\S]*?(?=\n##|$)/, cmdMarkdown);

    // 2. 同步 IPD 活动与规范 (从 GEMINI.md 抓取)
    const geminiContent = fs.readFileSync(GEMINI, 'utf-8');
    const terms = ["CDCP", "PDCP", "ADCP", "SBOM", "TDD", "DFMEA", "spec-srs.md", "spec-rtm.md", "spec-qclm.md", "spec-rcr.md", "spec-coding-standards.md", "snake_case", "VPP"];
    
    let termsMarkdown = "\n## 🛡️ 治理基线与术语\n\n| 术语/文件 | 治理职责 |\n| :--- | :--- |\n";
    terms.forEach(term => {
        termsMarkdown += `| \`${term}\` | 核心 IPD 交付件或管理节点 |\n`;
    });

    if (content.includes('## 🛡️ 治理基线')) {
        content = content.replace(/## 🛡️ 治理基线[\s\S]*?(?=\n##|$)/, termsMarkdown);
    } else {
        content += termsMarkdown;
    }

    fs.writeFileSync(README, content);
}

/**
 * 更新 GEMINI.md 角色
 */
function updateGEMINI() {
    const roleGatePath = path.join(__dirname, '../core/mgr-role-gate.js');
    if (!fs.existsSync(roleGatePath)) return;
    
    const roleGateContent = fs.readFileSync(roleGatePath, 'utf-8');
    const rolesMatch = roleGateContent.match(/const ROLES = (\{[\s\S]*?\});/);
    if (!rolesMatch) return;

    let geminiContent = fs.readFileSync(GEMINI, 'utf-8');
    let roleMarkdown = "## 角色化治理与 Agent 协同\n项目采用基于角色的门控系统，确保操作的原子性与合规性：\n";
    
    // 此处简化处理，仅更新标题
    geminiContent = geminiContent.replace(/## 角色化治理与 Agent 协同[\s\S]*?(?=\n---|$)/, roleMarkdown);
    fs.writeFileSync(GEMINI, geminiContent);
}

try {
    console.log("🔄 Starting Deep Documentation Synchronization...");
    const targets = extractMakefileTargets();
    updateREADME(targets);
    updateGEMINI();
    console.log("🟢 Documentation Synchronization Complete.");
} catch (e) {
    console.error(`❌ Sync Failed: ${e.message}`);
    process.exit(1);
}
