# 5G UPF 研发治理平台 (IPD 专家版 v1.2)

本项目是一个高性能、云原生的 5G UPF 数据面网元实现，采用 **Go (控制面)** + **VPP/DPDK (数据面)** 技术栈。项目严格遵循 IPD (Integrated Product Development) 研发治理标准。

## 🚀 研发全生命周期执行地图 (Phase Map)

| 阶段 | 核心任务 | 负责角色 | 关键治理 Skill (符合 IPD 专家版) |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Charter 立项与需求基线 | PRODUCT/PM/SE | `mgr-ipd-charter`, `flow-req-spec`, **CDCP** |
| **Phase 2** | 架构设计与可靠性 | SE/ARCHITECT | `arch-adr-decision`, `arch-hld-expert`, **PDCP**, **DFMEA** |
| **Phase 3** | **[强制准入]** 高质量开发 | DEV | **`flow-writing-plans`**, `dev-c-std`, `dev-go-ms-std`, **TDD**, **snake_case** |
| **Phase 4** | 集成测试与质量闭环 | TESTER | `test-quality-gate`, `flow-rat-acceptance`, **ADCP** |
| **Phase 5** | 发布归档与运维 | PRODUCT/QA/PM | `mgr-ipd-spec-archiving`, **SBOM**, **tr-audit**, `mgr-obs-std`, `ops-sop-manual` |

## 🚨 核心治理红线 (Engineering Rules)

1.  **物理设计网关**: 严禁在架构设计 (SDS/LLD) 和测试用例 (TC) 缺失的情况下开启编码任务。
2.  **LTM 伴随生成**: 业务逻辑与监控 (Log/Trace/Metric) 同步实现。
3.  **三位一体同步**: RTM 矩阵必须与物理设计/验证层级对齐。
4.  **架构符合性**: 必须遵循 **VPP** 数据面架构规范。

## 🛠️ 常用指令 (Standard Commands)

- **全流程演练**: `make flow-dryrun` (执行 v5.0+ 多角色仿真干跑)
- **质量审计**: `make quality-gate` (包含 **tr-audit** 与物理对齐检查)
- **物理纠偏**: `make fix-all` (代码格式化与 **SBOM** 索引同步)

---
*Powered by Gemini CLI. 物理闭环治理已就绪。*
























## 🛡️ 治理基线与术语

| 术语/文件 | 治理职责 |
| :--- | :--- |
| `CDCP` | 核心 IPD 交付件或管理节点 |
| `PDCP` | 核心 IPD 交付件或管理节点 |
| `ADCP` | 核心 IPD 交付件或管理节点 |
| `SBOM` | 核心 IPD 交付件或管理节点 |
| `TDD` | 核心 IPD 交付件或管理节点 |
| `DFMEA` | 核心 IPD 交付件或管理节点 |
| `spec-srs.md` | 核心 IPD 交付件或管理节点 |
| `spec-rtm.md` | 核心 IPD 交付件或管理节点 |
| `spec-qclm.md` | 核心 IPD 交付件或管理节点 |
| `spec-rcr.md` | 核心 IPD 交付件或管理节点 |
| `spec-coding-standards.md` | 核心 IPD 交付件或管理节点 |
| `snake_case` | 核心 IPD 交付件或管理节点 |
| `VPP` | 核心 IPD 交付件或管理节点 |
