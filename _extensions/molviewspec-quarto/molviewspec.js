// MolViewSpec Quarto Extension
// Initializes EditorWithViewer components with MolViewSpec builder code using Preact

// Import Preact and molstar-components directly from CDN
const PREACT_URL = "https://esm.sh/preact@10.19.3";
const MOLSTAR_COMPONENTS_URL =
  "https://esm.sh/jsr/@zachcp/molstar-components@0.4.0";

// Initialize all molviewspec viewers when DOM is ready
async function initializeMolViewSpecViewers() {
  const viewers = document.querySelectorAll(".molviewspec-viewer");

  if (viewers.length === 0) {
    return;
  }

  try {
    // Dynamically import dependencies
    const { h, render } = await import(PREACT_URL);
    const { EditorWithViewer } = await import(MOLSTAR_COMPONENTS_URL);

    if (!EditorWithViewer) {
      console.error("EditorWithViewer component not found");
      return;
    }

    viewers.forEach((viewerElement) => {
      // Get the story and scene code from script tags
      const viewerId = viewerElement.id.replace("-viewer", "");
      const storyScript = document.getElementById(viewerId + "-story");
      const sceneScript = document.getElementById(viewerId + "-scene");

      if (!sceneScript) {
        console.warn(
          "No MolViewSpec scene code script found for viewer:",
          viewerElement.id,
        );
        return;
      }

      const storyCode = storyScript ? storyScript.textContent : "";
      const sceneCode = sceneScript.textContent;

      console.log(
        "Extracted code for",
        viewerElement.id,
        "- story length:",
        storyCode.length,
        "scene length:",
        sceneCode.length,
      );
      console.log("Scene preview:", sceneCode.substring(0, 100));

      try {
        // Clear the container
        viewerElement.innerHTML = "";

        // Render the EditorWithViewer component using Preact
        // Use hiddenCode prop to prepend story code before scene code
        render(
          h(EditorWithViewer, {
            initialCode: sceneCode,
            hiddenCode: storyCode, // Story code runs but doesn't show in editor
            layout: "horizontal",
            editorHeight: "400px",
            viewerHeight: "400px",
            autoRun: true,
            autoRunDelay: 500,
          }),
          viewerElement,
        );

        console.log("Initialized EditorWithViewer for", viewerElement.id);
      } catch (error) {
        console.error("Error initializing MolViewSpec viewer:", error);
        viewerElement.innerHTML = `
          <div class="molviewspec-error" style="padding: 20px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px;">
            <p style="margin: 0 0 10px 0;"><strong>Error loading MolViewSpec:</strong></p>
            <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${error.message}</pre>
            <details style="margin-top: 10px;">
              <summary style="cursor: pointer;">Code</summary>
              <pre style="margin-top: 10px; background: white; padding: 10px; border-radius: 4px; overflow-x: auto; font-family: monospace;">Story: ${storyCode}\n---\n${sceneCode}</pre>
            </details>
          </div>
        `;
      }
    });
  } catch (error) {
    console.error("Failed to load dependencies:", error);
    viewers.forEach((viewerElement) => {
      viewerElement.innerHTML = `
        <div class="molviewspec-error" style="padding: 20px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px;">
          <p style="margin: 0 0 10px 0;"><strong>Error loading dependencies:</strong></p>
          <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${error.message}</pre>
          <p style="margin-top: 10px;">Failed to load Preact or molstar-components from CDN.</p>
        </div>
      `;
    });
  }
}

// Run initialization when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeMolViewSpecViewers);
} else {
  initializeMolViewSpecViewers();
}
