-- MolViewSpec Quarto Filter
-- Processes molviewspec code blocks and creates interactive MolStar viewers

local counter = 0
local dependencies_added = false
local monaco_injected = false

-- Function to add HTML dependencies (JS and CSS)
local function add_dependencies()
  if dependencies_added then
    return
  end

  -- Only add dependencies if quarto global is available
  if quarto and quarto.doc and quarto.doc.addHtmlDependency then
    -- Add MolStar and extension assets
    quarto.doc.addHtmlDependency({
      name = "molviewspec-quarto",
      version = "1.0.0",
      scripts = {
        { path = "assets/molstar.js" },
        { path = "molviewspec.js", attribs = {type = "module"} }
      },
      stylesheets = {
        "assets/molstar.css",
        "molviewspec.css"
      },
      resources = {
        { name = "vs", path = "assets/vs", attribs = {recursive = true} }
      }
    })
  end

  dependencies_added = true
end

-- Function to inject Monaco Editor loader (only once)
-- Try to use local Monaco files if available, fall back to CDN
local function inject_monaco()
  if monaco_injected then
    return ""
  end
  monaco_injected = true

  -- Load Monaco from local files with CDN fallback
  return [[
<script>
(function() {
  // Determine the base path for extension resources
  var scripts = document.getElementsByTagName('script');
  var basePath = '';
  for (var i = 0; i < scripts.length; i++) {
    var src = scripts[i].src;
    if (src && src.indexOf('molviewspec-quarto') !== -1) {
      basePath = src.substring(0, src.lastIndexOf('/') + 1);
      break;
    }
  }

  // Try to load Monaco from local extension files first
  var script = document.createElement('script');
  var localPath = basePath + 'vs/loader.js';
  script.src = localPath;

  script.onerror = function() {
    // Fallback to CDN if local files not found
    console.log('Loading Monaco from CDN (local files not available at ' + localPath + ')');
    var cdnScript = document.createElement('script');
    cdnScript.src = 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs/loader.js';
    cdnScript.onload = function() {
      require.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs' }});
      require(['vs/editor/editor.main'], function() {
        console.log('Monaco Editor loaded from CDN');
      });
    };
    document.head.appendChild(cdnScript);
  };

  script.onload = function() {
    // Configure for local files
    var vsPath = basePath + 'vs';
    require.config({ paths: { vs: vsPath }});
    require(['vs/editor/editor.main'], function() {
      console.log('Monaco Editor loaded from local files at ' + vsPath);
    });
  };

  document.head.appendChild(script);
})();
</script>
]]
end

-- Function to generate unique ID
local function generate_id()
  counter = counter + 1
  return "molviewspec-" .. counter
end

-- Process CodeBlock elements
function CodeBlock(el)
  -- Check if this is a molviewspec code block
  if el.classes:includes("molviewspec") then

    -- Only process for HTML output (check if quarto global exists)
    if quarto and quarto.doc then
      if not quarto.doc.isFormat("html") then
        -- For non-HTML formats, return the original code block
        return el
      end
    end

    -- Add dependencies on first use
    add_dependencies()

    -- Generate unique ID for this instance
    local id = generate_id()

    -- Get the code content (JavaScript builder code)
    local content = el.text

    -- Split content into story code and scene code using "---" as delimiter
    local story_code = ""
    local scene_code = content
    local separator_pos = content:find("\n%-%-%-\n")

    if separator_pos then
      story_code = content:sub(1, separator_pos - 1)
      scene_code = content:sub(separator_pos + 5) -- Skip past "\n---\n"
    end

    -- Get optional attributes
    local height = el.attributes.height or "400px"
    local width = el.attributes.width or "100%"
    local title = el.attributes.title or ""

    -- Inject Monaco loader before first viewer (only once)
    local monaco_loader = inject_monaco()

    -- Create HTML structure with separate script tags for story and scene code
    local html = string.format([[%s
<div class="molviewspec-container" id="%s" style="height: %s; width: %s;">
  %s
  <script type="application/json" id="%s-story">%s</script>
  <script type="application/json" id="%s-scene">%s</script>
  <div class="molviewspec-viewer" id="%s-viewer"></div>
</div>
]], monaco_loader, id, height, width,
    title ~= "" and string.format('<div class="molviewspec-header"><h4 class="molviewspec-title">%s</h4></div>', title) or "",
    id, story_code,
    id, scene_code,
    id)

    -- Return as raw HTML block
    return pandoc.RawBlock('html', html)
  end

  -- Return unchanged if not a molviewspec block
  return el
end

-- Return filter function
return {
  { CodeBlock = CodeBlock }
}
