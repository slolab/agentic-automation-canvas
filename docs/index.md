# Agentic Automation Canvas (AAC)

!!! warning "Beta Release"
    **Version 0.11.1 (Beta)**: This specification is currently in beta testing. The schema and documentation 
    may change before the stable 1.0.0 release. Feedback and contributions are welcome!

The **Agentic Automation Canvas (AAC)** is a framework for designing and documenting agentic automation solutions driven by generative AI. Agentic systems are designed to replace human judgment in a reliable way, requiring a control inversion where the system takes command of tasks while humans step back accordingly. The AAC provides a structured approach to capture project metadata, user expectations, feasibility considerations, governance requirements, and outcomes—all while generating machine-readable outputs that integrate with FAIR Digital Object ecosystems.

The canvas serves simultaneously as a framework for implementation, a checklist for relevant aspects that need consideration, and a machine-readable specification for your agentic automation task. Once completed, the canvas can be exported as an interoperable RO-Crate that guides development through planning, prototype, and deployment stages.

## Quickstart

1. **Write a canvas**: Use the [interactive web application](https://slolab.github.io/agentic-automation-canvas/) to fill out your agentic automation canvas, capturing project details, requirements, feasibility, governance, and outcomes.

2. **Validate**: The web form validates your data automatically as you fill it out. If you're working with canvas JSON files directly (outside the web form), use the [validator](validator.md) to ensure compliance with the AAC specification.

3. **Download**: Download your completed canvas as an RO-Crate package (ZIP file). The web form exports your data as a standards-compliant RO-Crate that can be shared, archived, and integrated with research infrastructure following FAIR principles.

## Canonical Identifiers

The canonical base namespace for the Agentic Automation Canvas is:

**`https://w3id.org/aac/`**

All schema artifacts, examples, and documentation are served from this stable namespace:

- **Schema**: `https://w3id.org/aac/schema/aac.schema.json`
- **Specification**: `https://w3id.org/aac/spec/`
- **Examples**: `https://w3id.org/aac/examples/`

### Namespace Policy

**Stability Promises:**

- **Beta Phase (0.9.x)**: During beta testing, the schema structure may change. Breaking changes will be documented in the changelog.
- **Stable (1.0+)**: After 1.0.0, schema `$id` URIs, property names, required fields, and core structure will remain stable within major versions.
- **Versioned Changes**: Breaking changes will only occur in major version increments (e.g., 1.0 → 2.0), with deprecation notices in advance.
- **Additive Evolution**: Minor versions may add optional fields, new controlled vocabularies, or extended examples without breaking existing implementations.
- **Documentation**: Specification documentation may be updated for clarity without changing the schema structure.

**What May Change:**

- Documentation wording and examples (for clarity)
- Additional optional fields in minor versions
- Extended controlled vocabularies
- New example files

**What Won't Change:**

- Core property names and types
- Required field definitions
- Schema `$id` URIs (within major versions)
- JSON Schema structure and validation rules

## Resources

### Specification & Documentation

- **[Specification](spec/index.md)**: Complete specification overview
- **[Core Concepts](spec/concepts.md)**: Key concepts (canvas, task, contract, evaluation, provenance)
- **[Conformance](spec/conformance.md)**: Conformance requirements, versioning, and deprecation policy

### Schema & Artifacts

- **[JSON Schema](https://w3id.org/aac/schema/aac.schema.json)**: Machine-readable schema definition (available after deployment)
- **[YAML Schema](https://w3id.org/aac/schema/aac.schema.yaml)**: YAML representation of the schema (available after deployment)
- **[Schema Reference](reference/index.md)**: Auto-generated reference documentation

### Examples

- **[Minimal Example](examples/minimal.md)**: A minimal valid AAC canvas
- **[Complete Example](examples/complete.md)**: A comprehensive example with all sections populated

### Tools & Validation

- **[Validator](validator.md)**: Validate AAC canvas files against the schema
- **[Web Application](https://slolab.github.io/agentic-automation-canvas/)**: Interactive form for creating canvases

### Community & Support

- **[GitHub Repository](https://github.com/slolab/agentic-automation-canvas)**: Source code, issues, and discussions
- **[Changelog](changelog.md)**: Version history and release notes

## Standards Compliance

The Agentic Automation Canvas follows established standards:

- **RO-Crate 1.1**: Research Object Crate specification
- **Schema.org**: Project, ResearchProject, CreativeWork types
- **W3C DCAT**: Data Catalog Vocabulary for datasets
- **W3C PROV-O**: Provenance Ontology for activities
- **P-Plan**: Plan Ontology for user expectations
- **FRAPO**: Funding, Research Administration & Projects Ontology
- **DUO**: Data Use Ontology for data restrictions

## License

Licensed under the Apache License, Version 2.0. See the [LICENSE](https://github.com/slolab/agentic-automation-canvas/blob/main/LICENSE) file for details.
