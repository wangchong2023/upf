#ifndef PFCP_SESSION_H
#define PFCP_SESSION_H

#include <stdint.h>

/**
 * PFCP 会话核心结构体
 * 必须与 3GPP N4 YAML 定义保持物理对齐
 */
struct pfcp_session {
    uint64_t seid;      // Session Endpoint Identifier
    uint16_t pdr_id;    // Packet Detection Rule ID
    uint16_t far_id;    // Forwarding Action Rule ID
    uint32_t f_teid;    // Fully Qualified TEID
};

#endif
