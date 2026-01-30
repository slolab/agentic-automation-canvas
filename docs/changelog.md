# Changelog

All notable changes to the Agentic Automation Canvas specification and schema will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.9.0] - 2025-01-30

!!! warning "Beta Release"
    This is a **beta release** for testing and feedback. The schema structure may change before 1.0.0.

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
