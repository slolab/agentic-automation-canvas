#!/usr/bin/env python3
"""Publish generated aliases and immutable versioned AAC schema artifacts."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

import yaml


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
SCHEMA_ROOT = REPOSITORY_ROOT / "schema"
OUTPUT_ROOT = REPOSITORY_ROOT / "site" / "schema"


def main() -> None:
    manifest = json.loads((SCHEMA_ROOT / "manifest.json").read_text())
    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)

    current_alias = json.loads((SCHEMA_ROOT / "canvas-schema.json").read_text())
    (OUTPUT_ROOT / "aac.schema.json").write_text(
        json.dumps(current_alias, indent=2) + "\n"
    )
    (OUTPUT_ROOT / "aac.schema.yaml").write_text(
        yaml.dump(current_alias, default_flow_style=False, sort_keys=False, allow_unicode=True)
    )
    shutil.copy2(
        SCHEMA_ROOT / "rocrate-profile.json",
        OUTPUT_ROOT / "rocrate-profile.json",
    )

    for version, relative_schema in manifest["schemas"].items():
        version_output = OUTPUT_ROOT / version
        version_output.mkdir(parents=True, exist_ok=True)
        shutil.copy2(SCHEMA_ROOT / relative_schema, version_output / "aac.schema.json")

        relative_profile = manifest.get("profiles", {}).get(version)
        if relative_profile:
            shutil.copy2(
                SCHEMA_ROOT / relative_profile,
                version_output / "rocrate-profile.json",
            )


if __name__ == "__main__":
    main()
