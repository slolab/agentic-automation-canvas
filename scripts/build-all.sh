#!/bin/bash
set -e

echo "🔨 Building Agentic Automation Canvas (Vue app + Documentation)..."

# Build Vue app (with base path for GitHub Pages)
echo "📦 Building Vue app..."
npm run build

# Generate reference documentation
echo "📚 Generating reference documentation..."
uv run python tools/generate-reference.py

# Build MkDocs (for local development, use default site_url)
echo "📖 Building MkDocs documentation..."
uv run python -m mkdocs build --quiet

# Prepare schema artifacts
echo "📄 Preparing schema artifacts..."
mkdir -p site/schema site/examples

# Copy schema and update $id to w3id.org
uv run python -c "
import json
import yaml

with open('schema/canvas-schema.json', 'r') as f:
    schema = json.load(f)

# Update \$id to w3id.org
schema['\$id'] = 'https://w3id.org/aac/schema/aac.schema.json'

# Write updated schema
with open('site/schema/aac.schema.json', 'w') as f:
    json.dump(schema, f, indent=2)

# Convert to YAML
with open('site/schema/aac.schema.yaml', 'w') as f:
    yaml.dump(schema, f, default_flow_style=False, sort_keys=False, allow_unicode=True)
"

# Copy examples
echo "📋 Copying examples..."
cp schema/examples/*.json site/examples/ 2>/dev/null || true

# Combine builds: reorganize to match GitHub Pages structure
echo "🔗 Combining builds..."
# Create the base path directory
mkdir -p dist/agentic-automation-canvas
# Move Vue app files to the base path
mv dist/index.html dist/agentic-automation-canvas/ 2>/dev/null || true
mv dist/assets dist/agentic-automation-canvas/ 2>/dev/null || true
mv dist/favicon.svg dist/agentic-automation-canvas/ 2>/dev/null || true
# Copy docs to the base path subdirectory
mkdir -p dist/agentic-automation-canvas/docs
cp -r site/* dist/agentic-automation-canvas/docs/

echo "✅ Build complete!"
echo ""
echo "📁 Vue app: dist/agentic-automation-canvas/"
echo "📁 Documentation: dist/agentic-automation-canvas/docs/"
echo ""
echo "To preview locally:"
echo "  npm run preview    # Preview Vue app at http://localhost:4173"
echo "  uv run python -m mkdocs serve  # Preview docs at http://localhost:8000"
echo ""
echo "Or serve the combined build:"
echo "  npm run preview:all"
echo "  # Vue app: http://localhost:4173/agentic-automation-canvas/"
echo "  # Docs: http://localhost:4173/agentic-automation-canvas/docs/"
