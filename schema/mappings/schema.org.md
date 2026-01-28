# Schema.org Mappings

This document describes how Agentic Automation Canvas fields map to Schema.org vocabulary, specifically the `Project` and `ResearchProject` types.

## Project Definition & Context

### Core Properties

| Canvas Field | Schema.org Property | Type | Description |
|-------------|-------------------|------|-------------|
| title | `name` | Text | Project title/name |
| description | `description` | Text | Project description |
| objective | `about` | Text or Thing | Project objectives/goals |
| startDate | `startDate` | Date | Project start date |
| endDate | `endDate` | Date | Project end date |
| domain | `about` (with domain-specific Thing) | Thing | Research domain(s) |
| keywords | `keywords` | Text | Keywords/tags |

### ResearchProject Extension

When the project is a research project, use `ResearchProject` type with additional properties:

- `funder`: Organization or Person that funded the project
- `sponsor`: Organization that sponsored the project
- `member`: Person or Organization that is a member of the project

### Example JSON-LD

```json
{
  "@type": "ResearchProject",
  "@id": "#project-1",
  "name": "Example Agentic Automation Project",
  "description": "A project to develop an agentic automation system...",
  "startDate": "2025-01-01",
  "endDate": "2025-12-31",
  "keywords": ["AI", "automation", "biomedical"]
}
```

## Outcomes

Outcomes map to `CreativeWork` types:

- Publications: `ScholarlyArticle`, `Article`
- Reports: `Report`
- Datasets: `Dataset`
- Software: `SoftwareApplication`

## References

- [Schema.org Project](https://schema.org/Project)
- [Schema.org ResearchProject](https://schema.org/ResearchProject)
- [Bioschemas Project Profile](http://bioschemas.org/profiles/Project)
