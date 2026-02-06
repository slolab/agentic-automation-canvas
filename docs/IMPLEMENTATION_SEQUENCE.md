# Implementation Sequence

This document records the implementation sequence for the Agentic Automation Canvas UI plan.

## Migration

- **normalizeCanvasData**: Maps old schema to new (description→title, old unitCategory→new, validates primaryValueDriver) and returns warnings.
- **Import flow**: Runs normalization after RO-Crate import; adds `migrationWarnings` to `ImportROCrateResult`.
- **useCanvasData**: Adds `lastImportMigrationWarnings`, `clearMigrationWarnings`; `importFromROCrate` accepts optional `migrationWarnings`.
- **ImportButton**: Shows migration warnings after import.
- **CanvasForm**: Adds migration-warnings banner with dismiss.
- **Legacy compatibility**: Import only what maps clearly to the new schema; drop the rest; use existing warnings for migrated/dropped items.

## Phase 1 – Quick Wins

1. **Human Oversight**: Moved from requirement level to benefit level (in benefits modal). Oversight follows aggregation basis: perUnit benefits use `oversightMinutesPerUnit`, perMonth benefits use `oversightMinutesPerMonth`. Always measured in minutes.
2. **Multiline User Stories**: User Story field changed from `<input>` to `<textarea rows="3">`.
3. **Unit Categories**: Schema, types, and UI updated to `item`, `interaction`, `computation`, `other` (migrated from case/document/record/message/meeting/analysisRun).

## Phase 2 – Core Enhancements

4. **Cost Benefit Type**: Schema and types extended with `cost`; `CostBenefitForm.vue` created; BenefitsModal has Cost tab; badges/colors in RequirementItem, Dashboard, ProjectDefinition.
5. **Task Title vs Description**: Schema and types now have `title` (required) and `description` (optional); UI split into Title (single-line) and Description (textarea); RO-Crate export/import updated; all displays use `title`; create-default and validation updated.
6. **Task Reordering**: `vue-draggable-next` added; MultiValueInput uses draggable with drag handles.
7. **LLM Technology Fields**: Schema and types extended with `llmApproach` (architecture, ragDetails, agenticDetails); new "LLM Technology Approach" card in DeveloperFeasibility with conditional RAG and agentic sections.

## Phase 3 – Dependencies

8. **Task Dependencies**: Schema and types extended with `dependsOn?: string[]`; RequirementItem has dependency section (multi-select + chips); RO-Crate export/import updated.
9. **Dependency Graph**: `dependencyGraph.ts` with `generateDependencyMermaid()` and `hasDependencies()`; mermaid added; Dashboard has "Task Dependency Graph" section that renders Mermaid.

## Phase 4 – Advanced Features

10. **Benefit–Effort Balance UI**:
    - Info box in UserExpectations explaining deployment context and benefit estimates.
    - Dynamic helper near Volume Per Month based on volume bands (<100, 100–1000, >1000).
    - (Optional) Benefit–Effort scatter chart in Dashboard – not implemented.

11. **Task-Specific Feasibility**:
    - Optional `feasibility` on requirements (technologies, effortEstimate, technicalRisk, feasibilityNotes, modelSelection, modelName, technologyApproach).
    - Collapsible "Technical Feasibility" section in RequirementItem.
    - Project-level `developerFeasibility` provides defaults that apply to all tasks unless overridden.
    - Per-task feasibility indicators in Dashboard (risk badge, effort).
    - RO-Crate export/import updated for feasibility.

## Key Paths

- Schema: `schema/canvas-schema.json`
- Types: `src/types/canvas.ts`
- Migration: `src/utils/migrate.ts`, `src/utils/import.ts`
- Components: RequirementItem, BenefitsModal, MultiValueInput, Dashboard, DeveloperFeasibility, UserExpectations
- Benefit metrics: `src/data/benefitMetrics.ts`
- Dependency graph: `src/utils/dependencyGraph.ts`
