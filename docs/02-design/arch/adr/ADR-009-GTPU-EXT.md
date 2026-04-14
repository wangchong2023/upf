# ADR-009: GTP-U 扩展报头物理解析方案

## 1. 状态 (Status)
Accepted

## 2. 上下文 (Context)
需要支持 N3 接口 GTP-U 扩展报头 (PDU Session Container) 的物理解析，单次解析时延要求 < 100ns。

## 3. 决策 (Decision)
采用向量化解析逻辑 (Vectorized parsing)，基于 VPP 的双环缓冲区处理。

## 4. 影响 (Consequences)
- 优点: 极低时延，高吞吐。
- 缺点: 开发复杂度略高。

## 5. 修订记录 (Revision History)

| 版本 | 日期 | 修订说明 | 修订人 |
| :--- | :--- | :--- | :--- |
| v1.0 | 2026-04-14 | 初始版本 | ARCHITECT |
