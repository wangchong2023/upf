package cpcore

import (
	"fmt"
	"time"
)

// PFCPSession 代表一个 N4 会话
type PFCPSession struct {
	SEID        uint64
	LastContact time.Time
	IsActive    bool
}

// CheckHeartbeat 检查心跳状态
// @Trace [SR.UPF.001.01.002]
func (s *PFCPSession) CheckHeartbeat(timeout time.Duration) error {
	if time.Since(s.LastContact) > timeout {
		s.IsActive = false
		return fmt.Errorf("heartbeat timeout for SEID: %d", s.SEID)
	}
	s.IsActive = true
	return nil
}

// UpdateActivity 更新会话活跃时间
// @Trace [SR.UPF.001.01.002]
func (s *PFCPSession) UpdateActivity() {
	s.LastContact = time.Now()
	s.IsActive = true
}
