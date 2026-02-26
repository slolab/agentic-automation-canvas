# AAC Specification

## Overview

The Agentic Automation Canvas (AAC) specification defines a structured data model for capturing comprehensive metadata about agentic automation projects. The specification ensures that all canvas data can be validated, transformed into standards-compliant RO-Crate packages, and integrated with FAIR Digital Object ecosystems.

## Purpose

The AAC specification serves multiple purposes:

1. **Structured Data Capture**: Provides a consistent schema for capturing project metadata, requirements, feasibility assessments, governance structures, and outcomes.

2. **Validation**: Enables programmatic validation of canvas data to ensure completeness and correctness before export.

3. **Interoperability**: Ensures generated RO-Crates follow established standards (RO-Crate, Schema.org, DCAT, PROV-O) for integration with research infrastructure.

4. **Documentation**: Serves as a reference for understanding the data model, field semantics, and relationships between entities.

5. **Tooling**: Enables development of CLI tools, API integrations, and other interfaces that work with AAC data.

6. **AI-Ready Handoff**: Every RO-Crate export includes an `AGENTS.md` file that translates the structured canvas specification into instructions consumable by AI coding agents (e.g., GitHub Copilot, Cursor), bridging the gap between project design and implementation.

## Scope

The specification covers:

- **Project Definition**: Core project metadata, objectives, stages, and domain information
- **User Expectations**: Requirements, stakeholders, and benefit metrics
- **Developer Feasibility**: Technical risk assessment, TRL levels, model selection, and implementation considerations
- **Governance**: Governance stages, agents, milestones, and compliance standards
- **Data Access**: Dataset metadata, access rights, sensitivity levels, and DUO terms
- **Outcomes**: Deliverables, publications, and evaluation results

## Specification Structure

The specification is organized into several sections:

- **[Core Concepts](concepts.md)**: Fundamental concepts and entities (canvas, task, contract, evaluation, provenance)
- **[Conformance](conformance.md)**: Conformance requirements, versioning policy, and deprecation procedures
- **[Schema Reference](../reference/index.md)**: Detailed field-by-field reference documentation

## Schema Version

The current schema version is **0.13.1 (Beta)**. The schema follows semantic versioning.

!!! warning "Beta Testing Phase"
    Version 0.13.1 is a **beta release** for testing and feedback. The schema structure and fields 
    may change before the stable 1.0.0 release. We welcome feedback and contributions during this phase.

See the [Conformance](conformance.md) section for details on versioning and compatibility.

## Validation

All AAC canvas data MUST conform to the JSON Schema defined at:

`https://w3id.org/aac/schema/aac.schema.json`

Validation can be performed:

- Programmatically using JSON Schema validators
- Via the [CLI validator](../validator.md)
- Through the web application's built-in validation

## Related Standards

The AAC specification builds on and integrates with:

- **RO-Crate 1.2**: Research Object Crate specification for packaging research outputs
- **Schema.org**: Vocabulary for structured data on the web
- **W3C DCAT**: Data Catalog Vocabulary for describing datasets
- **W3C PROV-O**: Provenance Ontology for describing activities and agents
- **P-Plan**: Plan Ontology for describing plans and steps
- **FRAPO**: Funding, Research Administration & Projects Ontology
- **DUO**: Data Use Ontology for data use restrictions

See the [schema mappings](https://github.com/slolab/agentic-automation-canvas/tree/main/schema/mappings/) for detailed mapping documentation.
