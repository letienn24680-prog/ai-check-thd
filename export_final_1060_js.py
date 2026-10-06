# -*- coding: utf-8 -*-
"""
export_final_1060_js.py
Hợp nhất 60 câu gốc + 340 câu Học tập + 330 câu Đời sống + 330 câu AI
Thành 1.060 câu kiểm chứng hoàn chỉnh cho AI CHECK THĐ.
Ghi ra pages/practice-data.js
"""
import subprocess
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

# 1. Trích xuất 60 câu gốc từ git HEAD
res = subprocess.run(['git', 'show', 'HEAD:pages/practice-data.js'], capture_output=True, text=True, encoding='utf-8')
content = res.stdout

pattern = r'\{\s*group:\s*"([^"]+)",\s*topic:\s*"([^"]+)",\s*title:\s*"([^"]+)",\s*quote:\s*"([^"]+)",\s*task:\s*"([^"]+)",\s*source:\s*"([^"]+)",\s*verdict:\s*"([^"]+)",\s*explain:\s*"([^"]+)"\s*\}'
matches = re.findall(pattern, content)
assert len(matches) == 60, f"Expected 60 base scenarios, got {len(matches)}"

base_study = []
base_life = []
base_ai = []

for m in matches:
    item = {
        "group": m[0],
        "topic": m[1],
        "title": m[2],
        "quote": m[3],
        "task": m[4],
        "source": m[5],
        "verdict": m[6],
        "explain": m[7]
    }
    if m[0] == "Học tập":
        base_study.append(item)
    elif m[0] == "Đời sống":
        base_life.append(item)
    elif m[0] == "AI":
        base_ai.append(item)

print(f"Base items: Study={len(base_study)}, Life={len(base_life)}, AI={len(base_ai)}")

# 2. Đọc 3 file JSON
with open("study_340.json", "r", encoding="utf-8") as f:
    study_340 = json.load(f)

with open("life_330.json", "r", encoding="utf-8") as f:
    life_330 = json.load(f)

with open("ai_330.json", "r", encoding="utf-8") as f:
    ai_330 = json.load(f)

# 3. Kết hợp theo từng nhóm
full_study = base_study + study_340  # 360 câu
full_life = base_life + life_330    # 350 câu
full_ai = base_ai + ai_330        # 350 câu

all_1060 = full_study + full_life + full_ai
print(f"Total combined: {len(all_1060)} (Study: {len(full_study)}, Life: {len(full_life)}, AI: {len(full_ai)})")
assert len(all_1060) == 1060, f"Expected 1060, got {len(all_1060)}"

# 4. Kiểm tra tính hợp lệ và trùng lặp
seen_titles = {}
for idx, item in enumerate(all_1060):
    t = item["title"]
    if t in seen_titles:
        print(f"Notice: Duplicate title '{t}' at #{idx} and #{seen_titles[t]}")
    seen_titles[t] = idx

print(f"Unique titles count: {len(seen_titles)} / 1060")

# Thống kê phán đoán toàn bộ 1.060 câu
verdicts = {}
for item in all_1060:
    v = item["verdict"]
    verdicts[v] = verdicts.get(v, 0) + 1

print("Toàn bộ phân bố phán đoán 1.060 câu:")
for k, v in sorted(verdicts.items(), key=lambda x: -x[1]):
    print(f"  - {k}: {v} ({v*100/len(all_1060):.1f}%)")

# 5. Xuất file pages/practice-data.js
js_lines = [
    "// ==========================================================================",
    "// AI CHECK THD - KHO DỮ LIỆU 1.060 TÌNH HUỐNG KIỂM CHỨNG TOÀN DIỆN",
    "// Tổng cộng: 1.060 tình huống (Học tập: 360, Đời sống: 350, AI: 350)",
    "// Chuẩn hóa 4 phán đoán: Đúng | Sai | Chưa đủ căn cứ | Cần kiểm chứng thêm",
    "// Mỗi lượt thực hành làm 10 câu, tự động xáo đề và không bị trùng lặp",
    "// ==========================================================================",
    "window.AICheckScenarios = ["
]

for idx, item in enumerate(all_1060):
    item_json = json.dumps(item, ensure_ascii=False)
    comma = "," if idx < len(all_1060) - 1 else ""
    js_lines.append(f"  {item_json}{comma}")

js_lines.append("];")
js_lines.append("")

with open("pages/practice-data.js", "w", encoding="utf-8") as f:
    f.write("\n".join(js_lines))

print("Successfully written pages/practice-data.js (1.060 scenarios)!")

