#!/usr/bin/env python3
"""
Validate example files against the AAC JSON Schema.

This script validates all example files in schema/examples/ against
the canvas-schema.json and reports any validation errors.
"""

import json
import sys
from pathlib import Path
from typing import List, Tuple

try:
    import jsonschema
    from jsonschema import validate, ValidationError
except ImportError:
    print("Error: jsonschema package not found. Install with: uv sync", file=sys.stderr)
    sys.exit(1)


def load_schema(schema_path: Path) -> dict:
    """Load and return the JSON Schema."""
    with open(schema_path, "r", encoding="utf-8") as f:
        return json.load(f)


def load_example(example_path: Path) -> dict:
    """Load and return an example file."""
    with open(example_path, "r", encoding="utf-8") as f:
        return json.load(f)


def is_rocrate_file(data: dict) -> bool:
    """Check if a JSON file is an RO-Crate (has @context and @graph)."""
    return "@context" in data and "@graph" in data


def validate_example(schema: dict, example_data: dict, example_path: Path) -> Tuple[bool, List[str]]:
    """
    Validate an example against the schema.
    
    Returns:
        Tuple of (is_valid, list_of_errors)
    """
    errors = []
    
    try:
        # Validate against the schema
        validate(instance=example_data, schema=schema)
        return True, []
    except ValidationError as e:
        # Extract validation error message
        error_path = " -> ".join(str(p) for p in e.absolute_path) if e.absolute_path else "root"
        error_msg = f"{error_path}: {e.message}"
        errors.append(error_msg)
        
        # If there are more errors in the context, include them
        if e.context:
            for suberror in e.context:
                suberror_path = " -> ".join(str(p) for p in suberror.absolute_path) if suberror.absolute_path else "root"
                errors.append(f"  {suberror_path}: {suberror.message}")
        
        return False, errors
    except Exception as e:
        errors.append(f"Unexpected error: {str(e)}")
        return False, errors


def main():
    """Main entry point."""
    # Get paths
    repo_root = Path(__file__).parent.parent
    schema_file = repo_root / "schema" / "canvas-schema.json"
    examples_dir = repo_root / "schema" / "examples"
    
    # Check schema file exists
    if not schema_file.exists():
        print(f"Error: Schema file not found: {schema_file}", file=sys.stderr)
        sys.exit(1)
    
    # Check examples directory exists
    if not examples_dir.exists():
        print(f"Error: Examples directory not found: {examples_dir}", file=sys.stderr)
        sys.exit(1)
    
    # Load schema
    print(f"Loading schema from: {schema_file}")
    schema = load_schema(schema_file)
    
    # Find all JSON example files
    example_files = sorted(examples_dir.glob("*.json"))
    
    if not example_files:
        print(f"Warning: No example files found in {examples_dir}", file=sys.stderr)
        sys.exit(0)
    
    print(f"Found {len(example_files)} example file(s)\n")
    
    # Validate each example
    all_valid = True
    rocrate_files = []
    canvas_files = []
    
    for example_file in example_files:
        try:
            example_data = load_example(example_file)
            
            # Check if this is an RO-Crate file
            if is_rocrate_file(example_data):
                rocrate_files.append(example_file.name)
                print(f"Skipping: {example_file.name} (RO-Crate format, not raw canvas JSON)")
                continue
            
            # Validate raw canvas JSON files
            canvas_files.append(example_file.name)
            print(f"Validating: {example_file.name}")
            
            is_valid, errors = validate_example(schema, example_data, example_file)
            
            if is_valid:
                print(f"  ✓ Valid\n")
            else:
                all_valid = False
                print(f"  ✗ Invalid:")
                for error in errors:
                    print(f"    - {error}")
                print()
        except json.JSONDecodeError as e:
            all_valid = False
            print(f"  ✗ JSON parsing error: {e}\n")
        except Exception as e:
            all_valid = False
            print(f"  ✗ Error: {e}\n")
    
    # Summary
    print()
    if rocrate_files:
        print(f"Note: Skipped {len(rocrate_files)} RO-Crate file(s): {', '.join(rocrate_files)}")
        print("      RO-Crate files are validated separately against the RO-Crate profile.")
        print()
    
    if not canvas_files:
        print("No raw canvas JSON files found to validate.")
        print("Note: The examples directory contains RO-Crate files (output format), not raw canvas JSON (input format).")
        print("      To validate canvas data, add raw canvas JSON files to the examples directory.")
        sys.exit(0)
    
    print(f"Validated {len(canvas_files)} raw canvas JSON file(s): {', '.join(canvas_files)}")
    print()
    
    # Exit with appropriate code
    if all_valid:
        print("All canvas examples are valid!")
        sys.exit(0)
    else:
        print("Some canvas examples failed validation. See errors above.", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
