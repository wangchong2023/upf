const fs = require('fs');
const path = require('path');

// 36 个技能的完整元数据定义
const skillsMetadata = [
    // [分类, 物理路径, 中文名称, 功能说明, 核心约束/专家经验]
    ['flow', 'flow/req-spec', '需求/规格文档', '定义产品需求与系统规格，驱动研发输入', '遵循 IPD RR/SR 模板；必须包含 3GPP 标准条款映射；优先级定义 P0-P2。'],
    ['flow', 'flow/feat-trace', '功能拆解与追踪', '将需求逐层分解为可实现的开发任务', '维护需求追踪矩阵 (RTM)；AR 与测试用例必须 100% 映射；执行变更影响分析。'],
    ['flow', 'flow/test-case', '用例与测试文档', '定义验证体系，覆盖单元/集成/系统测试', 'UT/IT/ST 分层设计；用例必须覆盖正向与异常场景；数据与逻辑解耦。'],
    
    ['arch', 'arch/adr-decision', 'ADR（架构决策记录）', '记录关键架构决策的背景、选项与结论', '包含标题/状态/背景/决策/后果；重点记录 DPDK 选型、协议栈实现等专项决策。'],
    ['arch', 'arch/view-4p1', '架构视图文档（4+1视图）', '从多维度描述系统架构，统一认知', '涵盖逻辑/开发/进程/物理/场景视图；必须包含 UPF 转发面进程模型。'],
    ['arch', 'arch/svc-decomp', '服务与模块拆分原则', '指导微服务边界和 C 模块边界的合理划分', '微服务间通信治理（gRPC vs Kafka）；解耦同步/异步路径；定义 k8s Pod 映射关系。'],
    ['arch', 'arch/intf-internal', '内部子系统接口规范', '定义各子系统间的接口契约', '定义 API/消息/共享内存接口；版本兼容性规则；接口变更必须执行兼容性审计。'],
    ['arch', 'arch/k8s-cloud', 'k8s云原生部署规范', '定义基于 k8s 的全栈部署标准', '涵盖 SR-IOV/Hugepage 特权配置；NUMA 感知调度；Operator 生命周期管理。'],
    ['arch', 'arch/ha-dr', '高可用与容灾设计', '保障电信级可靠性要求', '无状态服务 HA 策略；会话状态同步机制；故障检测与快速切换（BFD/心跳）。'],
    ['arch', 'arch/hw-accel', '硬件加速与卸载策略', '定义硬件加速与卸载演进路径', '卸载策略评估；与 DPDK/VPP 框架集成；硬件抽象层 (HAL) 定义。'],

    ['sub', 'sub/base-lib', '基础平台库', '为所有 C 模块提供统一基础能力', '内存池/无锁队列规范；定时器框架；严禁在转发面路径使用系统调用。'],
    ['sub', 'sub/net-dev-lib', '网络开发库', '封装 DPDK 及相关网络底层开发接口', 'DPDK mbuf/ring 使用规范；零拷贝设计模式；网卡队列调优与 RSS 调度。'],
    ['sub', 'sub/net-svc-plt', '网络业务平台', '承载 IP/数通层面的网络业务逻辑', 'IP 分片重组；NAT 规则实现；路由查找与转发表管理。'],
    ['sub', 'sub/core-cp', '核心网控制面', '实现与 SMF 的会话管理交互', 'PFCP 协议处理 (TS 29.244)；会话上下文管理；状态机异常处理。'],
    ['sub', 'sub/core-dp', '核心网数据面', '实现用户面报文高性能处理', '转发流水线 (UL/DL) 设计；GTP-U 封装解封装；QoS 执行与计费上报。'],
    ['sub', 'sub/oam-mgr', 'OAM管理', '实现配置、监控和告警管理', 'YANG 模型设计；O1 接口规范；PM 性能指标与 FM 故障管理。'],
    ['sub', 'sub/svc-reg-disc', '服务管理（注册与发现）', '指导微服务的生命周期管理', 'NRF 注册发现流程；k8s Service 映射；故障熔断与降级规范。'],
    ['sub', 'sub/ms-mw', '微服务框架与中间件集成', '定义微服务框架选型和集成规范', 'gRPC/Gin 框架选型；Kafka/Redis 集成规范；中间件配置热加载。'],

    ['dev', 'dev/c-std', 'C模块设计规范', '指导数据面和基础平台的 C 开发', '严禁动态内存分配；必须进行边界检查；遵循 MISRA C 部分准则。'],
    ['dev', 'dev/go-svc-std', 'Go服务设计规范', '指导控制面服务的高质量设计', '遵循 Clean Architecture；接口抽象原则；依赖注入规范。'],
    ['dev', 'dev/go-ms-std', 'Go微服务开发规范', '聚焦 Go 语言层面的编码实践', '并发编程（goroutine）规范；错误处理模式；单元测试覆盖率门控。'],
    ['dev', 'dev/intf-3gpp', '外部3GPP接口规范', '定义对外的标准协议接口', 'N3/N4/N6 接口消息流程；与 3GPP TS 条款的严格对应。'],
    ['dev', 'dev/code-review', '代码评审规范', '确保代码质量与设计一致性', 'CR 发现的所有问题必须记录至 IRTM；必须通过静态扫描 (Lint)。'],
    ['dev', 'dev/sec-std', '安全规范', '保障产品安全基线', 'TLS 规范；容器安全基线；敏感数据加密存储；k8s RBAC 最小权限原则。'],
    ['dev', 'dev/3gpp-map', '3GPP标准规范映射', '建立标准条款与代码实现的映射', '维护 TS 条款追踪链；标准变更影响分析；确保合规性。'],
    ['dev', 'dev/api-doc', '接口文档定义标准', '统一 API 文档描述规范', '使用 OpenAPI/Swagger；定义错误码体系；提供调用示例。'],

    ['test', 'test/quality-gate', '测试与质量门控', '定义准入准出标准和质量红线', 'IRTM 缺陷必须 100% 闭环；覆盖率门控；性能基线测试。'],
    ['test', 'test/issue-fix', '缺陷管理与定位', '规范缺陷修复流程', '修复必须伴随回归测试用例；修复 Commit 必须同步至 IRTM。'],
    ['test', 'test/perf-tune', '性能调优规范', '指导 DPDK 与系统层面性能优化', 'CPU 亲和性；NUMA 调优；大页内存配置；性能退化红线。'],

    ['mgr', 'mgr/change-mgr', '变更管理规范', '处理需求与架构变更流程', '变更影响评估；版本兼容性分析；变更评审记录。'],
    ['mgr', 'mgr/git-ver', '软件版本管理与 Git 规范', '规范代码管理与协作流程', '分支策略 (Trunk-based)；Commit Message 规范；版本号语义化。'],
    ['mgr', 'mgr/cicd-pipe', 'CI/CD流水线模板', '提供标准化的自动化流水线', '构建/测试/部署自动化；质量门控集成；制品库管理。'],
    ['mgr', 'mgr/release-mgr', '发布与管理规范', '定义版本发布准则', '发布 Checklist；版本说明书 (Release Notes)；兼容性矩阵。'],
    ['mgr', 'mgr/obs-std', '可观测性规范', '定义系统监控与定位标准', 'Metrics/Logging/Tracing 三位一体；告警规则设计。'],
    ['mgr', 'mgr/cfg-std', '配置管理规范', '统一配置管理模型', 'YANG 模型建模；ConfigMap 使用规范；热加载审计。'],

    ['ops', 'ops/sop-manual', '运维手册与故障排查SOP', '指导生产环境运维与故障处理', '故障分级处理流程；转发面丢包排查 SOP；升级回滚脚本。'],
];

const skillsDir = path.join(process.cwd(), 'skills');

skillsMetadata.forEach(([category, relativePath, chineseName, description, expertGuide]) => {
    const skillPath = path.join(skillsDir, relativePath);
    const skillMdPath = path.join(skillPath, 'SKILL.md');
    const guideMdPath = path.join(skillPath, 'references', 'guide.md');

    // 1. 获取 guide.md 内容（如果存在）
    let guideContent = '';
    if (fs.existsSync(guideMdPath)) {
        guideContent = fs.readFileSync(guideMdPath, 'utf-8');
    }

    // 2. 构造闭环指令 (针对 dev 和 test 分类)
    let closedLoopInstruction = '';
    if (category === 'dev' || category === 'test') {
        closedLoopInstruction = `
## 质量闭环 (Quality Closed-Loop)
- **发现**: 任何评审、扫描或测试发现的缺陷必须记录至 \`docs/verification/issue-review-traceability-matrix.md\` (IRTM)。
- **修复**: 修复代码后必须编写或更新回归测试用例，并在 IRTM 中填入修复 Commit ID。
- **验证**: 确保关联的 Issue 状态更新为 **Closed** 后，方可触发质量门控。
`;
    }

    // 3. 构造 SKILL.md 内容
    const newContent = `---
name: ${path.basename(relativePath)}
description: ${description}
---

# ${chineseName} (${path.basename(relativePath)})

> **专家级工作流**: ${expertGuide}

## 核心任务与操作指南
1. **输入分析**: 基于 \`GEMINI.md\` 生命周期地图，确认当前任务的需求编号（如 RR.XXX/AR.XXX）。
2. **执行规范**: 严格遵循以下专家经验：
   - 优先查阅 [详细指南](references/guide.md) 中的 IPD 模板或 3GPP 条款。
   - 在实施过程中，保持与架构决策 (ADR) 的一致性。
3. **成果验证**: 使用 \`quality-gate\` 检查实施效果，确保不引入回归。
${closedLoopInstruction}
## 参考资源
- [详细指南与模板](references/guide.md)
- [执行地图 (GEMINI.md)](../../GEMINI.md)

---
*Generated by Skill Manager v1.0. 核心业务逻辑已集成。*
`;

    // 4. 写入文件
    if (!fs.existsSync(skillPath)) {
        fs.mkdirSync(skillPath, { recursive: true });
    }
    fs.writeFileSync(skillMdPath, newContent);
    
    // 如果 guide.md 不存在，创建一个占位符
    if (!fs.existsSync(path.dirname(guideMdPath))) {
        fs.mkdirSync(path.dirname(guideMdPath), { recursive: true });
    }
    if (!fs.existsSync(guideMdPath)) {
        fs.writeFileSync(guideMdPath, `# ${chineseName} 指南\n\n${expertGuide}\n`);
    }

    console.log(`[UPDATED] ${relativePath}`);
});

console.log(`\n[SUCCESS] 36 个技能已完成专家化重构。`);
