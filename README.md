# The Agentic Automation Canvas (AAC)

!!! warning "Beta Release"
    **Version 0.10.2 (Beta)**: This specification is currently in beta testing. The schema and documentation 
    may change before the stable 1.0.0 release. Feedback and contributions are welcome!

Using agentic systems driven by generative AI is a promising approach to processing efficiency. However, developing these systems is challenging in several ways. By design, they are meant to replace human judgment, hopefully in a reliable way; this implies that there needs to be a control inversion, allowing the system to take command of the task, while the human has to step back accordingly.

This canvas is meant to support the design of such agentic automation solutions for any given task, grounding it in the typical challenges and pitfalls of the process. The custom output you receive by filling out the canvas is simultaneously

- a framework for implementation, 
- a checklist for the relevant aspects that need to be considered, and
- a machine-readable output of the specific solution for your agentic task.

The filled-out canvas, once created and downloaded as an interoperable RO-Crate, is meant to

- guide the development process of the solution through planning, prototype, and deployment stages,
- capture expectations of users and feasibility considerations of developers,
- allow comparison of actual gains vs. initial expectations,
- facilitate governance and use & access decisions, and
- guide the data protection strategy, if necessary.

## Features

- **Interactive Form**: Modern, accessible Vue.js interface for capturing project metadata
- **Standards-Compliant**: Generates RO-Crate packages following W3C and Schema.org standards
- **Comprehensive Coverage**: Captures project definition, user expectations, feasibility, governance, data access, and outcomes
- **Bot Assistant**: Contextual help for filling out the canvas (MVP with placeholder)
- **Schema Profile**: Standalone schema definitions for validation and tooling

## Quick Start

Visit the [live application](https://slolab.github.io/agentic-automation-canvas/) to start filling out your canvas.

## Development

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/slolab/agentic-automation-canvas.git
   cd agentic-automation-canvas
   ```

2. **Install dependencies**
   ```bash
   # Install Node.js dependencies
   npm install
   
   # Install Python dependencies (using uv)
   uv sync
   ```

3. **Run development servers**
   ```bash
   # Start Vue app development server
   npm run dev
   
   # Or start MkDocs documentation server (in another terminal)
   npm run docs:dev
   ```

4. **Build for production**
   ```bash
   # Build Vue app only
   npm run build
   
   # Build both Vue app and documentation together
   npm run build:all
   ```

5. **Preview combined build**
   ```bash
   # Preview the combined build (Vue app + docs)
   npm run preview:all
   # Then navigate to:
   # Vue app: http://localhost:4173/agentic-automation-canvas/
   # Documentation: http://localhost:4173/agentic-automation-canvas/docs/
   ```

### Dev RO-Crate

Build a dev aid zip with every benefit metric represented once: `npm run build:dev-rocrate`. Output is `tools/dev-all-benefits.rocrate.zip`; upload it in the app to test display groups and benefit display.

## Project Structure

```
/
├── src/                    # Vue.js application source
│   ├── components/        # Vue components
│   ├── composables/       # Vue composables
│   ├── types/             # TypeScript interfaces
│   ├── utils/             # Utility functions (RO-Crate generation)
│   └── styles/            # Global styles
├── schema/                # Schema profile (standalone)
│   ├── canvas-schema.json # JSON Schema for validation
│   ├── rocrate-profile.json # RO-Crate profile definition
│   ├── mappings/          # Ontology mapping documentation
│   ├── vocabularies/      # Controlled vocabularies
│   └── examples/          # Example RO-Crates
├── docs/                  # Documentation
└── .github/workflows/     # GitHub Actions workflows
```

## Standards Compliance

The Agentic Automation Canvas follows established standards:

- **RO-Crate 1.1**: Research Object Crate specification
- **Schema.org**: Project, ResearchProject, CreativeWork types
- **W3C DCAT**: Data Catalog Vocabulary for datasets
- **W3C PROV-O**: Provenance Ontology for activities
- **P-Plan**: Plan Ontology for user expectations
- **FRAPO**: Funding, Research Administration & Projects Ontology
- **DUO**: Data Use Ontology for data restrictions

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) for detailed standards mapping.

## Schema Profile

The `schema/` directory contains standalone schema definitions that can be used independently:

- **JSON Schema**: `schema/canvas-schema.json` for validating canvas data
- **RO-Crate Profile**: `schema/rocrate-profile.json` for validating RO-Crates
- **Mappings**: Documentation of ontology mappings
- **Vocabularies**: Controlled vocabularies (Technology Readiness Level (TRL), DUO terms, etc.)
- **Examples**: Example RO-Crate files

See [schema/README.md](schema/README.md) for schema documentation.

## Documentation

- [Contributing Guide](docs/CONTRIBUTING.md) - Development guidelines
- [Deployment Guide](docs/DEPLOYMENT.md) - GitHub Pages deployment
- [Architecture Documentation](docs/ARCHITECTURE.md) - Technical architecture

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.

## Acknowledgments

This project builds on established vocabularies and standards from Schema.org, W3C, GA4GH, and the research data management community.
