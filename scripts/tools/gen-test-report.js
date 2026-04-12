/**
 * @职责: 集成与系统测试报告生成工具 v1.0
 * @作者: Gemini CLI
 */

const fs = require('fs');
const path = require('path');
const config = require('../core/mgr-config');

const PATHS = config.PATHS;
const REPORT_FILE = path.join(PATHS.VERIFY_DIR, 'it-st-test-report.md');

/**
 * @职责: 自动补齐的治理函数
 */
function main() {
    try {
        console.log("📊 Generating formal IT/ST Test Report...");

        if (!fs.existsSync(PATHS.RESULTS)) {
            throw new Error("No test results found to generate report.");
        }

        const results = JSON.parse(fs.readFileSync(PATHS.RESULTS, 'utf-8'));
        const total = results.length;
        const passed = results.filter(r => r.status === 'Pass').length;
        const passRate = ((passed / total) * 100).toFixed(2);

        let report = `# 5G UPF 集成与系统测试报告 (IT/ST Report)\n\n`;
        report += `## 1. 测试摘要 (Executive Summary)\n`;
        report += `- **版本目标**: v1.0.0\n`;
        report += `- **测试日期**: ${new Date().toISOString().split('T')[0]}\n`;
        report += `- **测试用例总数**: ${total}\n`;
        report += `- **成功率**: ${passRate}%\n`;
        report += `- **结论**: ${passRate === '100.00' ? '✅ 准出' : '❌ 拦截'}\n\n`;

        report += `## 2. 测试环境 (Test Environment)\n`;
        report += `- **用户面引擎**: VPP v23.10\n`;
        report += `- **控制面容器**: Go 1.21-alpine\n`;
        report += `- **模拟器**: gNB-Sim / Core-Sim\n\n`;

        report += `## 3. 详细测试结果 (Detailed Results)\n`;
        report += `| 用例 ID | 关联需求 | 结果 | 执行时间 | 测试证据 (Log/PCAP) |\n`;
        report += `| :--- | :--- | :--- | :--- | :--- |\n`;
        
        results.forEach(r => {
            const evidence = r.status === 'Pass' ? `[View Log](logs/${r.id}.log)` : 'N/A';
            report += `| ${r.id} | ${r.id} | ${r.status === 'Pass' ? '✅ Pass' : '❌ Fail'} | ${r.execution_date || 'N/A'} | ${evidence} |\n`;
        });

        report += `\n## 4. 遗留问题 (Open Issues)\n`;
        const failed = results.filter(r => r.status !== 'Pass');
        if (failed.length === 0) {
            report += `✅ 无遗留 P0/P1 级缺陷。\n`;
        } else {
            failed.forEach(f => {
                report += `- [ ] ${f.id}: 需在 TR6 前完成闭环。\n`;
            });
        }

        fs.writeFileSync(REPORT_FILE, report);
        console.log(`✨ Formal test report generated: ${REPORT_FILE}`);
    } catch (error) {
        console.error(`❌ [Report Gen] Error: ${error.message}`);
        process.exit(1);
    }
}

main();
