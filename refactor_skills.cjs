const fs = require('fs');
const path = require('path');

const mapping = {
    'requirements-specification': 'std-req-spec',
    'feature-decomposition-traceability': 'std-feat-trace',
    'usecase-test-specification': 'std-test-case',
    'adr-architecture-decision-record': 'arch-adr-decision',
    'architecture-view-4plus1': 'arch-view-4p1',
    'service-module-decomposition': 'arch-svc-decomp',
    'internal-interface-specification': 'arch-intf-internal',
    'external-3gpp-interface-specification': 'arch-intf-3gpp',
    'k8s-cloudnative-deployment': 'arch-k8s-cloud',
    'high-availability-disaster-recovery': 'arch-ha-dr',
    'c-module-design-standard': 'dev-c-std',
    'go-service-design-standard': 'dev-go-svc-std',
    'security-standard': 'dev-sec-std',
    '3gpp-standard-mapping': 'dev-3gpp-map',
    'testing-quality-gate': 'test-quality-gate',
    'performance-tuning-standard': 'test-perf-tune',
    'version-management-git-standard': 'mgr-git-ver',
    'cicd-pipeline-template': 'mgr-cicd-pipe',
    'observability-standard': 'mgr-obs-std',
    'configuration-management-standard': 'mgr-cfg-std',
    'ops-manual-troubleshooting-sop': 'ops-sop-manual',
    'base-platform-lib': 'sub-base-lib',
    'network-dev-lib': 'sub-net-dev-lib',
    'network-business-platform': 'sub-net-svc-plt',
    'core-network-control-plane': 'sub-core-cp',
    'core-network-data-plane': 'sub-core-dp',
    'oam-management': 'sub-oam-mgr',
    'go-microservice-dev-standard': 'sub-go-ms-std',
    'microservice-framework-middleware': 'sub-ms-mw',
    'service-management-registry-discovery': 'sub-svc-reg-disc'
};

const skillsTxt = `序号	分类	技能	英文名称	功能说明	备注
1	流程规范	需求/规格文档	requirements-specification	定义产品需求与系统规格，驱动研发输入	IPD RR/SR模板、市场需求描述、系统需求条款、3GPP标准条款映射、需求优先级定义
2	流程规范	功能拆解与需求追踪	feature-decomposition-traceability	将需求逐层分解为可实现的开发任务并保持全程可追踪	IPD IR/SR/AR分解模板、需求追踪矩阵（RTM）、AR与测试用例映射、变更影响分析
3	流程规范	用例与测试文档	usecase-test-specification	定义验证体系，覆盖单元/集成/系统测试	UT/IT/ST用例模板、测试场景设计、测试数据规范、用例与AR的追踪关系
4	架构设计	ADR（架构决策记录）	adr-architecture-decision-record	记录关键架构决策的背景、选项与结论，支持决策回溯	ADR模板（标题/状态/背景/决策/后果）、UPF专项决策场景（DPDK选型/PFCP实现/用户态协议栈/SMF接口协议）
5	架构设计	架构视图文档（4+1视图）	architecture-view-4plus1	从多维度描述系统架构，统一各干系人的架构认知	逻辑视图/开发视图/进程视图/物理视图/场景视图模板、UPF转发面与控制面进程模型、DU/CU分离与MEC部署视图
6	架构设计	服务与模块拆分原则	service-module-decomposition	指导微服务边界和C模块边界的合理划分，并明确UPF微服务参考架构与服务间通信治理规范	微服务拆分原则（Go）、C模块边界原则、UPF微服务参考划分方案（upf-cp/upf-dp/upf-oam/upf-svc/upf-cfg各服务边界）、模块与k8s Pod对应关系、内聚/耦合评估方法、微服务间通信治理（同步gRPC vs 异步Kafka选择原则/超时重试熔断规范/API版本管理）、cp↔dp规则下发与状态同步规范
7	架构设计	内部子系统接口规范	internal-interface-specification	定义各子系统间的接口契约，保障模块间解耦与协作	接口定义模板（API/消息/共享内存）、版本兼容性规则、接口变更流程、基础平台/网络平台/核心网/服务管理各层接口约定
8	架构设计	外部3GPP接口规范	external-3gpp-interface-specification	定义UPF对外的标准协议接口，保障互联互通	N3（GTP-U）/N4（PFCP）/N6（SGi/DN）/N9（UPF间）接口规范、协议栈约定、消息流程模板、与3GPP TS条款的对应关系
9	架构设计	k8s云原生部署规范	k8s-cloudnative-deployment	定义UPF基于k8s的云原生部署架构规范，覆盖数据面特权配置到控制面调度的全栈k8s使用标准	Pod/Deployment/StatefulSet设计规范、数据面特权配置（hugepage/SR-IOV/Multus CNI）、调度规范（亲和性/污点/NUMA感知调度）、Operator开发规范（UPF生命周期管理）、ResourceQuota/LimitRange规范、k8s存储规范（会话持久化）、CNI网络插件选型与配置
10	架构设计	高可用与容灾设计	high-availability-disaster-recovery	指导UPF控制面和数据面的高可用架构设计，保障电信级可靠性要求	主备/负载均衡架构模式、无状态服务HA策略、有状态服务HA策略、会话状态同步机制、故障检测与快速切换（BFD/心跳）、优雅重启与GR（Graceful Restart）、k8s Pod HA策略（PodDisruptionBudget/反亲和性）、容灾演练规范
11	开发规范	C模块设计规范	c-module-design-standard	指导数据面和基础平台的C语言模块开发，保障代码质量 and 可维护性	模块结构规范、头文件/接口设计原则、内存管理规则、错误处理规范、禁止项（系统调用/动态内存/异常路径）、代码风格与命名规范
12	开发规范	Go服务设计规范	go-service-design-standard	聚焦Go微服务的设计原则与架构规范，指导控制面和管理面服务的高质量设计	SOLID/Clean Architecture在Go中的应用、包结构设计原则、接口抽象原则、依赖注入规范、领域模型设计、服务边界定义
13	开发规范	安全规范	security-standard	保障UPF产品在接口、数据和部署层面的安全基线	N4接口TLS规范、数据面隔离要求、容器安全基线、k8s RBAC规范、敏感数据处理规则、安全编码checklist
14	开发规范	3GPP标准规范映射	3gpp-standard-mapping	将3GPP标准条款与产品需求、代码实现建立显式映射，确保合规	TS 29.244（PFCP）条款映射、TS 23.501/502场景映射、标准条款→需求→代码→测试的追踪链、标准变更影响分析方法
15	测试质量	测试与质量门控	testing-quality-gate	定义测试策略、准入准出标准和质量红线，保障版本质量	测试分层策略（UT/IT/ST/性能）、覆盖率门控指标、性能测试规范（吞吐量/时延/并发会话数）、质量红线定义、测试报告模板
16	测试质量	性能调优规范	performance-tuning-standard	指导DPDK数据面和系统层面的性能优化，达到UPF吞吐与时延目标	DPDK CPU亲和性配置、NUMA内存优化、大页内存规范、网卡队列调优、转发面性能基线、性能回归测试方法
17	工程管理	软件版本管理与Git规范	version-management-git-standard	规范代码管理流程，保障多团队协作和版本可控	分支策略（主干/特性/发布/热修复）、commit规范、tag与版本号规则、changelog生成、多仓库管理策略、版本兼容性矩阵
18	工程管理	CI/CD流水线模板	cicd-pipeline-template	提供标准化的自动化构建、测试、部署流水线，提升交付效率	C/DPDK构建流水线模板、Go服务流水线模板、k8s部署流水线模板、质量门控集成、制品管理规范、环境晋级策略
19	工程管理	可观测性规范	observability-standard	定义系统可观测性标准，支撑运维监控和问题定位	Metrics指标定义规范（Prometheus）、Tracing链路追踪规范（Jaeger）、Logging日志规范、告警规则设计、Dashboard模板
20	工程管理	配置管理规范	configuration-management-standard	统一应用配置、基础设施配置和网元配置的管理规范，保障配置的可控、可追踪和一致性	应用配置规范（静态/动态/热加载）、k8s ConfigMap/Secret使用规范、Helm Chart设计规范、YANG模型配置建模、NETCONF/RESTCONF配置下发、环境差异化配置策略、配置版本化与变更审计、配置备份与恢复
21	运维支撑	运维手册与故障排查SOP	ops-manual-troubleshooting-sop	指导UPF生产环境运维操作和故障处理，降低MTTR	日常运维操作手册、故障分级与处理流程、UPF专项排查（转发面丢包/GTP隧道异常/N4断链）、诊断工具使用指南、升级回滚SOP
22	子系统	基础平台库	base-platform-lib	为所有C模块提供统一的基础能力，避免重复造轮子	内存池使用规范、无锁队列/Ring Buffer设计、定时器框架、日志与告警接口、公共数据结构、错误码体系
23	子系统	网络开发库	network-dev-lib	封装DPDK及相关网络开发库的使用规范，为上层网络业务和数据面提供统一的底层开发接口	DPDK mbuf/mempool/ring使用规范、零拷贝设计模式、Poll Mode Driver（PMD）使用规范、多核并行与RSS队列调度、收发包API封装规范、网卡驱动适配规范、开发库版本管理与升级策略、转发面编程禁止项（禁止系统调用/阻塞/动态内存分配）
24	子系统	网络业务平台	network-business-platform	承载IP/数通层面的网络业务逻辑处理，介于底层网络开发库与核心网数据面业务之间	IP分片/重组处理、NAT规则管理与实现、路由查找与转发表管理、ARP/NDP协议处理、VLAN/VXLAN封装处理、协议解析框架、流分类与报文识别、与网络开发库的底层边界定义、与核心网数据面的上层边界定义
25	子系统	核心网控制面	core-network-control-plane	指导UPF控制面业务开发，实现与SMF的会话管理交互	PFCP协议处理（TS 29.244）、N4会话建立/修改/删除流程、PDR/FAR/QER/URR规则模型、SMF交互状态机、会话上下文管理、控制面异常处理
26	子系统	核心网数据面	core-network-data-plane	指导UPF数据面转发流水线开发，实现用户面报文高性能处理	转发流水线设计（UL/DL处理路径）、GTP-U封装/解封装、QoS执行（GBR/MBR）、URR计费上报、Fast Path设计约束、数据面与控制面规则同步机制
27	子系统	OAM管理	oam-management	指导UPF的管理面开发，实现运营商的配置、监控和告警管理	O1接口规范、YANG模型设计、性能指标上报（PM）、故障告警管理（FM）、配置下发模型、与NMS/EMS的北向接口约定
28	子系统	Go微服务开发规范	go-microservice-dev-standard	聚焦Go语言层面的具体开发规范和编码实践，与#12设计规范互补	包编码规范、错误处理模式、并发编程规范（goroutine/channel）、单元测试规范、gRPC/REST服务编码实践、优雅启停实现、脚手架模板
29	子系统	微服务框架与中间件集成	microservice-framework-middleware	定义UPF控制面/管理面微服务框架选型和中间件集成规范，语言无关	框架选型规范（Gin/gRPC等）、消息队列集成规范（Kafka用于话单上报）、缓存集成规范（Redis用于会话缓存）、中间件配置规范、依赖管理规范
30	子系统	服务管理（注册与发现）	service-management-registry-discovery	指导UPF微服务的注册、发现和生命周期管理，支撑5G SBI架构	NRF注册/发现流程（3GPP SBI）、k8s Service与5G SBI映射关系、服务健康检查规范、负载均衡策略、服务版本管理、故障熔断与降级规范`;

const lines = skillsTxt.split('\n').filter(l => l.trim() !== '');
const rows = lines.slice(1).map(line => line.split('\t'));

const skillsDir = path.join(process.cwd(), 'skills');
if (!fs.existsSync(skillsDir)) {
    fs.mkdirSync(skillsDir);
}

rows.forEach(row => {
    const chineseName = row[2];
    const oldName = row[3];
    const functionDesc = row[4];
    const remark = row[5];

    const newName = mapping[oldName];
    if (!newName) {
        console.error(`Mapping not found for ${oldName}`);
        return;
    }

    const category = newName.split('-')[0];
    const categoryDir = path.join(skillsDir, category);
    if (!fs.existsSync(categoryDir)) {
        fs.mkdirSync(categoryDir);
    }

    const skillPath = path.join(categoryDir, newName);
    if (!fs.existsSync(skillPath)) {
        fs.mkdirSync(skillPath);
    }

    const refDir = path.join(skillPath, 'references');
    if (!fs.existsSync(refDir)) {
        fs.mkdirSync(refDir);
    }

    // Generate SKILL.md
    const skillMdContent = `---
name: ${newName}
description: ${functionDesc}
---

# ${chineseName} (${newName})

## 工作流
1. 理解业务背景与${chineseName}的核心要求。
2. 遵循标准规范进行详细设计与实施。
3. 执行质量检查与验证，确保符合预期目标。
4. 归档文档并持续迭代优化。

详情请参考 [指南](references/guide.md)。
`;
    fs.writeFileSync(path.join(skillPath, 'SKILL.md'), skillMdContent);

    // Generate references/guide.md
    const guideMdContent = `# ${chineseName} 指南

${remark}
`;
    fs.writeFileSync(path.join(refDir, 'guide.md'), guideMdContent);
});

console.log('Skills refactored successfully.');
