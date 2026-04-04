# 规格归档与同步 指南

## 1. 归档触发时机
- 当 `quality-gate` 报告所有 AR (分配需求) 的 UT/IT 均已通过。
- 当代码已完成 Code Review 并获准合入基线。

## 2. 规格回填操作逻辑
### 2.1 逻辑描述回填 (Functional SR)
- **动作**: 提取代码中关键路径的伪代码或流程说明。
- **目标**: 确保 `SRS` 文档能够作为“活的说明书”指导运维和后续演进。

### 2.2 性能实测回填 (Performance SR)
- **动作**: 读取 `perf-tune` 产生的基准测试数据（如：吞吐量、并发数、时延 P99）。
- **目标**: 将设计目标值 (Target) 与实测值 (Measured) 并列记录。

### 2.3 状态同步 (RTM)
- **路径**: `docs/requirements/upf-requirement-traceability-matrix.md`。
- **操作**: 
    - 状态列: `开发中` -> `已合入` / `已发布`。
    - 备注列: 关联最终合入的 Short Commit ID。

## 3. 归档后的文档锁定
- 归档完成后，该版本的 SRS/RTM 应视为该 Release 版本的基线文档。
- 后续任何修改必须走 `change-mgr` 流程。
