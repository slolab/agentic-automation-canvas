# Spec: Agentic Automation Canvas v2 Framework

**Intent:** AAC v2 gives an expert facilitator and a client team one lightweight conversation surface for establishing the current work and problem, desired change, credible solutions, development reality, evidence of value, and a bounded MVP brief.

## Problem

AAC v1 combines a flexible consulting framework with a rigid data standard. Its interconnected sections, completion logic, validation, and detailed metadata turn early discovery into form completion. Teams with limited AI and software-engineering experience need a simpler way to build a shared project foundation with an AI developer. The separate v2 experiment must prove this approach in real consulting sessions without changing or replacing v1.

## Success Criteria

| # | Criterion | Verified by |
|---|---|---|
| 1 | WHEN a user opens `/v2`, the system SHALL present AAC v2 independently, while the existing route, v1 workflow, stored work, imports, and exports remain unchanged. | Side-by-side regression demo of v1 and v2; existing automated checks pass. |
| 2 | AAC v2 SHALL expose all major areas together in one desktop overview, use no more than 22 primary thinking prompts, and express those prompts as plain questions rather than schema terms or field labels. | Review at 1440×900; count primary prompts; content audit of every prompt. |
| 3 | WHEN participants skip a question, they SHALL remain able to use and export the canvas. AAC v2 SHALL NOT classify answers by certainty, assign gaps, calculate completion, enforce an answer order, or turn missing content into validation errors. | Reproducible demo using a deliberately incomplete canvas; absence audit for excluded mechanics. |
| 4 | A completed session artifact SHALL capture a concise project description, named users, a recent real case, an evidenced problem, the desired change and reason to act, explicit trade-offs and non-negotiables, prior attempts and their results, user-proposed and expert-identified solutions, user-provided data/access/legal/delivery constraints, committed owners, required organizational changes, intended scientific value, decision-grade metrics, a bounded MVP scope, user stories, a concrete user–developer collaboration setup, unresolved pre-build questions or blockers, and a measurable condition for stopping or reshaping the build. | Content audit against a representative completed session artifact. |
| 5 | AAC v2 SHALL place user needs and developer feasibility in the same artifact so that both sides can contribute and disagreements remain visible without forcing resolution. | Demo fixture containing a user request that the developer considers infeasible or materially constrained. |
| 6 | WHEN participants consider automation, AAC v2 SHALL make them consider the simplest credible alternative, including a person, existing tool, script, or trained model. WHEN they record a time-saving benefit, the documented benefit SHALL account for human review or oversight and state the net saving. | Completed example covering a non-agent alternative and a time calculation with review effort deducted. |
| 7 | WHEN a user exports any partial or completed v2 canvas, the result SHALL be a valid, version-identified RO-Crate whose human-readable content communicates the project foundation. WHEN that v2 export is reopened, its framework content SHALL survive without material loss. | Validation of partial and completed exports; export–reopen–export comparison. |
| 8 | In at least two of the first three facilitated consulting sessions, the team SHALL complete the session within 45 minutes and leave with the outputs in criterion 4, without using v1’s advanced sections. | Timed session record and artifact audit for each of the first three sessions. |

## Non-Goals

- Producing a detailed implementation backlog or approving an MVP for development while recorded blockers remain unresolved
- Producing an implementation architecture or production-ready technical specification
- Assessing production or deployment readiness
- Modifying, replacing, migrating, or maintaining compatibility with v1
- Structured certainty states, automated gap logs, gap ownership, or due dates
- Conditional workflows, completion scoring, or validation-led interaction
- Detailed TRL, DUO, Policy Card, governance, portfolio, or outcome-tracking workflows
- Real-time multi-user editing
- Proving self-service use
- Shipping an AI facilitator, ChatGPT/Claude skill, or equivalent integration

## Constraints

- A facilitated session has a 45-minute budget.
- The canvas contains no more than 22 primary thinking prompts.
- All major areas remain visible together in one desktop overview; answering may expand or scroll without moving participants into disconnected sections.
- V1 behavior and artifacts remain unchanged.
- V2 requires no v1 import, export, or schema compatibility.
- Every v2 export identifies the framework version used to create it.
- RO-Crate remains the portable export format, but the framework process takes priority over metadata richness.

## Trade-off Priorities

Actionable consulting outcome > honest gaps > low cognitive load > future self-service clarity > RO-Crate richness > comprehensiveness.

## Known Unknowns

- The final wording and ordering of prompts will emerge from facilitated sessions. The builder may improve wording within the 22-prompt budget; adding or removing a subject area requires approval from the framework owner.
- Whether 45 minutes and 22 prompts work across different teams will emerge from the first three sessions. Escalate if fewer than two sessions meet criterion 8.
- Whether teams can use AAC v2 without an expert facilitator remains untested. Defer self-service requirements to a later specification.
- The depth of RO-Crate semantics needed beyond valid export and lossless v2 reopening remains unknown. The builder decides, favoring simplicity.
