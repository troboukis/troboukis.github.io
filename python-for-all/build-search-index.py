#!/usr/bin/env python3
"""Generate search-index.json from all English chapter HTML files."""

import html as html_module
import json
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))


def strip_tags(h):
    h = re.sub(r"<script[^>]*>.*?</script>", " ", h, flags=re.DOTALL)
    h = re.sub(r"<style[^>]*>.*?</style>", " ", h, flags=re.DOTALL)
    h = re.sub(r"<[^>]+>", " ", h)
    h = html_module.unescape(h)
    return re.sub(r"\s+", " ", h).strip()


def parse_toc(index_path):
    with open(index_path, encoding="utf-8") as f:
        content = f.read()

    result = []
    for details_html in re.findall(
        r'<details class="toc-book"[^>]*>(.*?)</details>', content, re.DOTALL
    ):
        summary = re.search(r"<summary[^>]*>(.*?)</summary>", details_html, re.DOTALL)
        if not summary:
            continue
        book_title = strip_tags(summary.group(1))
        for href, chapter_link_html in re.findall(
            r'<a href="([^"]+)">(.*?)</a>', details_html
        ):
            result.append(
                {
                    "book": book_title,
                    "href": href,
                    "chapter": strip_tags(chapter_link_html),
                }
            )
    return result


def parse_sections(chapter_path):
    with open(chapter_path, encoding="utf-8") as f:
        content = f.read()

    main_m = re.search(r"<main>(.*?)</main>", content, re.DOTALL)
    if not main_m:
        return []

    sections = []
    for m in re.finditer(
        r'<section id="(part\d+)"[^>]*>(.*?)</section>', main_m.group(1), re.DOTALL
    ):
        part_id = m.group(1)
        section_html = m.group(2)

        label_m = re.search(
            r'<p class="section-label"[^>]*>(.*?)</p>', section_html, re.DOTALL
        )
        label = strip_tags(label_m.group(1)) if label_m else ""

        h2_m = re.search(r"<h2>(.*?)</h2>", section_html, re.DOTALL)
        title = strip_tags(h2_m.group(1)) if h2_m else ""

        text = strip_tags(section_html).lower()

        sections.append({"id": part_id, "label": label, "title": title, "text": text})

    return sections


def build_index():
    toc = parse_toc(os.path.join(ROOT, "index.html"))
    entries = []
    for item in toc:
        chapter_path = os.path.join(ROOT, item["href"])
        if not os.path.exists(chapter_path):
            print(f"Warning: {chapter_path} not found")
            continue
        for section in parse_sections(chapter_path):
            entries.append(
                {
                    "url": item["href"] + "#" + section["id"],
                    "book": item["book"],
                    "chapter": item["chapter"],
                    "partLabel": section["label"],
                    "partTitle": section["title"],
                    "text": section["text"],
                }
            )
    return entries


if __name__ == "__main__":
    entries = build_index()
    out_path = os.path.join(ROOT, "search-index.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(entries, f, ensure_ascii=False, indent=2)
    print(f"Built {len(entries)} entries → {out_path}")
