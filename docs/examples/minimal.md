# Minimal Example

This is a minimal valid Agentic Automation Canvas example demonstrating the absolute minimum required fields.

## Overview

The minimal example shows:

- Basic project definition with required fields
- Minimal canvas structure
- Core metadata elements

## Structure

```json
{
  "version": "0.1.0",
  "versionDate": "2025-01-30",
  "isImported": false,
  "project": {
    "title": "Example Agentic Automation Project",
    "description": "A minimal example project",
    "projectStage": "Planning",
    "startDate": "2025-01-01"
  }
}
```

## Key Features

- **Minimal Canvas**: Contains only the required canvas fields
- **Basic Project**: Single project with title, description, project stage, and start date
- **Validates Successfully**: Passes schema validation

## Use Cases

- Getting started with AAC
- Understanding the basic structure
- Testing validation tools
- Creating your own canvas from scratch

## Download

**What you download from the web form:**

- [minimal-example.json](https://github.com/slolab/agentic-automation-canvas/blob/main/schema/examples/minimal-example.json) - RO-Crate JSON-LD format. **This is what you get when you click "Download RO-Crate"** in the web application. The download is a ZIP file containing `ro-crate-metadata.json` following RO-Crate 1.1 specification.

**For validation and programmatic use:**

- [minimal-canvas.json](https://github.com/slolab/agentic-automation-canvas/blob/main/schema/examples/minimal-canvas.json) - Canvas JSON format that validates against the AAC schema. This is the internal format used by the web form. Use this format if you want to validate against the schema or work with the data programmatically.

## Validation

This example is validated against the schema in CI. Validate locally:

```bash
uv run python tools/validate-examples.py
```

Or validate this specific file:

```bash
uv run python -c "
import json
import jsonschema

with open('schema/canvas-schema.json', 'r') as f:
    schema = json.load(f)

with open('schema/examples/minimal-canvas.json', 'r') as f:
    canvas = json.load(f)

jsonschema.validate(instance=canvas, schema=schema)
print('✓ Valid')
"
```

## Next Steps

After understanding the minimal example:

1. Review the [complete example](complete.md) to see all available fields
2. Read the [schema reference](../reference/index.md) for detailed field documentation
3. Try creating your own canvas using the [web application](https://slolab.github.io/agentic-automation-canvas/)
