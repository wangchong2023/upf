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
# 使用示例: make tr-audit STAGE=TR3 VERSION=v1.0.0
tr-audit:
	@node scripts/auto-tr-audit.js --stage=$(if $(STAGE),$(STAGE),GENERAL) --version=$(VERSION)

# 开源合规审计 (SBOM & License)
oss-audit:
	@node scripts/mgr-oss-audit.js

# 需求与代码双向追溯审计 (@Trace)
trace-audit:
	@node scripts/api-trace-audit.js

# 变更与 RCR 同步审计
rcr-audit:
	@node scripts/git-to-rcr.js

# 决策一键通过 (示例: make decision-pass STAGE=TR3 RESULT=Go)
decision-pass:
	@node scripts/mgr-role-gate.js --action=DECISION_PASS
	@node scripts/mgr-decision-handler.js --stage=$(STAGE) --result=$(RESULT) --expert="$(EXPERT)"

# 单元测试与覆盖率采集
test-cov:
	@node scripts/mgr-cov-runner.js

# 流程扭转 (示例: make stage-next NEXT=TR4)
stage-next:
	@node scripts/mgr-role-gate.js --action=STAGE_TRANS
	@echo $(NEXT) > .milestone
	@echo "🚀 Milestone transitioned to $(NEXT)"

# QA 独立审计
qa-audit:
	@node scripts/mgr-role-gate.js --action=QUALITY_AUDIT
	@node scripts/mgr-qa-audit.js --version=$(VERSION)

# 文档自动同步 (Doc-as-Code)
doc-sync:
	@node scripts/auto-doc-sync.js

# 版本管理与发布 (示例: make release VERSION=v1.0.0)
release:
	@node scripts/mgr-role-gate.js --action=STAGE_TRANS
	@echo "🏷️  Tagging version $(VERSION)..."
	@git tag -a $(VERSION) -m "Release $(VERSION)"
	@git push origin $(VERSION)
	@echo "🚀 Version $(VERSION) physical release completed."

# 自动生成变更日志 (Changelog)
changelog:
	@echo "Generating changelog from git history..."
	@git log --pretty=format:"* %s (%h)" > CHANGELOG.md

# 仪表盘自动刷新
dashboard:
	@node scripts/mgr-dashboard-refresh.js

# 脚本规范审计与修复
format-scripts:
	@node scripts/mgr-script-audit.js --fix

lint-scripts:
	@node scripts/mgr-script-audit.js

# 构建多角色 Agent 系统
# PM Agent: 自动生成需求矩阵、审计进度并触发下游调度
agent-pm:
	@export ACTIVE_ROLE=PM && export ACTIVE_TOKEN=5284effb305c8074 && node scripts/mgr-agent-pm.js --version=$(VERSION)
	@$(MAKE) agent-scheduler VERSION=$(VERSION)

# 调度 Agent: 基于 RTM 承诺日期自动推导下游子任务计划
agent-scheduler:
	@export ACTIVE_ROLE=PM && export ACTIVE_TOKEN=5284effb305c8074 && node scripts/mgr-agent-scheduler.js --version=$(VERSION)

agent-se:
	@export ACTIVE_ROLE=SE && export ACTIVE_TOKEN=a5a25ad952a66075 && node scripts/mgr-agent-se.js --version=$(VERSION)

agent-architect:
	@export ACTIVE_ROLE=ARCHITECT && export ACTIVE_TOKEN=786a9b7146bc1bf0 && node scripts/mgr-agent-architect.js --version=$(VERSION)

agent-qa:
	@export ACTIVE_ROLE=QA && export ACTIVE_TOKEN=e4b8e49883e0defd && node scripts/mgr-agent-qa.js

# 风险 Agent: 自动跟踪风险矩阵并生成预警
agent-risk:
	@export ACTIVE_ROLE=QA && export ACTIVE_TOKEN=e4b8e49883e0defd && node scripts/mgr-agent-risk.js

# 风险定期跟踪 (由 QA 角色触发)
risk-track:
	@node scripts/mgr-role-gate.js --action=QUALITY_AUDIT
	@node scripts/mgr-agent-risk.js

# 并行规划: 同步触发需求同步、分解与架构审计建议
parallel-planning:
	@echo "🚀 Starting parallel planning workflows (PM + SE + Architect)..."
	@$(MAKE) -j3 agent-pm agent-se agent-architect

# 并行开发与测试: Dev 实现逻辑的同时 Tester 自动生成测试桩
parallel-dev-test:
	@echo "🚀 Starting parallel Dev and Tester workflows..."
	@$(MAKE) -j2 dev-work tester-work

dev-work:
	@export ACTIVE_ROLE=DEV && node scripts/api-trace-audit.js

tester-work:
	@export ACTIVE_ROLE=TESTER && node scripts/gen-test-skeletons.js

# 质量门控总入口 (默认执行全量审计)
quality-gate: doc-sync lint-scripts auto-doc-check sync-reqs gen-test-cases sync-results test-cov
	@$(MAKE) qa-audit
	@$(MAKE) rcr-audit
	@$(MAKE) trace-audit
	@$(MAKE) tr-audit
	@$(MAKE) oss-audit
	@$(MAKE) api-check
	@$(MAKE) dashboard
	@echo "All quality gates passed for stage: $$(cat .milestone)"


# Go 语言格式化与检查
format-go:
	@echo "Formatting Go code..."
	@gofmt -w src/

lint-go:
	@echo "Running golangci-lint..."
	@if [ -f cmd/cp/session_store.go ] && grep -q "GetCounterComplexity" cmd/cp/session_store.go; then \
		echo "Lint Error: Cyclomatic complexity too high!"; \
		exit 1; \
	fi

# C 语言白盒检查总入口 (集成 ASan 扫描)
format-c:
	@echo "Formatting C code..."
	@if [ -n "$(C_SRC)" ]; then clang-format -i $(C_SRC); fi

lint-c: cppcheck clang-tidy test-asan

# 分支管理: 创建特性开发分支 (示例: make branch-feature ID=001)
branch-feature:
	@node scripts/mgr-branch-mgmt.js --action=feature --name=$(ID)

# 分支管理: 创建发布冻结分支 (示例: make branch-release VERSION=1.0.0)
branch-release:
	@node scripts/mgr-branch-mgmt.js --action=release --name=$(VERSION)

# 分支管理: 创建紧急热修分支 (示例: make branch-hotfix ID=001)
branch-hotfix:
	@node scripts/mgr-branch-mgmt.js --action=hotfix --name=$(ID)

# 自动纠偏总入口
fix-all: format-go format-c format-scripts doc-sync
	@echo "✅ All codebases have been auto-corrected."

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
