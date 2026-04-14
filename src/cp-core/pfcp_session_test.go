package cpcore

import (
	"testing"
	"time"
)

// @Trace [SR.UPF.001.01.002]
func TestPFCPSession_CheckHeartbeat(t *testing.T) {
	s := &PFCPSession{
		SEID:        1,
		LastContact: time.Now(),
		IsActive:    true,
	}

	if err := s.CheckHeartbeat(10 * time.Second); err != nil {
		t.Errorf("expected no error, got %v", err)
	}

	// Test timeout
	s.LastContact = time.Now().Add(-20 * time.Second)
	if err := s.CheckHeartbeat(10 * time.Second); err == nil {
		t.Errorf("expected error on timeout, got nil")
	}
}

func TestPFCPSession_UpdateActivity(t *testing.T) {
	s := &PFCPSession{
		SEID:        1,
		LastContact: time.Now().Add(-10 * time.Second),
		IsActive:    false,
	}
	s.UpdateActivity()
	if !s.IsActive {
		t.Errorf("expected IsActive to be true")
	}
	if time.Since(s.LastContact) > time.Second {
		t.Errorf("expected LastContact to be updated")
	}
}
