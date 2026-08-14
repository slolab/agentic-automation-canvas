# Conformance

This section defines conformance requirements, versioning policy, and deprecation procedures for the Agentic Automation Canvas specification.

## Conformance Levels

### MUST (Required)

Fields and behaviors marked as **MUST** are mandatory. Canvas data that does not include required fields or violates required constraints SHALL be considered invalid.

Examples:

- `project.title` MUST be present and non-empty
- `project.description` MUST be present and non-empty
- `persons[].id` MUST be unique within the canvas

### SHOULD (Recommended)

Fields and behaviors marked as **SHOULD** are recommended but not mandatory. Implementations SHOULD include these fields when applicable, but their absence does not invalidate the canvas.

Examples:

- `project.startDate` and `project.endDate` SHOULD be provided when known
- `project.projectStage` SHOULD be provided when known
- `persons[].orcid` SHOULD be provided for researchers
- Benefit metrics SHOULD include confidence levels and assumptions

### MAY (Optional)

Fields and behaviors marked as **MAY** are optional. Their presence or absence does not affect conformance.

Examples:

- `project.keywords` MAY be provided
- `project.fundingGrant` MAY be provided
- `persons[].affiliation` MAY be provided

## Versioning Policy

The AAC schema follows [Semantic Versioning](https://semver.org/) (SemVer) independently from application releases and per-canvas `project.version` values:

- **MAJOR** version (X.0.0): Breaking changes that are incompatible with previous versions
- **MINOR** version (0.X.0): Pre-release versions (beta/alpha), may include breaking changes
- **PATCH** version (0.0.X): Backward-compatible bug fixes and documentation updates; documented beta exceptions may add optional fields

!!! warning "Beta Versions (0.x.x)"
    Versions starting with `0.` (e.g., 0.17.1) are considered **beta releases**. During the beta phase:

    - Breaking changes may occur between minor versions (0.10 → 0.11)
    - Feedback and testing are encouraged
    - The schema structure may change before the stable 1.0.0 release
    - Migration guides will be provided for significant changes

### Major Version Changes

Major version increments indicate breaking changes:

- Removal of required fields
- Changes to field types that break existing data
- Changes to validation rules that invalidate previously valid data
- Changes to schema `$id` URIs

**Migration**: Major version changes will include migration guides and tools to help convert data from previous versions.

### Minor Version Changes After 1.0

Minor version increments add new capabilities without breaking existing implementations:

- Addition of optional fields
- Extension of controlled vocabularies
- New example files
- Enhanced documentation

**Compatibility**: After 1.0, data conforming to version X.Y.Z will also conform to version X.Y+1.0 within the same major version. During the 0.x beta, only the current schema is fully supported; non-current input is recovered best-effort with diagnostics and no lossless compatibility guarantee.

### Patch Version Changes

Patch version increments fix bugs and update documentation:

- Correction of validation rules
- Documentation clarifications
- Example corrections

**Compatibility**: Patch versions are fully backward compatible within the same minor version.

!!! note "0.17.1 Beta Patch Exception"
    Version 0.17.1 also adds optional simplified-canvas fields and an unclassified benefit
    branch. This additive change is a documented beta exception to the normal patch policy.
    It does not invalidate documents that conform to 0.17.0.

## Deprecation Policy

### Deprecation Process

1. **Announcement**: Deprecated fields or behaviors will be announced in the changelog at least one minor version before removal.

2. **Deprecation Period**: Deprecated features will remain supported for at least one major version cycle.

3. **Removal**: Deprecated features will be removed only in major version increments.

### Deprecation Indicators

Deprecated fields in the schema will be marked with:

- `deprecated: true` in JSON Schema
- Documentation noting the deprecation and migration path
- Changelog entry with deprecation notice

## Validation Conformance

A current canvas is **conformant** if:

1. It validates against the exact versioned JSON Schema declared by the document; the stable `https://w3id.org/aac/schema/aac.schema.json` URL discovers the current version
2. All MUST requirements are satisfied
3. All referenced entities exist (e.g., Person IDs referenced in stakeholders exist in the persons array)
4. All controlled vocabulary terms are valid (e.g., TRL levels, benefit types)

## Security and Privacy Considerations

### Agent Logs

Agentic systems may generate logs containing:

- User inputs and system outputs
- Intermediate processing steps
- Error messages and debugging information

**MUST**: Implement appropriate log retention and access controls.

**SHOULD**: Anonymize or pseudonymize sensitive information in logs.

**MAY**: Include log retention policies in governance documentation.

### Protected Health Information (PHI)

If the agentic system processes PHI or other sensitive personal data:

**MUST**:

- Mark datasets with `containsPersonalData: true`
- Specify appropriate sensitivity levels
- Include DUO terms for data use restrictions
- Document data protection strategies

**SHOULD**:

- Use appropriate access controls
- Implement audit logging
- Follow relevant regulations (GDPR, HIPAA, etc.)

### Data Access Rights

**SHOULD**: Specify `accessRights` for all datasets.

**SHOULD**: Include DUO terms when datasets have use restrictions.

**MAY**: Provide persistent identifiers (PIDs) for datasets.

## Extensibility

### Custom Fields

AAC schema `0.17.1` rejects undeclared properties and does not preserve them during current-model recovery. Evaluation `metrics` is the sole intentionally open dictionary for metric-specific values. New interoperable fields require a new versioned AAC schema.

### Controlled Vocabularies

Controlled vocabularies (e.g., benefit types, TRL levels) **MAY** be extended in minor versions but **MUST NOT** remove existing terms in minor versions.

## Compliance with Standards

AAC canvases exported as RO-Crates **MUST** conform to:

- RO-Crate specification
- Schema.org vocabulary usage as specified in mappings
- W3C DCAT, PROV-O, and other referenced standards

See the [schema mappings](https://github.com/slolab/agentic-automation-canvas/tree/main/schema/mappings/) for detailed compliance requirements.
