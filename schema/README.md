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
- **`examples/`**: Example RO-Crate files for reference

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

- RO-Crate 1.1 specification
- FAIR Digital Object principles
- EOSC metadata profiles
- W3C standards (DCAT, PROV-O)
- Schema.org vocabularies

## Versioning

The schema follows semantic versioning. Changes to the schema structure will be versioned independently of the web application.
