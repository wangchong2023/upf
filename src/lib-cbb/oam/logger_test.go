package oam

import "testing"

// @Trace [SR.UPF.001.01.001]
func TestLogger(t *testing.T) {
	Info("test info")
	Error("test error")
}
