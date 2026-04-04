const fs = require('fs');
const path = require('path');

/**
 * @Trace 增强型双向审计脚本 v1.0
 * 职责：检查 RTM 中的 AR 需求是否在源码中有物理实现，并识别孤立代码。
 */

console.log("🕵️  Starting Bidirectional Traceability Audit (@Trace)...");

const rtmPath = 'docs/spec-rtm.md';
const srcDir = 'src';
const fileExtensions = ['.go', '.c', '.h'];

// 1. 从 RTM 提取所有 AR 编号
function getARsFromRTM() {
    if (!fs.existsSync(rtmPath)) return new Set();
    const content = fs.readFileSync(rtmPath, 'utf-8');
    const matches = content.match(/AR\.UPF\.[0-9.]+/g) || [];
    return new Set(matches);
}

// 2. 从源码扫描所有 @Trace 标记
function getTracesFromCode(dir, allTraces = new Map()) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            getTracesFromCode(fullPath, allTraces);
        } else if (fileExtensions.includes(path.extname(file))) {
            const content = fs.readFileSync(fullPath, 'utf-8');
            const matches = content.match(/@Trace\s+(AR\.UPF\.[0-9.]+)/g);
            if (matches) {
                matches.forEach(m => {
                    const id = m.replace('@Trace', '').trim();
                    if (!allTraces.has(id)) allTraces.set(id, []);
                    allTraces.get(id).push(fullPath);
                });
            }
        }
    });
    return allTraces;
}

const rtmARs = getARsFromRTM();
const codeTraces = getTracesFromCode(srcDir);

console.log(`📊 Statistics: RTM ARs: ${rtmARs.size}, Code Trace Points: ${codeTraces.size}`);

// 3. 执行分析
let missingImplementations = []; // RTM 有，Code 无
let orphanImplementations = [];  // Code 有，RTM 无

rtmARs.forEach(ar => {
    if (!codeTraces.has(ar)) {
        missingImplementations.push(ar);
    }
});

codeTraces.forEach((files, ar) => {
    if (!rtmARs.has(ar)) {
        orphanImplementations.push({ ar, files });
    }
});

// 4. 打印审计报告
console.log("\n--- 🔍 Audit Findings ---");

if (missingImplementations.length > 0) {
    console.error(`❌ Missing Implementations (${missingImplementations.length}):`);
    // 仅打印前 10 个
    missingImplementations.slice(0, 10).forEach(ar => console.log(`   - [NOT_FOUND] ${ar}`));
    if (missingImplementations.length > 10) console.log(`   ... and ${missingImplementations.length - 10} more.`);
} else {
    console.log("✅ All RTM Requirements have corresponding @Trace in code.");
}

if (orphanImplementations.length > 0) {
    console.warn(`⚠️  Orphan Implementations (${orphanImplementations.length}): (Code found but not in RTM)`);
    orphanImplementations.forEach(item => {
        console.log(`   - [ORPHAN] ${item.ar} in: ${item.files.join(', ')}`);
    });
}

// 5. 门控判定
if (missingImplementations.length > 0) {
    console.error("\n❌ Quality Gate Failure: Requirement traceability gap detected.");
    process.exit(1);
} else {
    console.log("\n🟢 Traceability audit passed.");
    process.exit(0);
}
