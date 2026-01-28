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
