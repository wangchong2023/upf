# IPD Pipeline Configuration (v3.6)
# 职责：统一管理物理路径、角色 Token、构建工具及全案修订审计

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
SPEC_MASTER = $(DOC_DESIGN)/SYSTEM_DESIGN_SPEC.md
SPEC_RCR = $(DOC_MANAGEMENT)/spec-rcr.md
SPEC_PLAN = $(DOC_MANAGEMENT)/spec-project-plan.md
SPEC_QCLM = $(DOC_QUALITY)/spec-qclm.md
MILESTONE_FILE = .milestone

# 4. 角色授权 Token
ACTIVE_TOKEN_PM ?= 5284effb305c8074
ACTIVE_TOKEN_SE ?= a5a25ad952a66075
ACTIVE_TOKEN_ARCHITECT ?= 786a9b7146bc1bf0
ACTIVE_TOKEN_PRODUCT ?= dfe7551bc1f75f35
ACTIVE_TOKEN_QA ?= e4b8e49883e0defd
ACTIVE_TOKEN_DEV ?= 0af963e78ef93a9d
ACTIVE_TOKEN_TESTER ?= 502e02404ee169fe

# 5. 编译器标志
CC = gcc
C_INC = -I$(SRC_DIR)
CFLAGS = -O2 -Wall -g $(C_INC) -std=c11
ASAN_FLAGS = -fsanitize=address -fno-omit-frame-pointer

.PHONY: quality-gate lint-go lint-c cppcheck clang-tidy auto-doc-check sync-reqs test-asan tr-audit \
        api-check gen-test-cases sync-results oss-audit cbb-audit cbb-catalog refactor-audit \
        trace-audit rcr-audit decision-pass test-cov doc-audit qa-audit doc-sync release \
        changelog dashboard ipd-run flow-dryrun format-scripts test-it-st fix-all lint-scripts

# --- 治理自动化层 ---

api-check:
	$(NODE) scripts/tools/api-contract-check.js

sync-reqs:
	$(NODE) scripts/tools/auto-req-sync.js

gen-test-cases:
	$(NODE) scripts/tools/gen-test-skeletons.js

sync-results:
	$(NODE) scripts/tools/sync-test-results.js

test-it-st:
	$(NODE) scripts/tools/run-it-st-suite.js

tr-audit:
	$(NODE) scripts/tools/auto-tr-audit.js --stage=$(if $(STAGE),$(STAGE),GENERAL) --version=$(VERSION)

oss-audit:
	$(NODE) scripts/tools/mgr-oss-audit.js

cbb-audit:
	$(NODE) scripts/tools/mgr-cbb-audit.js

cbb-catalog:
	$(NODE) scripts/tools/auto-cbb-catalog.js

refactor-audit:
	$(NODE) scripts/tools/mgr-refactor-audit.js

trace-audit:
	$(NODE) scripts/tools/api-trace-audit.js

rcr-audit:
	$(NODE) scripts/tools/git-to-rcr.js

doc-audit:
	$(NODE) scripts/tools/mgr-doc-audit.js

qa-audit:
	$(NODE) scripts/core/mgr-role-gate.js --action=QUALITY_AUDIT
	$(NODE) scripts/tools/mgr-qa-audit.js --version=$(VERSION)

doc-sync: cbb-catalog
	$(NODE) scripts/tools/auto-doc-sync.js

auto-doc-check:
	@bash scripts/tools/auto-doc-check.sh

flow-dryrun:
	$(NODE) scripts/core/flow-dryrun.js

format-scripts:
	$(NODE) scripts/tools/mgr-script-audit.js --fix

lint-scripts:
	$(NODE) scripts/tools/mgr-script-audit.js

# --- Agent 触发层 ---

agent-pm:
	@export ACTIVE_ROLE=PM && export ACTIVE_TOKEN=$(ACTIVE_TOKEN_PM) && $(NODE) scripts/agents/mgr-agent-pm.js
	@$(MAKE) agent-scheduler

agent-scheduler:
	@export ACTIVE_ROLE=PM && $(NODE) scripts/agents/mgr-agent-scheduler.js

agent-se:
	@export ACTIVE_ROLE=SE && export ACTIVE_TOKEN=$(ACTIVE_TOKEN_SE) && $(NODE) scripts/agents/mgr-agent-se.js

agent-architect:
	@export ACTIVE_ROLE=ARCHITECT && export ACTIVE_TOKEN=$(ACTIVE_TOKEN_ARCHITECT) && $(NODE) scripts/agents/mgr-agent-architect.js

agent-product:
	@export ACTIVE_ROLE=PRODUCT && export ACTIVE_TOKEN=$(ACTIVE_TOKEN_PRODUCT) && $(NODE) scripts/agents/mgr-agent-product.js

agent-qa:
	@export ACTIVE_ROLE=QA && export ACTIVE_TOKEN=$(ACTIVE_TOKEN_QA) && $(NODE) scripts/agents/mgr-agent-qa.js

agent-dev:
	@export ACTIVE_ROLE=DEV && export ACTIVE_TOKEN=$(ACTIVE_TOKEN_DEV) && $(NODE) scripts/agents/mgr-agent-dev.js

agent-tester:
	@export ACTIVE_ROLE=TESTER && export ACTIVE_TOKEN=$(ACTIVE_TOKEN_TESTER) && $(NODE) scripts/agents/mgr-agent-tester.js

# 质量门控
quality-gate: doc-sync lint-scripts
	$(NODE) scripts/tools/mgr-change-integrity.js
	@$(MAKE) auto-doc-check sync-reqs gen-test-cases sync-results test-cov cbb-audit refactor-audit doc-audit
	@$(MAKE) qa-audit
	@echo "All quality gates passed for stage: $$(cat $(MILESTONE_FILE))"

# 物理纠偏
fix-all: format-go format-c format-scripts doc-sync
	@echo "✅ All codebases have been auto-corrected."

format-go:
	@gofmt -w $(SRC_DIR)/

format-c:
	@if [ -n "$$(shell find $(SRC_DIR) -name "*.c")" ]; then clang-format -i $$(shell find $(SRC_DIR) -name "*.c"); fi

test-cov:
	$(NODE) scripts/tools/mgr-cov-runner.js
