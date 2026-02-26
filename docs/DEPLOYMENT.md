# Deployment Guide

## GitHub Pages Deployment

The project is deployed to GitHub Pages **only when a version tag** (e.g. `v0.14.0`) is pushed. Merging to `main` does not trigger deploy; the version bump is done on `main` after merging so that the auto-generated release notes include the merged PRs.

### Automatic Deployment (on version tag push)

1. On `main`, bump the version (e.g. `bump2version patch`) and commit.
2. Push the commit and the new tag:
   ```bash
   git push origin main --follow-tags
   ```
   Or push the tag explicitly: `git push origin vX.Y.Z`
3. The **Deploy to GitHub Pages** workflow (`.github/workflows/deploy.yml`) runs: validate → build → deploy.
4. A **GitHub Release** is created for that tag with auto-generated release notes (PRs and commits since the previous tag).

See [Contributing – Version bump and release](CONTRIBUTING.md#version-bump-and-release) for the full release steps.

### Manual Deployment

You can also trigger deployment manually (without pushing a tag):

1. Go to Actions tab in GitHub
2. Select "Deploy to GitHub Pages" workflow
3. Click "Run workflow" and choose the branch/ref to build from

### Configuration

The deployment is configured in `.github/workflows/deploy.yml`:

- **Build**: Runs `npm ci` and `npm run build`
- **Output**: `dist/` directory
- **Base path**: `/agentic-automation-canvas/` (configured in `vite.config.ts`)

### Custom Domain

To use a custom domain:

1. Add a `CNAME` file to `public/` directory with your domain
2. Configure DNS records as per GitHub Pages documentation
3. Update `vite.config.ts` base path if needed

### Local Testing

Test the production build locally:

```bash
npm run build
npm run preview
```

## Environment Variables

For local development with API integrations (future):

Create a `.env.local` file:

```
VITE_API_ENDPOINT=http://localhost:11434/api/chat
VITE_API_KEY=your-api-key
```

Note: Environment variables are not needed for MVP (bot uses contextual help).

## Troubleshooting

### Build Fails

- Check Node.js version (requires Node 20+)
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check for TypeScript errors: `npm run build`

### Deployment Fails

- Check GitHub Actions logs
- Ensure repository has Pages enabled (Settings > Pages)
- Verify workflow permissions

### Assets Not Loading

- Check `vite.config.ts` base path matches repository name
- Ensure all assets are in `public/` directory
- Check browser console for 404 errors
