# Contributing to Agentic Automation Canvas

Thank you for your interest in contributing to the Agentic Automation Canvas project!

**AI assistants (Copilot, Cursor, etc.):** See root [AGENTS.md](../AGENTS.md) for the pre-PR checklist and contributor instructions.

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

## Releases (release-please)

Releases are automated with [release-please](https://github.com/googleapis/release-please)
via `.github/workflows/release-please.yml`. Do not bump versions or edit the changelog for
releases by hand.

1. **Use Conventional Commit PR titles.** PRs are squash-merged, so the PR title becomes
   the commit message release-please reads:
    - `fix: ...` → patch release (0.15.0 → 0.15.1)
    - `feat: ...` → minor release (0.15.0 → 0.16.0)
    - `feat!: ...` or a `BREAKING CHANGE:` footer → minor bump while we are pre-1.0
      (`bump-minor-pre-major` is enabled)
    - `chore: ...`, `docs: ...`, `ci: ...` etc. → recorded, but no release on their own
2. **Merge PRs to `main`.** The Release Please workflow opens (or updates) a release PR
   titled `chore(main): release X.Y.Z` that bumps every version location and prepends a
   generated section to `docs/changelog.md`.
3. **Review the release PR** — you can edit its changelog before merging.
4. **Merge the release PR.** release-please tags `vX.Y.Z`, creates the GitHub Release, and
   the workflow dispatches **Deploy to GitHub Pages** at that tag.

Version locations updated automatically: `package.json` and `package-lock.json` (native
node updater), plus the lines annotated with `x-release-please-version` in
`pyproject.toml`, `README.md`, `docs/index.md`, `docs/spec/index.md`,
`docs/spec/conformance.md`, and `docs/schema/index.md` (listed under `extra-files` in
`release-please-config.json`). If you add a new file that displays the version, annotate
the line and add the file to `extra-files`.

Notes and limitations:

- Workflows (CI) do not run on the release PR because it is created with `GITHUB_TOKEN`
  (GitHub anti-recursion rule). CI is not a required check today; if branch protection
  ever requires it, switch the release-please workflow to a Personal Access Token.
- The repository setting **Allow GitHub Actions to create and approve pull requests**
  (Settings → Actions → General) must be enabled.
- New changelog sections use release-please's format (Features / Bug Fixes with commit
  links); the hand-written Keep-a-Changelog entries below them remain as history.
- `uv.lock` records the project's own version and is not part of the release PR, so it
  lags one release behind; harmless (CI runs `uv sync`, not `uv sync --locked`) and
  self-heals on the next `uv sync`.

## Schema Changes

If you're modifying the schema (`schema/` directory):

- Update `schema/canvas-schema.json` (JSON Schema)
- Update TypeScript interfaces in `src/types/canvas.ts`
- Update RO-Crate generator in `src/utils/rocrate.ts`
- Update example RO-Crates in `schema/examples/`
- Update mapping documentation in `schema/mappings/`

## Standards Compliance

All changes must maintain compliance with:

- RO-Crate specification
- Schema.org vocabularies
- W3C DCAT, PROV-O, P-Plan
- FRAPO, DUO ontologies

## Questions?

Open an issue or start a discussion on GitHub.
