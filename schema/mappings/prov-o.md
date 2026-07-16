# PROV-O and P-Plan Mappings

This document describes how Agentic Automation Canvas fields map to W3C PROV-O (Provenance Ontology) and P-Plan (Plan Ontology).

## User Expectations & Requirements

User expectations are represented as `prov:Plan` entities using P-Plan extensions:

### P-Plan Structure

| Canvas Field | P-Plan Property | Type | Description |
|-------------|----------------|------|-------------|
| requirement | `p-plan:Step` | Entity | Individual requirement/step |
| user story | `dct:description` | Literal | User story text |
| priority | Custom property | Literal | Requirement priority |
| status | Custom property | Literal | Implementation status |
| stakeholder | `prov:wasAssociatedWith` | Agent | Associated stakeholder |

### Example Structure

```json
{
  "@type": ["prov:Plan", "p-plan:Plan"],
  "@id": "#user-expectations-plan",
  "dct:description": "User expectations for the automation",
  "p-plan:hasStep": [
    {
      "@id": "#requirement-1",
      "@type": "p-plan:Step",
      "dct:description": "As a user, I want...",
      "priority": "high"
    }
  ]
}
```

## Task-Level Data Access

Tasks declare which datasets they use and what the agent may do with them. Links
are exported both as a machine-readable blob (`aac:dataAccess`) and as PROV
usage relations from the step to the referenced `dcat:Dataset` entities:

| Canvas Field | Property | Type | Description |
|-------------|----------------|------|-------------|
| task ↔ dataset link | `prov:used` | Entity | Step references each linked dataset (and the model card, if set) |
| dataset links + agent actions | `aac:dataAccess` | Blob | `datasetLinks[]` with `datasetId`, `agentActions` (read / modify / process / generate), `notes` |

### Example Structure

```json
{
  "@id": "#task-deid",
  "@type": "p-plan:Step",
  "prov:used": { "@id": "#ds-letters" },
  "aac:dataAccess": {
    "datasetLinks": [
      { "datasetId": "ds-letters", "agentActions": ["read", "process", "generate"] }
    ]
  }
}
```

Dataset crate `@id`s preserve the canvas dataset id where it forms a valid,
unique fragment; other datasets get a unique `#dataset-<n>` id, and the blob's
`datasetId`s are rewritten to match the emitted `@id`s. Either way, task-level
links remain resolvable after export → import roundtrips.

## Governance & Staging

Governance stages are represented as `prov:Activity` entities:

### PROV-O Activity Properties

| Canvas Field | PROV-O Property | Type | Description |
|-------------|----------------|------|-------------|
| stage name | `dct:title` | Literal | Stage name |
| start time | `prov:startedAtTime` | DateTime | Stage start |
| end time | `prov:endedAtTime` | DateTime | Stage end |
| agent | `prov:wasAssociatedWith` | Agent | Responsible agent |
| plan | `prov:hadPlan` | Plan | Stage plan/milestones |
| informed by | `prov:wasInformedBy` | Activity | Previous stage |

### Example Structure

```json
{
  "@type": "prov:Activity",
  "@id": "#stage-development",
  "dct:title": "Development",
  "prov:startedAtTime": "2025-02-01T00:00:00Z",
  "prov:wasAssociatedWith": {
    "@id": "#developer-1",
    "@type": "prov:Person"
  },
  "prov:wasInformedBy": {
    "@id": "#stage-design"
  }
}
```

## Outcomes

Outcomes link to activities via `prov:wasGeneratedBy`:

```json
{
  "@type": "prov:Entity",
  "@id": "#outcome-1",
  "dct:title": "Final Report",
  "prov:wasGeneratedBy": {
    "@id": "#stage-validation"
  }
}
```

## References

- [W3C PROV-O Specification](https://www.w3.org/TR/prov-o/)
- [P-Plan Ontology](https://www.opmw.org/model/p-plan/)
