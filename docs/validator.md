# Validator

The AAC validator allows you to validate canvas files against the JSON Schema to ensure they conform to the specification.

## When Do You Need Validation?

**If you use the web form**: Validation happens automatically! The web form validates your data as you fill it out and prevents download if there are validation errors. You don't need to validate separately.

**Use the validator tool if you**:

- Work with canvas JSON files directly (not through the web form)
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

- Load the schema from `schema/canvas-schema.json`
- Find all `.json` files in `schema/examples/`
- Skip RO-Crate files (they have `@context` and `@graph` properties)
- Validate raw canvas JSON files against the schema
- Report validation errors if any are found
- Exit with code 0 if all valid, 1 if any invalid

**Note:** The examples directory contains both:

- **Canvas JSON files** (e.g., `minimal-canvas.json`, `complete-canvas.json`) - These are validated against the schema. This is the internal format used by the web form.
- **RO-Crate files** (e.g., `minimal-example.json`, `complete-example.json`) - These are skipped by the validator. RO-Crate is the packaged format you download from the web form, which follows RO-Crate 1.1 specification and is validated separately.

#### Validate a Specific File

To validate a specific canvas file, you can use Python directly:

```python
import json
import jsonschema
from jsonschema import validate

# Load schema
with open('schema/canvas-schema.json', 'r') as f:
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
- If you downloaded an RO-Crate from the web form, you don't need to validate it separately—the web form already validated the data before export.
- Use canvas JSON validation when working with canvas data programmatically or validating examples.

### Integration with CI/CD

The validator is designed to be used in CI/CD pipelines. Example GitHub Actions step:

```yaml
- name: Validate examples
  run: python tools/validate-examples.py
```

The script exits with code 1 if validation fails, causing the CI build to fail.

## Validation Rules

The validator checks:

1. **Schema Compliance**: All fields conform to the JSON Schema definition
2. **Required Fields**: All mandatory fields are present
3. **Type Checking**: Field types match schema definitions
4. **Constraints**: Enum values, patterns, min/max constraints are satisfied
5. **References**: Referenced entities exist (e.g., Person IDs in stakeholders)

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

### Invalid Reference

```
Error: Person ID 'person-999' referenced in stakeholder but not found in persons array
```

**Solution**: Ensure all referenced Person IDs exist in the `persons` array.

## Browser Validator (Future)

A browser-based validator UI is planned for future releases. This will allow validation directly in the web browser without requiring local tools.

## Schema Location

The validator uses the canonical schema at:

`https://w3id.org/aac/schema/aac.schema.json`

For local validation, it uses `schema/canvas-schema.json` from the repository.

## When Validation Happens

### In the Web Form

The web form validates automatically:

- **Real-time validation**: As you fill out the form, fields are validated
- **Download protection**: The "Download RO-Crate" button is disabled if there are validation errors
- **Pre-download check**: Before generating the RO-Crate, the form runs comprehensive validation and blocks export if critical errors are found
- **Warnings**: Non-critical issues show warnings but allow export (with user confirmation)

**Result**: If you successfully download an RO-Crate from the web form, it's already validated and conforms to the schema.

### With the Validator Tool

Use the validator tool when:

- You have canvas JSON files created outside the web form
- You're building tools that process canvas data
- You want to validate examples or test data
- You need CI/CD validation

## Getting Help

If you encounter validation errors:

1. **Using the web form**: Check the validation messages shown in the form. The form will highlight fields with errors.
2. **Using the validator tool**: 
   - Check the [schema reference](reference/index.md) for field requirements
   - Review the [examples](examples/index.md) for usage patterns
   - Consult the [specification](spec/index.md) for detailed semantics
3. **Still stuck?**: Open an issue on [GitHub](https://github.com/slolab/agentic-automation-canvas/issues) for support
