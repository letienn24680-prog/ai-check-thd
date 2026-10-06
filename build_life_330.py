# -*- coding: utf-8 -*-
"""
build_life_330.py
Tổng hợp 330 tình huống đời sống chuẩn mực, sắc bén, không lặp tiêu đề.
- Sức khỏe: 60
- Dinh dưỡng: 55
- Môi trường: 55
- Công nghệ: 55
- An ninh mạng: 55
- Pháp luật & Xã hội: 50
Total: 330
"""
import sys
import json
sys.stdout.reconfigure(encoding='utf-8')

from life_part1 import health, nutrition, environment
from life_part2 import tech_devices, cybersecurity, law_society

life_all = []

def add_batch(topic, items):
    for it in items:
        life_all.append({
            "group": "Đời sống",
            "topic": topic,
            "title": it[0],
            "quote": it[1],
            "task": it[2],
            "source": it[3],
            "verdict": it[4],
            "explain": it[5]
        })

add_batch("Sức khỏe & Y tế", health)
add_batch("Dinh dưỡng & Ẩm thực", nutrition)
add_batch("Môi trường & Khí hậu", environment)
add_batch("Công nghệ & Thiết bị", tech_devices)
add_batch("An ninh mạng & Lừa đảo", cybersecurity)
add_batch("Pháp luật & Xã hội", law_society)

print(f"Total life scenarios loaded: {len(life_all)}")
assert len(life_all) == 330, f"Expected 330, got {len(life_all)}"

# Kiểm tra trùng lặp tiêu đề
titles = set()
for s in life_all:
    if s["title"] in titles:
        print(f"DUPLICATE TITLE IN LIFE: {s['title']}")
    titles.add(s["title"])

print(f"Unique titles in Life: {len(titles)} / {len(life_all)}")

# Thống kê phán đoán
verdicts = {}
for s in life_all:
    v = s["verdict"]
    verdicts[v] = verdicts.get(v, 0) + 1

print("Life verdicts distribution:", verdicts)

with open("life_330.json", "w", encoding="utf-8") as f:
    json.dump(life_all, f, ensure_ascii=False, indent=2)

print("Saved life_330.json successfully!")

