/**
 * @职责: 自动化设计骨架生成工具 v1.3 (Blueprint Library Edition)
 * @作者: Gemini CLI
 */

const fs = require('fs');
const path = require('path');
const config = require('../core/mgr-config');

const PATHS = config.PATHS;

/**
 * 物理加载模板并替换变量
 */
function generateFromTemplate(templatePath, targetPath, variables) {
    if (fs.existsSync(targetPath)) return;

    if (!fs.existsSync(templatePath)) {
        console.error(`❌ Template missing: ${templatePath}`);
        return;
    }

    let content = fs.readFileSync(templatePath, 'utf-8');
    for (const [key, value] of Object.entries(variables)) {
        const regex = new RegExp(`\\[${key}\\]`, 'g');
        content = content.replace(regex, value);
    }

    fs.writeFileSync(targetPath, content);
    console.log(`✨ Generated from blueprint: ${targetPath}`);
}

/**
 * 主逻辑
 */
function main() {
    try {
        console.log("🚀 Starting Design Skeleton Generation (SMART Blueprints)...");

        if (!fs.existsSync(PATHS.SRS)) {
            console.error("❌ SRS file missing.");
            return;
        }

        const content = fs.readFileSync(PATHS.SRS, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach(line => {
            const match = line.match(/\| (\*\*RR\.UPF\.\d+\*\*) \| [^|]+ \| ([^|]+) \|/);
            if (match) {
                const rrId = match[1].replace(/\*/g, '');
                const rrName = match[2].trim().replace(/\*\*/g, '');
                
                // 1. 生成 ADR
                const adrFile = `ADR-${rrId.replace(/\./g, '-')}.md`;
                generateFromTemplate(
                    PATHS.ADR_TEMPLATE, 
                    path.join(PATHS.ADR_DIR, adrFile),
                    { 'RR_ID': rrId, 'RR_NAME': rrName }
                );

                // 2. 生成对应模块的 LLD 占位
                const lldFile = `LLD-${rrId.replace(/\./g, '-')}.md`;
                // 假设 LLD 存放在 docs/02-design/lld/
                const lldDir = path.join(path.dirname(PATHS.SDS), 'lld');
                if (!fs.existsSync(lldDir)) fs.mkdirSync(lldDir, { recursive: true });
                
                generateFromTemplate(
                    PATHS.LLD_TEMPLATE,
                    path.join(lldDir, lldFile),
                    { '模块名称': rrName }
                );
            }
        });

        console.log("✅ All SMART design skeletons are synchronized with blueprints.");
    } catch (e) {
        console.error(`❌ [Design Gen] Fatal Error: ${e.message}`);
        process.exit(1);
    }
}

main();
