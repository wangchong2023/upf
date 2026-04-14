package cpcore

// @Trace [SR.UPF.001.01.003]
// @Trace [SR.UPF.001.01.004]
// @Trace [SR.UPF.001.01.005]
// ParseGTPUExtHeader 解析 GTP-U 扩展报头以提取 QFI
func ParseGTPUExtHeader(payload []byte) (uint8, error) {
	if len(payload) < 2 {
		return 0, nil
	}
	// 模拟解析逻辑
	qfi := payload[1] & 0x3F
	return qfi, nil
}
