# -*- coding: utf-8 -*-
"""
build_study_340.py
Tổng hợp 340 tình huống học tập chuẩn xác 100%, không lặp title, hỏi đúng trọng tâm.
"""
import sys
import json
sys.stdout.reconfigure(encoding='utf-8')

from build_study_dataset import math_items
from make_study_scenarios import physics
from study_part2 import chemistry, biology
from study_part3 import history, geography, literature_english

study_all = []

def add_batch(topic, items):
    for it in items:
        study_all.append({
            "group": "Học tập",
            "topic": topic,
            "title": it[0],
            "quote": it[1],
            "task": it[2],
            "source": it[3],
            "verdict": it[4],
            "explain": it[5]
        })

add_batch("Toán học", math_items)
add_batch("Vật lý", physics)
add_batch("Hóa học", chemistry)
add_batch("Sinh học", biology)
add_batch("Lịch sử", history)
add_batch("Địa lý", geography)
add_batch("Ngữ văn & Tiếng Anh", literature_english)

print(f"Total study scenarios loaded: {len(study_all)}")
assert len(study_all) == 340, f"Expected 340, got {len(study_all)}"

# Kiểm tra trùng lặp tiêu đề
titles = set()
for s in study_all:
    if s["title"] in titles:
        print(f"DUPLICATE TITLE DETECTED: {s['title']}")
    titles.add(s["title"])

print(f"Unique titles: {len(titles)} / {len(study_all)}")

# Thống kê phán đoán
verdicts = {}
for s in study_all:
    v = s["verdict"]
    verdicts[v] = verdicts.get(v, 0) + 1

print("Study verdicts distribution:", verdicts)

with open("study_340.json", "w", encoding="utf-8") as f:
    json.dump(study_all, f, ensure_ascii=False, indent=2)

print("Saved study_340.json successfully!")

