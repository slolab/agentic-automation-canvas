# Changelog

All notable changes to the Agentic Automation Canvas specification and schema will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.10.1] - 2025-02-03

### Changed
- Bumped AAC schema version to 0.10.1 after merging substantial schema changes.
- New projects default to project version 0.1.0; changelog ordered latest-first; RO-Crate download filename includes project version (`name-version-rocrate.zip`); chat placeholder updated to “We are currently evaluating the need for a chatbot.”

## [0.10.0] - 2025-02-02

!!! warning "Beta Release"
    This is a **beta release**. The schema structure may change before 1.0.0.

### Schema and RO-Crate
- **Removed:** `aggregateBenefits`, `aggregateBenefitValue`, `aggregateBenefitUnit`, `isImported`
- **Added:** Project-level `roughEstimateValue` and `roughEstimateUnit` for getting started before task-level benefits
- Developer feasibility embedded in RO-Crate root dataset (`aac:developerFeasibility`) instead of separate file
- Requirement IDs preserved in P-Plan step `@id` on export for display group resolution on import
- **Added:** `aac:schemaVersion` in root dataset on export; read on import for version-mismatch warning

### Display groups (app-only)
- Display group state (`BenefitDisplayState`, `benefit-display.json`): group benefits by metric for collapsed view and dashboard
- Configurable slot count (1–15, default 5) via +/− in display group overview; persisted in `benefit-display.json`
- Per-benefit number buttons to add/remove from groups; same metric per group; aggregated value (time = sum saved/month; non-time = list)
- Collapsed view: one line per display group (type tag + metric: value); Dashboard: display groups section with aggregated and per-benefit list
- Example dataset and dev RO-Crate include default display groups for testing

### Version and import UX
- Footer: app version (from package at build time) and “Schema subject to change until v1.0 release”
- Increment-version reminder only after first change since import; display-group edits count as change
- Schema-version mismatch warning when importing crate with different or missing `aac:schemaVersion`; support-may-be-limited wording; “Downloading the crate again will fix this”

### Docs
- README and schema/README updated: rough estimate, no aggregate in schema, developer feasibility embedded, display groups app-only

## [0.9.0] - 2025-01-30

!!! warning "Beta Release"
    This is a **beta release** for testing and feedback. The schema structure may change before 1.0.0.

### Changed
- New projects (create from scratch / clear form) are initialized with **project version** `0.1.0`. This is the canvas/project's own version field, independent of the schema version (0.9.0).

### Added
- Initial w3id.org namespace deployment
- MkDocs documentation site
- Schema reference documentation generator
- Example validator tool
- Comprehensive specification documentation

### Added
- Initial AAC schema specification
- JSON Schema definition (`canvas-schema.json`)
- RO-Crate profile definition
- Minimal and complete example files
- Core concepts: canvas, task, contract, evaluation, provenance
- Support for project definition, user expectations, developer feasibility, governance, data access, and outcomes
- Benefit metrics (time, quality, risk, enablement)
- Person identity and role model
- Governance stages with agents
- Dataset metadata with DUO terms
- Standards compliance (RO-Crate 1.1, Schema.org, DCAT, PROV-O, P-Plan, FRAPO)

### Schema Structure
- Main properties: `version`, `versionDate`, `isImported`, `persons`, `project`, `userExpectations`, `developerFeasibility`, `governance`, `dataAccess`, `outcomes`
- Schema definitions: `BenefitValue`, `Benefit`, `AggregateBenefit`

### Standards Integration
- RO-Crate 1.1 packaging
- Schema.org Project/ResearchProject types
- W3C DCAT for datasets
- W3C PROV-O for provenance
- P-Plan for user expectations
- FRAPO for funding and projects
- DUO for data use restrictions

## [1.0.0] - TBD

### Planned
- Stable release after beta testing and feedback incorporation
- Finalized schema structure
- Migration guide from 0.9.x to 1.0.0
