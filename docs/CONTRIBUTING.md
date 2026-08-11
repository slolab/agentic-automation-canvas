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
│   ├── types/              # TypeScript types (AAC domain types are generated)
│   ├── utils/              # Utility functions
│   └── styles/             # Global styles
├── schema/                 # Versioned AAC schemas, profiles, and current aliases
├── tests/                  # Centralized tests, grouped to mirror src domains
├── docs/                   # Documentation
└── public/                 # Static assets
```

## Testing

Keep automated tests under `tests/`, mirroring the relevant `src/` domain. Do not
colocate `*.spec.ts`, `*.test.ts`, or `*.type-test.ts` files with production code.

```bash
npm test
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
    - `chore: ...`, `docs: ...`, `ci: ...` etc. → no release on their own, and omitted
      from the generated changelog (only feat/fix/perf/revert entries are listed)
2. **Merge PRs to `main`.** The Release Please workflow opens (or updates) a release PR
   titled `chore(main): release X.Y.Z` that bumps every version location and prepends a
   generated section to `docs/changelog.md`.
3. **Review the release PR** — you can edit its changelog before merging.
4. **Merge the release PR.** release-please tags `vX.Y.Z`, creates the GitHub Release, and
   the workflow dispatches **Deploy to GitHub Pages** at that tag.

Application-version locations updated automatically: `package.json` and
`package-lock.json` (native node updater), plus the lines annotated with
`x-release-please-version` in `pyproject.toml`, `README.md`, and `docs/index.md` (listed
under `extra-files` in `release-please-config.json`). AAC schema versions are selected
independently in `schema/manifest.json` and must never use release-please annotations.
If you add a new file that displays the application version, annotate the line and add
the file to `extra-files`.

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

The versioned JSON Schema is the single source of truth for the AAC data contract.
Released contracts under `schema/versions/<version>/` are immutable. The selected
version in `schema/manifest.json` is the current contract.

The following files are generated from that selection and must not be edited by hand:

- `schema/canvas-schema.json` and `schema/rocrate-profile.json` — stable aliases for
  consumers that need the current contract
- `src/types/canvas.ts` — AAC domain types used by application, UI, import, and export code
- `src/schema/contract.ts` — current schema, profile, and RO-Crate contract constants

To change the schema:

1. Create a new `schema/versions/<version>/` contract by copying the current version;
   never alter an already released version.
2. Edit the new versioned JSON Schema and RO-Crate profile, then point
   `schema/manifest.json` at them.
3. Regenerate all derived artifacts:

   ```bash
   npm run schema:generate
   ```

4. Update schema examples, RO-Crate mappings, recovery/import behavior, and reference
   documentation as required by the contract change. The schema-exhaustive current
   round-trip fixture will fail until every newly declared field is represented.
5. Verify that no generated artifact has drifted and that all handwritten logic still
   type-checks against the generated model:

   ```bash
   npm run schema:check
   npm run typecheck
   uv run python tools/validate-examples.py
   ```

Do not hand-code AAC schema interfaces. UI and mapping logic must consume the generated
types so a schema change produces compile-time errors where handwritten logic needs to be
updated. Rare presentation-only configuration may be handwritten when it cannot
reasonably be derived, but it must still be strongly typed against the generated model.

Runtime data is also checked against the current JSON Schema. Current-schema exports are
strict and are blocked by schema errors. Import is deliberately tolerant: every
non-current or unversioned crate uses the same current-model recovery path, reports
structured warnings or errors, and loads whatever can be recovered instead of blocking
the view. Historical contracts are published artifacts, not lossless import promises.

## Standards Compliance

All changes must maintain compliance with:

- RO-Crate specification
- Schema.org vocabularies
- W3C DCAT, PROV-O, P-Plan
- FRAPO, DUO ontologies

## Questions?

Open an issue or start a discussion on GitHub.
