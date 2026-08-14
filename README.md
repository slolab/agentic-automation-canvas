# The Agentic Automation Canvas (AAC)

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.18649620.svg)](https://doi.org/10.5281/zenodo.18649620)

> [!WARNING]
> **Application release 0.16.0 (Beta)**: The application is currently in beta testing. <!-- x-release-please-version -->
> Its current AAC data contract is independently versioned as schema **0.17.1**. Both may
> change before their stable 1.0.0 releases. Feedback and contributions are welcome!

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

- **Visual Canvas**: A one-screen, two-dimensional project canvas backed by the same structured data as the detailed views
- **Standards-Compliant**: Generates RO-Crate packages following W3C and Schema.org standards
- **Comprehensive Coverage**: Captures project definition, user expectations, feasibility, governance, data access, and outcomes
- **AI-Ready Export**: Every RO-Crate includes an `AGENTS.md` file that translates the canvas specification into structured instructions for AI coding agents (GitHub Copilot, Cursor, and other LLM-based assistants), bridging the gap between project design and implementation
- **Contextual Guidance**: Short, per-section guidance in a sidebar, opened from the information icon beside the title or any canvas section
- **Schema Profile**: Standalone schema definitions for validation and tooling

## Quick Start

Visit the [live application](https://aac.slolab.ai) to start filling out your canvas.

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
│   ├── rocrate/           # RO-Crate export, import, and container handling
│   ├── schema/            # Generated schema contract, validation, recovery
│   ├── persistence/       # Browser-storage boundaries
│   ├── types/             # Schema-generated TypeScript model
│   ├── utils/             # Utility functions
│   └── styles/            # Global styles
├── tests/                 # Centralized tests, mirroring the src domains
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

The AAC generates RO-Crate packages using Schema.org, W3C DCAT, PROV-O, and other established vocabularies. See the [specification](docs/spec/index.md) for details.

## Schema Profile

The `schema/` directory contains standalone schema definitions (JSON Schema, RO-Crate profile, mappings, vocabularies, examples) that can be used independently. See [schema/README.md](schema/README.md).

## Documentation

- [AGENTS.md](AGENTS.md) - Instructions for AI assistants and contributors (pre-PR checklist)
- [Contributing Guide](docs/CONTRIBUTING.md) - Development guidelines
- [Deployment Guide](docs/DEPLOYMENT.md) - GitHub Pages deployment

## License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.

## Acknowledgments

This project builds on established vocabularies and standards from Schema.org, W3C, GA4GH, and the research data management community.
