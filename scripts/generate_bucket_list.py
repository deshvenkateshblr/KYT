#!/usr/bin/env python3
"""
generate_bucket_list.py — KYT Admin Tool
=========================================
Reads bucket list entries from bucket_list_source.json and generates
data/bucket-list.js for the KYT web app.

Usage:
    python scripts/generate_bucket_list.py

Input:  scripts/bucket_list_source.json
Output: data/bucket-list.js

Run this script whenever you add or update bucket list destinations.
The output file is committed to the repository and served as a static asset.
"""

import json
import os
import re
from datetime import datetime, timezone

SCRIPT_DIR  = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR    = os.path.dirname(SCRIPT_DIR)
SOURCE_FILE = os.path.join(SCRIPT_DIR, "bucket_list_source.json")
OUTPUT_FILE = os.path.join(ROOT_DIR, "data", "bucket-list.js")

VALID_CATEGORIES = {"Spiritual", "Adventure", "Culinary", "Cultural"}

REQUIRED_FIELDS  = {"id", "destination", "category", "mapsUrl", "youtubeQuery"}
OPTIONAL_FIELDS  = {"tagline", "coverImage", "attractions", "notes"}

HEADER = """\
/**
 * bucket-list.js — KYT Bucket List Database
 *
 * THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY.
 * Source: scripts/bucket_list_source.json
 * Generator: scripts/generate_bucket_list.py
 * Generated at: {generated_at}
 *
 * To update: edit bucket_list_source.json, then run:
 *   python scripts/generate_bucket_list.py
 */

"""

def validate_entry(entry, index):
    missing = REQUIRED_FIELDS - entry.keys()
    if missing:
        raise ValueError(f"Entry {index} missing required fields: {missing}")
    if entry["category"] not in VALID_CATEGORIES:
        raise ValueError(f"Entry {index} has invalid category '{entry['category']}'. Must be one of {VALID_CATEGORIES}")
    # Slugify check
    if not re.match(r'^[a-z0-9-]+$', entry["id"]):
        raise ValueError(f"Entry {index} id '{entry['id']}' must be lowercase alphanumeric with hyphens only")

def build_entry(raw):
    return {
        "id":           raw["id"],
        "destination":  raw["destination"],
        "category":     raw["category"],
        "tagline":      raw.get("tagline", ""),
        "coverImage":   raw.get("coverImage", ""),
        "mapsUrl":      raw["mapsUrl"],
        # Build the YouTube fallback search URL
        "youtubeQuery": raw["youtubeQuery"],
        "youtubeUrl":   f"https://www.youtube.com/results?search_query={raw['youtubeQuery'].replace(' ', '+')}",
        "attractions":  raw.get("attractions", []),
        "notes":        raw.get("notes", ""),
    }

def main():
    if not os.path.exists(SOURCE_FILE):
        print(f"ERROR: Source file not found: {SOURCE_FILE}")
        print("Create 'scripts/bucket_list_source.json' with an array of bucket list entries.")
        return

    with open(SOURCE_FILE, "r", encoding="utf-8") as f:
        raw_entries = json.load(f)

    if not isinstance(raw_entries, list):
        raise ValueError("Source file must be a JSON array of entries.")

    entries = []
    for i, raw in enumerate(raw_entries):
        validate_entry(raw, i)
        entries.append(build_entry(raw))

    generated_at = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    js_array     = json.dumps(entries, ensure_ascii=False, indent=2)

    output = HEADER.format(generated_at=generated_at)
    output += f"window.KYT_BUCKET_LIST = {js_array};\n"

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write(output)

    print(f"✅ Generated {len(entries)} bucket list entries → {OUTPUT_FILE}")

if __name__ == "__main__":
    main()

