---
name: hw-accel
description: 定义 5G UPF 的硬件加速与卸载策略，提升转发性能并降低 CPU 占用
---
# 硬件加速与卸载策略 (hw-accel)
## 工作流
1. 评估业务场景流量特征与 CPU 资源瓶颈。
2. 制定硬件加速策略（SR-IOV, OVS-DPDK, VDPA 等）。
3. 设计数据面卸载路径与异常回滚机制。
4. 验证卸载性能指标与系统稳定性。
详情参考 [指南](hw-accel)。
