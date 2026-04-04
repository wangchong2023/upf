# Git 提交与版本管理指南 (专家版 v1.0)

## 1. Commit Message 标准格式
每个提交必须遵循 Angular 风格，且**必须关联需求/缺陷编号**：
`type(scope): [ID] subject`

*   **type**: `feat` (新功能), `fix` (修补), `docs` (文档), `style` (格式), `refactor` (重构), `test` (测试), `chore` (构建)。
*   **ID**: 对应的 **AR 编号** (如 `AR.UPF.001.01.001.01`) 或 **Issue 编号** (如 `IS.TDD.001`)。
*   **示例**: `feat(cp-core): [AR.UPF.001.01.001.01] 实现 PFCP PDR 解析逻辑`

## 2. 分支管理策略 (Trunk-based Development)
- **main**: 受保护的稳定分支，仅允许通过 TR5 的 MR 合入。
- **feat/[ID]**: 针对特定 AR 开发的特性分支。
- **fix/[ID]**: 针对特定 Issue 的修复分支。

## 3. Git Hooks 强制准则
- **pre-commit**:
    - 运行 `make auto-doc-check`。
    - 运行 `make lint-c` / `make lint-go` (仅针对当前暂存文件)。
- **commit-msg**:
    - 校验 ID 模式是否匹配 `\[(AR|IS|RCR)\..*\]`。

## 4. Tag 与版本发布
- 格式: `v[Major].[Minor].[Patch]`
- 每次发布 TR6 通过后，必须在 `main` 分支打 Tag。
