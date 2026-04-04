# 5G UPF: Cloud-Native User Plane Function

[![Quality Gate](https://img.shields.io/badge/Quality%20Gate-Passed-brightgreen)](Makefile)
[![Standard](https://img.shields.io/badge/IPD-V1.0%20Standard-blue)](GEMINI.md)
[![Style](https://img.shields.io/badge/Code%20Style-snake__case-orange)](skills/dev-c-std/references/guide.md)

基于云原生架构的高性能、高可靠 5G 核心网数据面网元 (User Plane Function)。

---

## 💎 核心工程能力 (Engineering Excellence)
本项目不仅是代码的集合，更是一套严密的工业级研发体系：
- **质量内生**: 强制 **TDD** (Test-Driven Development) 驱动，实现 AR 级 100% 覆盖。
- **契约驱动**: API 规格 (OpenAPI 3.0) 先行，实现控制面与数据面解耦。
- **可靠基石**: 集成 **DFMEA**/FTA 风险分析，确保 99.999% 电信级可用性。
- **治理闭环**: 贯穿 **TR1-TR6** 技术评审与 **CDCP**/**PDCP**/**ADCP** 商业决策。
- **开源合规**: 全生命周期 **OSS** 治理（依赖 License 自动审计）。

---

## 🗺 研发全生命周期地图 (IPD Lifecycle)
项目严格遵循以下阶段执行：
1. **Phase 1: Flow (需求与基线)**: RR/IR 定义, TR1 需求评审。
2. **Phase 2: Arch (架构与可靠性)**: SDS 设计, DFMEA 分析, TR2/TR3 评审。
3. **Phase 3: Dev (高质量开发)**: TDD 驱动实现, 安全编码, TR4 详设评审。
4. **Phase 4: Test (质量闭环)**: **Quality Gate** 拦截, **RAT (需求验收)**, TR5 集成评审。
5. **Phase 5: Release (发布与运维)**: SBOM 审计, 规格归档, TR6 发布评审。

---

## 📂 项目结构规范 (Standard Layout)
- **`docs/spec-rtm.md`**: 需求追踪矩阵 (RTM)。
- **`docs/spec-qclm.md`**: 质量闭环矩阵 (QCLM)。
- **`docs/spec-rat.md`**: 需求验收矩阵 (RAT) - [NEW]。
- **`docs/api/`**: 统一 API 契约门户 (3GPP N4 / Internal)。
- **`scripts/`**: 自动化治理脚本 (Audit, Sync, Contract Check)。

---

## 🚀 关键指令
- **需求同步**: `make sync-reqs` (刷新 700+ 规格项)。
- **质量准入**: `make quality-gate` (执行物理拦截与多维度审计)。
- **测试同步**: `make sync-results` (自动从测试结果回填文档状态)。

---
*Powered by Gemini CLI & IPD Expert Framework. 致力于构建最稳健的 5G 数据面。*
