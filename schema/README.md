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

## Schema Version 1.1

### Person Identity and Role Model

**Functional Roles (Required)**
- Each Person must have at least one `functionRoles` entry from a controlled vocabulary
- Functional roles are standardized terms (e.g., "project-lead", "developer", "researcher") defined in `vocabularies/function-roles.json`
- These roles enable role aggregation and cross-project analysis

**Local Titles (Optional)**
- `localTitles` are free-text descriptions of a person's position or title within their organization
- Examples: "Senior Research Scientist", "Head of IT", "Principal Investigator"
- Multiple titles can be provided as a comma-separated list

**Person Identity Enforcement**
- All persons are managed in a centralized `persons` array
- When assigning people to stakeholders or agents, you must reference existing Person IDs
- No free-text person creation is allowed - this ensures correct role aggregation
- Each Person must have a unique ID and at least one functional role

### Project-Level Required Fields

**Creator (Required)**
- The `creator` field is required and must contain at least one Person ID
- References persons from the centralized `persons` array
- Used to establish project ownership and attribution

**Auto-Aggregation**
- `aggregateExpectedHoursSavedPerMonth` is automatically calculated from all requirements
- Formula: Σ(volumePerMonth × netTimeSavedLikely / 60)
- Where `netTimeSavedLikely = timeSavedMinutesPerUnit.likely - humanOversightMinutesPerUnit`
- This provides a project-level summary of expected time savings

### Savings Model Validation

**Per-Step Validation Rules:**
- `volumePerMonth >= 1` (required)
- `baselineMinutesPerUnit >= 0` (required)
- If all three time saved estimates are present: `best >= likely >= worst`
- Warning (non-blocking) if `netTimeSaved <= 0`

**Field Naming:**
- `humanOversightMinutesPerUnit`: Time required for human review/oversight per unit
- `netTimeSavedMinutesPerUnit`: Computed as `likely - oversight` (auto-calculated, not stored)

### Governance Stage Gating

**Stage Emission Rules:**
- Governance stages are only exported as `prov:Activity` entities if:
  - Stage has a `name` (non-empty)
  - Stage has at least one `agent`
- Empty or incomplete stages are skipped during RO-Crate export
- This ensures only meaningful governance activities are included

### Validation Rules Summary

**Person:**
- `functionRoles.length >= 1` (required)
- `localTitles` optional (free text)
- Unique `id` required

**Project:**
- `creator.length >= 1` (required, Person IDs)
- `projectStage` required
- `title` and `description` required

**Requirement:**
- `volumePerMonth >= 1`
- `baselineMinutesPerUnit >= 0`
- `best >= likely >= worst` (if all present)
- Warning if `netTimeSaved <= 0`

**References:**
- All Person `@id` references must exist in Persons registry
- No duplicate Person nodes for same identity

### Schema Version Flag

RO-Crates generated with schema version 1.1 include:
- `aac:schemaVersion: "1.1"` in the root dataset
- This enables version-aware processing and migration tools
