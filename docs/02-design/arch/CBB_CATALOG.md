# 5G UPF CBB 资产图谱 (Common Building Blocks Catalog)

本文件由 `auto-cbb-catalog.js` 自动生成，作为架构设计 (ADR) 复用的“资产货架”。

## 1. 资产概览
| 组件名称 | 物理路径 | 代码规模 | 核心导出能力 | 验证状态 |
| :--- | :--- | :--- | :--- | :--- |
| logger.go | `oam/logger.go` | 21 LOC | `Info, Error` | ✅ 100% UT |

## 2. 复用指南
- **查找**: 架构师在方案设计前，必须查阅此清单。
- **集成**: 通过 `require` 或物理链接方式引入。
- **贡献**: 通用逻辑应提交至 `src/lib-cbb/` 并同步刷新此目录。
