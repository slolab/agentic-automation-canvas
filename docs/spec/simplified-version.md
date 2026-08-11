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

- Keep the landing-page change minimal.
- Preserve one AAC specification, one web application, and one RO-Crate per project.
- Base the initial simplified framework on Vlad's recorded consulting experience.
- The meeting target was a PR on August 11, 2026, review on August 12, and paper submission on August 14; the PR may remain open at submission.
- The paper must be able to reference the simplified framework and one example.

## Trade-off Priorities

Preventing unjustified agentic projects > all other goals.

No further ordering was established.

## Known Unknowns

- Exact landing-page questions and ordering — Vlad proposes them from interview experience; Sebastian and Peyman review.
- Whether the first version must work independently without an expert — escalate before claiming self-service success.
- How simplified content will eventually be transformed into detailed content — defer beyond the landing-page PR.
- How the "prevent 80%" goal will be measured and what qualifies as an attempt that should be prevented — define in a later evaluation specification.
- Whether the simplified view compresses detailed fields or selects a subset — escalate before extending the canonical schema.
- How much semantic duplication is acceptable — escalate if the shared-spec requirement cannot be met without contradictory content.
