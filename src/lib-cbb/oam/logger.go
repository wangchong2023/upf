package oam

import "log"

/**
 * logger.go - 统一可观测性日志组件
 * @Trace AR.UPF.004.01.001.01
 */

func Info(msg string) {
	log.SetPrefix("[UPF-INFO] ")
	log.Println(msg)
}

func Error(msg string) {
	log.SetPrefix("[UPF-ERROR] ")
	log.Println(msg)
}

// @Trace [SR.UPF.001.01.001]
