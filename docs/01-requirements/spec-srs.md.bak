# 5G UPF 系统需求规格说明书 (SRS)

| SR ID | 关联 IR | 类型 | 规格详述 (Action + Object + Metric) | 协议遵循 |
| :--- | :--- | :--- | :--- | :--- |
| **SR.UPF.001.02.001** | IR.UPF.001.02 | FUN | **N4 路径故障探测**: 系统必须每隔 T1 (1-60s 可配) 发送 PFCP Heartbeat Request；若连续 N1 (1-5 次) 未收到响应，必须判定对端故障。判定延时误差需控制在 100ms 以内。 | TS 29.244 Clause 6.2.2 |
| **SR.UPF.001.02.002** | IR.UPF.001.02 | DFX | **路径故障可观测性**: 当 N4 链路判定为 DEAD 时，系统必须在 50ms 内触发 `ERR_PFCP_HB_TIMEOUT` 结构化日志，并原子累加 `upf_n4_path_failure_total` 指标。 | TS 32.401 |
| **SR.UPF.009.01.001** | IR.UPF.009.01 | FUN | 实现 N3 接口 GTP-U 扩展报头物理解析，单次解析时延 < 100ns。 | TS 29.281 |
