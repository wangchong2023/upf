const fs = require('fs');
const path = require('path');

/**
 * 测试用例骨架生成脚本 v1.0
 * 职责：根据 RTM 矩阵自动同步测试用例文档
 */

const rtmPath = 'docs/spec-rtm.md';
const outputDir = 'docs/verification/test-cases';
const templatePath = 'docs/verification/test-case-template.md';

console.log("🚀 Syncing test case skeletons with RTM...");

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const template = fs.readFileSync(templatePath, 'utf-8');

try {
    const rtmContent = fs.readFileSync(rtmPath, 'utf-8');
    const lines = rtmContent.split('\n');
    
    let tcCount = 0;
    
    lines.forEach(line => {
        // 匹配格式如 | TC.SR.UPF.001.01.001 |
        const match = line.match(/TC\.SR\.UPF\.[0-9.]+/);
        if (match) {
            const tcId = match[0];
            // 提取对应的 AR ID (假设 AR 在同一行的前几列)
            const arMatch = line.match(/AR\.UPF\.[0-9.]+/);
            const arId = arMatch ? arMatch[0] : 'N/A';
            
            const filePath = path.join(outputDir, `${tcId}.md`);
            
            if (!fs.existsSync(filePath)) {
                let content = template.replace(/\[TC\.ID\]/g, tcId)
                                      .replace(/TC\.SR\.UPF\.XXX/g, tcId)
                                      .replace(/AR\.UPF\.XXX/g, arId);
                fs.writeFileSync(filePath, content);
                tcCount++;
            }
        }
    });
    
    console.log(`✅ Success: Generated ${tcCount} new test case skeletons.`);
} catch (e) {
    console.error("❌ Failed to process RTM for test cases:", e.message);
}
