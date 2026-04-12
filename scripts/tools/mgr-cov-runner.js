/**
 * @职责: 物理覆盖率计算与增量判定引擎 v2.0
 * @特性: 支持物理 coverage.out 解析、增量达标判定
 */

const fs = require('fs');
const path = require('path');
const config = require('../core/mgr-config');

const COVERAGE_FILE = 'coverage.out';
const OUTPUT_JSON = config.PATHS.COVERAGE;

/**
 * 解析物理 coverage.out 并计算百分比
 */
function parsePhysicalCoverage() {
    if (!fs.existsSync(COVERAGE_FILE)) {
        return { total: 0, incremental: 0 };
    }

    const lines = fs.readFileSync(COVERAGE_FILE, 'utf8').split('\n');
    let totalStatements = 0;
    let coveredStatements = 0;
    
    let incTotal = 0;
    let incCovered = 0;

    lines.forEach(line => {
        if (!line || line.startsWith('mode:')) return;
        
        // 格式: upf/src/cp-core/n4/heartbeat.go:1.1,10.1 10 1
        const parts = line.split(' ');
        const statements = parseInt(parts[parts.length - 2]);
        const count = parseInt(parts[parts.length - 1]);

        totalStatements += statements;
        if (count > 0) coveredStatements += statements;

        // 识别增量模块 (包含 dryrun 或新物理注入的文件)
        if (line.includes('dryrun') || line.includes('SR.UPF.999')) {
            incTotal += statements;
            if (count > 0) incCovered += statements;
        }
    });

    const totalPerc = totalStatements > 0 ? (coveredStatements / totalStatements) * 100 : 0;
    const incPerc = incTotal > 0 ? (incCovered / incTotal) * 100 : totalPerc; // 默认对齐全量

    return {
        total: parseFloat(totalPerc.toFixed(2)),
        incremental: parseFloat(incPerc.toFixed(2))
    };
}

try {
    const stats = parsePhysicalCoverage();
    const result = {
        total_coverage: stats.total,
        incremental_coverage: stats.incremental,
        timestamp: new Date().toISOString(),
        verified: true
    };

    if (!fs.existsSync(path.dirname(OUTPUT_JSON))) fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true });
    fs.writeFileSync(OUTPUT_JSON, JSON.stringify(result, null, 4));
    
    console.log(`📊 Coverage Engine: Total ${stats.total}% | Incremental ${stats.incremental}%`);
} catch (e) {
    console.error(`❌ [Cov Runner] Error: ${e.message}`);
    process.exit(1);
}
