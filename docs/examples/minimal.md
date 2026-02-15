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

- [minimal-example.json](https://github.com/slolab/agentic-automation-canvas/blob/main/schema/examples/minimal-example.json) - RO-Crate JSON-LD (what you get from "Download RO-Crate")
- [minimal-canvas.json](https://github.com/slolab/agentic-automation-canvas/blob/main/schema/examples/minimal-canvas.json) - Canvas JSON for validation and programmatic use

See [Examples overview](index.md) for details on the two formats.

## Validation

This example is validated in CI. See the [validator documentation](../validator.md) for local validation instructions.

## Next Steps

After understanding the minimal example:

1. Review the [complete example](complete.md) to see all available fields
2. Read the [schema reference](../reference/index.md) for detailed field documentation
3. Try creating your own canvas using the [web application](https://slolab.github.io/agentic-automation-canvas/)
