# Validator

The AAC validator allows you to validate canvas files against the JSON Schema to ensure they conform to the specification.

## Schema Source of Truth

Released AAC contracts live in immutable directories under
`schema/versions/<version>/`. `schema/manifest.json` selects the current JSON Schema and
RO-Crate profile. The root-level `schema/canvas-schema.json` and
`schema/rocrate-profile.json` files are generated aliases for that selection; they are
convenient current-version entry points, not files to edit manually.

The application contract is generated from the same source. In particular,
`src/types/canvas.ts` contains generated TypeScript types and must not be edited by hand.
Use these commands when working on the schema or schema-dependent code:

```bash
npm run schema:generate  # regenerate current aliases, types, and contract constants
npm run schema:check     # fail if committed generated artifacts have drifted
npm run typecheck        # check application and UI logic against generated types
```

`npm run build` runs the drift check and type-check before building.

## When Do You Need Validation?

**If you use the web canvas**: Validation and simplified-prompt checks happen automatically. A normal export is validated strictly against the current schema. If required simplified prompts are unanswered, the canvas can also be exported explicitly as a partial draft after confirmation. Partial exports are marked as such and do not claim conformance to the current AAC RO-Crate profile.

**Use the validator tool if you**:

- Work with canvas JSON files directly (not through the web canvas)
- Build integrations or tools that process canvas data
- Want to validate examples or test data
- Set up CI/CD pipelines to validate canvas files
- Need programmatic validation in your own tools

## CLI Validator

The command-line validator is the primary validation tool, suitable for CI/CD pipelines, local development, and programmatic validation.

### Installation

The validator requires Python 3.8+ and uses `uv` for dependency management. Install dependencies:

```bash
uv sync
```

Or install jsonschema directly:

```bash
uv pip install jsonschema
```

### Usage

#### Validate All Examples

Validate all example files in `schema/examples/`:

```bash
uv run python tools/validate-examples.py
```

This will:

- Load the generated current alias from `schema/canvas-schema.json`
- Find all `.json` files in `schema/examples/`
- Skip RO-Crate files (they have `@context` and `@graph` properties)
- Validate raw canvas JSON files against the schema
- Report validation errors if any are found
- Exit with code 0 if all valid, 1 if any invalid

**Note:** The examples directory contains both:

- **Canvas JSON files** (e.g., `minimal-canvas.json`, `complete-canvas.json`) - These are validated against the schema. This is the internal format used by the web canvas.
- **RO-Crate files** (e.g., `minimal-example.json`, `complete-example.json`) - These are skipped by this canvas JSON validator. RO-Crate is the packaged download format and has a separate structural profile test in `tests/rocrate/profile.spec.ts`.

#### Validate a Specific File

To validate a specific canvas file, you can use Python directly:

```python
import json
import jsonschema
from jsonschema import validate
from pathlib import Path

# Resolve the exact current schema selected by the manifest.
schema_root = Path('schema')
with (schema_root / 'manifest.json').open() as f:
    manifest = json.load(f)
with (schema_root / manifest['currentSchema']).open() as f:
    schema = json.load(f)

# Load your canvas file (use raw canvas JSON, not RO-Crate format)
with open('schema/examples/minimal-canvas.json', 'r') as f:
    canvas_data = json.load(f)

# Validate
try:
    validate(instance=canvas_data, schema=schema)
    print("✓ Valid")
except jsonschema.ValidationError as e:
    print(f"✗ Invalid: {e.message}")
    print(f"  Path: {' -> '.join(str(p) for p in e.absolute_path)}")
```

**Note:**

- Make sure you're validating canvas JSON files (like `minimal-canvas.json`), not RO-Crate files (like `minimal-example.json`). RO-Crate files have a different structure with `@context` and `@graph` properties.
- A normal RO-Crate export has already passed current-schema validation. An explicitly marked partial export has not: finish the unanswered prompts and create a normal export before treating it as AAC-profile-conformant.
- Use canvas JSON validation when working with canvas data programmatically or validating examples.

### Integration with CI/CD

The validator is designed to be used in CI/CD pipelines. Example GitHub Actions step:

```yaml
- name: Validate examples
  run: uv run python tools/validate-examples.py
```

The script exits with code 1 if validation fails, causing the CI build to fail.

## Validation Rules

The validator checks:

1. **Schema Compliance**: All fields conform to the JSON Schema definition
2. **Required Fields**: All mandatory fields are present
3. **Type Checking**: Field types match schema definitions
4. **Constraints**: Enum values, patterns, min/max constraints are satisfied

## Common Validation Errors

### Missing Required Fields

```
Error: 'project' is a required property
```

**Solution**: Ensure all required fields are present. See the [schema reference](reference/index.md) for required fields.

### Invalid Enum Value

```
Error: 'invalid-value' is not one of ['low', 'medium', 'high', 'critical']
```

**Solution**: Use only values from the controlled vocabulary. See the schema for allowed values.

### Type Mismatch

```
Error: '123' is not of type 'number'
```

**Solution**: Ensure field types match the schema (string vs number vs boolean vs object).

### Unresolved Person reference

The JSON Schema does not express cross-references, so the command-line validator
does not check them. The web application reports them as warnings before an
export instead:

```
Warning: Stakeholder references unknown person: person-999
```

**Solution**: Ensure all referenced Person IDs exist in the `persons` array.

## Browser Validator (Future)

A browser-based validator UI is planned for future releases. This will allow validation directly in the web browser without requiring local tools.

## Schema Location

The stable current-schema URL is:

`https://w3id.org/aac/schema/aac.schema.json`

Each versioned JSON Schema also has an exact versioned `$id`. In the repository,
`schema/manifest.json` selects the exact current file under `schema/versions/`, while
`schema/canvas-schema.json` is its generated stable alias. The example validator uses
that alias and `npm run schema:check` guarantees that it matches the manifest selection.

## When Validation Happens

### In the Web Form

The web canvas validates current data automatically:

- **Real-time validation**: As you work, fields are validated
- **Download availability**: The "Download RO-Crate" button appears as soon as the canvas holds any content, and stays available when the project title is blank — the export then falls back to a safe file name and is marked partial
- **Simplified-prompt check**: If simplified prompts are unanswered, download opens a confirmation that offers either continued editing or an explicit partial export
- **Pre-download check**: A normal export runs comprehensive current-schema validation and is blocked if validation errors are found
- **Warnings**: Non-critical issues show warnings but allow export (with user confirmation)

**Result**: A normal export has passed current-schema validation and claims the current AAC RO-Crate profile. A partial export is a recoverable draft, not a conformant AAC profile artifact.

#### Partial exports

Partial export is an explicit escape hatch for saving or sharing work in progress. When any
simplified prompt remains unanswered — including the project title — the user can confirm
**Export anyway** in the unanswered-prompts dialog. A partial crate:

- sets `aac:partialCanvas` to `true` on the root dataset
- retains `aac:schemaVersion` so importers can interpret the AAC vocabulary version
- omits the current AAC profile `conformsTo` claim
- identifies itself as partial and non-conformant in its README

Partial crates remain importable on a best-effort basis. They may be incomplete or invalid
under the current canvas schema, so downstream systems must not infer AAC profile
conformance from `aac:schemaVersion` alone.

### When Importing an Older or Malformed Crate

Import is intentionally more tolerant than export. The importer detects the crate's
`aac:schemaVersion` and maps every crate through the same current-model recovery path.
Missing, non-current, and unknown versions, malformed optional entities, and recoverable
parsing failures are logged and shown as import notices. Those findings do not prevent
the canvas from opening: the tool displays whatever could be recovered. Historical
versions have no lossless or version-specific compatibility guarantee.

This tolerant behavior does not make the imported file valid under the current schema.
Before a normal, profile-conformant crate can be exported, the recovered canvas must pass
strict current-schema validation. It can instead be saved deliberately as another marked
partial draft.

### Incomplete Drafts

Reopening a saved canvas uses the same recovery path. Incomplete fields that can be
represented by the current model are retained and may be reported as unanswered or invalid
in the form. They block a normal conformant export until you complete them, but they can be
preserved in an explicitly confirmed partial export.

### With the Validator Tool

Use the validator tool when:

- You have canvas JSON files created outside the web canvas
- You're building tools that process canvas data
- You want to validate examples or test data
- You need CI/CD validation

## Getting Help

If you encounter validation errors:

1. **Using the web canvas**: Check the validation messages shown in the application. Detailed views and partial-export checks surface fields that need attention.
2. **Using the validator tool**: 
   - Check the [schema reference](reference/index.md) for field requirements
   - Review the [examples](examples/index.md) for usage patterns
   - Consult the [specification](spec/index.md) for detailed semantics
3. **Still stuck?**: Open an issue on [GitHub](https://github.com/slolab/agentic-automation-canvas/issues) for support
