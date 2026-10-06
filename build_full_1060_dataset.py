# -*- coding: utf-8 -*-
"""
build_full_1060_dataset.py
Tạo 1,060 tình huống kiểm chứng AI chuẩn xác, hỏi đúng trọng tâm,
bao gồm 60 câu gốc + 1,000 câu mới trải đều 3 nhóm: Học tập, Đời sống, AI.
"""

import sys
import re
import json
import io

sys.stdout.reconfigure(encoding='utf-8')
import gen_study
import gen_life
import gen_ai

print("Building 1,060 high-quality scenarios for AI CHECK THD...")

# 1. Read existing 60 base scenarios from pages/practice-data.js
with open("pages/practice-data.js", "r", encoding="utf-8") as f:
    original_code = f.read()

pattern = r'\{\s*group:\s*"([^"]+)",\s*topic:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*quote:\s*"([^"]+)",\s*task:\s*"([^"]+)",\s*source:\s*"([^"]+)",\s*verdict:\s*"([^"]+)",\s*explain:\s*"([^"]+)"\s*\}'
matches = re.findall(pattern, original_code)
print(f"Found {len(matches)} existing base scenarios in practice-data.js")

base_scenarios = []
for m in matches:
    base_scenarios.append({
        "group": m[0],
        "topic": m[1],
        "title": m[2],
        "quote": m[3],
        "task": m[4],
        "source": m[5],
        "verdict": m[6],
        "explain": m[7]
    })

study_scenarios = gen_study.STUDY_SCENARIOS
life_scenarios = gen_life.LIFE_SCENARIOS
ai_scenarios = gen_ai.AI_SCENARIOS

print(f"Study scenarios: {len(study_scenarios)}")
print(f"Life scenarios: {len(life_scenarios)}")
print(f"AI scenarios: {len(ai_scenarios)}")

# Combine all:
# Group 1: Học tập (20 base + 340 new = 360)
# Group 2: Đời sống (20 base + 330 new = 350)
# Group 3: AI (20 base + 330 new = 350)
base_study = [s for s in base_scenarios if s["group"] == "Học tập"]
base_life = [s for s in base_scenarios if s["group"] == "Đời sống"]
base_ai = [s for s in base_scenarios if s["group"] == "AI"]

all_scenarios = base_study + study_scenarios + base_life + life_scenarios + base_ai + ai_scenarios
print(f"Total scenarios combined: {len(all_scenarios)}")

# Validate each scenario has required fields and proper verdict
valid_verdicts = {"Đúng", "Sai", "Chưa đủ căn cứ", "Cần kiểm chứng thêm"}
verdict_counts = {}
for idx, s in enumerate(all_scenarios):
    assert s["group"] in ["Học tập", "Đời sống", "AI"], f"Invalid group at {idx}: {s['group']}"
    assert s["verdict"] in valid_verdicts, f"Invalid verdict at {idx}: {s['verdict']}"
    verdict_counts[s["verdict"]] = verdict_counts.get(s["verdict"], 0) + 1
    assert len(s["title"]) > 0
    assert len(s["quote"]) > 0
    assert len(s["task"]) > 0
    assert len(s["source"]) > 0
    assert len(s["explain"]) > 0

print("Verdict distribution:", verdict_counts)

# Generate formatted javascript file
js_lines = [
    "// ==========================================================================",
    "// AI CHECK THD - KHO DỮ LIỆU 1.060 TÌNH HUỐNG KIỂM CHỨNG TOÀN DIỆN",
    "// Tổng cộng: 1.060 tình huống (Học tập: 360, Đời sống: 350, AI: 350)",
    "// Chuẩn hóa 4 phán đoán: Đúng | Sai | Chưa đủ căn cứ | Cần kiểm chứng thêm",
    "// ==========================================================================",
    "window.AICheckScenarios = ["
]

for idx, s in enumerate(all_scenarios):
    # Escape quotes and backslashes properly in JSON style
    item_str = json.dumps(s, ensure_ascii=False)
    # Convert JSON keys to JS object format: {"group": ...} -> { group: ... }
    # Or keeping valid JSON-like object notation
    js_lines.append(f"  {item_str}" + ("," if idx < len(all_scenarios) - 1 else ""))

js_lines.append("];")
js_lines.append("")

output_file = "pages/practice-data.js"
with open(output_file, "w", encoding="utf-8") as f:
    f.write("\n".join(js_lines))

print(f"Successfully generated {output_file} with {len(all_scenarios)} scenarios!")
