# Examples

This section provides example Agentic Automation Canvas files to help you understand the schema structure and see real-world usage patterns.

## Available Examples

### [Minimal Example](minimal.md)

A minimal valid AAC canvas demonstrating the required fields and basic structure. This example shows the absolute minimum needed to create a valid canvas.

**Use case**: Getting started, understanding basic structure, testing validation.

### [Complete Example](complete.md)

A comprehensive example with all sections populated, including:

- Full project definition with metadata
- Multiple requirements with benefit metrics
- Stakeholder definitions
- Developer feasibility assessment
- Governance stages with agents
- Data access information
- Outcomes including deliverables, publications, and evaluations

**Use case**: Understanding advanced features, seeing all field types, reference implementation.

## Using Examples

### Understanding the Two Formats

The examples directory contains two formats representing the same data:

- **Canvas JSON** (e.g., `minimal-canvas.json`): The internal data format that validates against the AAC schema. This is what the web form uses internally and what you'd use for programmatic validation.

- **RO-Crate JSON** (e.g., `minimal-example.json`): The packaged format you **download from the web form**. When you click "Download RO-Crate" in the web application, you get a ZIP file containing `ro-crate-metadata.json` in RO-Crate format, following RO-Crate 1.1 specification.

**Important**: When you download from the web form, you get **RO-Crate format** (the packaged, standards-compliant format). Canvas JSON is the internal format used for validation and programmatic access.

### Download

Each example page provides download links for both formats so you can:
- Validate canvas JSON against the schema
- See what RO-Crate format looks like (what you'll download)

### Validation

All examples are validated against the schema in CI. You can validate them locally using the [validator](../validator.md):

```bash
python tools/validate-examples.py
```

### Integration

Examples can be used as:

- **Templates**: Starting points for your own canvases
- **Test data**: For testing tools and integrations
- **Reference**: Understanding field semantics and relationships
- **Documentation**: Seeing how concepts map to actual data

## Creating Your Own Examples

When creating examples:

1. **Start minimal**: Begin with `minimal-canvas.json` and add fields as needed
2. **Validate early**: Use the validator to catch errors during development
3. **Follow patterns**: Look at `complete-canvas.json` for field usage patterns
4. **Document purpose**: Include descriptions explaining what the example demonstrates
5. **Use canvas JSON format**: Create examples in canvas JSON format (not RO-Crate) for validation against the schema

## Contributing Examples

We welcome contributions of domain-specific examples! Examples should:

- Be valid against the current schema
- Demonstrate real-world use cases
- Include clear descriptions
- Follow the existing example structure

Submit examples via pull request to the `schema/examples/` directory.
