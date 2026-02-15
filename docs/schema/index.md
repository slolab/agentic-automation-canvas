# Schema Artifacts

This section provides access to machine-readable schema artifacts for the Agentic Automation Canvas.

## JSON Schema

The canonical JSON Schema definition:

- **[aac.schema.json](https://w3id.org/aac/schema/aac.schema.json)**: Complete JSON Schema definition (available after deployment)

This schema can be used for:

- Validation of canvas data
- IDE autocomplete and type checking
- Code generation
- Integration with validation libraries

## YAML Schema

YAML representation of the schema:

- **[aac.schema.yaml](https://w3id.org/aac/schema/aac.schema.yaml)**: YAML version of the schema (available after deployment)

## Schema Version

Current schema version: **0.12.1** (Beta)

!!! warning "Beta Status"
    This schema is currently in **beta testing**. The structure and fields may change before the 1.0.0 release. 
    Feedback and testing are welcome during this phase.

The schema `$id` is: `https://w3id.org/aac/schema/aac.schema.json`

## Usage

### Validation

Validate a canvas file against the schema:

```python
import json
import jsonschema

with open('canvas.json', 'r') as f:
    canvas = json.load(f)

with open('aac.schema.json', 'r') as f:
    schema = json.load(f)

jsonschema.validate(instance=canvas, schema=schema)
```

### Programmatic Access

The schema can be loaded and used programmatically:

```python
import json
import urllib.request

schema_url = "https://w3id.org/aac/schema/aac.schema.json"
with urllib.request.urlopen(schema_url) as response:
    schema = json.load(response)

# Use schema for validation, code generation, etc.
```

## Schema Structure

The schema defines:

- **Main Properties**: Top-level canvas structure
- **Definitions**: Reusable type definitions (`$defs`)
- **Constraints**: Validation rules, enums, patterns
- **Metadata**: Descriptions, examples, format hints

See the [schema reference](../reference/index.md) for detailed documentation of all types and properties.

## Ontology Alignment

The AAC schema builds on established standards rather than reinventing common concepts. Generic fields align with well-known ontologies:

- **Schema.org**: Core properties like `title` (schema:name), `description`, `startDate`, `endDate`, `keywords`, `identifier`, `license`, `author`, etc.
- **DCAT (Data Catalog Vocabulary)**: Dataset properties like `accessRights` (dct:accessRights), data formats, and catalog metadata
- **PROV-O (Provenance Ontology)**: Provenance tracking for `startedAtTime`, `endedAtTime`, `wasAssociatedWith`, and activity relationships
- **P-Plan (Plan Ontology)**: Requirements as plan steps (`requirements` → p-plan:hasStep), milestones (`milestones` → p-plan:hasMilestone)
- **FRAPO (Funding, Research Administration & Projects Ontology)**: Research project extensions like `fundingGrant` (frapo:fundingGrant), `leadOrganization` (frapo:leadOrganization), `projectStage` (frapo:hasStatus), `deliverables` (frapo:deliverable)
- **DUO (Data Use Ontology)**: Data use restrictions via `duoTerms` (dct:conformsTo)

The [schema reference](../reference/index.md) includes an "Ontology" column indicating which standard each generic field maps to. Custom AAC-specific fields (like `projectStage`, `roughEstimateValue`, etc.) are clearly marked as such.

For detailed mapping documentation, see:

- [Schema.org mappings](https://github.com/slolab/agentic-automation-canvas/tree/main/schema/mappings/schema.org.md)
- [DCAT mappings](https://github.com/slolab/agentic-automation-canvas/tree/main/schema/mappings/dcat.md)
- [PROV-O mappings](https://github.com/slolab/agentic-automation-canvas/tree/main/schema/mappings/prov-o.md)
- [DUO mappings](https://github.com/slolab/agentic-automation-canvas/tree/main/schema/mappings/duo.md)
- [FRAPO mappings](https://github.com/slolab/agentic-automation-canvas/tree/main/schema/mappings/frapo.md)

## Versioning

The schema follows semantic versioning:

- **Major versions**: Breaking changes (incompatible)
- **Minor versions**: Additive changes (backward compatible)
- **Patch versions**: Bug fixes and documentation updates

See [Conformance](../spec/conformance.md) for versioning policy details.

## Related Resources

- [Schema Reference](../reference/index.md) - Human-readable field documentation
- [Examples](../examples/index.md) - Example canvas files
- [Validator](../validator.md) - Validation tools and usage
- [Specification](../spec/index.md) - Complete specification documentation
