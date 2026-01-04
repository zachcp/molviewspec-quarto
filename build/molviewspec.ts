// MolViewSpec Quarto Extension Entry Point
// Initializes all molviewspec viewers when DOM is ready

import { h, render } from "npm:preact@10.28.1";
import { EditorWithViewer } from "jsr:@zachcp/molstar-components@0.4.12";

// Configure Monaco Environment to load workers from assets subdirectory
// This must be set before Monaco is initialized
(self as any).MonacoEnvironment = {
  getWorkerUrl: function (_moduleId: string, label: string) {
    // Determine the base path from the current script
    const scripts = document.getElementsByTagName("script");
    let basePath = "";
    for (let i = 0; i < scripts.length; i++) {
      const src = scripts[i].src;
      if (src && src.indexOf("molviewspec") !== -1) {
        basePath = src.substring(0, src.lastIndexOf("/") + 1);
        break;
      }
    }

    if (label === "typescript" || label === "javascript") {
      return basePath + "assets/ts.worker.js";
    }
    return basePath + "assets/editor.worker.js";
  },
};

// Initialize all molviewspec viewers when DOM is ready
async function initializeMolViewSpecViewers() {
  const viewers = document.querySelectorAll(".molviewspec-viewer");

  if (viewers.length === 0) {
    return;
  }

  try {
    if (!EditorWithViewer) {
      console.error("EditorWithViewer component not found");
      return;
    }

    if (!h || !render) {
      console.error("Preact h/render functions not found");
      return;
    }

    console.log("Successfully loaded EditorWithViewer component");

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
        "Initializing viewer for",
        viewerElement.id,
        "- story:",
        storyCode.length,
        "chars, scene:",
        sceneCode.length,
        "chars",
      );

      try {
        // Clear the container
        viewerElement.innerHTML = "";

        // Render the EditorWithViewer component
        render(
          h(EditorWithViewer, {
            initialCode: sceneCode,
            hiddenCode: storyCode,
            layout: "horizontal",
            editorHeight: "400px",
            viewerHeight: "400px",
            autoRun: true,
            autoRunDelay: 500,
            showLog: false,
            showAutoUpdateToggle: false,
            showBottomControlPanel: false,
          }),
          viewerElement,
        );

        console.log("Successfully initialized viewer:", viewerElement.id);
      } catch (error) {
        console.error("Error initializing viewer:", viewerElement.id, error);
        viewerElement.innerHTML = `
          <div class="molviewspec-error" style="padding: 20px; background: #fff3cd; border: 1px solid #ffc107; border-radius: 4px;">
            <p style="margin: 0 0 10px 0;"><strong>Error initializing viewer:</strong></p>
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
          <p style="margin-top: 10px;">Failed to load molstar-components. Check the console for details.</p>
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
