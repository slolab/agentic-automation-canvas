# DCAT Mappings

This document describes how Agentic Automation Canvas data fields map to W3C DCAT (Data Catalog Vocabulary) for dataset descriptions.

## Data Access & Sensitivity Section

### Core DCAT Properties

| Canvas Field | DCAT Property | Type | Description |
|-------------|---------------|------|-------------|
| dataset name | `dct:title` | Literal | Dataset title |
| dataset description | `dct:description` | Literal | Dataset description |
| data format | `dct:format` | IRI | Data format (MIME type) |
| license | `dct:license` | IRI | License URI |
| access rights | `dct:accessRights` | IRI | Access rights classification |
| PID/DOI | `dct:identifier` | Literal | Persistent identifier |
| publisher | `dct:publisher` | IRI | Publishing organization |
| contact point | `dcat:contactPoint` | IRI | Contact information |

### DCAT-AP Extensions

For European projects, use DCAT-AP profile extensions:

- `dcat:theme`: Theme/category (e.g., from EuroVoc)
- `dcat:keyword`: Keywords
- `dcat:distribution`: Data distributions
- `dcatap:availability`: Availability status
- `dcatap:spatial`: Geographic coverage

### DUO Integration

DUO terms are attached via `dct:accessRights` or custom properties linking to DUO ontology URIs.

### Example JSON-LD

```json
{
  "@type": "dcat:Dataset",
  "@id": "#dataset-1",
  "dct:title": "Patient Dataset",
  "dct:description": "Anonymized patient data for research",
  "dct:format": "application/json",
  "dct:license": "https://creativecommons.org/licenses/by/4.0/",
  "dct:accessRights": "http://purl.obolibrary.org/obo/DUO_0000006",
  "dct:identifier": "https://doi.org/10.1234/example"
}
```

## References

- [W3C DCAT Specification](https://www.w3.org/TR/vocab-dcat-2/)
- [DCAT-AP Specification](https://joinup.ec.europa.eu/collection/semantic-interoperability-community-semic/solution/dcat-application-profile-data-portals-europe)
- [EOSC Metadata Model](https://dataeuropa.gitlab.io/data-provider-manual/our-metadata-model/)
