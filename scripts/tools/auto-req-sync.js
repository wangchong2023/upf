/**
 * @职责: 自动化需求同步脚本 v1.3 (Full Hierarchy & Parsing Edition)
 * @作者: Gemini CLI
 */

const fs = require('fs');
const { execSync } = require('child_process');
const config = require('../core/mgr-config');

const PATHS = config.PATHS;

// Role Gate Check
try {
    execSync(`node scripts/core/mgr-role-gate.js --action=SRS_GEN`, { stdio: 'inherit' });
} catch (e) {
    process.exit(1);
}

const content = fs.readFileSync(PATHS.FEATURE_LIST, 'utf-8');
const lines = content.split('\n');

let rrCounter = 1;
let irCounter = 1;
let srCounter = 1;

let currentRR_ID = "";
let currentIR_ID = "";

// 按版本分组的容器
let versionedData = {
    "v1.0.0": { rr: [], ir: [], sr: [], rtm: [] },
    "v1.1.0": { rr: [], ir: [], sr: [], rtm: [] }
};

for (let line of lines) {
    line = line.trimEnd();
    if (!line) continue;

    if (line.startsWith('## ')) {
        const name = line.substring(3).trim();
        const rrSeq = rrCounter.toString().padStart(3, '0');
        currentRR_ID = `RR.UPF.${rrSeq}`;
        
        let v = "v1.0.0";
        if (name.includes("业务特性") || name.includes("网络切片") || rrCounter >= 4) v = "v1.1.0";
        
        versionedData[v].rr.push(`| **${currentRR_ID}** | 特性清单 | **${name}** | P1 |`);
        rrCounter++;
        irCounter = 1;
    } else if (line.startsWith('### ')) {
        const name = line.substring(4).trim();
        const rrSeq = (rrCounter - 1).toString().padStart(3, '0');
        const irSeq = irCounter.toString().padStart(2, '0');
        currentIR_ID = `IR.UPF.${rrSeq}.${irSeq}`;
        
        let v = (rrCounter - 1 >= 4) ? "v1.1.0" : "v1.0.0";
        versionedData[v].ir.push(`| **${currentIR_ID}** | ${currentRR_ID} | FUN | **${name}** | - |`);
        irCounter++;
        srCounter = 1;
    } else if (line.match(/^[\s]*-\s+(.*)/)) {
        let feature = line.match(/^[\s]*-\s+(.*)/)[1].trim();
        if (feature && !feature.startsWith('*~~')) {
             const rrSeq = (rrCounter - 1).toString().padStart(3, '0');
             const irSeq = (irCounter - 1).toString().padStart(2, '0');
             const srSeq = srCounter.toString().padStart(3, '0');
             
             const currentSR_ID = `SR.UPF.${rrSeq}.${irSeq}.${srSeq}`;
             const currentAR_ID = `AR.UPF.${rrSeq}.${irSeq}.${srSeq}.01`;
             
             let v = (rrCounter - 1 >= 4) ? "v1.1.0" : "v1.0.0";
             let trNode = (v === "v1.0.0") ? "TR3" : "TR5";
             
             let baseDate = new Date(); 
             let leadDays = (v === "v1.0.0") ? 30 : 60;
             let targetDateObj = new Date(baseDate.getTime() + (leadDays * 24 * 60 * 60 * 1000));
             let targetDateStr = targetDateObj.toISOString().split('T')[0];

             feature = feature.replace(/<[^>]*>?/gm, '');
             versionedData[v].sr.push(`| **${currentSR_ID}** | ${currentIR_ID} | FUN | **${feature}** | - |`);
             versionedData[v].rtm.push(`| **${currentRR_ID}** | **${currentIR_ID}** | **${currentSR_ID}** | **${currentAR_ID}** | FUN | **cp-core** | **${trNode}** | ${targetDateStr} | [Target: ${v}] | \`TC.${currentSR_ID}\` | 待开发 |`);
             srCounter++;
        }
    }
}

// 生成物理隔离的 SRS
let specContent = `# 5G UPF 软件需求规格说明书 (SRS - IPD 标准)\n\n`;
Object.keys(versionedData).forEach(v => {
    specContent += `## 📦 Version: ${v}\n`;
    specContent += `### RR (Raw Requirement)\n| 编号 | 来源 | 描述 | 优先级 |\n| :--- | :--- | :--- | :--- |\n${versionedData[v].rr.join('\n')}\n\n`;
    specContent += `### IR (Initial Requirement)\n| 编号 | 关联 RR | 类型 | 特性描述 | 目标 |\n| :--- | :--- | :--- | :--- |\n${versionedData[v].ir.join('\n')}\n\n`;
    specContent += `### SR (System Requirement)\n| 编号 | 关联 IR | 类型 | 规格详述 | 协议遵循 |\n| :--- | :--- | :--- | :--- | :--- |\n${versionedData[v].sr.join('\n')}\n\n`;
});
fs.writeFileSync(PATHS.SRS, specContent);

// 生成物理隔离的 RTM
let rtmContent = `# 5G UPF 功能全链路追踪矩阵 (RTM - Version Partitioned)\n\n`;
Object.keys(versionedData).forEach(v => {
    rtmContent += `## 🎯 Release Target: ${v}\n`;
    rtmContent += `| RR ID | IR ID | SR ID | AR ID | 类型 | 分配模块 | TR 节点 | 承诺交付 | 版本目标 | 测试用例 | 状态 |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n${versionedData[v].rtm.join('\n')}\n\n`;
});
fs.writeFileSync(PATHS.RTM, rtmContent);

console.log(`✅ SRS & RTM synchronized. Full hierarchy restored.`);
