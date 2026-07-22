# Deployment Guide

## GitHub Pages Deployment

The project is deployed to GitHub Pages when a release is published. Releases are automated
with [release-please](https://github.com/googleapis/release-please); merging feature PRs to
`main` does not trigger a deploy on its own.

### Automatic Deployment (via release-please)

1. Merge PRs to `main` (with Conventional Commit titles).
2. release-please opens/updates a `chore(main): release X.Y.Z` PR; merge it to release.
3. release-please tags `vX.Y.Z`, creates the GitHub Release, and dispatches the
   **Deploy to GitHub Pages** workflow (`.github/workflows/deploy.yml`) at that tag:
   validate → build → deploy.

Pushing a `v*` tag manually also triggers the deploy workflow (fallback path).

See [Contributing – Releases](CONTRIBUTING.md#releases-release-please) for the full
release process.

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
