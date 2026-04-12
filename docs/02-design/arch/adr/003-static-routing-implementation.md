# ADR.003: N6 接口静态路由实现方案选择

## 修订记录 (Revision History)
| 版本 | 日期 | 修改描述 | 作者 |
| :--- | :--- | :--- | :--- |
| v1.0 | 2026-04-12 | 初始设计完成 | Architect-Agent |


## 1. 背景 (Context)
随着需求 `RR.UPF.004` (N6 静态路由) 的下发，UPF 需要支持在 N6 接口配置手工静态路由，以引导下行流量进入非默认网关的特定 DNN 路径。

## 2. 备选方案 (Alternatives)
- **Option A: 核心态路由注入**。利用 Linux 内核路由表，通过 Netlink 同步到数据面。
- **Option B: VPP 转发面原生管理**。直接在 VPP 内部通过 CLI/API 维护 FIB 表项。

## 3. 架构决策 (Decision)
**选择 Option B (VPP 原生管理)**。

## 4. 理由 (Rationale)
- **性能**: VPP 原生 FIB 查询具备极高的查表效率，避免了内核态与用户态的频繁同步开销。
- **云原生**: 符合无状态 HA 要求，配置可通过 ConfigMap 物理注入到 VPP 容器中。

## 5. 影响 (Consequences)
- **API 变更**: 需要增加 `routing-service` 内部微服务接口。
- **开发量**: 需在 `cp-core` 中增加 PFCP Session 关联路由的逻辑。

---
*Status: Accepted | Date: 2026-04-11 | Expert: Architect Agent*
