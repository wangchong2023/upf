# Skill: mgr-ipd-charter

## 职责 (Responsibilities)
本 Skill 负责在 Charter 移交阶段定义项目的业务目标、成本指标及 DFx (Design for X) 需求。

## 核心任务 (Core Tasks)
1. **业务目标定义 (Business Goals)**:
   - 明确产品的商业竞争力目标 (如吞吐量、并发用户数)。
   - 定义投资回报预测与上市时间 (TTM)。
2. **成本与资源 (Cost & Resources)**:
   - 设定研发成本上限与硬件 BOM 成本目标。
   - 确定核心团队组成与关键资源分配。
3. **DFx 需求注入 (DFx Requirements)**:
   - 可靠性 (DfR): 定义 MTBF 目标。
   - 易维性 (DfS): 明确可观测性与诊断规格。
   - 安全性 (DfS): 注入安全基线要求。

## 产出物 (Outputs)
- `docs/04-management/spec-charter.md` (项目章程)。
- 初始风险登记簿 (`docs/04-management/spec-risk-register.md`)。

## 质量门控 (Quality Gate)
- 必须通过 CDCP (概念决策评审) 批准方可进入 Phase 2。


## 交付契约 (Delivery Contract)
- **交付件 (Deliverables)**:
- docs/04-management/spec-decision-log.md
- docs/05-quality/verification/qa-audit-log.md
- **质量门限 (Quality Gate)**:
- 100% decision integrity
- Audit score > 95
- 0 P0 risks open
- **挂载里程碑 (Milestone)**: TR1
- **评审角色 (Reviewer)**: QA
