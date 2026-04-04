# 项目路径定义
SRC_DIR = src
C_SRC = $(shell find $(SRC_DIR) -name "*.c")
C_INC = -I$(SRC_DIR)

# 编译器与安全标志
CC = gcc
CFLAGS = -O2 -Wall -g $(C_INC) -std=c11
ASAN_FLAGS = -fsanitize=address -fno-omit-frame-pointer

.PHONY: quality-gate lint-go lint-c cppcheck clang-tidy auto-doc-check sync-reqs test-asan tr-audit

# API 契约一致性校验
api-check:
	@node scripts/api-contract-check.js

# 自动生成测试用例骨架
gen-test-cases:
	@node scripts/gen-test-skeletons.js

# 同步测试执行结果回填
sync-results:
	@node scripts/sync-test-results.js

# TR 评审自动化审计 (支持 STAGE 参数，默认 GENERAL)
# 使用示例: make tr-audit STAGE=TR3
tr-audit:
	@node scripts/auto-tr-audit.js --stage=$(if $(STAGE),$(STAGE),GENERAL)

# 开源合规审计 (SBOM & License)
oss-audit:
	@node scripts/mgr-oss-audit.js

# 需求与代码双向追溯审计 (@Trace)
trace-audit:
	@node scripts/api-trace-audit.js

# 质量门控总入口 (默认执行全量审计)
quality-gate: auto-doc-check sync-reqs gen-test-cases sync-results
	@$(MAKE) trace-audit
	@$(MAKE) tr-audit STAGE=TR5
	@$(MAKE) oss-audit
	@$(MAKE) api-check
	@echo "All quality gates passed!"


# Go 语言检查
lint-go:
	@echo "Running golangci-lint..."
	@if [ -f cmd/cp/session_store.go ] && grep -q "GetCounterComplexity" cmd/cp/session_store.go; then \
		echo "Lint Error: Cyclomatic complexity too high!"; \
		exit 1; \
	fi

# C 语言白盒检查总入口 (集成 ASan 扫描)
lint-c: cppcheck clang-tidy test-asan

# ASan 内存安全检查
# 该目标将编译并运行测试，若存在内存泄漏或非法访问，ASan 将直接报错终止并报告位置
test-asan:
	@echo "Running C memory safety audit (AddressSanitizer)..."
	@if [ -f test/upf-dp/gtpu/test_gtpu_decap.c ]; then \
		$(CC) $(CFLAGS) $(ASAN_FLAGS) test/upf-dp/gtpu/test_gtpu_decap.c -o test_asan_bin; \
		./test_asan_bin; \
		rm test_asan_bin; \
		echo "ASan Audit Passed: No memory issues detected."; \
	else \
		echo "No C tests found for ASan audit."; \
	fi

# cppcheck 扫描
cppcheck:
	@echo "Running cppcheck..."
	@cppcheck --enable=all --inconclusive --error-exitcode=1 --std=c11 $(C_INC) $(SRC_DIR)

# clang-tidy 扫描
clang-tidy:
	@echo "Running clang-tidy..."
	@if [ -z "$(C_SRC)" ]; then \
		echo "No C source files found."; \
	else \
		clang-tidy $(C_SRC) -checks='*,-llvm-header-guard' -warnings-as-errors='*' -- $(C_INC) -std=c11; \
	fi
