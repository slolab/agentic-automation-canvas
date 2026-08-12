# Spec: AAC Landing Page UI/UX Redesign

**Intent:** Make the Simplified Canvas the focused, self-guided entry to AAC while keeping detailed capabilities, guidance, and project controls discoverable without competing for attention.

## Problem

The application shell must keep the simplified workflow visually primary while making its view controls, export behavior, documentation, and project context immediately understandable. Advanced navigation, ambiguous controls, or unexplained export requirements can prevent non-experts from using the canvas as intended.

## Success Criteria

| # | Criterion | Verified by |
|---|---|---|
| 1 | WHEN AAC opens, the landing page SHALL show a compact sticky header containing the AAC identity and a general-information icon immediately beside the title. The information panel SHALL explain AAC's purpose, shared user–developer workflow, views, privacy, and export format. | Empty-state browser audit; content and keyboard audit of the information action and panel. |
| 2 | The right-hand header controls SHALL show Show Example and Import RO-Crate while the canvas is completely empty. Download RO-Crate SHALL be hidden in that state. Once meaningful content exists, Show Example and Import SHALL be replaced by Clear Canvas and Download RO-Crate; Download SHALL remain available even when the project title is blank. | Reproducible empty → answer without title → export → clear sequence. |
| 3 | WHEN AAC opens, the Simplified Canvas SHALL be active and detailed-section navigation SHALL be hidden behind a two-choice “Simplified” / “Advanced” segmented control in the header. The selected view SHALL be visually and programmatically explicit. Selecting Advanced SHALL reveal the existing detailed-section navigation directly beneath the header; selecting Simplified SHALL return to the simplified canvas. The control SHALL NOT add a separate badge or dot for advanced-only content. | New, partially completed, and imported-canvas walkthroughs; simplified–advanced–simplified round trip confirms no data loss. |
| 4 | The Simplified Canvas SHALL show no completion percentage or progress bar. The Advanced view SHALL show its existing completion percentage without a progress bar. This redesign SHALL NOT change the completion calculation. | Visual audit in both views; percentage comparison before and after the redesign using the same fixture. |
| 5 | WHEN Download RO-Crate is activated and simplified prompts remain unanswered, the system SHALL highlight those prompts and warn that the artifact is partial. The warning SHALL let the user continue editing or export anyway. Choosing Export anyway SHALL complete the partial export without displaying a second native-browser validation confirmation. After a successful export, the missing-prompt highlights SHALL be cleared. A canvas with meaningful content but no title SHALL export with a safe fallback name as a clearly marked partial RO-Crate that does not claim AAC profile conformance. | Export walkthroughs with an untouched canvas, untitled partial canvas, title-only canvas, and completed simplified canvas; confirm a single confirmation step, highlights clear after export, and exported user content survives reopening. |
| 6 | The AAC title and each of the five simplified sections SHALL provide an information control that opens brief guidance in a right-hand sidebar. Guidance SHALL cover: AAC purpose and workflow; grounding the Problem in a real case; defining Change and Value with evidence; comparing Solutions with prior attempts and simpler alternatives; checking Development Reality across data, constraints, and ownership; and bounding the First Milestone with observable completion evidence. | Content audit plus keyboard walkthrough of every information control. |
| 7 | The sticky header, progressive navigation, dynamic actions, highlighted omissions, and guidance sidebar SHALL remain readable and operable without overlap, clipped controls, or page-level horizontal scrolling at Full HD 16:9, 4K 16:9, and 4K half-screen 8:9. Every control SHALL have an accessible name, visible keyboard focus, and keyboard operation; closing guidance SHALL return focus to its trigger. | Browser walkthrough at all required viewports; keyboard-only audit; automated and manual WCAG 2.1 AA checks. |
| 8 | A non-sticky footer SHALL restore links to the documentation, GitHub, the HTML manuscript and arXiv paper, plus the linked slolab identity and visible application version. Paper links SHALL live in the footer rather than the compact header. | Link-target audit and page-scroll check confirming the footer participates in normal document flow. |
| 9 | The empty-canvas header state SHALL show only Show Example and Import RO-Crate, without animated glow or pulse effects. Once meaningful content exists, those actions SHALL be replaced by Clear Canvas and Download RO-Crate. | Empty and populated header visual audit, including reduced-motion and narrow-width checks. |

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
- Keep the footer in normal document flow; it must not obscure canvas content or remain fixed while scrolling.

## Trade-off Priorities

First-use clarity > preservation and discoverability of project data > accessibility > advanced-feature immediacy > persistent action visibility > visual decoration.

## Known Unknowns

- Blank and title-only exports are explicitly partial and do not claim current AAC profile conformance.
- Final sidebar wording — builder may adapt the former `/v2` guidance within the required topics; escalate changes to its meaning.
- Whether first-time users discover the Advanced view and guidance without prompting — evaluate after release; formal usability testing is not a release gate.
