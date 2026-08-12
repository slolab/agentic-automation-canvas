# Spec: AAC Schema as the Single Source of Truth

**Intent:** Make the versioned AAC JSON Schema the sole definition of canvas data so schema changes propagate mechanically through validation, TypeScript, the UI, and RO-Crate conversion without silent drift or data loss.

## Problem

The released JSON Schema and the handwritten TypeScript model describe different AAC contracts. Current RO-Crate conversion also omits supported data, while the exported schema version follows the application version instead of an independent data-contract version. Developers must therefore synchronize several representations manually, allowing incompatible shapes, incomplete conversions, and misleading version claims to pass review.

## Success Criteria

| # | Criterion | Verified by |
|---|-----------|-------------|
| 1 | Released AAC schemas SHALL remain immutable published artifacts, and the current schema SHALL be identified as `0.17.1`. The AAC schema version SHALL be independent of the application version, RO-Crate specification version, RO-Crate profile version, and per-canvas `project.version`. Only the selected current schema is a fully supported runtime contract. | Inspect the versioned artifacts and current manifest selection; change the application version and verify that the declared AAC schema version does not change. |
| 2 | The `0.17.1` schema SHALL preserve the complete `0.17.0` AAC model and add only the approved simplified-canvas fields, including project problem context, lightweight solution and feasibility choices, and unclassified benefits. | Validate representative complete-canvas fixtures and compare every current AAC field against the schema. |
| 3 | WHEN the schema-derived TypeScript command runs, it SHALL deterministically produce all AAC domain types from the selected versioned JSON Schema. No handwritten interface, type alias, enum, or parallel model SHALL restate a schema-defined AAC entity or field. | Run generation twice and compare byte-for-byte output; repository search and type-check confirm that AAC domain definitions originate from generated output. |
| 4 | WHEN generated TypeScript output is stale or a consumer references a field absent from the schema, the repository's automated checks SHALL fail. | Modify a schema field without refreshing generated output and observe a failing check; reference a nonexistent field from a typed consumer and observe a failing type-check. |
| 5 | UI data access, runtime-validation integration, recovery logic, and RO-Crate conversion SHALL use schema-generated AAC types wherever generated types can express the contract. Handwritten UI configuration is permitted only as a rare, documented exception when the required presentation behavior cannot be expressed otherwise; every such configuration SHALL remain strongly keyed to generated types so an unknown AAC field fails type-checking. | Type-check representative UI, validation, recovery, and conversion code; introduce an unknown UI field and observe failure; inspect each handwritten UI exception for an explanation of why generated types are insufficient. |
| 6 | Current-version persisted and conformant exports SHALL be validated at runtime against the `0.17.1` JSON Schema. Validation findings SHALL be available as structured diagnostics for both logging and user-visible display, without a separately maintained structural validator becoming authoritative. | Exercise valid and invalid `0.17.1` fixtures at every persistence and export boundary; assert schema-derived diagnostics and their logged and displayed forms. |
| 7 | WHEN a crate declares a non-current, missing, or unknown AAC schema/profile, the tool SHALL use the same version-independent best-effort import path, warn about the mismatch, report incompatible values, and open every safely recoverable current-model value instead of blocking. Undeclared or structurally unsafe values may be omitted or defaulted. Historical versions have no lossless compatibility guarantee. | Import current, missing-version, representative old-version, future-version, malformed, and extension-bearing fixtures; assert visible and logged diagnostics plus successful viewing of recoverable content. |
| 8 | RO-Crate import and conformant export SHALL consume the generated current AAC model, declare exact current AAC schema and profile versions independently of the app version, and preserve every supported field through a current-version round trip, including `leadOrganization` and evaluation `metrics`. | Round-trip a complete `0.17.1` fixture through the public import/export APIs and compare all supported values; validate exporter output against the current profile. |

## Non-Goals

- Adding or implementing any proposed v2 field or simplified landing-page behavior.
- Guaranteeing lossless or version-specific imports for any historical AAC schema.
- Exporting historical AAC schema versions; exports use the current schema.
- Preserving undeclared or custom extension properties.
- Upgrading the JSON Schema dialect or the underlying RO-Crate specification in this change.
- Eliminating handwritten semantic behavior that cannot be derived from structural schema types, including recovery normalizers and AAC-to-RO-Crate meaning mappings.

## Constraints

- JSON Schema remains the runtime and structural source of truth; generated TypeScript types do not replace runtime validation.
- Import diagnostics must never prevent users from viewing data that can be recovered safely.
- Current `0.17.1` data rejects undeclared properties.
- Historical, missing, and unknown schema versions share one non-blocking best-effort recovery path.

## Trade-off Priorities

Schema fidelity and recoverable user data > automated drift prevention > maintainability > best-effort historical import quality > speculative extensibility.

## Known Unknowns

- Historical files may rely on undocumented shapes created by earlier application models. The importer recovers only unambiguous current-model values and reports what it cannot safely retain; a dedicated version adapter is justified only by a concrete fixture that cannot be handled generically.
- Some presentation behavior may not be expressible through generated types alone. The builder first exhausts generated, strongly typed representations; escalate before introducing a handwritten UI configuration that duplicates AAC field structure.
- Some RO-Crate statements may not map losslessly to AAC fields. The builder preserves unambiguous supported values and diagnostics; escalate before discarding or inventing ambiguous AAC meaning.
