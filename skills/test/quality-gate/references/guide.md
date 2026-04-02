# 测试与质量门控 (quality-gate) 规范指南

## 1. 质量红线与门控指标
- **UT (单元测试)**: 语句覆盖率 > 80%，核心 AR 逻辑 100% 覆盖。
- **IT (集成测试)**: 接口测试 100% 通过，主要 SR 规格场景全覆盖。
- **ST (系统测试)**: 性能指标 (PERF) 达标，业务流程 (FUN) 闭环。

## 2. 验证通过后的合入流水线 (Commit Pipeline)
当且仅当所有质量门控指标均达标后，方可启动代码提交程序：
1. **生成测试报告**: 汇总 UT/IT 结果，标注对应的 AR/SR 编号。
2. **发起合入请求 (MR/PR)**: 描述本次合入修复的 Issue 或实现的 Feature。
3. **静态扫描与编译**: 自动触发 Lint 和构建检查。
4. **人工代码评审 (Code Review)**: 遵循 `code-review` 规范进行审核。
5. **最终提交 (Commit/Push)**: 评审通过后，代码正式合入基线分支。

## 3. 结果回填
- 必须将测试通过的 Commit ID 或 Build ID 回填至 `feature-decomposition-traceability.md` 的 RTM 矩阵中，实现需求与代码的物理闭环。
