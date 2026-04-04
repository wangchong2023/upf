# 5G UPF 层次化架构视图标准

## 1. 架构映射矩阵

| 架构层级 | 4+1 对应视图 | 承载的需求级别 | 体现重点 |
| :--- | :--- | :--- | :--- |
| **L0 (系统上下文)** | 场景视图 (+1) | RR (原始需求) | 业务边界、外部接口协议映射。 |
| **L1 (容器/微服务)** | 逻辑视图 / 物理视图 | IR (特性需求) | 服务边界 (FUN)、部署位置、弹性伸缩策略 (PERF)。 |
| **L2 (组件/模块)** | 开发视图 / 进程视图 | SR/AR (规格/分配需求) | 核心类/函数设计、并发模型、同步/异步调用流。 |

## 2. 核心架构资产映射
- **L0 资产**: `docs/arch/views/system-architecture-views.md`
- **L1 资产**: `docs/arch/views/microservice-decomposition-l1.md`
- **L2 资产**: `docs/arch/views/component-decomposition-l2.md`

---
*本标准由 view-4p1 技能驱动并维护。*
