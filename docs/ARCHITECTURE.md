# Architecture Documentation

## Overview

The Agentic Automation Canvas is a Vue.js 3 application that provides an interactive form for capturing project metadata and generating RO-Crate-compliant packages.

## Technology Stack

- **Frontend**: Vue.js 3 (Composition API) with TypeScript
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **UI Components**: Headless UI
- **RO-Crate**: Custom JSON-LD generator
- **ZIP Generation**: JSZip

## Architecture Diagram

```
┌─────────────────────────────────────────┐
│         Vue.js Application               │
│  ┌───────────────────────────────────┐  │
│  │      CanvasForm Component          │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │  Section Components         │  │  │
│  │  │  - ProjectDefinition       │  │  │
│  │  │  - UserExpectations         │  │  │
│  │  │  - DeveloperFeasibility     │  │  │
│  │  │  - GovernanceStaging        │  │  │
│  │  │  - DataAccessSensitivity    │  │  │
│  │  │  - OutcomesEvaluation      │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │      useCanvasData Composable      │  │
│  │  (State Management + localStorage) │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │      BotAssistant Component        │  │
│  │  (Contextual Help - MVP)           │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         RO-Crate Generator               │
│  ┌───────────────────────────────────┐  │
│  │  generateROCrate()                 │  │
│  │  - Schema.org mappings             │  │
│  │  - DCAT mappings                   │  │
│  │  - PROV-O mappings                 │  │
│  │  - FRAPO mappings                  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         Download Utility                 │
│  ┌───────────────────────────────────┐  │
│  │  downloadROCrateZip()              │  │
│  │  - Generate ZIP                    │  │
│  │  - Include metadata + README       │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Data Flow

1. **User Input** → Form components capture data
2. **State Management** → `useCanvasData` composable stores data in reactive state + localStorage
3. **RO-Crate Generation** → `generateROCrate()` transforms canvas data to RO-Crate JSON-LD
4. **Download** → `downloadROCrateZip()` creates ZIP file with metadata and README

## Standards Mapping

### Schema.org
- Project → `schema:Project` / `schema:ResearchProject`
- Outcomes → `schema:CreativeWork`, `schema:ScholarlyArticle`

### DCAT
- Datasets → `dcat:Dataset` with `dct:license`, `dct:accessRights`

### PROV-O
- Governance Stages → `prov:Activity`
- Outcomes → `prov:wasGeneratedBy` links

### P-Plan
- User Expectations → `p-plan:Plan` with `p-plan:hasStep`

### FRAPO
- Project → `frapo:Project` (complementary to Schema.org)
- Deliverables → `frapo:Deliverable`

### DUO
- Data Restrictions → DUO ontology terms via `dct:accessRights`

## Component Hierarchy

```
App
├── CanvasForm
│   ├── ProjectDefinition
│   ├── UserExpectations
│   ├── DeveloperFeasibility
│   ├── GovernanceStaging
│   ├── DataAccessSensitivity
│   └── OutcomesEvaluation
├── BotAssistant
└── (Shared Components)
    ├── FormField
    └── MultiValueInput
```

## State Management

- **Local State**: Each section component manages its own local state
- **Global State**: `useCanvasData` composable provides reactive canvas data
- **Persistence**: Automatic save to localStorage
- **Validation**: Form-level validation in components

## RO-Crate Structure

Generated RO-Crates follow this structure:

```json
{
  "@context": "https://w3id.org/ro/crate/1.1/context",
  "@graph": [
    {
      "@id": "ro-crate-metadata.json",
      "@type": "CreativeWork",
      "conformsTo": { "@id": "https://w3id.org/ro/crate/1.1" }
    },
    {
      "@id": "./",
      "@type": "Dataset",
      "name": "Project Name",
      "about": { "@id": "#project-1" }
    },
    {
      "@id": "#project-1",
      "@type": ["Project", "ResearchProject"],
      ...
    },
    // ... more entities
  ]
}
```

## Future Enhancements

- **API Integration**: Bot assistant with real LLM API calls
- **Import**: Load existing RO-Crates
- **Validation**: Client-side RO-Crate validation
- **Export Formats**: RDF/Turtle, JSON-LD variants
- **Collaboration**: Multi-user editing

## Performance Considerations

- **Lazy Loading**: Section components loaded on demand
- **LocalStorage**: Efficient serialization/deserialization
- **Build Optimization**: Vite code splitting and tree shaking
- **Asset Optimization**: Image compression, font subsetting
