# Changelog

All notable changes to the Agentic Automation Canvas specification and schema will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.13.1]

### Changed
- **Person local title**: `localTitles` (string array, comma-separated) simplified to `localTitle` (single string), fixing a reactive bug where spaces could not be typed; migration joins existing arrays on import

### Fixed
- **RO-Crate round-trip**: `targetPopulation` now imported (was exported but never read back)
- **RO-Crate round-trip**: `policyCardUri` on governance stages now imported (was exported but never read back)
- **RO-Crate round-trip**: `functionRoles` and `localTitle` on Person entities now exported and imported (both were previously silently dropped, with functionRoles loss causing a validation error on reimport)
- **Compliance standards type**: import type assertion corrected from `string[]` to `(string | ComplianceStandard)[]` to match the actual union type
- **Example data**: junior extraction task (req-1b) now connected in dependency graph — req-2 and req-4 depend on both `req-1` and `req-1b`; Emma Rodriguez has `localTitle` demonstrating the field

## [0.13.0]

### Added
- **Per-task risk assessments** paralleling benefits: each task's feasibility can now include a `risks` array with category (technical, data, compliance, operational, ethical, adoption), title, description, likelihood, impact, mitigation strategy, and status
- Risk assessment UI in Feasibility & Risks section with collapsible risk cards per task
- Collapsed task-level feasibility view shows risk assessment count alongside feasibility count
- **Policy Card URI** field on governance stages: optional `policyCardUri` linking to a machine-readable Policy Card deployment governance artifact
- Policy Card URI input with external link in governance stage UI
- **Structured compliance standards**: `complianceStandards` now accepts both plain strings and structured objects with `framework`, `clauses` (array), and `uri` fields
- "Add Structured" mode in governance stage compliance UI for framework/clauses/URI entry
- `Risk` definition added to JSON Schema `$defs`
- RO-Crate export: `aac:policyCardUri` on governance stage entities
- Risk and governance field mappings documented in `docs/mapping.md`
- Example data: 4 risk examples across tasks, structured compliance standards (ISO/IEC 42001, Policy Card v1.0), Policy Card URI on Deployment stage
- **Target population** field on requirements: optional `targetPopulation` string specifying which user group the benefit estimates apply to (e.g., "junior researchers", "senior clinical staff"), enabling explicit heterogeneity modelling
- Target population input with tooltip in the Benefits section of each task
- RO-Crate export: `aac:targetPopulation` on P-Plan step entities; AGENTS.md: target population listed per requirement
- Schema and docs: `targetPopulation` property in JSON Schema, TypeScript interface, and `docs/spec/concepts.md`
- Example data: document extraction task split into senior vs. junior staff variants with differing baseline, oversight, and net-savings values demonstrating heterogeneous benefits; "delayed learning" adoption risk on junior variant
- **Confidence tooltips** on all benefit forms: User Confidence and Developer Confidence selectors now include InfoTooltip explaining each perspective and noting that disagreement highlights areas for discussion
- **Chip input improvements** for Algorithms/Technologies, Tools/Frameworks, and agentic Framework/Tools/Orchestration fields: tooltips explaining chip-based entry, updated placeholders ("Type a name and press Enter"), comma-separated input automatically split into multiple chips
- Risk assessment section added to schema reference documentation
- **Drag-and-drop RO-Crate import**: drop a ZIP file anywhere on the canvas to import, with a confirmation dialog to prevent accidental data replacement

### Changed
- **Tab rename**: "Tasks & Expectations" → "Tasks & Benefits"
- **Tab rename**: "Developer Feasibility" → "Feasibility & Risks"
- Section headers and descriptions updated to reflect the balanced benefits/risks framing
- Completion calculation handles structured compliance standard objects
- Collapsed task view: time savings now show **net** savings (after subtracting oversight) instead of gross savings
- **AGENTS.md minimised**: stripped governance stages, deliverables, evaluations, stakeholders, risk ratings, effort estimates, TRL, and project metadata; output now contains only title, objective, requirements with acceptance criteria, tech approach, data sources, and constraints — roughly 60% fewer tokens
- AGENTS.md header includes canvas semantic version as a target-version instruction for the agent

### Fixed
- Benefits modal no longer closes on backdrop click or click-release outside the modal area, preventing accidental data loss
- **AGENTS.md compliance rendering**: structured compliance standards (objects with framework/clauses/uri) no longer render as `[object Object]`

## [0.12.3]

### Added
- Model Card URI field on task feasibility — link to model card documentation; RO-Crate export: `schema:SoftwareApplication` with `schema:url`, step linked via `aac:model` and `prov:used`
- Dataset Sheet URI field on datasets — link to FAIR dataset sheet / landing page; RO-Crate export: `dcat:landingPage` (import still accepts legacy `schema:url`)

## [0.12.2] - 2026-02-15

### Added
- AI-ready `AGENTS.md` included in every RO-Crate export: translates the canvas specification (requirements, technical approach, data constraints, governance checkpoints) into structured instructions for AI coding agents

## [0.12.0] - 2026-02-11

### Changed
- RO-Crate upgraded from spec 1.1 to 1.2: `@context` and `conformsTo` bumped to `https://w3id.org/ro/crate/1.2`
- Root dataset now includes `datePublished` (MUST in RO-Crate 1.2)
- Preview file renamed from `preview.html` to `ro-crate-preview.html` per spec naming convention
- Preview entity no longer added to root dataset `hasPart` (SHOULD NOT per 1.2); uses `about` back-reference instead
- README slimmed down: Standards Compliance and Schema Profile sections replaced with links to spec docs; broken links to `IMPLEMENTATION_PLAN.md` and `docs/ARCHITECTURE.md` removed
- RO-Crate version number consolidated to single source of truth in `docs/spec/index.md`; removed from 10+ other doc locations to prevent drift
- `docs/mapping.md`: Developer Feasibility section updated to reflect embedded `aac:developerFeasibility` (was incorrectly documenting the removed separate-file approach)
- Example docs (`minimal.md`, `complete.md`) trimmed: deduplicated validation snippets and two-format explanations into links

### Added
- Configurable `license` field on `ProjectDefinition`; when set, generates a license contextual entity in the RO-Crate graph

### Removed
- Deprecated `requirement.stakeholder` (singular string) field from schema — use `requirement.stakeholders` (array of Person IDs) instead
- Legacy `userExpectations.stakeholders` project-level array from schema, types, export, and import — stakeholders are now per-task only
- Legacy stakeholder import/export code paths and validation logic

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
