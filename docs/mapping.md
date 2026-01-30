# Canvas to RO-Crate Field Mapping

This document provides a deterministic mapping from Agentic Automation Canvas fields to RO-Crate JSON-LD properties. This ensures stable, predictable exports and enables round-trip import/export.

## Overview

The canvas data model is the source of truth. RO-Crate export is a deterministic projection of this model using Schema.org, PROV-O, P-Plan, DCAT, and custom AAC vocabulary terms.

## Entity Mappings

### Project Entity

| Canvas Field | RO-Crate Property | Notes |
|-------------|-------------------|-------|
| `project.title` | `name` | Required |
| `project.description` | `description` | Required |
| `project.objective` | `schema:abstract` | Optional |
| `project.projectStage` | `aac:projectStage` | Custom vocabulary |
| `project.startDate` | `startDate` | ISO date format |
| `project.endDate` | `endDate` | ISO date format |
| `project.domain` | `aac:domain` | Array of strings |
| `project.keywords` | `keywords` | Schema.org property |
| `project.projectId` | `identifier` | URI/DOI |
| `project.headlineValue` | `aac:headlineValue` | Free text |
| `project.aggregateBenefitValue` | `aac:aggregateBenefitValue` | Number |
| `project.aggregateBenefitUnit` | `aac:aggregateBenefitUnit` | String |
| `project.primaryValueDriver` | `aac:primaryValueDriver` | Enum: time, quality, risk, enablement |
| `project.aggregateBenefits` | `aac:aggregateBenefits` | Array of AggregateBenefit objects |
| `project.version` | `aac:version` | Semantic version |
| `project.versionDate` | `aac:versionDate` | ISO date |

### Person Entities

Persons are exported as identity-only entities. Roles are NOT embedded in Person nodes.

| Canvas Field | RO-Crate Property | Notes |
|-------------|-------------------|-------|
| `persons[].id` | `@id` | Format: `#person-N` |
| `persons[].name` | `name` | Required |
| `persons[].affiliation` | `schema:affiliation` | Optional, for disambiguation |
| `persons[].orcid` | `schema:identifier` | ORCID URI |

**Important:** Person entities do not contain role information. Roles are represented as separate `schema:Role` nodes.

### Role Entities

Roles are exported as separate `schema:Role` nodes that reference Person entities.

| Source | RO-Crate Property | Notes |
|--------|-------------------|-------|
| Role assignment | `@type` | `schema:Role` |
| Role assignment | `@id` | Format: `#role-N` |
| `stakeholders[].role` or `agents[].role` | `schema:roleName` | Role name |
| Person reference | `schema:member` | `{ @id: "#person-N" }` |
| Context | `aac:roleContext` | `stakeholder`, `stage-agent`, or `task-agent` |
| Stage reference (if stage-agent) | `aac:stageId` | Stage @id |

### Stakeholder Mappings

| Canvas Field | RO-Crate Representation | Notes |
|-------------|-------------------------|-------|
| `stakeholders[].personId` | Person entity reference | Links to `#person-N` |
| `stakeholders[].role` | `schema:Role` node | Separate entity |
| Stakeholder list | `contributor` on Project | Array of Person references |

### Requirement/Task Entities

| Canvas Field | RO-Crate Property | Notes |
|-------------|-------------------|-------|
| `requirements[].id` | `@id` | Format: `#requirement-N` |
| `requirements[].description` | `description` | Required |
| `requirements[].userStory` | `name` | Optional |
| `requirements[].priority` | `priority` | Enum |
| `requirements[].status` | `status` | Enum |
| `requirements[].unitOfWork` | `aac:unitOfWork` | String |
| `requirements[].unitCategory` | `aac:unitCategory` | Enum |
| `requirements[].volumePerMonth` | `aac:volumePerMonth` | Number |
| `requirements[].humanOversightMinutesPerUnit` | `aac:humanOversightMinutesPerUnit` | Number |
| `requirements[].benefits` | `aac:benefits` | Array of Benefit objects |

### Benefit Objects

Benefits are embedded as-is in requirement entities under `aac:benefits`.

| Canvas Field | RO-Crate Property | Notes |
|-------------|-------------------|-------|
| `benefitType` | `benefitType` | Required: time, quality, risk, enablement |
| `metricId` | `metricId` | Required |
| `metricLabel` | `metricLabel` | Required |
| `direction` | `direction` | Required: increaseIsBetter, decreaseIsBetter, targetIsBetter, boolIsBetter |
| `valueMeaning` | `valueMeaning` | Required: absolute, delta |
| `target` | `target` | Optional: number (for targetIsBetter) |
| `aggregationBasis` | `aggregationBasis` | Optional: perUnit, perMonth, oneOff |
| `benefitUnit` | `benefitUnit` | Required |
| `baseline` | `baseline` | BenefitValue object |
| `expected` | `expected` | BenefitValue object |
| `confidenceUser` | `confidenceUser` | Optional: low, medium, high |
| `confidenceDev` | `confidenceDev` | Optional: low, medium, high |
| `assumptions` | `assumptions` | Optional |

### Governance Stage Entities

| Canvas Field | RO-Crate Property | Notes |
|-------------|-------------------|-------|
| `stages[].id` | `@id` | Format: `#stage-N` |
| `stages[].name` | `name` | Required |
| `stages[].startDate` | `startedAtTime` | ISO datetime |
| `stages[].endDate` | `endedAtTime` | ISO datetime |
| `stages[].agents` (person type) | `wasAssociatedWith` + Role nodes | Person reference + separate Role entity |
| `stages[].agents` (org/software) | `wasAssociatedWith` | Separate org/software entity |
| `stages[].milestones` | `hasMilestone` | Array of CreativeWork entities |
| `stages[].complianceStandards` | `aac:complianceStandard` | Array of strings |

### Dataset Entities

| Canvas Field | RO-Crate Property | Notes |
|-------------|-------------------|-------|
| `datasets[].id` | `@id` | Format: `#dataset-N` |
| `datasets[].title` | `name` | Required |
| `datasets[].description` | `description` | Optional |
| `datasets[].format` | `schema:encodingFormat` | MIME type or format name |
| `datasets[].license` | `license` | `{ @id: "URL" }` |
| `datasets[].accessRights` | `dct:accessRights` | Access level |
| `datasets[].pid` | `identifier` | PID/DOI |
| `datasets[].duoTerms` | `dct:conformsTo` | Array of `{ @id: DUO_URL }` |
| `datasets[].containsPersonalData` | `aac:containsPersonalData` | Boolean |

### Outcome Entities

#### Deliverables

| Canvas Field | RO-Crate Property | Notes |
|-------------|-------------------|-------|
| `deliverables[].id` | `@id` | Format: `#outcome-N` |
| `deliverables[].title` | `name` | Required |
| `deliverables[].type` | `@type` | Format: `schema:{type}` |
| `deliverables[].description` | `description` | Optional |
| `deliverables[].date` | `datePublished` | ISO date |
| `deliverables[].pid` | `identifier` | PID/DOI |

#### Publications

| Canvas Field | RO-Crate Property | Notes |
|-------------|-------------------|-------|
| `publications[].id` | `@id` | Format: `#publication-N` |
| `publications[].title` | `name` | Required |
| `publications[].doi` | `identifier` | DOI |
| `publications[].authors` | `author` | Array of Person objects |
| `publications[].date` | `datePublished` | ISO date |

#### Evaluations

| Canvas Field | RO-Crate Property | Notes |
|-------------|-------------------|-------|
| `evaluations[].id` | `@id` | Format: `#evaluation-N` |
| `evaluations[].type` | `name`, `aac:evaluationType` | Type string |
| `evaluations[].date` | `datePublished` | ISO date |
| `evaluations[].results` | `description` | Results text |

## Namespace Prefixes

The RO-Crate export uses the following namespace prefixes:

```json
{
  "schema": "https://schema.org/",
  "prov": "http://www.w3.org/ns/prov#",
  "p-plan": "http://purl.org/net/p-plan#",
  "dct": "http://purl.org/dc/terms/",
  "dcat": "http://www.w3.org/ns/dcat#",
  "aac": "https://github.com/slolab/agentic-automation-canvas/schema/"
}
```

## Export Rules

### General Rules

1. **Null/undefined fields**: Omit from output (do not export as `null`)
2. **Empty arrays**: Omit from output
3. **@id references**: Always use `{ @id: "..." }` format
4. **Date formats**: Use ISO 8601 format

### Person/Role Separation

1. Person entities contain ONLY identity information (name, affiliation, orcid)
2. Roles are ALWAYS represented as separate `schema:Role` nodes
3. Role nodes reference persons via `schema:member`
4. Role context is specified via `aac:roleContext`

### Benefit Semantics

Benefits MUST include:
- `direction`: How to interpret improvement
- `valueMeaning`: Whether values are absolute or delta

This enables downstream analytics without ambiguity.

## Import Rules

### Role Resolution

1. Check for `schema:Role` entities and build person-to-role map
2. Fall back to legacy `aac:roles` embedded in Person entities
3. Match roles to stakeholders/agents by context

### Benefit Migration

For older exports without `direction`/`valueMeaning`:
- Default `direction` to `increaseIsBetter` for time metrics
- Default `valueMeaning` to `delta` for time-saved metrics
- Default `valueMeaning` to `absolute` for other metrics

## Related Documentation

- [Schema.org mappings](../schema/mappings/schema.org.md)
- [PROV-O mappings](../schema/mappings/prov-o.md)
- [DCAT mappings](../schema/mappings/dcat.md)
- [DUO mappings](../schema/mappings/duo.md)
- [FRAPO mappings](../schema/mappings/frapo.md)
