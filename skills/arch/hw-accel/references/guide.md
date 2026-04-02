# 硬件加速指南
- **卸载技术选型**: SR-IOV 直通、NVIDIA BlueField DPU 卸载、VDPA (vHost Data Path Acceleration)。
- **转发路径方案**: Fast Path 卸载到网卡、Slow Path 保留在 CPU 软件处理。
- **配置与协同**: DPDK 驱动绑定、CPU 亲和性隔离、NUMA 亲和性配置方案。
