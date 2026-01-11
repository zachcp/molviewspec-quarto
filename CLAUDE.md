# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Quarto filter extension that creates interactive molecular structure editors and viewers using MolViewSpec and MolStar. The extension processes custom `molviewspec` code blocks in Quarto documents and transforms them into embedded interactive 3D molecular visualizations.

## Development Commands

### Testing and Preview
```bash
# Render and preview the example document
./test.sh

# Manual rendering
quarto render example.qmd

# Preview with live reload
quarto preview example.qmd
```

### Installation Testing
```bash
# Install locally in a test project
quarto add /path/to/molviewspec-quarto
```

## Architecture

### Component Structure
```
_extensions/molviewspec-quarto/
├── _extension.yml           # Extension metadata and configuration
├── molviewspec-quarto.lua   # Main filter: processes code blocks
├── molviewspec.js           # Runtime: loads MolStar components
└── molviewspec.css          # Styling for containers and UI
```

### Data Flow

1. **Quarto Parsing** → Identifies `molviewspec` code blocks in `.qmd` files
2. **Lua Filter** → Detects blocks, extracts JSON content and attributes
3. **HTML Generation** → Creates container divs with escaped JSON in `data-molviewspec` attributes
4. **Dependency Injection** → Adds JS/CSS via `quarto.doc.add_html_dependency()` (once per document)
5. **JavaScript Initialization** → On DOM ready, dynamically imports molstar-components from JSR
6. **Component Creation** → Initializes interactive editor+viewer for each block

### Key Design Patterns

**Data Attribute Storage**: JSON content is stored in `data-molviewspec` HTML attributes on generated divs. This keeps content close to viewer elements, supports multiple independent instances, and avoids global state management.

**Unique ID Generation**: Lua-side counter generates deterministic IDs (`molviewspec-1`, `molviewspec-2`, etc.) ensuring no collisions within a document.

**Dynamic Import**: molstar-components library is loaded at runtime via ESM from `https://esm.sh/jsr/@molstar/molstar-components`, avoiding bundling and keeping the extension lightweight.

**Graceful Degradation**: If components fail to load (no internet, errors), falls back to displaying JSON in a textarea with clear error messaging.

**HTML-Only Processing**: Filter uses `quarto.doc.is_format("html:js")` to only process HTML output. For PDF/Word/etc., the original code block is preserved unchanged.

## Code Block Processing (Lua)

The `CodeBlock(el)` function in `molviewspec-quarto.lua`:

1. Checks if block has class "molviewspec"
2. Verifies HTML output format (skips non-HTML)
3. Adds HTML dependencies on first use (singleton pattern via `dependencies_added` flag)
4. Generates unique ID via counter
5. Extracts attributes: `height` (default: "600px"), `width` (default: "100%"), `title` (default: ""), `show-editor` (default: "true")
6. Escapes JSON content for safe HTML attribute embedding
7. Returns `pandoc.RawBlock('html', html)` with generated structure

**Critical**: JSON escaping via `escape_json()` prevents injection attacks by escaping backslashes, quotes, and control characters.

## Component Initialization (JavaScript)

`MolViewSpecManager` singleton in `molviewspec.js`:

1. **init()**: Dynamically imports molstar-components, checks for `molstar-editor-viewer` custom element or `createEditorViewer()` API
2. **initializeEditor()**: Creates viewer instance for each `.molviewspec-content` element
3. Runs on `DOMContentLoaded` or immediately if DOM ready
4. Extracts `data-molviewspec` and `data-show-editor` from each element
5. Falls back to textarea display on any error

## Supported Attributes

Code blocks accept these attributes:

- `title`: Header title for viewer (optional, hides header if empty)
- `height`: CSS height value (default: "600px")
- `width`: CSS width value (default: "100%")

Example:
````markdown
```{.molviewspec title="My Structure" height="800px"}
{...}
```
````

**Important**: Use `{.molviewspec}` with a dot prefix, not `{molviewspec}`. This is standard Pandoc/Quarto syntax for code block classes.

## MolViewSpec JSON Format

The JSON content must be valid MolViewSpec format with minimum structure:
```json
{
  "version": "1",
  "root": {
    "kind": "root",
    "children": [...]
  }
}
```

Common patterns include `download` nodes for fetching structures, `structure`/`component` nodes for selection, `representation` nodes for visualization style, and `color` nodes for styling.

## Styling Customization

Override these CSS classes for custom styling:
- `.molviewspec-container`: Main container
- `.molviewspec-header`: Title area
- `.molviewspec-title`: Title text  
- `.molviewspec-content`: Viewer content area
- `.molviewspec-error`: Error message styling

Built-in CSS includes dark mode support via `@media (prefers-color-scheme: dark)` and responsive design with mobile breakpoints at 768px.

## Important Constraints

- **HTML Output Only**: Extension only processes HTML formats; gracefully returns original code block for PDF, Word, etc.
- **Works Offline**: MolStar library is bundled with the extension in `assets/` directory
- **Modern Browsers**: Requires ES6+ support (async/await)
- **Quarto Version**: Requires >= 1.8.0

## Troubleshooting

**Viewers not appearing**: Check browser console for JavaScript errors. Verify `molstar.js` is loading correctly from the `assets/` directory.

**MolViewSpec errors**: Ensure JSON is valid. Check that `data-molviewspec` attribute contains properly escaped JSON in rendered HTML.

**Multiple instances**: Each viewer is independent; counter ensures unique IDs. Check console for initialization errors if specific instances fail.

**Code blocks showing as plain text**: Ensure you're using `{.molviewspec}` with the dot prefix, not `{molviewspec}`.

## Extension Distribution

Users install via:
```bash
quarto add zachcp/molviewspec-quarto
```

Or manually copy `_extensions/molviewspec-quarto/` directory to their project's `_extensions/` folder.
