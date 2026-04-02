# Cloud-Native 5G UPF (User Plane Function)

本项目致力于从零开始构建一个端到端、高质量、基于云原生架构的 5G UPF 产品。它旨在满足 5G 场景下的高吞吐、低时延需求，并具备电信级的可靠性与可扩展性。

## 🚀 项目概览
- **核心定位**: 完全云原生的 5GC 用户面功能网元 (UPF)。
- **技术选型**:
  - **控制面 (UPF-C)**: Go 语言实现，负责 PFCP 协议处理与会话管理。
  - **数据面 (UPF-D)**: C 语言 + VPP/DPDK 框架，负责高性能报文转发。
  - **基础设施**: 基于 Kubernetes 部署，支持 SR-IOV、Multus CNI 及 NUMA 感知调度。

## 📂 目录结构
- `skills/`: 研发资产库，包含 33 个专业 Skill（覆盖流程、架构、开发、测试、运维）。
- `dist/`: 已打包的 `.skill` 文件，用于快速安装与分发。
- `deployments/`: 部署相关脚本（Helm Charts, K8s manifests）。
- `upf-c/`: [TODO] 控制面源代码。
- `upf-d/`: [TODO] 数据面源代码。
- `GEMINI.md`: **AI 研发指挥中心**，定义了详细的研发地图与 Skill 执行顺序。

## 🛠 研发指南 (AI-Driven Development)
本项目深度集成了 Gemini CLI 的 AI 协同能力。开发者应遵循以下原则：

1. **查阅执行地图**: 在开始任何研发阶段前，请先阅读根目录下的 `GEMINI.md`。
2. **激活专业技能**: 根据当前任务阶段（如需求、架构、编码等），调用对应的 Skill。例如：
   ```bash
   # 获取微服务拆分架构建议
   /skills use svc-decomp
   ```
3. **遵循渐进式披露**: 核心工作流在 `SKILL.md` 中，详细规范与指南位于各 Skill 目录下的 `references/guide.md`。

## 📈 研发路线图
- [x] 研发流程与 33 个专业 Skill 定义。
- [x] 研发全生命周期执行地图 (GEMINI.md) 建立。
- [ ] 核心目录结构初始化与控制面项目脚手架搭建。
- [ ] 基础转发面 VPP 插件原型开发。
- [ ] MVP 版本：实现端到端会话建立与单条 GTP 流转发。

---
*由项目管理团队 (Product Manager, Architect & R&D Manager) 维护。*
