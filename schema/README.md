# Agentic Automation Canvas Schema Profile

This directory contains the formal schema definitions and specifications for the Agentic Automation Canvas, independent of the web application implementation.

## Overview

The Agentic Automation Canvas schema is designed to capture comprehensive metadata about agentic automation projects, following established standards including:

- **Schema.org** (Project/ResearchProject)
- **DCAT** (Data Catalog Vocabulary)
- **PROV-O** (Provenance Ontology)
- **P-Plan** (Plan Ontology)
- **FRAPO** (Funding, Research Administration & Projects Ontology)
- **DUO** (Data Use Ontology)
- **RO-Crate** (Research Object Crate)

## Contents

- **`canvas-schema.json`**: JSON Schema for validating canvas data structure
- **`rocrate-profile.json`**: RO-Crate profile definition specifying expected structure
- **`mappings/`**: Detailed documentation of ontology mappings
- **`vocabularies/`**: Controlled vocabularies and term lists
- **`examples/`**: Example JSON files for reference (canvas and RO-crate formats)

## Usage

### For Developers

The schema can be used independently of the web application for:

- **Validation**: Validate canvas data against JSON Schema
- **Tooling**: Build CLI tools, API integrations, or other interfaces
- **Integration**: Import/export functionality in other systems
- **Documentation**: Reference implementation for understanding the data model

### For Users

The schema ensures that all generated RO-Crates follow consistent, standards-compliant structures that can be:

- Validated against the schema
- Integrated with FAIR Digital Object ecosystems
- Discovered through standard metadata catalogs
- Interoperable with research infrastructure (EOSC, etc.)

## Standards Compliance

This schema profile aligns with:

- RO-Crate specification
- FAIR Digital Object principles
- EOSC metadata profiles
- W3C standards (DCAT, PROV-O)
- Schema.org vocabularies


## Versioning

AAC data contracts are versioned independently from the web application, the RO-Crate specification, and each canvas's `project.version`.

- `manifest.json` identifies the current AAC schema and RO-Crate profile.
- `versions/<version>/` contains immutable released contracts.
- `canvas-schema.json` and `rocrate-profile.json` are generated aliases for the current release.
- Exported crates declare an exact `aac:schemaVersion` and versioned AAC profile.
- The application fully supports and exports only the selected current schema. Non-current or unversioned crates use one version-independent best-effort import path with visible diagnostics; historical artifacts remain published references, not runtime compatibility promises.

## Generated TypeScript Contract

The current AAC TypeScript model is generated from the versioned JSON Schema. Do not edit `src/types/canvas.ts` manually.

```bash
npm run schema:generate  # refresh generated aliases, types, and version constants
npm run schema:check     # fail without modifying files when generated artifacts drift
npm run typecheck        # check TypeScript and Vue templates against generated types
```

Runtime validation uses the same current JSON Schema. TypeScript types provide compile-time enforcement but do not replace runtime validation.

## Current Schema: 0.17.0

Version `0.17.0` reconciles the published schema with the current canvas model:

- Person supports optional `functionRoles` and `localTitle`.
- Project supports optional `creator` Person references and `license` URI.
- Governance milestones use objects with required `description` and optional `kpi`.
- AAC structural objects reject undeclared properties; evaluation `metrics` remains an intentionally open dictionary.
- All schema-defined fields, identifiers, and references must survive current RO-Crate export/import round trips.

The schema requires `project.title` and `project.description`. Person roles, project creator, project stage, and dataset access rights remain optional in this reconciliation release.
