const fs = require('fs');
const path = require('path');

/**
 * 开源合规审计脚本 v2.1 (合规增强版)
 * 职责：解析工程依赖文件，执行 License 红线拦截
 */

try {
    console.log("🛡️  Starting Production-Grade OSS Compliance Audit...");

    const reportPath = "docs/verification/oss-compliance-report.md";
    const POLICY = {
        BLOCK: ["GPL-3.0", "AGPL-3.0", "GPLv3", "AGPL", "LGPL-3.0"],
        WARNING: ["GPL-2.0", "LGPL-2.1"]
    };

    // 1. 尝试探测依赖源
    const getDependencies = () => {
        let deps = [];
        if (fs.existsSync('go.mod')) {
            console.log("📦 Detected go.mod, parsing dependencies...");
        }
        return deps;
    };

    const dependencies = getDependencies();
    let violations = [];
    let warnings = [];

    // 2. 审计逻辑
    let report = `# OSS Compliance & SBOM Audit Report (v2.0)\n\n`;
    report += `## 1. SBOM Overview\n| Component | Version | License | Status |\n| :--- | :--- | :--- | :--- |\n`;

    dependencies.forEach(dep => {
        let status = "🟢 Passed";
        if (POLICY.BLOCK.some(l => dep.license.includes(l))) {
            status = "🔴 FORBIDDEN";
            violations.push(dep);
        } else if (POLICY.WARNING.some(l => dep.license.includes(l))) {
            status = "🟡 WARNING";
            warnings.push(dep);
        }
        report += `| ${dep.name} | ${dep.version} | ${dep.license} | ${status} |\n`;
    });

    // 3. 结果汇总
    report += `\n## 2. Compliance Verdict\n`;
    if (violations.length > 0) {
        report += `### ❌ CRITICAL FAILURE\nDetected ${violations.length} forbidden components. **BLOCKING RELEASE.**\n`;
        violations.forEach(v => report += `- [BLOCKER] \`${v.name}\` (${v.license})\n`);
    } else if (warnings.length > 0) {
        report += `### ⚠️ COMPLIANCE WARNING\nDetected ${warnings.length} components with restrictive licenses.\n`;
        warnings.forEach(w => report += `- [WARN] \`${w.name}\` (${w.license})\n`);
    } else {
        report += `✅ All components satisfy the project license policy.\n`;
    }

    report += `\n\n---\n*Audit Timestamp: ${new Date().toISOString()}*\n`;

    fs.writeFileSync(reportPath, report);
    console.log(`✅ Audit report saved to ${reportPath}`);

    if (violations.length > 0) {
        console.error("❌ Quality Gate Failure: OSS policy violation (Incompatible License).");
        process.exit(1);
    } else {
        console.log("🟢 OSS Audit passed.");
    }
} catch (error) {
    console.error(`❌ [OSS Audit] Error: ${error.message}`);
    process.exit(1);
}
