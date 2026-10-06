# -*- coding: utf-8 -*-
"""
build_ai_330.py
Tổng hợp 330 tình huống AI chuẩn mực, câu hỏi sắc bén, không trùng lặp tiêu đề.
- Ảo giác AI: 60
- Giới hạn LLM: 55
- Deepfake: 55
- Liêm chính học thuật: 55
- Định kiến & Thiên vị: 50
- Kỹ năng Prompt & Bảo mật: 55
Total: 330
"""
import sys
import json
sys.stdout.reconfigure(encoding='utf-8')

from ai_part1 import hallucination, llm_limits, deepfake
from ai_part2 import ethics_academic, bias_fairness, prompt_security

ai_all = []

def add_batch(topic, items):
    for it in items:
        ai_all.append({
            "group": "AI",
            "topic": topic,
            "title": it[0],
            "quote": it[1],
            "task": it[2],
            "source": it[3],
            "verdict": it[4],
            "explain": it[5]
        })

add_batch("Ảo giác AI", hallucination)
add_batch("Giới hạn LLM", llm_limits)
add_batch("Deepfake & Giả mạo", deepfake)
add_batch("Liêm chính học thuật & Đạo đức AI", ethics_academic)
add_batch("Định kiến & Thiên vị dữ liệu", bias_fairness)
add_batch("Kỹ năng Prompt & Bảo mật", prompt_security)

print(f"Total AI scenarios loaded: {len(ai_all)}")
assert len(ai_all) == 330, f"Expected 330, got {len(ai_all)}"

# Kiểm tra trùng lặp tiêu đề
titles = set()
for s in ai_all:
    if s["title"] in titles:
        print(f"DUPLICATE TITLE IN AI: {s['title']}")
    titles.add(s["title"])

print(f"Unique titles in AI: {len(titles)} / {len(ai_all)}")

# Thống kê phán đoán
verdicts = {}
for s in ai_all:
    v = s["verdict"]
    verdicts[v] = verdicts.get(v, 0) + 1

print("AI verdicts distribution:", verdicts)

with open("ai_330.json", "w", encoding="utf-8") as f:
    json.dump(ai_all, f, ensure_ascii=False, indent=2)

print("Saved ai_330.json successfully!")

