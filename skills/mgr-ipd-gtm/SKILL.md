# Skill: mgr-ipd-gtm

## 职责 (Responsibilities)
本 Skill 负责 Go-To-Market (GTM) 治理、产品规格审计及发布说明 (Release Notes) 的完备性检查，确保产品在商业发布前的合规性与竞争力。

## 核心任务 (Core Tasks)
1. **GTM 治理 (GTM Governance)**:
   - 制定并执行上市策略，确保各区域市场准备就绪。
   - 协调市场、销售与技术支持团队的联动。
2. **产品规格审计 (Product Spec Audit)**:
   - 审计 `docs/02-design/api/external/product-spec.md` 的准确性与最新性。
   - 确保外部接口定义符合 3GPP 标准及客户承诺。
3. **发布说明完备性 (Release Notes Audit)**:
   - 检查 Release Notes 是否包含所有新增特性、已修复缺陷及已知限制。
   - 确保文档语言符合商业发布标准。

## 产出物 (Outputs)
- `docs/02-design/api/external/product-spec.md` (产品规格书)。
- `docs/release-notes.md` (发布说明)。

## 质量门控 (Quality Gate)
- 必须通过 ADCP (可获得性决策评审) 方可进行正式商用发布。

## 交付契约 (Delivery Contract)
- **交付件 (Deliverables)**:
  - docs/02-design/api/external/product-spec.md
- **质量门限 (Quality Gate)**:
  - 100% GTM compliance audit passed
  - Release notes zero-error rate
- **挂载里程碑 (Milestone)**: TR6 / ADCP
- **评审角色 (Reviewer)**: QA / PM
