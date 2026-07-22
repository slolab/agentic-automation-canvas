# Instructions for AI assistants and contributors

This file is for copilots, Cursor, and other AI assistants working on the **agentic-automation-canvas** repository. (The `AGENTS.md` inside exported RO-Crates is a different artifact: a canvas brief for downstream use.)

## Pre-PR checklist

Execute before creating a PR.

### Commands (all must pass)

1. `npm run lint`
2. `npm run build:all`
3. `uv run python tools/validate-examples.py`

### Tasks

#### Documentation
- Schema changes → update `docs/reference/index.md`
- New features → add docs
- UI-only changes → no docs needed
- Check: `grep -r "fieldName" docs/`

#### Changelog
Add to `docs/changelog.md`:
```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added/Changed/Fixed/Removed
- [changes]
```

#### Examples
If schema changed:
- Update `schema/examples/complete-canvas.json`
- Update `src/data/example-data.ts` if needed
- Re-validate

#### PR Message
Do NOT attempt to create PRs programmatically (e.g., via `gh pr create`) — it will fail in this environment. Instead, provide the PR title and body as a fenced markdown code block so the user can copy it and create the PR manually on GitHub.

Format:
- Title
- `## Summary` with bullet points
- `## Test plan` with a checklist
- Breaking changes (if any)

#### Version and release
Releases are automated with release-please. Merging PRs to `main` (Conventional Commit
titles — PRs are squash-merged, so the PR title is what release-please reads) maintains a
release PR; when the maintainer merges it, release-please tags `vX.Y.Z`, creates the
GitHub Release, and dispatches the deploy workflow. Do not bump versions or edit
`docs/changelog.md` for releases manually, and do not suggest that merging a feature PR
deploys. Note in the PR whether the change is a `feat` (minor) or `fix` (patch) so the
title can be set accordingly.

### Checklist
- [ ] Lint passes
- [ ] Build passes
- [ ] Schema validation passes
- [ ] Docs reviewed
- [ ] PR title follows Conventional Commits
- [ ] Examples updated (if schema changed)
- [ ] PR message ready
