/**
 * @职责: 自动补齐的治理脚本 - Architect Agent
 * @版本: v1.2 (Full Coverage Edition)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('../core/mgr-config');

const PATHS = config.PATHS;

console.log("🚀 [Architect Agent] Starting full architectural coverage audit...");

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

    // 2. 审计：需求对齐性 (SRS -> ADR)
    console.log("🔍 [Architect Agent] Auditing requirement-to-design coverage...");
    if (!fs.existsSync(PATHS.SRS)) throw new Error("SRS file missing.");
    const srsContent = fs.readFileSync(PATHS.SRS, 'utf-8');
    const rrIds = [];
    const rrMatches = srsContent.matchAll(/\| (\*\*RR\.UPF\.\d+\*\*) \|/g);
    for (const match of rrMatches) {
        rrIds.push(match[1].replace(/\*/g, ''));
    }

    let coverageErrors = 0;
    rrIds.forEach(id => {
        const adrFile = `ADR-${id.replace(/\./g, '-')}.md`;
        const adrPath = path.join(PATHS.ADR_DIR, adrFile);
        if (!fs.existsSync(adrPath)) {
            console.error(`❌ [MISSING_ADR] Requirement ${id} lacks a physical ADR file: ${adrFile}`);
            coverageErrors++;
        }
    });

    // 3. 审计：内容完备性
    console.log("🔍 [Architect Agent] Auditing existing ADR readiness...");
    const adrFiles = fs.readdirSync(PATHS.ADR_DIR).filter(f => f.endsWith('.md'));
    let contentErrors = 0;

    adrFiles.forEach(file => {
        const content = fs.readFileSync(path.join(PATHS.ADR_DIR, file), 'utf-8');
        if (content.includes('Status: [Draft') || content.includes('Expert: TBD')) {
            console.error(`❌ [ADR_INCOMPLETE] ADR ${file} is still in Draft or has TBD fields.`);
            contentErrors++;
        }
    });

    // 4. 校验 API 契约 (物理)
    console.log("📡 [Architect Agent] Auditing API Contract...");
    execSync('node scripts/tools/api-contract-check.js', { stdio: 'inherit' });

    const totalErrors = coverageErrors + contentErrors;
    if (totalErrors > 0) {
        throw new Error(`Architectural audit failed: ${totalErrors} coverage or content violations found.`);
    }

    console.log("✅ [Architect Agent] All architectural audits passed.");
} catch (e) {
    console.error(`❌ [Architect Agent] Audit failed: ${e.message}`);
    process.exit(1);
}
