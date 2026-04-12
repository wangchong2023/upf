package n4

import (
	"fmt"
	"time"
	"upf/src/lib-cbb/oam"
)

// PFCPHeartbeatConfig defines T1/N1 parameters.
type PFCPHeartbeatConfig struct {
	T1 time.Duration
	N1 int
}

// HeartbeatContext manages node-level heartbeat state.
type HeartbeatContext struct {
	LastRequest  time.Time
	LastResponse time.Time
	RetryCount   int
	Running      bool
}

/**
 * StartHeartbeatLoop runs the T1 timer. [TASK.001]
 * Integration with LTM [TASK.001_LTM]
 */
func (hc *HeartbeatContext) StartHeartbeatLoop(config PFCPHeartbeatConfig, timeoutHandler func()) {
	hc.Running = true
	ticker := time.NewTicker(config.T1)
	defer ticker.Stop()

	for hc.Running {
		select {
		case <-ticker.C:
			hc.sendRequest()
			hc.checkTimeout(config, timeoutHandler)
		}
	}
}

func (hc *HeartbeatContext) sendRequest() {
	hc.LastRequest = time.Now()
	// [TASK.001_LTM]
	oam.Info(fmt.Sprintf("Sent PFCP Heartbeat Request at %v", hc.LastRequest))
}

func (hc *HeartbeatContext) checkTimeout(config PFCPHeartbeatConfig, handler func()) {
	if hc.LastResponse.Before(hc.LastRequest) {
		hc.RetryCount++
		// [TASK.001_LTM]
		oam.Error(fmt.Sprintf("[ERR_PFCP_HB_TIMEOUT] Heartbeat timeout. Retry: %d/%d", hc.RetryCount, config.N1))

		if hc.RetryCount >= config.N1 {
			hc.Running = false
			handler()
		}
	}
}
