# Spec: AAC Simplified Landing Page

**Intent:** Give project proponents a minimal, visual, risk-first entry into the Agentic Automation Canvas so they can recognize unjustified agentic projects before committing resources, while preserving one structured project artifact shared with the full canvas.

## Problem

People proposing agentic applications are not generally experts in agentic-system feasibility and failure modes. Even a well-explained full canvas cannot prevent vague, incomplete, or incorrectly interpreted answers without expert facilitation. The current expert-led process does not scale, while an unstructured simplification loses the checklist and structured evidence needed for later evaluation.

## Success Criteria

| # | Criterion | Verified by |
|---|---|---|
| 1 | WHEN a user opens AAC, the system SHALL present a simplified visual framework containing the risk-critical questions selected from Vlad's consulting experience. | Content audit against the approved simplified framework and a facilitated scenario walkthrough. |
| 2 | The simplified framework SHALL prioritize evidence that can change a build/no-build decision, including whether the proposed application has sufficient benefit and justification. | Audit each prompt against a documented decision risk; a completed negative example supports a "do not build" conclusion. |
| 3 | Every simplified-framework response SHALL belong to the same canonical AAC specification and project artifact as the full canvas. | Export inspection confirms that simplified and full data occupy one versioned specification and one RO-Crate. |
| 4 | WHEN a user moves between simplified and full representations, the system SHALL retain the same project artifact without requiring a separate canvas or conversion before viewing it. | Reproducible simple-full-simple round trip using one project and one RO-Crate. |
| 5 | WHEN the simplified framework does not address areas covered by the full canvas, the system SHALL make those omissions visible and SHALL NOT represent simplified completion as semantic completeness. | Demo with an intentionally partial simplified canvas; omitted full-canvas areas remain identifiable. |
| 6 | User-provided content SHALL remain authoritative. The application may surface changes or inconsistencies but SHALL NOT claim to guarantee semantic agreement between simplified and detailed descriptions. | Edit conflicting descriptions in both representations and verify that neither is silently treated as authoritative or automatically reconciled. |
| 7 | The review deliverable SHALL include the landing-page framework, its fields, and one minimal project example viewable in both simplified and full representations. | PR content audit followed by Sebastian and Peyman's review. |

## Non-Goals
- Selecting or deploying an LLM, skill, chatbot, or AI provider
- Embedding an LLM-powered consultant in the landing page
- Defining how simplified content is transformed into detailed content
- Automatically generating follow-up questions
- Guaranteeing semantic consistency between representations
- Proving broad adoption or production-market fit
- Completing the planned scientific comparison between a baseline LLM and the canvas-assisted process
- Redesigning every detailed field in the full canvas

## Constraints
- Keep the landing-page minimal and acessible. High quality UI/UX — explicitly validated in the browser.
- Preserve one AAC specification, one web application, and one RO-Crate per project.
- Base the initial simplified framework on Vlad's recorded consulting experience.
- minimal edits to the original AAC specification.

## Trade-off Priorities
Preventing unjustified agentic projects > all other goals.
Accessibility > completeness.

## How to Test:
Besides scripted unit tests, always test in-browser with the following viewer settings:
- fullhd 16/9 view
- 4k, 16/9 view
- 4k, half-screen view (8/9)

# Implementation:

The simplified canvas is a single-screen, two-dimensional view over the canonical AAC schema, arranged as three regions across the top and two across the bottom. It does not store a separate answer per question. A row that maps to several schema properties represents one structured input group backed by those properties.

All multiline text fields show three rows before their content scrolls. In the Problem region, “Who experiences this problem?” and “How often do you experience this problem?” are stacked vertically rather than sharing a row.

Checkbox lists may offer recommended values without turning those suggestions into schema vocabularies. Both potential approaches and constraint flags remain arrays of non-empty free-text strings in the canonical schema. Selecting `Other` enables custom tag entry. Clearing `Other` preserves existing custom tags but disables and grays the tag list until `Other` is selected again.

Two schema-required parent objects are managed automatically. The simplified canvas reuses the first requirement and governance stage when they exist. When no requirement exists, it creates one whose generated `id` is duplicated into `title` and whose `benefits` starts empty. When no governance stage exists, it creates a generated stage named `Planning`. These technical parent values are not presented as user-authored content.

## Canvas Header

The project title sits above the canvas and remains visible across all sections.

| Field in the simplified canvas | Type | Schema mapping | Status |
|---|---|---|---|
| Project title | Short text | `project.title` | Reused |

## 1. Problem

This section establishes the problem before discussing a change or solution. It must capture a concrete recent case, not only an abstract process description.

| Field in the simplified canvas | Type | Schema mapping | Status |
|---|---|---|---|
| Problem description | Long free text | `project.description` | Reused |
| Who experiences this problem? | Short free text | `userExpectations.requirements[].targetPopulation` | Reused |
| How often do you experience this problem? | Select: daily, weekly, monthly, a few times per year, or less than once per year | `project.problemFrequency` | New — `volumePerMonth` cannot represent these ranges without inventing precision and currently rejects values below one |
| Examples of the problem | Repeatable long free text; the simplified canvas initially requests one item | `project.problemExamples[]` | New — proposed for schema `0.17.1` |

## 2. Change and Value

This section asks for the desired change, why it matters now, expected benefits, and evidence of success. Benefit and metric entry stays lightweight: typing a value and pressing Enter creates a separate item that can be classified and quantified later in the full canvas.

| Field in the simplified canvas | Type | Schema mapping | Status |
|---|---|---|---|
| What should happen differently? | Long free text | `project.objective` | Reused |
| Why is this important right now? | Long free text | `project.headlineValue` | Reused |
| What benefits do you expect? | Tag-entry free text; Enter creates one benefit item | `userExpectations.requirements[].benefits[]` with `benefitType: "unclassified"` and a free-form `description` | Extended — add the `unclassified` benefit type and allow description-only benefit entries |
| How will you know the change worked? | Tag-entry free text; Enter creates one metric item | `userExpectations.requirements[].benefits[]` with `benefitType: "unclassified"` and `metricLabel` | Extended — an unclassified metric may start with a label and receive baseline, expected value, unit, and direction later |

## 3. Solutions

This section records prior attempts, potential agentic use-case patterns, and tools or existing solutions that require research. The question **“Why do you believe a better solution is possible now?”** and detailed model, algorithm, and agent-framework questions are dropped.

| Field in the simplified canvas | Type | Schema mapping | Status |
|---|---|---|---|
| What has already been tried, and what happened? | Long free text | `developerFeasibility.feasibilityNotes` | Reused |
| Potential Approaches | Multi-select suggestions: agentic user support; unstructured document or log processing; code development; computer use; live-event monitoring; intelligent search; research support; data and metadata curation; analysis-pipeline orchestration; experiment or protocol design; simulation or parameter optimization; laboratory workflow coordination; or other | `userExpectations.requirements[].feasibility.technologyApproach.approaches[]` | New — `approaches[]` is free text, not a schema enum; the existing `architecture` field remains available separately for later technical design |
| Other Potential Approaches | Tag-entry free text, enabled when `Other` is selected and retained in a disabled gray state when it is deselected | `userExpectations.requirements[].feasibility.technologyApproach.customApproaches[]` | New — custom items remain editable without overloading tool or architecture fields |
| Tools or existing solutions (to research) | Long free text | `developerFeasibility.solutionsToResearch` | New — preserves open-ended research notes without forcing them into a structured tool list |

## 4. Development Reality

This section uses a lightweight checklist to identify constraints that require deeper investigation in the full canvas, followed by a small team-readiness probe. A checked item records that the constraint applies; it does not claim that the corresponding detailed risk, dataset, or mitigation assessment is complete.

| Field in the simplified canvas | Type | Schema mapping | Status |
|---|---|---|---|
| My data is large, above 100 GB | Checkbox | `developerFeasibility.constraintFlags[] = "large-data"` | New |
| The workload requires high CPU capacity or cluster execution | Checkbox | `developerFeasibility.constraintFlags[] = "cluster-compute"` | New |
| The workload requires a GPU with more than 8 GB VRAM | Checkbox | `developerFeasibility.constraintFlags[] = "large-gpu"` | New |
| The data contains personal or GDPR-sensitive information | Checkbox | `developerFeasibility.constraintFlags[] = "personal-data"` | New — detailed datasets later use `dataAccess.datasets[].containsPersonalData` |
| The project handles valuable or confidential intellectual property | Checkbox | `developerFeasibility.constraintFlags[] = "valuable-ip"` | New |
| The solution must connect to external systems, APIs, identities, or credentials | Checkbox | `developerFeasibility.constraintFlags[] = "external-system-integration"` | New |
| Cloud or external processing is restricted by network, residency, or security policy | Checkbox | `developerFeasibility.constraintFlags[] = "restricted-processing-environment"` | New |
| The solution has strict real-time or latency requirements | Checkbox | `developerFeasibility.constraintFlags[] = "real-time"` | New |
| The output affects regulated, safety-critical, or high-impact decisions | Checkbox | `developerFeasibility.constraintFlags[] = "regulated-or-high-impact"` | New |
| Procurement, licensing, or external-provider approval may block delivery | Checkbox | `developerFeasibility.constraintFlags[] = "procurement-or-licensing"` | New |
| Other constraints | Checkbox plus tag-entry free text; custom tags are retained in a disabled gray state when `Other` is deselected | `developerFeasibility.constraintFlags[]` | New — `constraintFlags[]` is free text, not a schema enum; checkbox values are UI suggestions |
| Is a person or team available to build it? | Select: no, possible but uncommitted, or committed | `governance.buildTeamStatus` | New |
| Is a person or team available to maintain it long-term? | Select: no, possible but uncommitted, or committed | `governance.maintenanceOwnerStatus` | New |

## 5. First Milestone

This section replaces the separate MVP concept with one bounded, testable milestone plus the minimum first-stage governance needed to plan it. It does not restate the problem, workflow, or desired change captured in earlier sections.

| Field in the simplified canvas | Type | Schema mapping | Status |
|---|---|---|---|
| What is the first milestone? | Three-line free text | `governance.stages[0].milestones[0].description` | Reused — the first stage is reused or created as `Planning` |
| How will we know the milestone is complete? | Three-line free text | `governance.stages[0].milestones[0].kpi` | Reused — the first stage is reused or created as `Planning` |
| When can this stage begin? | Date | `governance.stages[0].startDate` | Reused |
| Target date for this stage | Date | `governance.stages[0].endDate` | Reused |

## Automatic Parent Records

- The first simplified requirement is created lazily as `{ id, title: id, benefits: [] }`. Later detailed requirements are never replaced.
- The first governance stage is created lazily as `{ id, name: "Planning" }`. Existing first stages, later stages, and later milestones are preserved.
