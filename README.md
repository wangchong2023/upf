# 5G UPF: Cloud-Native User Plane Function

[![Quality Gate](https://img.shields.io/badge/Quality%20Gate-Passed-brightgreen)](Makefile)
[![Standard](https://img.shields.io/badge/IPD-V1.2%20Standard-blue)](GEMINI.md)
[![QA Audit](https://img.shields.io/badge/QA%20Audit-Active-orange)](docs/05-quality/verification/qa-audit-log.md)

基于云原生架构的高性能、高可靠 5G 核心网数据面网元。

---

## 🔍 项目实时概貌 (Quick-Look)
| 核心能力 | 现状 | 支撑工具/Skill |
| :--- | :--- | :--- |
| **需求治理** | 719 项 SR/AR 已基线化 | `flow-req-sync` |
| **代码追踪** | `@Trace` 双向审计已开启 | `api-trace-audit` |
| **质量拦截** | 5 重物理门控 + QA 独立审计 | `quality-gate` |
| **流程变革管控** | QA 指导与全量监控已开启 | `mgr-ipd-qa-expert` |
## 🤖 PDT Digital Expert Team (Agent Cluster)

| Agent | PDT Role | IPD Responsibilities | Key Deliverables |
| :--- | :--- | :--- | :--- |
| **`agent-product`**| Product | Charter Lockdown & GTM Audit | `spec-charter.md`, `product-spec.md` |
| **`agent-pm`** | PM | Schedule Audit & Risk Track | `spec-project-plan.md`, `spec-risk.md` |
| **`agent-se`** | SE | Requirement Decomposition & APIs | `api/external/`, `spec-sds.md` (IR) |
| **`agent-architect`**| Architect | Architecture Design & Governance | `arch/adr/`, `spec-sds.md` (SDS) |
| **`agent-dev`** | Developer | High-Quality Coding & Unit Tests | `src/**/*.go`, `src/**/*.c`, `api/internal/` |
| **`agent-tester`** | Tester | Integration & System Validation | `verification/test-results.json` |
| **`agent-qa`** | QA | Process Compliance & Audit | `verification/qa-audit-log.md`, `tr-audit.md` |
| **`agent-maintainer`**| Maintainer | Release & Configuration Control | `release/`, `spec-version-plan.md` |
| **`agent-risk`** | Risk Expert | Continuous Risk Tracking | `spec-risk-register.md` (Updated) |

---

## 🚀 关键指令

| 指令 | 职责说明 |
| :--- | :--- |
| `make sync-reqs` | 需求同步 |
| `make flow-dryrun` | IPD 全生命周期干跑仿真 |
| `make agent-pm` | 执行 agent-pm 指令 |
| `make agent-scheduler` | 执行 agent-scheduler 指令 |
| `make agent-se` | 执行 agent-se 指令 |
| `make agent-architect` | 执行 agent-architect 指令 |
| `make agent-product` | 执行 agent-product 指令 |
| `make agent-qa` | 执行 agent-qa 指令 |
| `make agent-dev` | 执行 agent-dev 指令 |
| `make agent-tester` | 执行 agent-tester 指令 |
| `make agent-risk` | 执行 agent-risk 指令 |
| `make quality-gate` | 质量门控总入口 |


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
