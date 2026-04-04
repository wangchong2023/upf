#!/bin/bash

# 5G UPF 文档一致性深度校验脚本 (专家版 v2.0)
# 校验逻辑：结构化提取 -> 集合对比 -> 差异上报

GEMINI_FILE="GEMINI.md"
README_FILE="README.md"

echo "🔍 Starting Deep Documentation Consistency Audit..."

ERROR_COUNT=0

check_mismatch() {
    local key_term=$1
    local description=$2
    
    count_gemini=$(grep -c "$key_term" "$GEMINI_FILE")
    count_readme=$(grep -c "$key_term" "$README_FILE")
    
    if [ "$count_gemini" -gt 0 ] && [ "$count_readme" -eq 0 ]; then
        echo "❌ [MISMATCH] $description: '$key_term' found in $GEMINI_FILE but missing in $README_FILE"
        ((ERROR_COUNT++))
    fi
}

# 1. 深度校验研发里程碑中的核心活动
echo "--- Checking Milestone Activities ---"
check_mismatch "CDCP" "Decision Point: Concept"
check_mismatch "PDCP" "Decision Point: Plan"
check_mismatch "ADCP" "Decision Point: Availability"
check_mismatch "tr-audit" "Command: Technical Review Audit"
check_mismatch "SBOM" "Activity: SBOM Audit"
check_mismatch "TDD" "Practice: Test-Driven Development"
check_mismatch "DFMEA" "Practice: Reliability Analysis"

# 2. 深度校验核心规格文件命名
echo "--- Checking Specification File References ---"
for spec in "spec-srs.md" "spec-rtm.md" "spec-qclm.md" "spec-sds.md" "spec-rcr.md" "spec-coding-standards.md"; do
    check_mismatch "$spec" "Document Reference"
done

# 3. 校验工程规约
echo "--- Checking Engineering Standards ---"
check_mismatch "snake_case" "Coding Style"
check_mismatch "VPP" "Tech Stack: User Plane"

# 4. 结论输出
if [ "$ERROR_COUNT" -gt 0 ]; then
    echo ""
    echo "🚨 Audit Failed: $ERROR_COUNT consistency errors found."
    echo "Please ensure README.md matches the operational instructions in GEMINI.md."
    exit 1
else
    echo ""
    echo "✅ Audit Passed: All critical milestones, commands, and specs are synced."
    exit 0
fi
