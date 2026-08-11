# Spec: AAC Landing Page UI/UX Redesign

**Intent:** Make the Simplified Canvas the focused, self-guided entry to AAC while keeping detailed capabilities, guidance, and project controls discoverable without competing for attention.

## Problem

The current application shell exposes advanced tabs, completion mechanics, duplicated resource links, a fixed footer, and a placeholder chatbot before non-expert users understand the simplified workflow. These elements reduce the visual priority of the canvas and preserve the form-completion pressure that the simplified redesign intends to remove. Without a shell redesign, the new canvas content remains surrounded by the interaction model it replaces.

## Success Criteria

| # | Criterion | Verified by |
|---|---|---|
| 1 | WHEN AAC opens, the landing page SHALL show a compact sticky header containing the AAC identity and a general-information icon; a small subtitle SHALL contain “View on GitHub, Read the paper: online / arXiv.” The right side SHALL contain Show Example and a single-line, width-stable Import RO-Crate control. It SHALL NOT show a Documentation action, the former marketing subtitle, “made by slolab,” visible version, chatbot, or sticky footer. | Empty-state browser audit; text and control inventory against the approved shell. |
| 2 | The right-hand header controls SHALL have two in-place states: an empty canvas shows Show Example and Import RO-Crate; once meaningful content exists, those controls SHALL be replaced in the same position by Clear Canvas and Download RO-Crate. Clear Canvas SHALL be available, while Download RO-Crate SHALL remain disabled until the project has a non-blank title. | Reproducible empty → answer → title → clear sequence. |
| 3 | WHEN AAC opens, the Simplified Canvas SHALL be active and detailed-section navigation SHALL be hidden behind a clearly recognizable “Detailed Canvas” on/off switch in the right-hand header controls. Switching it on SHALL reveal the existing detailed-section navigation directly beneath the header, with no vertical gap; the tab strip SHALL span the viewport width while the detailed content below retains page margins. Switching it off SHALL return to the Simplified Canvas. WHEN imported content includes detailed data, the switch SHALL indicate that additional content exists. No secondary simplified/detailed navigation row or explanatory label SHALL appear above the canvas. | New, partially completed, and imported-canvas walkthroughs; simple–detailed–simple round trip confirms no data loss. |
| 4 | The Simplified Canvas SHALL show no completion percentage or progress bar. The detailed canvas SHALL show its existing completion percentage without a progress bar. This redesign SHALL NOT change the completion calculation. | Visual audit in both views; percentage comparison before and after the redesign using the same fixture. |
| 5 | WHEN Download RO-Crate is activated and simplified prompts remain unanswered, the system SHALL highlight those prompts and warn that the artifact is partial. The warning SHALL let the user continue editing or export anyway. WHEN the project title is blank, Download RO-Crate SHALL remain unavailable. | Export walkthroughs with a blank canvas, title-only canvas, partial canvas, and completed simplified canvas; exported user content survives reopening. |
| 6 | The AAC title and each of the five simplified sections SHALL provide an information control that opens brief guidance in a right-hand sidebar. Guidance SHALL cover: AAC purpose and workflow; grounding the Problem in a real case; defining Change and Value with evidence; comparing Solutions with prior attempts and simpler alternatives; checking Development Reality across data, constraints, and ownership; and bounding the First Milestone with observable completion evidence. | Content audit plus keyboard walkthrough of every information control. |
| 7 | The sticky header, progressive navigation, dynamic actions, highlighted omissions, and guidance sidebar SHALL remain readable and operable without overlap, clipped controls, or page-level horizontal scrolling at Full HD 16:9, 4K 16:9, and 4K half-screen 8:9. Every control SHALL have an accessible name, visible keyboard focus, and keyboard operation; closing guidance SHALL return focus to its trigger. | Browser walkthrough at all required viewports; keyboard-only audit; automated and manual WCAG 2.1 AA checks. |

## Non-Goals

- Redesigning fields, content, or layouts inside detailed sections
- Changing simplified-canvas questions or schema mappings
- Changing the advanced completion calculation
- Adding an AI assistant or chatbot
- Defining final guidance prose beyond the required topics
- Adding analytics or making formal usability testing a release gate
- Changing RO-Crate contents unrelated to partial-export support

## Constraints

- Preserve one AAC application, one canonical specification, and one project artifact.
- Preserve all user-provided data when moving between simplified and detailed views.
- Keep Show Example and Import RO-Crate available before a project starts.
- Keep the header visible while the user scrolls.
- Follow the repository’s WCAG 2.1 AA requirement and applicable [WAI disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) and [tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) interaction guidance.
- Remove the application version from the visible shell while retaining it in general information or documentation.

## Trade-off Priorities

First-use clarity > preservation and discoverability of project data > accessibility > advanced-feature immediacy > persistent action visibility > visual decoration.

## Known Unknowns

- A title-only partial canvas conflicts with the current AAC schema requirement for a non-empty project description. Escalate before representing such an export as schema-conformant.
- The exact indication that imported detailed data exists — builder decides, provided it is perceivable without opening the detailed canvas.
- Final sidebar wording — builder may adapt the former `/v2` guidance within the required topics; escalate changes to its meaning.
- Whether first-time users discover the Detailed Canvas and guidance without prompting — evaluate after release; formal usability testing is not a release gate.
