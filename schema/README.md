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

**Rough estimate (project-level)**
- `roughEstimateValue` and `roughEstimateUnit` provide an optional manual project-level benefit estimate for getting started (before task-level benefits are defined)
- The schema does not store aggregate benefit values; the single source of truth is per-requirement benefits
- The web app may compute or display aggregated values (e.g. time saved per month) for UI purposes only

**Developer feasibility**
- Developer feasibility is embedded directly in the RO-Crate root dataset (`aac:developerFeasibility`), not in a separate file

**Display groups (app-only)**
- Grouping benefits for display (e.g. by metric) is application state only, stored in `benefit-display.json` in the crate when present
- Display groups are not part of the canvas schema; they allow the UI to show combined values (e.g. time saved per month) in the collapsed view and dashboard

### Benefits and Oversight Model

**Time Benefits:**
- Time benefits include baseline and expected values (in requirement's `timeUnit`: minutes or hours)
- Human oversight is stored at benefit level:
  - `oversightMinutesPerUnit`: For benefits with `aggregationBasis: "perUnit"` (oversight per unit, always in minutes)
  - `oversightMinutesPerMonth`: For benefits with `aggregationBasis: "perMonth"` (oversight per month, always in minutes)
- Net time savings = (baseline - expected) - oversight (calculated, not stored)
- Oversight is always measured in minutes regardless of the benefit's time unit

**Benefit Types:**
- `time`: Time savings (with optional oversight)
- `quality`: Quality improvements
- `risk`: Risk reductions
- `enablement`: New capabilities enabled
- `cost`: Cost savings

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
- `title` required (min length: 1)
- `benefits` required (array, at least one benefit)
- `volumePerMonth >= 1` (if applicable)
- `timeUnit` optional (enum: "minutes" | "hours") - standardizes all time values for the requirement
- `stakeholders` optional (array of Person IDs, per-task)

**References:**
- All Person `@id` references must exist in Persons registry
- No duplicate Person nodes for same identity

### Schema Version Flag

RO-Crates generated with schema version 1.1 include:
- `aac:schemaVersion: "1.1"` in the root dataset
- This enables version-aware processing and migration tools
