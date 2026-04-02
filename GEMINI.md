# 项目上下文：upf (云原生 5G UPF)

该目录 (`/Users/constantine/Documents/Work/Code/projects/upf`) 是一个基于云原生架构的 5G UPF (User Plane Function) 研发项目。本 `GEMINI.md` 为 Gemini CLI 提供核心项目背景与指令指引。

## 项目概览
- **名称:** upf
- **定位:** 高性能、高可靠、完全云原生的 5G 核心网数据面网元。
- **技术栈:** **Go (控制面)** + **VPP/DPDK (数据面)**，支持 K8s、SR-IOV 及无状态 HA。

## 研发全生命周期执行地图 (Skill 执行顺序)

为了确保端到端高质量交付，请根据研发阶段依次调用以下 Skill。**注：所有需求编号须遵循 RR.XXX / IR.FUN.XXX / SR.FUN.XXX.XXX / AR.FUN.XXX.XXX.XXX 规范。**

### 第一阶段：需求分析与流程规范 (flow)
1. `req-spec` (需求/规格文档) - **RR 级定义**
2. `feat-trace` (功能拆解与追踪) - **IR/SR/AR 级拆解**
3. `change-mgr` (变更管理规范) - **处理需求变更流程 (新增)**
4. `test-case` (用例与测试文档) - **UT/IT/ST 映射**

### 第二阶段：架构设计与方案决策 (arch)
1. `adr-decision` (架构决策记录)
2. `view-4p1` (架构多维视图)
3. `svc-decomp` (微服务与模块拆分)
4. `k8s-cloud` (云原生部署规范)
5. `ha-dr` (高可用与容灾)
6. `hw-accel` (硬件加速与卸载策略)

### 第三阶段：开发规约与环境准备 (dev)
1. `c-std` / `go-svc-std` (代码设计规范)
2. `sec-std` (安全开发基线)
3. `3gpp-map` (标准条款映射)
4. `api-doc` (接口文档定义标准)

### 第四阶段：子系统开发实现 (sub)
1. `base-lib` (基础库) / `net-dev-lib` (网络库)
2. `core-dp` (转发面) / `core-cp` (控制面)
3. `go-ms-std` (Go 规范) / `code-review` (代码评审 - **新增**)

### 第五阶段：集成测试与质量保障 (test)
1. `quality-gate` (质量门控) - **含测试后提交环节**
2. `issue-fix` (缺陷管理与定位 - **新增**)
3. `perf-tune` (性能调优与基准)

### 第六阶段：工程管理与交付运维 (mgr & ops)
1. `git-ver` (版本与 Git 管理)
2. `cicd-pipe` (CI/CD 自动化流水线)
3. `release-mgr` (发布与管理规范)
4. `obs-std` (可观测性) / `cfg-std` (配置管理)
5. `sop-manual` (运维与故障排查)

---
- **flow**: 研发流程、规格定义与变更管理
- **arch**: 系统架构、决策与硬件加速
- **dev**: 编码规范、安全与代码评审
- **sub**: 核心组件与子系统实现
- **test**: 测试策略、缺陷修复与性能调优
- **mgr**: 工程管理、Git 规范与版本发布
- **ops**: 运维支撑与 SOP

---
*由 Gemini CLI 生成并维护。建议在开始每个任务前，先咨询对应的 Skill 以获取最佳实践建议。*
