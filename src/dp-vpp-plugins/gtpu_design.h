#ifndef GTPU_DESIGN_H
#define GTPU_DESIGN_H

/* 
 * IS.GTPU.001 修复方案 A: 增加 Hash 桶数量
 * 将默认桶数量从 64k 提升至 128k，以降低百万会话下的冲突率
 */
#define GTPU_HASH_BUCKETS_COUNT (128 * 1024)

#endif
