/**
 * @职责: 源码与设计全链路双向追溯审计工具 v2.2 (Bidirectional Edition)
 * @作者: Gemini CLI
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const config = require('../core/mgr-config');

const PATHS = config.PATHS;

/**
 * 递归扫描源码中的 @Trace 注解
 */
function scanSourceAnnotations(dir, results = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanSourceAnnotations(fullPath, results);
        } else if (file.endsWith('.go') || file.endsWith('.c') || file.endsWith('.h')) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const matches = content.matchAll(/\/\/ @Trace\s+\[([\w\.]+)\]/g);
            for (const match of matches) {
                results.push({ id: match[1], file: path.relative(process.cwd(), fullPath) });
            }
        }
    });
    return results;
}

/**
 * 主逻辑
 */
function main() {
    try {
        console.log("🔍 Starting Bidirectional Code Traceability Audit...");

        // 1. 获取 RTM 中的所有规格 ID 及状态
        if (!fs.existsSync(PATHS.RTM)) throw new Error("RTM file missing.");
        const rtmContent = fs.readFileSync(PATHS.RTM, 'utf-8');
        
        const rtmSpecs = []; // 存储 {id, status}
        // 匹配 RTM 行: | RR | IR | SR | AR | 类型 | ... | 状态 |
        const lines = rtmContent.split('\n');
        lines.forEach(line => {
            if (line.includes('|') && (line.includes('SR.UPF.') || line.includes('AR.UPF.'))) {
                const parts = line.split('|').map(p => p.trim());
                if (parts.length >= 11) {
                    const id = parts[3].replace(/\*/g, '') || parts[4].replace(/\*/g, '');
                    const status = parts[11] || parts[10] || ""; // 状态通常在末尾
                    if (id) rtmSpecs.push({ id, status, line });
                }
            }
        });

        // 2. 扫描物理源码
        const codeAnnotations = scanSourceAnnotations(PATHS.SRC);
        const codeIds = new Set(codeAnnotations.map(a => a.id));

        let errors = 0;

        // 3. 校验 A: Code -> RTM (幽灵追溯检查)
        console.log("   - Phase A: Checking for Ghost Traces (Code -> RTM)...");
        const rtmAllIds = new Set(rtmSpecs.map(s => s.id));
        codeAnnotations.forEach(anno => {
            if (!rtmAllIds.has(anno.id)) {
                console.error(`❌ [GHOST_TRACE] Code at ${anno.file} refers to unknown ID: ${anno.id}`);
                errors++;
            }
        });

        // 4. 校验 B: RTM -> Code (漏实现检查)
        console.log("   - Phase B: Checking for Missing Implementations (RTM -> Code)...");
        rtmSpecs.forEach(spec => {
            // 如果 RTM 标记为“已验证”或“开发中”，则源码必须有 Trace
            if ((spec.status.includes('✅') || spec.status.includes('开发')) && !codeIds.has(spec.id)) {
                console.error(`❌ [MISSING_TRACE] ID ${spec.id} is claimed in RTM but missing @Trace in source code.`);
                errors++;
            }
        });

        console.log(`📊 Audit Summary: ${rtmAllIds.size} specs in RTM, ${codeIds.size} traces in Code.`);

        // 5. 结论
        if (errors > 0) {
            console.error(`\n🚨 Bidirectional Traceability Audit Failed: ${errors} violations found.`);
            process.exit(1);
        }

        console.log("✅ Bidirectional Traceability Audit Passed.");
    } catch (error) {
        console.error(`❌ [Trace Audit] Error: ${error.message}`);
        process.exit(1);
    }
}

main();
