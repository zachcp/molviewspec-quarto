# MolViewSpec Quarto Extension

A Quarto filter extension that creates interactive molecular structure editors and viewers using MolViewSpec and MolStar.

## Features

- 🧬 Interactive 3D molecular structure visualization
- ✏️ Built-in Monaco code editor with live preview
- 🎨 Customizable layout and dimensions
- 🔧 Optional interactive controls (auto-update toggle, execution log)
- 📦 Works offline - all dependencies bundled
- 🚀 Uses @molstar/molstar-components from JSR

## Installation

```bash
quarto add molstar/molviewspec-quarto
```

## Usage

Add the filter to your document's YAML header:

```yaml
---
title: "My Document"
format: html
filters:
  - molviewspec-quarto
---
```

Then create a `{.molviewspec}` code block with JavaScript builder code:

````markdown
```{.molviewspec}
const structure = builder
  .download({ url: 'https://www.ebi.ac.uk/pdbe/entry-files/1cbs.bcif' })
  .parse({ format: 'bcif' })
  .modelStructure();

structure
  .component({ selector: 'polymer' })
  .representation({ type: 'cartoon' })
  .color({ color: 'blue' });
```
````

## Attributes

Customize your viewers with these attributes:

### Container
- `title` - Optional title for the viewer
- `height` - Container height (default: `"400px"`)
- `width` - Container width (default: `"100%"`)

### Layout
- `layout` - Editor/viewer arrangement: `"horizontal"` or `"vertical"` (default: `"horizontal"`)
- `editorHeight` - Editor panel height (default: `"400px"`)
- `viewerHeight` - Viewer panel height (default: `"400px"`)

### Behavior
- `autoRun` - Auto-execute code on edit: `"true"` or `"false"` (default: `"true"`)
- `autoRunDelay` - Delay before auto-execution in ms (default: `500`)
- `controls` - Enable interactive controls: `"true"` or `"false"` (default: `"false"`)

### Examples

**With title:**
````markdown
```{.molviewspec title="Protein Structure"}
// your code here
```
````

**With interactive controls:**
````markdown
```{.molviewspec controls="true" title="Interactive Demo"}
// your code here
```
````

When `controls="true"`, users can:
- Toggle auto-update on/off
- View execution logs for debugging

**Custom dimensions:**
````markdown
```{.molviewspec height="800px" width="100%"}
// your code here
```
````

## Advanced: Story and Scene Code

Split your code using `---` as a separator:
- **Story code** (above `---`): Runs but hidden from editor - for setup/imports
- **Scene code** (below `---`): Visible and editable in the Monaco editor

````markdown
```{.molviewspec}
// Hidden setup code
const structure = builder
  .download({ url: 'https://www.ebi.ac.uk/pdbe/entry-files/1cbs.bcif' })
  .parse({ format: 'bcif' })
  .modelStructure();

---

// Visible, editable code
structure
  .component({ selector: 'polymer' })
  .representation({ type: 'cartoon' })
  .color({ color: 'purple' });
```
````

## MolViewSpec Builder API

The `builder` variable provides a fluent API for creating molecular visualizations:

- `download()` - Load structure from URL
- `parse()` - Parse file (bcif, cif, pdb, etc.)
- `modelStructure()` - Create model structure node
- `component()` - Select parts (polymer, ligand, water, etc.)
- `representation()` - Add visuals (cartoon, ball_and_stick, surface, spacefill, etc.)
- `color()` - Apply colors (named colors or hex codes)
- `focus()` - Focus camera on component

**Resources:**
- [MolViewSpec Documentation](https://molstar.org/mol-view-spec-docs/)
- [Integration Examples](https://molstar.org/mol-view-spec-docs/mvs-molstar-extension/integration/)
- [MolStar Website](https://molstar.org/)

## Development

```bash
# Build and preview
deno task build && quarto preview index.qmd

# Build only
deno task build
```

## Requirements

- Quarto >= 1.8.0
- HTML output format (non-HTML formats display original code block)
- Modern browser with ES6+ support

## How It Works

1. Lua filter detects `{.molviewspec}` code blocks
2. Extracts JavaScript builder code
3. Generates HTML containers with unique IDs
4. Loads bundled MolStar library and Monaco editor
5. Initializes interactive editor/viewer components
6. Executes code and renders molecular structure

## Styling

Override these CSS classes to customize appearance:

- `.molviewspec-container` - Main container
- `.molviewspec-viewer` - Viewer wrapper
- `.molviewspec-header` - Title header
- `.molviewspec-title` - Title text

## Troubleshooting

**Viewers not rendering?**
- Check browser console for errors
- Ensure HTML output format
- Verify JavaScript syntax in code blocks

**Monaco workers failing?**
- Check Network tab for 404s on worker files
- Ensure assets are properly deployed with your site

## License

MIT

## Author

Zachary Charlop-Powers
