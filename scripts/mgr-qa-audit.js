const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * QA 独立审计脚本 v1.0
 * 职责：执行内容真实性抽查，识别“合规性作弊”与隐性质量风险
 */

console.log("🕵️  Starting Independent QA Deep Audit...");

// Role Gate Check
try {
    execSync('node scripts/mgr-role-gate.js --action=QUALITY_AUDIT', { stdio: 'inherit' });
} catch (e) {
    process.exit(1);
}

const paths = {
    src: 'src',
    results: 'docs/verification/test-results.json',
    qaReport: 'docs/verification/qa-audit-log.md',
    riskMatrix: 'docs/spec-risk-register.md'
};

let qaIssues = [];

// 1. 代码空洞检测 (扫描 @Trace 关联的代码块是否包含有效逻辑)
function auditCodeSubstance(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            auditCodeSubstance(fullPath);
        } else if (file.endsWith('.go') || file.endsWith('.c')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            if (content.includes('@Trace') && (content.includes('TODO') || content.includes('panic("not implemented")'))) {
                qaIssues.push(`[CODE_EMPTY] File ${file} has @Trace but contains TODO or Not-Implemented logic.`);
            }
        }
    });
}

// 2. 测试真实性核查 (检查测试执行耗时是否合理)
function auditTestRealism() {
    if (fs.existsSync(paths.results)) {
        const results = JSON.parse(fs.readFileSync(paths.results, 'utf-8'));
        results.forEach(res => {
            const ms = parseInt(res.duration);
            if (ms < 1 && res.status === 'PASSED') {
                qaIssues.push(`[TEST_SUSPICIOUS] ${res.id} passed in <1ms. Possible mock or empty test case.`);
            }
        });
    }
}

// 3. 风险矩阵审计 (检查 Critical 风险与超期风险)
function auditRiskMatrix() {
    if (fs.existsSync(paths.riskMatrix)) {
        const content = fs.readFileSync(paths.riskMatrix, 'utf-8');
        const lines = content.split('\n');
        const today = new Date();
        
        lines.forEach(line => {
            if (line.includes('| **RK.')) {
                const parts = line.split('|').map(p => p.trim());
                if (parts.length < 9) return;
                
                const riskId = parts[1];
                const level = parts[3];
                const targetDate = new Date(parts[7]);
                const status = parts[8];

                if (level === '高' || level === 'Critical' || level === 'High') {
                    if (status !== '**Closed**' && status !== 'Closed') {
                        qaIssues.push(`[CRITICAL_RISK] ${riskId} is ${level} and still ${status}.`);
                    }
                }

                if (status !== '**Closed**' && status !== 'Closed' && targetDate < today && parts[7] !== '') {
                    qaIssues.push(`[RISK_OVERDUE] ${riskId} has passed its target closure date (${parts[7]}).`);
                }
            }
        });
    }
}

// 执行审计
auditCodeSubstance(paths.src);
auditTestRealism();
auditRiskMatrix();

// 3. 生成 QA 审计日志
let report = `# QA Independent Audit Log\n\n`;
report += `| Risk Level | Category | Description | Status |\n| :--- | :--- | :--- | :--- |\n`;

if (qaIssues.length === 0) {
    report += `| 🟢 Low | N/A | No suspicious patterns detected in code or tests. | Verified |\n`;
} else {
    qaIssues.forEach(issue => {
        const level = issue.includes('EMPTY') ? "🔴 High" : "🟡 Medium";
        report += `| ${level} | Audit | ${issue} | **Open** |\n`;
    });
}

fs.writeFileSync(paths.qaReport, report);
console.log(`✅ QA Audit log generated at ${paths.qaReport}`);

// QA 审计不直接拦截编译，但会将结果输出到仪表盘
