# FRAPO Mappings

This document describes how Agentic Automation Canvas fields map to FRAPO (Funding, Research Administration & Projects Ontology).

## Project Definition & Context

### FRAPO Project Properties

| Canvas Field | FRAPO Term | Type | Description |
|-------------|----------------|------|-------------|
| project | `frapo:Project` | Class | Project entity |
| funding grant | `frapo:isFundedBy` | Object property | Links the project to its `frapo:Grant` entity |
| funding grant | `frapo:Grant` | Class | The grant that funds the project |
| funding grant | `frapo:hasGrantNumber` | Datatype property | Grant number / identifier carried on the `frapo:Grant` |
| lead organization | `frapo:leadOrganization` | Organization | Lead organization |
| project status | `frapo:hasStatus` | Status | Project status |
| start date | `frapo:hasStartDate` | Date | Project start date |
| end date | `frapo:hasEndDate` | Date | Project end date |
| budget | `frapo:hasBudget` | MonetaryAmount | Project budget |

## Outcomes & Evaluation

### Deliverables

| Canvas Field | FRAPO Property | Type | Description |
|-------------|----------------|------|-------------|
| deliverable | `frapo:deliverable` | Deliverable | Project deliverable |
| deliverable type | `dct:type` | Literal | Type of deliverable |
| due date | `dct:date` | Date | Deliverable due date |

### Funding

The exporter maps the canvas `funding grant` field to a dedicated
`frapo:Grant` entity, linked from the project via `frapo:isFundedBy`:

```json
{
  "@type": ["schema:Project", "schema:ResearchProject"],
  "@id": "#project",
  "frapo:isFundedBy": { "@id": "#grant" }
}
{
  "@type": "frapo:Grant",
  "@id": "#grant",
  "frapo:hasGrantNumber": "ERC-2024-STG-101234567"
}
```

### Example Structure

```json
{
  "@type": "frapo:Project",
  "@id": "#project-1",
  "frapo:hasStartDate": "2025-01-01",
  "frapo:hasEndDate": "2025-12-31",
  "frapo:hasStatus": {
    "@id": "#status-active",
    "@type": "frapo:Status",
    "rdfs:label": "Active"
  },
  "frapo:deliverable": [
    {
      "@id": "#deliverable-1",
      "@type": "frapo:Deliverable",
      "dct:title": "Final Report",
      "dct:date": "2025-12-31"
    }
  ]
}
```

## Integration with Schema.org

FRAPO properties complement Schema.org Project properties. Both can be asserted on the same entity:

```json
{
  "@type": ["schema:ResearchProject", "frapo:Project"],
  "@id": "#project-1",
  "schema:name": "Example Project",
  "frapo:hasStatus": {...}
}
```

## References

- [FRAPO Ontology](https://sparontologies.github.io/frapo/current/frapo.html)
- [CERIF Specification](https://www.eurocris.org/cerif/main-features-cerif)
