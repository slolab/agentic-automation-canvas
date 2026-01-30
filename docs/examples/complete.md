# Complete Example

This is a comprehensive Agentic Automation Canvas example with all sections populated, demonstrating advanced features and real-world usage patterns.

## Overview

The complete example includes:

- **Full Project Definition**: Title, description, objectives, stages, domain, keywords, funding, and benefit metrics
- **User Expectations**: Multiple requirements with detailed benefit metrics, stakeholders with roles and values
- **Developer Feasibility**: TRL levels, technical risk assessment, model selection, baseline capabilities, expected gains, implementation difficulty
- **Governance**: Multiple governance stages with agents (people, organizations, software), milestones, and compliance standards
- **Data Access**: Dataset metadata with access rights, sensitivity levels, DUO terms, and PIDs
- **Outcomes**: Deliverables, publications with DOIs, and evaluation results with metrics

## Structure Highlights

### Project Section

- Complete project metadata
- Aggregate benefit values and units
- Primary value driver
- Multiple aggregate benefits (time, quality)
- Contributors and plans

### User Expectations

- Requirements with user stories
- Priority and status tracking
- Unit of work definitions
- Volume and baseline metrics
- Multiple benefit types (time, quality, risk, enablement)
- Stakeholder definitions with roles

### Developer Feasibility

- Current and target TRL levels
- Technical risk assessment
- Algorithm and tool specifications
- Model selection (open-source, frontier-model, etc.)
- Baseline capability assessment
- Expected performance improvements
- Implementation difficulty factors

### Governance

- Multiple governance stages (planning, prototype, deployment)
- Agents of different types (person, organization, software)
- Milestones and compliance standards
- Date ranges for each stage

### Data Access

- Dataset catalog with titles, descriptions, formats
- Access rights and sensitivity levels
- DUO terms for data use restrictions
- Personal data indicators
- Persistent identifiers

### Outcomes

- Deliverables with types and dates
- Publications with DOIs and authors
- Evaluations with metrics and results

## Key Features

- **Comprehensive Coverage**: All major sections populated
- **Real-world Patterns**: Demonstrates typical usage scenarios
- **Standards Compliant**: Follows RO-Crate 1.1 and all referenced ontologies
- **Validated**: Passes schema validation

## Use Cases

- Understanding advanced features
- Seeing all field types in context
- Reference implementation for tooling
- Learning field relationships and semantics
- Template for complex projects

## Download

**What you download from the web form:**

- [complete-example.json](https://github.com/slolab/agentic-automation-canvas/blob/main/schema/examples/complete-example.json) - RO-Crate JSON-LD format. **This is what you get when you click "Download RO-Crate"** in the web application. The download is a ZIP file containing `ro-crate-metadata.json` following RO-Crate 1.1 specification.

**For validation and programmatic use:**

- [complete-canvas.json](https://github.com/slolab/agentic-automation-canvas/blob/main/schema/examples/complete-canvas.json) - Canvas JSON format that validates against the AAC schema. This is the internal format used by the web form. Use this format if you want to validate against the schema or work with the data programmatically.

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

with open('schema/examples/complete-canvas.json', 'r') as f:
    canvas = json.load(f)

jsonschema.validate(instance=canvas, schema=schema)
print('✓ Valid')
"
```

## Field Reference

For detailed documentation on any field in this example, see the [schema reference](../reference/index.md).

## Related Documentation

- [Core Concepts](../spec/concepts.md) - Understanding AAC concepts
- [Schema Reference](../reference/index.md) - Detailed field documentation
- [Specification](../spec/index.md) - Complete specification
