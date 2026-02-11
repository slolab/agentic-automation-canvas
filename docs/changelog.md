# Changelog

All notable changes to the Agentic Automation Canvas specification and schema will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.12.0] - 2026-02-11

### Changed
- RO-Crate upgraded from spec 1.1 to 1.2: `@context` and `conformsTo` bumped to `https://w3id.org/ro/crate/1.2`
- Root dataset now includes `datePublished` (MUST in RO-Crate 1.2)
- Preview file renamed from `preview.html` to `ro-crate-preview.html` per spec naming convention
- Preview entity no longer added to root dataset `hasPart` (SHOULD NOT per 1.2); uses `about` back-reference instead

### Added
- Configurable `license` field on `ProjectDefinition`; when set, generates a license contextual entity in the RO-Crate graph

## [0.11.6] - 2026-02-10

### Added
- Load Example: subtle pulse animation for first-time visitors (cleared on click)
- Canvas Summary: panel headers link to respective tabs (Project, Governance, User Expectations, etc.)
- Canvas Summary: benefit tags link to Project tab

### Changed
- Canvas Summary: non-hovered panels subtly dimmed on hover (overlay avoids icon wiggle)
- Canvas Summary: stronger dim effect (70% overlay opacity)

## [0.11.5] - 2026-02-10

### Added
- RO-Crate preview: exported crates include `preview.html` with one-page canvas summary (BMC-style layout)
- Shared `parseUserStory` and `isLink` helpers in canvasSummary utils

### Changed
- Canvas Summary: header styling (canvas title and "Design for:" use gray-900, font-semibold; project name gray-500)
- Canvas Summary: block icons right-aligned in panel headers
- Outcomes form: Deliverables, Publications, Evaluations subheaders use gray-500
- RO-Crate README: mentions preview.html in contents

## [0.11.4] - 2026-02-06

### Added
- Risk-only task example (req-4) demonstrating tasks without time benefits, focused on security and compliance validation

### Changed
- Time savings display: net savings shown prominently in green (matching bar color), gross savings shown as secondary info
- Amortization terminology updated: "payback" → "until amortization" for more formal language
- Effort summary cards standardized: consistent formatting with borders and typography matching top summary cards
- Mermaid dependency graph scaled to 75% for better fit in dashboard

### Fixed
- Person ID generation: sequential IDs (person-0, person-1) instead of timestamp-based hashes
- Safari autofill: ORCID field no longer incorrectly detected as credit card field
- Oversight display: always shown (displays 0 when none) for consistency

### Removed
- Unit Category Distribution panel from Dashboard

## [0.11.0] - 2026-02-06

### Added
- Developer Feasibility refactor: separate project-level defaults and task-level overrides
- Human oversight moved to benefits modal, follows aggregation basis (perUnit/perMonth)
- Time unit standardization: requirement-level timeUnit field, synchronized across all time benefits
- Cost benefit type with CostBenefitForm component
- Markdown rendering for task descriptions in feasibility section
- Functional roles dropdown with chips interface
- "Done (collapse)" buttons for all collapsible items and expandable sections

### Changed
- Stakeholders moved from separate section to per-task association
- Oversight calculations now use benefit-level oversight instead of requirement-level
- Benefits modal opens on "time" tab by default
- Enhanced example task descriptions with rationale and best practices
- Improved UI guidance: integrated bullet points replacing highlighted boxes

### Fixed
- Benefit tags wrap as a group instead of individually
- Removed tasks' benefits no longer appear in project summary
- Time unit dropdown reactivity in benefits modal
- DeliverableItem "Done" button width issue
- Tooltip hover behavior (stay visible when moving mouse)

## [0.10.2] - 2025-02-04

### Added
- Logo in page header (SVG from `public/logo.svg`).
- bump2version workflow for version bumps: `.bumpversion.cfg` covers `package.json`, `package-lock.json`, `pyproject.toml`, docs, README; CONTRIBUTING updated with instructions.

### Changed
- Header action buttons (What is this?, Load Example, Import RO-Crate) adapt to available width: full labels → short labels (About, Example, Import RO-Crate) → icon-only; avoids wrapping and keeps header one line.
- Import RO-Crate button label is always two lines (full: "Import RO-Crate" / "(ZIP)", short: "Import" / "RO-Crate"), centered.
- Display group assignments are persisted to localStorage and restored on reload (same key pattern as canvas data; cleared with "Clear form").
- `pyproject.toml` version synced with app/schema (0.10.2); included in bump2version config.

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
- Standards compliance (RO-Crate 1.2, Schema.org, DCAT, PROV-O, P-Plan, FRAPO)

### Schema Structure
- Main properties: `version`, `versionDate`, `persons`, `project`, `userExpectations`, `developerFeasibility`, `governance`, `dataAccess`, `outcomes`
- Schema definitions: `BenefitValue`, `Benefit`

### Standards Integration
- RO-Crate 1.2 packaging
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
