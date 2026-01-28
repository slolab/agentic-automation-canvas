# The Agentic Automation Canvas (AAC)

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

### Using the Web Application

Visit the [live application](https://slolab.github.io/agentic-automation-canvas/) to start filling out your canvas.

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/slolab/agentic-automation-canvas.git
   cd agentic-automation-canvas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

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
- **Vocabularies**: Controlled vocabularies (TRL levels, DUO terms, etc.)
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
