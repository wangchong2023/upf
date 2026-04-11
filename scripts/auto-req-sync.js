/**
 * @职责: 自动补齐的治理脚本
 * @版本: v1.0
 */

const fs = require('fs');
const { execSync } = require('child_process');

/**
 * 需求同步脚本 v1.0
 * 职责：解析特性清单并自动生成 SRS 与 RTM 矩阵
 */

// Role Gate Check
try {
    execSync('node scripts/mgr-role-gate.js --action=SRS_GEN', { stdio: 'inherit' });
} catch (e) {
    process.exit(1);
}

const content = fs.readFileSync('docs/01-requirements/spec-feature-list.md', 'utf-8');
const lines = content.split('\n');

let rrList = [];
let irList = [];
let srList = [];
let rtmList = [];

let currentL2 = '';
let currentL3 = '';
let currentRR_ID = '';
let currentIR_ID = '';

let rrCounter = 1;
let irCounter = 1;
let srCounter = 1;

// 按版本分组的容器
let versionedData = {
    "v1.0.0": { rr: [], ir: [], sr: [], rtm: [] },
    "v1.1.0": { rr: [], ir: [], sr: [], rtm: [] }
};

for (let line of lines) {
    line = line.trimEnd();
    if (!line) continue;

    if (line.startsWith('## ')) {
        currentL2 = line.substring(3).trim();
        let rrSeq = rrCounter.toString().padStart(3, '0');
        currentRR_ID = `RR.UPF.${rrSeq}`;
        
        // 动态确定版本归属
        let v = "v1.0.0";
        if (currentL2.includes("业务特性") || currentL2.includes("网络切片")) v = "v1.1.0";
        
        versionedData[v].rr.push(`| **${currentRR_ID}** | 特性清单 | **${currentL2}** | P1 |`);
        rrCounter++;
        irCounter = 1;
    } else if (line.startsWith('### ')) {
        currentL3 = line.substring(4).trim();
        let rrSeq = (rrCounter - 1).toString().padStart(3, '0');
        let irSeq = irCounter.toString().padStart(2, '0');
        currentIR_ID = `IR.UPF.${rrSeq}.${irSeq}`;
        
        let v = (rrCounter - 1 >= 4) ? "v1.1.0" : "v1.0.0";
        versionedData[v].ir.push(`| **${currentIR_ID}** | ${currentRR_ID} | FUN | **${currentL3}** | - |`);
        irCounter++;
        srCounter = 1;
    } else if (line.match(/^[\s]*-\s+(.*)/)) {
        let match = line.match(/^[\s]*-\s+(.*)/);
        let feature = match[1].replace(/[\*~_]/g, '').trim(); 
        if (feature && currentIR_ID) {
             let rrSeq = (rrCounter - 1).toString().padStart(3, '0');
             let irSeq = (irCounter - 1).toString().padStart(2, '0');
             let srSeq = srCounter.toString().padStart(3, '0');
             
             let currentSR_ID = `SR.UPF.${rrSeq}.${irSeq}.${srSeq}`;
             let currentAR_ID = `AR.UPF.${rrSeq}.${irSeq}.${srSeq}.01`;
             
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
let specContent = `# 5G UPF 系统规格说明书 (SRS - Version Partitioned)\n\n`;
Object.keys(versionedData).forEach(v => {
    specContent += `## 📦 Version: ${v}\n`;
    specContent += `### RR (Raw Requirement)\n| 编号 | 来源 | 描述 | 优先级 |\n| :--- | :--- | :--- | :--- |\n${versionedData[v].rr.join('\n')}\n\n`;
    specContent += `### SR (System Requirement)\n| 编号 | 关联 IR | 类型 | 规格详述 | 协议遵循 |\n| :--- | :--- | :--- | :--- | :--- |\n${versionedData[v].sr.join('\n')}\n\n`;
});
fs.writeFileSync('docs/01-requirements/spec-srs.md', specContent);

// 生成物理隔离的 RTM
let rtmContent = `# 5G UPF 功能全链路追踪矩阵 (RTM - Version Partitioned)\n\n`;
Object.keys(versionedData).forEach(v => {
    rtmContent += `## 🎯 Release Target: ${v}\n`;
    rtmContent += `| RR ID | IR ID | SR ID | AR ID | 类型 | 分配模块 | TR 节点 | 承诺交付 | 版本目标 | 测试用例 | 状态 |\n| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n${versionedData[v].rtm.join('\n')}\n\n`;
});
fs.writeFileSync('docs/03-traceability/spec-rtm.md', rtmContent);

fs.writeFileSync('docs/03-traceability/spec-rtm.md', rtmContent);
console.log(`Generated ${rrList.length} RRs, ${irList.length} IRs, ${srList.length} SRs/ARs with TR Node mappings.`);
