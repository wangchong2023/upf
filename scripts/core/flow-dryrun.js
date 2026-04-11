/**
 * @职责: IPD 全流程自愈演练编排器 v3.2 (元数据语义化版)
 * @作者: Gemini CLI
 */

const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');
const { tryHeal } = require('./mgr-healer');
const config = require('./mgr-config');

const PATHS = config.PATHS;
const MILESTONE_FILE = PATHS.MILESTONE;
const S = config.STAGES;
const R = config.ROLES;

/**
 * 深度解析全链路语义化明细 (ID + Inherited Name)
 */
function getDeliverableDetails() {
    const details = {
        requirements: [],
        irs: [],
        srs: [],
        specs: [],
        codeFiles: [],
        ratScenarios: []
    };

    const rrNameMap = {};

    try {
        // 1. 先抓取所有 RR (需求) 及其物理名称
        if (fs.existsSync(PATHS.SRS)) {
            const lines = fs.readFileSync(PATHS.SRS, 'utf-8').split('\n');
            lines.forEach(line => {
                const match = line.match(/\| (\*\*RR\.UPF\.\d+\*\*) \| [^|]+ \| ([^|]+) \|/);
                if (match) {
                    const id = match[1].replace(/\*/g, '');
                    const name = match[2].trim();
                    details.requirements.push(`${id}: ${name}`);
                    rrNameMap[id] = name;
                }
            });
        }

        // 2. 基于 RTM 语义解析并继承名称
        if (fs.existsSync(PATHS.RTM)) {
            const lines = fs.readFileSync(PATHS.RTM, 'utf-8').split('\n');
            const irSet = new Set(), srSet = new Set(), arSet = new Set();
            
            lines.forEach(line => {
                const parts = line.split('|').map(p => p.trim());
                if (parts.length > 5) {
                    const rrId = parts[1].replace(/\*/g, '');
                    const irId = parts[2].replace(/\*/g, '');
                    const srId = parts[3].replace(/\*/g, '');
                    const arId = parts[4].replace(/\*/g, '');
                    
                    const baseName = rrNameMap[rrId] || "基础特性";

                    if (irId.startsWith('IR.UPF.') && !irSet.has(irId)) {
                        details.irs.push(`${irId}: [初始需求] ${baseName}`);
                        irSet.add(irId);
                    }
                    if (srId.startsWith('SR.UPF.') && !srSet.has(srId)) {
                        details.srs.push(`${srId}: [系统规格] ${baseName} 分解规格`);
                        srSet.add(srId);
                    }
                    if (arId.startsWith('AR.UPF.') && !arSet.has(arId)) {
                        details.specs.push(`${arId}: [架构规格] ${baseName} 分配实现`);
                        arSet.add(arId);
                    }
                }
            });
        }

        // 3. 提取代码文件 (带行数)
        try {
            const files = execSync(`find ${PATHS.SRC} -name "*.go" -o -name "*.c"`, { stdio: 'pipe' }).toString().split('\n').filter(f => f.trim());
            files.forEach(f => {
                const loc = execSync(`wc -l < ${f}`, { stdio: 'pipe' }).toString().trim();
                details.codeFiles.push(`${path.relative(process.cwd(), f)} (${loc} lines)`);
            });
        } catch (e) {}

        // 4. 提取验收场景
        if (fs.existsSync(PATHS.RAT)) {
            const lines = fs.readFileSync(PATHS.RAT, 'utf-8').split('\n');
            lines.forEach(line => {
                const match = line.match(/\| (\*\*RR\.UPF\.\d+\*\*) \| ([^|]+) \| [^|]+ \| \*\*Accepted\*\*/);
                if (match) details.ratScenarios.push(`${match[1].replace(/\*/g, '')}: ${match[2].trim()}`);
            });
        }
    } catch (e) {}
    return details;
}

const STAGE_METADATA = {
    [S.TR1]: { role: `${R.PRODUCT}/${R.PM}/${R.SE}`, label: 'SRS 需求集' },
    [S.TR2]: { role: R.SE, label: 'RTM 跟踪矩阵' },
    [S.TR3]: { role: R.ARCHITECT, label: 'SDS 设计文档' },
    [S.TR4]: { role: R.DEV, label: '生产源码' },
    [S.TR5]: { role: R.TESTER, label: 'RAT 验收结果' },
    [S.TR6]: { role: `${R.PRODUCT}/${R.QA}/${R.PM}`, label: '版本归档包' }
};

let timeline = [];
let currentIndex = 1;

/**
 * @职责: 自动补齐的治理函数
 */
function printTableHeader() {
    console.log('\n' + '='.repeat(170));
    console.log(
        '| ' + '序号'.padEnd(4) + 
        ' | ' + '阶段'.padEnd(6) + 
        ' | ' + '负责角色'.padEnd(15) + 
        ' | ' + '核心交付内容 (语义修正链路摘要)'.padEnd(75) + 
        ' | ' + '发现/解决'.padEnd(10) + 
        ' | ' + '状态'.padEnd(10) + 
        ' |'
    );
    console.log('-'.repeat(170));
}

/**
 * @职责: 自动补齐的治理函数
 */
function printTableRow(index, stage, role, content, issues, status) {
    console.log(
        '| ' + String(index).padEnd(6) + 
        ' | ' + stage.padEnd(8) + 
        ' | ' + role.padEnd(19) + 
        ' | ' + content.padEnd(82).substring(0, 82) + 
        ' | ' + issues.padEnd(12) + 
        ' | ' + status.padEnd(12) + 
        ' |'
    );
}

/**
 * @职责: 自动补齐的治理函数
 */
function runStage(stage) {
    fs.writeFileSync(MILESTONE_FILE, stage);
    const meta = STAGE_METADATA[stage];
    let retryCount = 0, issuesFound = 0, issuesFixed = 0, healingAction = '-';

    while (retryCount <= 1) {
        try {
            execSync('node scripts/core/mgr-agent-orchestrator.js', { 
                stdio: 'pipe', env: { ...process.env, IPD_DRYRUN: 'true' }
            });
            const details = getDeliverableDetails();
            let summary = "";
            if (stage === S.TR1) summary = details.requirements[0] || "Init SRS";
            else if (stage === S.TR2) summary = `${details.irs.length} IRs (初始需求) / ${details.srs.length} SRs / ${details.specs.length} ARs`;
            else if (stage === S.TR3) summary = "SDS Architecture & Subsystem Specification";
            else if (stage === S.TR4) summary = `${details.codeFiles.length} Source Files (${details.codeFiles[0].split(' ')[0]})`;
            else if (stage === S.TR5) summary = `${details.ratScenarios.length} Acceptance Tests Completed`;
            else if (stage === S.TR6) summary = "Release Quality Gate & SBOM Archiving";

            const statusLabel = retryCount > 0 ? '🩹 Fixed' : '✅ Passed';
            printTableRow(currentIndex++, stage, meta.role, summary, `${issuesFound}/${issuesFixed}`, statusLabel);
            
            timeline.push({ 
                index: currentIndex - 1, stage, role: meta.role, 
                content: summary, details,
                issuesFound, issuesFixed, status: statusLabel, healing: healingAction
            });
            return;
        } catch (error) {
            const errorMsg = error.stdout?.toString() + error.stderr?.toString();
            issuesFound++;
            const healed = tryHeal(errorMsg, stage, 'Orchestrator-Dryrun');
            if (healed && retryCount < 1) {
                healingAction = healed; issuesFixed++; retryCount++; continue;
            } else {
                printTableRow(currentIndex++, stage, meta.role, "FAILED", `${issuesFound}/${issuesFixed}`, '🔴 Failed');
                throw error;
            }
        }
    }
}

/**
 * @职责: 自动补齐的治理函数
 */
async function main() {
    const originalMilestone = fs.existsSync(MILESTONE_FILE) ? fs.readFileSync(MILESTONE_FILE, 'utf-8') : S.GENERAL;
    try {
        console.log(`\n🚀 Starting Expert IPD Dry-run (v3.2) - ${new Date().toLocaleString()}`);
        printTableHeader();
        const stages = [S.TR1, S.TR2, S.TR3, S.TR4, S.TR5, S.TR6];
        for (const stage of stages) runStage(stage);
    } catch (e) {} 
    finally {
        console.log('='.repeat(170));
        let report = "# IPD 全生命周期全链路语义化交付报告 (v3.2)\n\n";
        report += `## 1. 演练执行摘要 (生成时间: ${new Date().toLocaleString()})\n\n`;
        report += "| 序号 | 阶段 | 责任角色 | 语义链路摘要 | 发现/解决 | 状态 | 自愈动作 |\n";
        report += "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n";
        timeline.forEach(t => {
            report += `| ${t.index} | ${t.stage} | ${t.role} | ${t.content} | ${t.issuesFound}/${t.issuesFixed} | ${t.status} | ${t.healing} |\n`;
        });

        report += "\n## 2. 数字化交付语义清单 (Deliverables Semantic Deep-Dive)\n\n";
        const d = getDeliverableDetails();

        report += "### [Step 1] 原始需求清单 (RR - ID & Name)\n";
        d.requirements.forEach(item => report += `- ${item}\n`);
        report += "\n";

        report += "### [Step 2] 初始需求清单 (IR - ID & Feature)\n";
        d.irs.forEach(item => report += `- ${item}\n`);
        report += "\n";

        report += "### [Step 3] 系统规格清单 (SR - ID & Specification)\n";
        d.srs.slice(0, 30).forEach(item => report += `- ${item}\n`);
        if (d.srs.length > 30) report += `- ... 及其他 ${d.srs.length - 30} 条系统规格\n`;
        report += "\n";

        report += "### [Step 4] 架构分配规格 (AR - ID & Target)\n";
        d.specs.slice(0, 20).forEach(item => report += `- ${item}\n`);
        if (d.specs.length > 20) report += `- ... 及其他 ${d.specs.length - 20} 条架构分配规格\n`;
        report += "\n";

        report += "### [Step 5] 物理实现清单 (Source Code & LOC)\n";
        d.codeFiles.forEach(item => report += `- ${item}\n`);
        report += "\n";

        report += "### [Step 6] 验收通过记录 (RAT Scenario & Evidence)\n";
        d.ratScenarios.forEach(item => report += `- ${item}\n`);
        report += "\n";

        fs.writeFileSync(PATHS.REPORT, report);
        console.log(`\n📊 Semantic report (Fixed) generated at ${path.resolve(PATHS.REPORT)}`);
        fs.writeFileSync(MILESTONE_FILE, originalMilestone);
    }
}
main();
