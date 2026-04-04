# 5G UPF: Cloud-Native User Plane Function

[![Quality Gate](https://img.shields.io/badge/Quality%20Gate-Passed-brightgreen)](Makefile)
[![Standard](https://img.shields.io/badge/IPD-V1.2%20Standard-blue)](GEMINI.md)
[![QA Audit](https://img.shields.io/badge/QA%20Audit-Active-orange)](docs/verification/qa-audit-log.md)

基于云原生架构的高性能、高可靠 5G 核心网数据面网元。

---

## 🔍 项目实时概貌 (Quick-Look)
| 核心能力 | 现状 | 支撑工具/Skill |
| :--- | :--- | :--- |
| **需求治理** | 719 项 SR/AR 已基线化 | `flow-req-sync` |
| **代码追踪** | `@Trace` 双向审计已开启 | `api-trace-audit` |
| **质量拦截** | 5 重物理门控 + QA 独立审计 | `quality-gate` |
| **流程变革管控** | QA 指导与全量监控已开启 | `mgr-qa-expert` |
| **角色化 Agent** | PM/SE/Arch/QA 协同已就绪 | `scripts/mgr-agent-*` |
| **并行工作流** | Dev 与 Tester 原子化并行 | `make parallel-*` |
| **自动纠偏** | C/Go/JS 全语言修复已开启 | `make fix-all` |
| **API 契约** | OpenAPI 3.0 (N4) 已锁定 | `api-contract-check` |

---

## 💎 核心工程能力
- **QA 专家驱动**: 独立审计脚本 + **全量流程监控**。任何流程变革均在 QA 指导下进行。
- **Agent 自动化协同**: 集成 **280+ 全局专家技能**，自动化执行需求、架构、质量及风险治理任务。
- **并行任务编排**: 利用 `make -j` 与原子权限，支持规划、开发与测试桩生成的同步推进。
- **物理门控与纠偏**: `pre-commit` 物理拦截非合规代码，并支持全语言自动纠偏。

---

## 🗺 研发地图 (IPD Roadmap)
1. **Phase 1: Flow**: 需求基线评审 (TR1)。
2. **Phase 2: Arch**: 架构设计评审 (TR3)。
3. **Phase 3: Dev**: TDD 驱动与单元验证 (TR4)。
4. **Phase 4: Test**: 集成验收 (TR5) & **RAT (需求验收)**。
5. **Phase 5: Release**: 发布决策 (TR6) & **ADCP**。

## 🛠 协同与权限使用说明 (Collaboration & Usage)

### 1. 角色与身份校验
项目采用 Token 化的角色门控。在执行关键指令前，必须注入合法的身份令牌：
- **生成 Token**: 运行 `node scripts/gen-tokens.js` 获取各角色的 `ACTIVE_TOKEN`。
- **假设角色**:
  ```bash
  export ACTIVE_ROLE=MAINTAINER
  export ACTIVE_TOKEN=xxxx_your_token_xxxx
  make stage-next NEXT=TR4
  ```

### 2. 多 Agent 并行协同
支持跨角色任务的集群化作业，提升研发吞吐量：
- **规划协同**: `make parallel-planning` (同步触发需求同步、分解与架构建议)。
- **开发协同**: `make parallel-dev-test` (Dev 实现代码与 Tester 生成测试桩并行)。

---

## 🚀 关键指令
- **stage-next**: 流程扭转 (示例: make stage-next NEXT=TR4)
- **agent-pm**: PM Agent: 自动生成需求矩阵、审计进度并触发下游调度
- **agent-scheduler**: 调度 Agent: 基于 RTM 承诺日期自动推导下游子任务计划
- **agent-se**: 自动执行治理任务
- **agent-architect**: 自动执行治理任务
- **agent-qa**: 自动执行治理任务
- **agent-risk**: 风险 Agent: 自动跟踪风险矩阵并生成预警
- **parallel-planning**: 并行规划: 同步触发需求同步、分解与架构审计建议
- **parallel-dev-test**: 并行开发与测试: Dev 实现逻辑的同时 Tester 自动生成测试桩
- **fix-all**: 自动纠偏总入口

---
*Powered by Gemini CLI & QA Expert Framework.*
