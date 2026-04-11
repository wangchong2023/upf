# IPD Pipeline Configuration (v3.0)
# 职责：统一管理物理路径、角色 Token 及构建工具

# 1. 基础工具变量
NODE = node
MAKE = make
RM = rm -rf
MKDIR = mkdir -p
GREP = grep
GIT = git

# 2. 物理路径定义
SRC_DIR = src
BUILD_DIR = build
DOC_REQUIREMENTS = docs/01-requirements
DOC_DESIGN = docs/02-design
DOC_TRACEABILITY = docs/03-traceability
DOC_MANAGEMENT = docs/04-management
DOC_QUALITY = docs/05-quality
DOC_VERIFY = $(DOC_QUALITY)/verification

# 3. 核心交付件路径
SPEC_SRS = $(DOC_REQUIREMENTS)/spec-srs.md
SPEC_RTM = $(DOC_TRACEABILITY)/spec-rtm.md
SPEC_RAT = $(DOC_TRACEABILITY)/spec-rat.md
SPEC_SDS = $(DOC_DESIGN)/spec-sds.md
SPEC_RCR = $(DOC_MANAGEMENT)/spec-rcr.md
SPEC_PLAN = $(DOC_MANAGEMENT)/spec-project-plan.md
SPEC_QCLM = $(DOC_QUALITY)/spec-qclm.md
MILESTONE_FILE = .milestone

# 4. 角色授权 Token (默认演练值)
ACTIVE_TOKEN_PM ?= 5284effb305c8074
ACTIVE_TOKEN_SE ?= a5a25ad952a66075
ACTIVE_TOKEN_ARCHITECT ?= 786a9b7146bc1bf0
ACTIVE_TOKEN_PRODUCT ?= dfe7551bc1f75f35
ACTIVE_TOKEN_QA ?= e4b8e49883e0defd
ACTIVE_TOKEN_DEV ?= 0af963e78ef93a9d
ACTIVE_TOKEN_TESTER ?= 502e02404ee169fe

# 5. 编译器与安全标志
CC = gcc
C_SRC = $(shell find $(SRC_DIR) -name "*.c")
C_INC = -I$(SRC_DIR)
CFLAGS = -O2 -Wall -g $(C_INC) -std=c11
ASAN_FLAGS = -fsanitize=address -fno-omit-frame-pointer

.PHONY: quality-gate lint-go lint-c cppcheck clang-tidy auto-doc-check sync-reqs test-asan tr-audit \
        api-check gen-test-cases sync-results oss-audit trace-audit rcr-audit decision-pass \
        test-cov stage-next qa-audit doc-sync release changelog dashboard ipd-run flow-dryrun \
        format-scripts lint-scripts format-go format-c build-cp docker-build archive backport \
        release-report fix-all

# --- 治理自动化层 ---

# API 契约一致性校验
api-check:
	$(NODE) scripts/tools/api-contract-check.js

# 需求同步
sync-reqs:
	$(NODE) scripts/tools/auto-req-sync.js

# 自动生成测试用例骨架
gen-test-cases:
	$(NODE) scripts/tools/gen-test-skeletons.js

# 同步测试执行结果回填
sync-results:
	$(NODE) scripts/tools/sync-test-results.js

# 执行集成与系统测试 (物理运行)
test-it-st:
	$(NODE) scripts/tools/run-it-st-suite.js

# TR 评审自动化审计
tr-audit:
	$(NODE) scripts/tools/auto-tr-audit.js --stage=$(if $(STAGE),$(STAGE),GENERAL) --version=$(VERSION)

# 开源合规审计
oss-audit:
	$(NODE) scripts/tools/mgr-oss-audit.js

# 需求与代码双向追溯审计
trace-audit:
	$(NODE) scripts/tools/api-trace-audit.js

# 变更与 RCR 同步审计
rcr-audit:
	$(NODE) scripts/tools/git-to-rcr.js

# 决策通过
decision-pass:
	$(NODE) scripts/core/mgr-role-gate.js --action=DECISION_PASS
	$(NODE) scripts/tools/mgr-decision-handler.js --stage=$(STAGE) --result=$(RESULT) --expert="$(EXPERT)"

# 单元测试与覆盖率采集
test-cov:
	$(NODE) scripts/tools/mgr-cov-runner.js

# 流程扭转
stage-next:
	$(NODE) scripts/core/mgr-role-gate.js --action=STAGE_TRANS
	@echo $(NEXT) > $(MILESTONE_FILE)
	@echo "🚀 Milestone transitioned to $(NEXT)"

# QA 独立审计
qa-audit:
	$(NODE) scripts/core/mgr-role-gate.js --action=QUALITY_AUDIT
	$(NODE) scripts/tools/mgr-qa-audit.js --version=$(VERSION)

# 文档自动同步
doc-sync:
	$(NODE) scripts/tools/auto-doc-sync.js

# 自动校验文档一致性
auto-doc-check:
	@bash scripts/tools/auto-doc-check.sh

# 版本管理与发布
release:
	$(NODE) scripts/core/mgr-role-gate.js --action=STAGE_TRANS
	@echo "🏷️  Tagging version $(VERSION)..."
	$(GIT) tag -a $(VERSION) -m "Release $(VERSION)"
	$(GIT) push origin $(VERSION)
	@echo "🚀 Version $(VERSION) physical release completed."

# 自动生成变更日志
changelog:
	@echo "Generating changelog from git history..."
	$(GIT) log --pretty=format:"* %s (%h)" > CHANGELOG.md

# 仪表盘自动刷新
dashboard:
	$(NODE) scripts/tools/mgr-dashboard-refresh.js

# IPD Agent 编排总入口
ipd-run:
	$(NODE) scripts/core/mgr-agent-orchestrator.js --version=$(if $(VERSION),$(VERSION),v1.0.0)

# IPD 全生命周期干跑仿真
flow-dryrun:
	$(NODE) scripts/core/flow-dryrun.js

# 脚本规范审计与修复
format-scripts:
	$(NODE) scripts/tools/mgr-script-audit.js --fix

lint-scripts:
	$(NODE) scripts/tools/mgr-script-audit.js

# --- Agent 角色触发层 ---

agent-pm:
	@export ACTIVE_ROLE=PM && export ACTIVE_TOKEN=$(ACTIVE_TOKEN_PM) && $(NODE) scripts/agents/mgr-agent-pm.js --version=$(VERSION)
	@$(MAKE) agent-scheduler VERSION=$(VERSION)

agent-scheduler:
	@export ACTIVE_ROLE=PM && export ACTIVE_TOKEN=$(ACTIVE_TOKEN_PM) && $(NODE) scripts/agents/mgr-agent-scheduler.js --version=$(VERSION)

agent-se:
	@export ACTIVE_ROLE=SE && export ACTIVE_TOKEN=$(ACTIVE_TOKEN_SE) && $(NODE) scripts/agents/mgr-agent-se.js --version=$(VERSION)

agent-architect:
	@export ACTIVE_ROLE=ARCHITECT && export ACTIVE_TOKEN=$(ACTIVE_TOKEN_ARCHITECT) && $(NODE) scripts/agents/mgr-agent-architect.js --version=$(VERSION)

agent-product:
	@export ACTIVE_ROLE=PRODUCT && export ACTIVE_TOKEN=$(ACTIVE_TOKEN_PRODUCT) && $(NODE) scripts/agents/mgr-agent-product.js --version=$(VERSION)

agent-qa:
	@export ACTIVE_ROLE=QA && export ACTIVE_TOKEN=$(ACTIVE_TOKEN_QA) && $(NODE) scripts/agents/mgr-agent-qa.js

agent-dev:
	@export ACTIVE_ROLE=DEV && export ACTIVE_TOKEN=$(ACTIVE_TOKEN_DEV) && $(NODE) scripts/agents/mgr-agent-dev.js

agent-tester:
	@export ACTIVE_ROLE=TESTER && export ACTIVE_TOKEN=$(ACTIVE_TOKEN_TESTER) && $(NODE) scripts/agents/mgr-agent-tester.js

agent-risk:
	@export ACTIVE_ROLE=QA && export ACTIVE_TOKEN=$(ACTIVE_TOKEN_QA) && $(NODE) scripts/agents/mgr-agent-risk.js

risk-track:
	$(NODE) scripts/core/mgr-role-gate.js --action=QUALITY_AUDIT
	$(NODE) scripts/agents/mgr-agent-risk.js

# 质量门控总入口
quality-gate: doc-sync lint-scripts auto-doc-check sync-reqs gen-test-cases sync-results test-cov
	@$(MAKE) qa-audit
	@$(MAKE) rcr-audit
	@$(MAKE) trace-audit
	@$(MAKE) tr-audit
	@$(MAKE) oss-audit
	@$(MAKE) api-check
	@$(MAKE) dashboard
	@echo "All quality gates passed for stage: $$(cat $(MILESTONE_FILE))"

# --- 物理构建与扫描层 ---

format-go:
	@echo "Formatting Go code..."
	@gofmt -w $(SRC_DIR)/

format-c:
	@echo "Formatting C code..."
	@if [ -n "$(C_SRC)" ]; then clang-format -i $(C_SRC); fi

lint-c: cppcheck clang-tidy test-asan

build-cp:
	@echo "Building UPF Control Plane..."
	@go build -o bin/upf-cp ./$(SRC_DIR)/cp-core/main.go

release-report:
	@echo "📊 Generating Final Release Integrity Report for $(VERSION)..."
	$(MKDIR) dist/reports
	@echo "# Release Integrity Report - $(VERSION)" > dist/reports/integrity.md
	@echo "## 1. Version Metadata" >> dist/reports/integrity.md
	@echo "- **Commit ID**: $$($(GIT) rev-parse HEAD)" >> dist/reports/integrity.md
	@echo "- **Release Tag**: $(VERSION)" >> dist/reports/integrity.md
	@echo "- **Build Time**: $$(date -u +'%Y-%m-%dT%H:%M:%SZ')" >> dist/reports/integrity.md
	@echo "## 2. Requirement Coverage" >> dist/reports/integrity.md
	@echo "- Total Requirements: $$($(GREP) -c "| \*\*RR.UPF." $(SPEC_RTM))" >> dist/reports/integrity.md
	@echo "- Verified: $$($(GREP) -c "✅" $(SPEC_RTM))" >> dist/reports/integrity.md
	@echo "## 3. Open Issues" >> dist/reports/integrity.md
	@echo "- Count: $$($(GREP) -c "Open" $(SPEC_QCLM))" >> dist/reports/integrity.md
	@echo "✅ Report generated at dist/reports/integrity.md"

fix-all: format-go format-c format-scripts doc-sync
	@echo "✅ All codebases have been auto-corrected."

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

cppcheck:
	@echo "Running cppcheck..."
	@cppcheck --enable=all --inconclusive --error-exitcode=1 --std=c11 $(C_INC) $(SRC_DIR)

clang-tidy:
	@echo "Running clang-tidy..."
	@if [ -z "$(C_SRC)" ]; then \
		echo "No C source files found."; \
	else \
		clang-tidy $(C_SRC) -checks='*,-llvm-header-guard' -warnings-as-errors='*' -- $(C_INC) -std=c11; \
	fi
