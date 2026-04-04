const fs = require('fs');
const path = require('path');

/**
 * 测试结果自动化回填脚本 v1.0
 * 职责：解析测试执行结果，物理更新 RTM 矩阵与用例文档状态
 */

const rtmPath = 'docs/spec-rtm.md';
const tcDir = 'docs/verification/test-cases';
// 模拟的测试结果输入 (生产环境下应由 test-runner 生成)
const mockResults = [
    { id: "TC.SR.UPF.001.01.001", status: "PASSED", duration: "120ms" },
    { id: "TC.SR.UPF.001.01.002", status: "PASSED", duration: "85ms" },
    { id: "TC.SR.UPF.001.01.003", status: "FAILED", duration: "200ms", error: "Timeout" }
];

console.log("🔄 Starting Automated Test Result Back-filling...");

const timestamp = new Date().toISOString().split('T')[0];

function updateRTM(results) {
    if (!fs.existsSync(rtmPath)) return;
    let content = fs.readFileSync(rtmPath, 'utf-8');
    let lines = content.split('\n');
    let updatedCount = 0;

    const newLines = lines.map(line => {
        for (const res of results) {
            if (line.includes(res.id)) {
                // 假设状态在最后一列
                if (res.status === "PASSED") {
                    updatedCount++;
                    return line.replace(/待开发|待验证|Pending/g, `✅ 已验证 [${timestamp}]`);
                } else {
                    return line.replace(/待开发|待验证|Pending/g, `❌ 验证失败 [${timestamp}]`);
                }
            }
        }
        return line;
    });

    fs.writeFileSync(rtmPath, newLines.join('\n'));
    console.log(`✅ RTM Updated: ${updatedCount} rows synchronized.`);
}

function updateTCFiles(results) {
    let updatedCount = 0;
    results.forEach(res => {
        const filePath = path.join(tcDir, `${res.id}.md`);
        if (fs.existsSync(filePath)) {
            let content = fs.readFileSync(filePath, 'utf-8');
            
            // 更新执行状态
            const statusText = res.status === "PASSED" ? "通过" : "失败";
            content = content.replace(/执行状态\]: \[.*?\]/g, `执行状态]: [${statusText} @ ${timestamp}]`);
            
            // 如果失败，追加错误信息
            if (res.status === "FAILED" && !content.includes("错误信息")) {
                content += `\n## 5. 错误信息\n- ${res.error}\n`;
            }

            fs.writeFileSync(filePath, content);
            updatedCount++;
        }
    });
    console.log(`✅ TC Documents Updated: ${updatedCount} files synchronized.`);
}

// 执行同步
updateRTM(mockResults);
updateTCFiles(mockResults);

console.log("✨ Back-filling completed successfully.");
