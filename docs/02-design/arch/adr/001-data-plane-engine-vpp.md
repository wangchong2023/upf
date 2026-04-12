# ADR-001: 数据面转发引擎选型

## 修订记录 (Revision History)
| 版本 | 日期 | 修改描述 | 作者 |
| :--- | :--- | :--- | :--- |
| v1.0 | 2026-04-12 | 初始设计完成 | Architect-Agent |


## 状态
已接受 (Accepted)

## 背景 (Context)
5G UPF 需要极高性能的数据包处理能力，以满足 100Gbps+ 的吞吐量和微秒级的时延要求。我们需要在自研 DPDK 标量框架和使用成熟开源矢量框架（如 FD.io VPP）之间做出选择。

## 决策 (Decision)
采用 **FD.io VPP (Vector Packet Processor)** 作为 5G UPF 的数据面转发引擎。

## 理由 (Rationale)
1. **高性能**: VPP 的矢量包处理 (Vector Packet Processing) 机制能显著提高 CPU 缓存命中率，性能在大规模流量下优于传统的标量处理。
2. **插件化架构**: 易于扩展 UPF 专属逻辑（如 GTP-U 解封装、PDR/FAR 匹配），且不影响核心引擎的稳定性。
3. **生态成熟**: VPP 已在多个电信级网元中得到验证，具备完善的图形化调试工具、CLI 以及对 DPDK 的原生支持。
4. **云原生友好**: VPP 能够很好地运行在容器中，并支持与 Multus CNI、SR-IOV 等云原生网络技术集成。

## 后果 (Consequences)
- **正面**: 缩短底层网络框架的开发周期，降低维护成本，支持快速横向扩展。
- **负面**: 学习曲线较陡，研发团队需要深入掌握 VPP 的二进制 API、Node 图编程模型及其特有的内存管理。
- **中性**: 核心开发工作将集中在编写定制化的 **VPP Plugin** 及其与控制面（Go 语言实现）的高效规则同步接口上。

---
*Created by Gemini CLI using 'adr-decision' skill on 2026-04-02.*
