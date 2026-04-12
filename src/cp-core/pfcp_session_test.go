package cpcore

import (
	"testing"
	"time"
)

func TestCheckHeartbeat(t *testing.T) {
	// 场景 1: 心跳正常
	session := &PFCPSession{
		SEID:        1001,
		LastContact: time.Now(),
		IsActive:    true,
	}

	err := session.CheckHeartbeat(5 * time.Second)
	if err != nil {
		t.Errorf("Expected no error, got %v", err)
	}
	if !session.IsActive {
		t.Error("Expected session to be active")
	}

	// 场景 2: 心跳超时
	session.LastContact = time.Now().Add(-10 * time.Second)
	err = session.CheckHeartbeat(5 * time.Second)
	if err == nil {
		t.Error("Expected timeout error, got nil")
	}
	if session.IsActive {
		t.Error("Expected session to be inactive")
	}
}
