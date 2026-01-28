# Contributing to Agentic Automation Canvas

Thank you for your interest in contributing to the Agentic Automation Canvas project!

## Development Setup

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

## Code Style

- **TypeScript**: Use TypeScript for all new code
- **Vue 3**: Use Composition API with `<script setup>`
- **Tailwind CSS**: Use Tailwind utility classes for styling
- **Accessibility**: Follow WCAG 2.1 AA guidelines
- **Formatting**: Code is automatically formatted (ESLint)

## Project Structure

```
/
├── src/                    # Source code
│   ├── components/         # Vue components
│   ├── composables/        # Vue composables
│   ├── types/              # TypeScript types
│   ├── utils/              # Utility functions
│   └── styles/             # Global styles
├── schema/                 # Schema definitions (standalone)
├── docs/                   # Documentation
└── public/                 # Static assets
```

## Making Changes

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Ensure the build passes: `npm run build`
5. Submit a pull request

## Schema Changes

If you're modifying the schema (`schema/` directory):

- Update `schema/canvas-schema.json` (JSON Schema)
- Update TypeScript interfaces in `src/types/canvas.ts`
- Update RO-Crate generator in `src/utils/rocrate.ts`
- Update example RO-Crates in `schema/examples/`
- Update mapping documentation in `schema/mappings/`

## Standards Compliance

All changes must maintain compliance with:

- RO-Crate 1.1 specification
- Schema.org vocabularies
- W3C DCAT, PROV-O, P-Plan
- FRAPO, DUO ontologies

## Questions?

Open an issue or start a discussion on GitHub.
