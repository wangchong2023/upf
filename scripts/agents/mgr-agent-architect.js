/**
 * @职责: 自动补齐的治理脚本 - Architect Agent
 * @版本: v1.3 (Conditional Master Audit Edition)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../core/mgr-config');

const PATHS = config.PATHS;

console.log("🚀 [Architect Agent] Starting conditional architectural audit...");

// Role Gate Check
try {
    execSync('node scripts/core/mgr-role-gate.js --action=ADR_REVIEW', { stdio: 'inherit' });
} catch (e) {
    process.exit(1);
}

try {
    // 1. 物理生成缺失的设计骨架
    console.log("🏗️  [Architect Agent] Syncing design skeletons...");
    execSync('node scripts/tools/gen-design-skeletons.js', { stdio: 'inherit' });

    // 2. 深度审计：Master 设计文档修订记录与语义密度
    console.log("🔍 [Architect Agent] Auditing Master Design Document...");
    execSync('node scripts/tools/mgr-doc-audit.js', { stdio: 'inherit' });

    // 3. 条件式审计：检查 ADR 覆盖率与内容
    const srsContent = fs.readFileSync(PATHS.SRS, 'utf-8');
    const rrIds = [];
    const rrMatches = srsContent.matchAll(/\| (\*\*RR\.UPF\.\d+\*\*) \|/g);
    for (const match of rrMatches) {
        rrIds.push(match[1].replace(/\*/g, ''));
    }

    let blockers = 0;
    rrIds.forEach(id => {
        const adrFile = `ADR-${id.replace(/\./g, '-')}.md`;
        const adrPath = path.join(PATHS.ADR_DIR, adrFile);
        
        if (!fs.existsSync(adrPath)) {
            console.error(`❌ [MISSING_ADR] Requirement ${id} lacks a physical ADR.`);
            blockers++;
        } else {
            const content = fs.readFileSync(adrPath, 'utf-8');
            // SMART 密度审计
            if (content.includes('TBD') || content.includes('[Draft')) {
                console.error(`❌ [INCOMPLETE_ADR] ${adrFile} contains placeholders.`);
                blockers++;
            }
        }
    });

    // 4. 校验 API 契约 (条件式：仅当头文件或 YAML 变化时)
    console.log("📡 [Architect Agent] Auditing API Contract...");
    execSync('node scripts/tools/api-contract-check.js', { stdio: 'inherit' });

    if (blockers > 0) {
        throw new Error(`Architectural audit failed: ${blockers} design gaps found.`);
    }

    console.log("✅ [Architect Agent] All conditional architectural audits passed.");
} catch (e) {
    console.error(`❌ [Architect Agent] Audit failed: ${e.message}`);
    process.exit(1);
}
