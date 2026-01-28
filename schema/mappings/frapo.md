# FRAPO Mappings

This document describes how Agentic Automation Canvas fields map to FRAPO (Funding, Research Administration & Projects Ontology).

## Project Definition & Context

### FRAPO Project Properties

| Canvas Field | FRAPO Property | Type | Description |
|-------------|----------------|------|-------------|
| project | `frapo:Project` | Class | Project entity |
| funding grant | `frapo:fundingGrant` | Grant | Associated grant |
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
