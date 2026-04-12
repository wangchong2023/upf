# LLD: N4 链路管理详细设计 [SR.UPF.001.02.001]

## 1. 算法设计
- 采用 **Ticker + Map** 模式。
- 时间复杂度: O(1) 指针操作。
- 并发策略: `sync.Map` 存储节点上下文，避免大锁竞争。

## 2. 数据结构
```go
type PFCPNode struct {
    ID string
    T1 time.Duration
    N1 int
    RetryCount int32 // 原子操作
}
```
