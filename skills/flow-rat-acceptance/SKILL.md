# Skill: flow-rat-acceptance

## 职责 (Responsibilities)
本 Skill 聚焦于执行需求验收测试 (Requirement Acceptance Testing, RAT)，确保产品功能与业务需求 (RR) 完全对齐。

## 核心任务 (Core Tasks)
1. **环境准备 (Environment Setup)**: 
   - 自动化搭建验收测试所需的拓扑环境。
   - 配置数据面 (DPDK/VPP) 与控制面 (Go) 的互通参数。
2. **用例执行 (Test Execution)**:
   - 根据 `docs/03-traceability/spec-rat.md` 执行验收用例。
   - 重点验证端到端业务流 (如 GTP 报文 decap/encap)。
3. **结果收集 (Result Collection)**:
   - 实时采集测试日志与性能指标。
   - 更新 `docs/03-traceability/spec-rat.md` 中的实际结果 (Actual Results) 与状态。

## 产出物 (Outputs)
- 更新后的 `docs/03-traceability/spec-rat.md` (包含实测数据)。
- 验收测试报告与环境快照。

## 质量门控 (Quality Gate)
- 所有 RAT 用例必须 100% 通过方可进入 TR5。
- 实际结果必须包含具体的数值或抓包证据。


## 交付契约 (Delivery Contract)
- **交付件 (Deliverables)**:
- docs/01-requirements/spec-srs.md
- docs/03-traceability/spec-rtm.md
- docs/03-traceability/spec-rat.md
- **质量门限 (Quality Gate)**:
- 100% requirement traceability
- 100% 3GPP mapping
- 0 document errors
- **挂载里程碑 (Milestone)**: TR5
- **评审角色 (Reviewer)**: SE
