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
- **stage-next**: 流程扭转 (示例: make stage-next NEXT=TR4)
- **release**: 版本管理与发布 (示例: make release VERSION=v1.0.0) 相关 Skill: mgr-ipd-release
- **changelog**: 自动生成变更日志 (Changelog)
- **agent-pm**: 构建多角色 Agent 系统 PM Agent: 自动生成需求矩阵、审计进度并触发下游调度
- **agent-scheduler**: 调度 Agent: 基于 RTM 承诺日期自动推导下游子任务计划
- **agent-se**: 执行 agent-se 指令
- **agent-architect**: 执行 agent-architect 指令
- **agent-product**: 执行 agent-product 指令
- **agent-qa**: 执行 agent-qa 指令
- **agent-dev**: 执行 agent-dev 指令
- **agent-tester**: 执行 agent-tester 指令
- **agent-risk**: 风险 Agent: 自动跟踪风险矩阵并生成预警
- **parallel-planning**: 并行规划: 同步触发需求同步、分解与架构审计建议
- **parallel-dev-test**: 并行开发与测试: Dev 实现逻辑的同时 Tester 自动生成测试桩
- **quality-gate**: 质量门控总入口 (默认执行全量审计)
- **branch-feature**: 分支管理: 创建特性开发分支 (示例: make branch-feature ID=001)
- **branch-release**: 分支管理: 创建发布冻结分支 (示例: make branch-release VERSION=1.0.0)
- **branch-hotfix**: 分支管理: 创建紧急热修分支 (示例: make branch-hotfix ID=001)
- **backport**: 跨版本变更同步 (示例: make backport COMMIT=c0ffee)
- **release-report**: 版本完备性报告 (TR6 准出物) 相关 Skill: mgr-ipd-release
- **fix-all**: 自动纠偏总入口

---
*Powered by Gemini CLI & QA Expert Framework.*

