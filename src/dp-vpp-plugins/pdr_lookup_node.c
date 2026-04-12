#include "pdr_match.h"
#include <vlib/vlib.h>
#include <vnet/vnet.h>

/*
 * pdr_lookup_node: 5G UPF 核心 PDR 查找节点
 * 遵循 arch-sub-core-dp 增强版规约
 */
VLIB_NODE_FN (pdr_lookup_node) (vlib_main_t *vm, vlib_node_runtime_t *node, vlib_frame_t *frame)
{
    uint32_t n_left_from, *from, *next;
    from = vlib_frame_vector_args (frame);
    n_left_from = frame->n_vectors;

    /* [DfP] 向量化双循环优化 (Dual-Loop) 骨架 */
    while (n_left_from >= 4)
    {
        /* 预取后续报文，减少缓存缺失 */
        {
            vlib_buffer_t *p2, *p3;
            p2 = vlib_get_buffer (vm, from[2]);
            p3 = vlib_get_buffer (vm, from[3]);
            vlib_prefetch_buffer_header (p2, LOAD);
            vlib_prefetch_buffer_header (p3, LOAD);
        }

        /* 处理当前两个报文 (Batch of 2) */
        // TODO: 调用 pdr_match_key_t 查找逻辑

        from += 2;
        next += 2;
        n_left_from -= 2;
    }

    /* 处理剩余报文 (Single-Loop) */
    while (n_left_from > 0)
    {
        // TODO: 单报文查找逻辑
        n_left_from--;
    }

    return frame->n_vectors;
}
