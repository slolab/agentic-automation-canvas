# DUO Ontology Mappings

This document describes how Agentic Automation Canvas data access fields map to GA4GH Data Use Ontology (DUO).

## Data Access & Sensitivity

DUO terms are used to specify data use restrictions and permissions in a machine-readable format.

### Integration with DCAT

DUO terms are typically attached to DCAT Dataset entities via `dct:accessRights`:

```json
{
  "@type": "dcat:Dataset",
  "@id": "#dataset-1",
  "dct:title": "Patient Dataset",
  "dct:accessRights": {
    "@id": "http://purl.obolibrary.org/obo/DUO_0000006",
    "@type": "duo:0000006",
    "rdfs:label": "Health/Medical/Biomedical Research Only"
  }
}
```

### Common DUO Terms

| DUO ID | Label | Use Case |
|--------|-------|----------|
| DUO:0000001 | General Research Use | General health research |
| DUO:0000006 | Health/Medical/Biomedical Research Only | Medical research only |
| DUO:0000012 | No Commercial Use | Non-commercial research |
| DUO:0000018 | Ethics Approval Required | Requires ethics approval |
| DUO:0000016 | Collaboration Required | Requires collaboration |

### Multiple DUO Terms

A dataset can have multiple DUO restrictions:

```json
{
  "dct:accessRights": [
    "http://purl.obolibrary.org/obo/DUO_0000006",
    "http://purl.obolibrary.org/obo/DUO_0000012",
    "http://purl.obolibrary.org/obo/DUO_0000018"
  ]
}
```

## References

- [GA4GH DUO Specification](https://www.ga4gh.org/product/data-use-ontology-duo/)
- [DUO Ontology](http://purl.obolibrary.org/obo/duo.owl)
