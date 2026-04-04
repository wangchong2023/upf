#include <vnet/vnet.h>
#include <vnet/plugin/plugin.h>
#include <vpp/app/version.h>

/**
 * upf_gtpu_decap.c - GTP-U 解封装核心逻辑
 * @Trace AR.UPF.001.02.001.01
 */

typedef struct {
    uint32_t teid;
    ip4_address_t ue_ip;
} upf_gtpu_session_t;

VNET_FEATURE_INIT (upf_gtpu_decap, static) = {
    .arc_name = "device-input",
    .node_name = "upf-gtpu-decap",
    .runs_before = VNET_FEATURES ("ethernet-input"),
};
