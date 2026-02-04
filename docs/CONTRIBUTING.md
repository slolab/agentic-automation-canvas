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

## Version bump

When releasing a new app/schema version, use [bump2version](https://github.com/c4urself/bump2version):

1. **Install** (if needed): `uv sync`
2. **Bump** (e.g. patch 0.10.2 → 0.10.3): `bump2version patch`
   - Or: `bump2version minor` / `bump2version major`
   - Or explicit: `bump2version --new-version 0.10.3 patch`
   - Use `--allow-dirty` if the working directory has uncommitted changes (e.g. changelog edits)
3. **Refresh package-lock.json**: `npm install`
4. **Add a changelog entry** in `docs/changelog.md`: add a new `## [X.Y.Z] - YYYY-MM-DD` section at the top with your changes.
5. **Commit** the version bump and changelog together.

The `.bumpversion.cfg` config updates: `package.json`, `package-lock.json`, `docs/spec/index.md`, `docs/spec/conformance.md`, `docs/schema/index.md`, `docs/index.md`, `README.md`. It does not edit the changelog (you add that manually).

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
