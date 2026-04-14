package cpcore

import "testing"

// @Trace [SR.UPF.001.01.003]
// @Trace [SR.UPF.001.01.004]
// @Trace [SR.UPF.001.01.005]
func TestParseGTPUExtHeader(t *testing.T) {
	tests := []struct {
		name    string
		payload []byte
		want    uint8
	}{
		{
			name:    "valid qfi",
			payload: []byte{0x00, 0x1F}, // 0x1F & 0x3F = 31
			want:    31,
		},
		{
			name:    "short payload",
			payload: []byte{0x00},
			want:    0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := ParseGTPUExtHeader(tt.payload)
			if err != nil {
				t.Errorf("unexpected error: %v", err)
			}
			if got != tt.want {
				t.Errorf("ParseGTPUExtHeader() = %v, want %v", got, tt.want)
			}
		})
	}
}
