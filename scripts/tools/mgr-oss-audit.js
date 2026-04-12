/**
 * @职责: 开源合规物理审计工具 v2.1 (Deep Compliance Edition)
 * @作者: Gemini CLI
 */

const fs = require('fs');
const path = require('path');
const config = require('../core/mgr-config');

const PATHS = config.PATHS;
const POLICY = config.OSS_POLICY;

/**
 * 主逻辑
 */
function main() {
    try {
        console.log("🔍 Starting Deep OSS Compliance & Attribution Audit...");

        const gomodPath = 'go.mod';
        const attributionPath = PATHS.OSS_ATTRIBUTIONS;
        const reportPath = PATHS.OSS_REPORT;

        if (!fs.existsSync(attributionPath)) {
            throw new Error(`Critical Missing Deliverable: ${attributionPath}`);
        }

        // 1. 解析 go.mod 提取依赖清单
        let dependencies = [];
        if (fs.existsSync(gomodPath)) {
            const content = fs.readFileSync(gomodPath, 'utf-8');
            const lines = content.split('\n');
            lines.forEach(line => {
                const match = line.match(/^\s*([a-zA-Z0-9\.\/\-_]+)\s+v/);
                if (match) dependencies.push(match[1].trim());
            });
        }

        // 2. 读取致谢清单
        const attributionContent = fs.readFileSync(attributionPath, 'utf-8');
        
        let forbiddenErrors = 0;
        let attributionErrors = 0;
        let violations = [];

        // 3. 深度交叉审计
        dependencies.forEach(dep => {
            // A. 禁止协议审计 (Tier 1)
            POLICY.FORBIDDEN.forEach(lic => {
                if (dep.toLowerCase().includes(lic.toLowerCase())) {
                    violations.push(`[FORBIDDEN] Dependency ${dep} matches blacklisted license category: ${lic}`);
                    forbiddenErrors++;
                }
            });

            // B. 致谢义务审计 (Tier 3)
            // 每一个 go.mod 里的包都必须在 OSS_ATTRIBUTIONS.md 中登记
            if (!attributionContent.includes(dep)) {
                violations.push(`[MISSING_ATTRIBUTION] Dependency ${dep} found in go.mod but not registered in ${attributionPath}`);
                attributionErrors++;
            }
        });

        // 4. 生成报告
        let report = `# 开源合规深度审计报告 (Deep OSS Audit)\n\n`;
        report += `- **审计日期**: ${new Date().toISOString().split('T')[0]}\n`;
        report += `- **go.mod 依赖数**: ${dependencies.length}\n`;
        report += `- **合规状态**: ${violations.length === 0 ? '✅ 100% 合规' : '❌ 发现违规'}\n\n`;
        
        report += `## 1. 审计明细\n`;
        if (violations.length === 0) {
            report += `✅ 所有依赖均已正确履行协议义务。\n`;
        } else {
            violations.forEach(v => report += `- 🚨 ${v}\n`);
        }

        fs.writeFileSync(reportPath, report);
        console.log(`✨ Detailed OSS Report generated: ${reportPath}`);

        // 5. 结论
        if (forbiddenErrors > 0 || attributionErrors > 0) {
            console.error(`\n🚨 OSS Audit Failed: ${forbiddenErrors} forbidden and ${attributionErrors} missing attributions.`);
            process.exit(1);
        }

        console.log("✅ OSS Deep Compliance Audit Passed.");
    } catch (error) {
        console.error(`❌ [OSS Audit] Error: ${error.message}`);
        process.exit(1);
    }
}

main();
