# Pre-PR Checklist

Execute before creating PR.

## Commands (all must pass)

1. `npm run lint`
2. `npm run build:all`
3. `uv run python tools/validate-examples.py`

## Tasks

### Documentation
- Schema changes → update `docs/reference/index.md`
- New features → add docs
- UI-only changes → no docs needed
- Check: `grep -r "fieldName" docs/`

### Changelog
Add to `docs/changelog.md`:
```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added/Changed/Fixed/Removed
- [changes]
```

### Examples
If schema changed:
- Update `schema/examples/complete-canvas.json`
- Update `src/data/example-data.ts` if needed
- Re-validate

### PR Message
Format in code block:
- Title
- Key Changes (bullets)
- Technical Details (files)
- Breaking Changes (if any)

### Version
User handles `bump2version` if needed. Note in PR if version changed.

## Checklist
- [ ] Lint passes
- [ ] Build passes
- [ ] Schema validation passes
- [ ] Docs reviewed
- [ ] Changelog updated
- [ ] Examples updated (if schema changed)
- [ ] PR message ready
