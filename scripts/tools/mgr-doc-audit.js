/**
 * @职责: 文档修订记录与一致性审计工具 v1.0
 * @作者: Gemini CLI
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const config = require('../core/mgr-config');

const PATHS = config.PATHS;

/**
 * 核实修订记录是否更新
 */
function auditRevisionHistory(filePath) {
    if (!fs.existsSync(filePath)) return;

    console.log(`🔍 [Doc Audit] Checking revision history in: ${path.basename(filePath)}`);
    
    // 检查是否有敏感变更 (通过 git diff)
    let hasChanges = false;
    try {
        const diff = execSync(`git diff --name-only HEAD ${filePath}`, { stdio: 'pipe' }).toString();
        if (diff.trim()) hasChanges = true;
    } catch (e) {
        // 如果不在 git 环境或无 diff，假设有变更以触发严格检查
        hasChanges = true; 
    }

    if (!hasChanges) {
        console.log(`   - No physical changes detected in ${path.basename(filePath)}. Skipping revision check.`);
        return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const today = new Date().toISOString().split('T')[0];
    
    // 匹配修订记录行，例如 | v1.0 | 2026-04-12 | ... |
    const revisionRegex = new RegExp(`\\|\\s*v\\d+\\.\\d+\\s*\\|\\s*${today}\\s*\\|`, 'g');
    
    if (!revisionRegex.test(content)) {
        console.error(`❌ [MISSING_REVISION] Document ${path.basename(filePath)} was modified but the Revision History table was not updated for today (${today}).`);
        process.exit(1);
    }

    console.log(`   ✅ Revision History updated for ${today}.`);
}

/**
 * 主逻辑
 */
function main() {
    try {
        console.log("🚀 Starting Document & Revision Audit...");

        // 1. 审计 Master 设计总案
        auditRevisionHistory(PATHS.SYSTEM_DESIGN_SPEC);

        // 2. 审计所有 ADR
        if (fs.existsSync(PATHS.ADR_DIR)) {
            const adrs = fs.readdirSync(PATHS.ADR_DIR).filter(f => f.endsWith('.md'));
            adrs.forEach(adr => {
                // ADR 较多，仅在有 git 变更时强制检查
                auditRevisionHistory(path.join(PATHS.ADR_DIR, adr));
            });
        }

        console.log("✅ Document Audit Passed.");
    } catch (error) {
        console.error(`❌ [Doc Audit] Error: ${error.message}`);
        process.exit(1);
    }
}

main();
