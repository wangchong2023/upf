#ifndef PDR_MATCH_H
#define PDR_MATCH_H

#include <stdint.h>

/* 
 * 遵循 snake_case 命名与华为安全规约 
 * 数据模型定义：PDR 匹配核心键值 
 */
typedef struct
{
    uint32_t teid;
    uint32_t ue_ipv4;
    uint8_t  protocol;
    uint16_t dest_port;
} pdr_match_key_t;

/* DfT: 核心转发 Node 统计累加器定义 */
typedef enum
{
    PDR_LOOKUP_NEXT_DROP,
    PDR_LOOKUP_NEXT_FORWARD,
    PDR_LOOKUP_N_NEXT,
} pdr_lookup_next_t;

typedef struct
{
    uint64_t packets_matched;
    uint64_t packets_dropped;
    uint64_t hash_collisions;
} pdr_lookup_stats_t;

#endif
