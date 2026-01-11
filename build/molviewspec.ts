// MolViewSpec Quarto Extension Entry Point
// Initializes all molviewspec viewers when DOM is ready

import { h, render } from "preact";
import { EditorWithViewer } from "@molstar/molstar-components";

// Note: Monaco Environment is configured in the HTML head via Lua filter
// to ensure it runs before the module loads

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
      const propsScript = document.getElementById(viewerId + "-props");

      if (!sceneScript) {
        console.warn(
          "No MolViewSpec scene code script found for viewer:",
          viewerElement.id,
        );
        return;
      }

      const storyCode = storyScript ? storyScript.textContent : "";
      const sceneCode = sceneScript.textContent;

      // Parse component props from JSON script tag
      let componentProps: any = {};
      if (propsScript && propsScript.textContent) {
        try {
          componentProps = JSON.parse(propsScript.textContent);
        } catch (e) {
          console.warn("Failed to parse component props for", viewerId, e);
        }
      }

      console.log(
        "Initializing viewer for",
        viewerElement.id,
        "- story:",
        storyCode.length,
        "chars, scene:",
        sceneCode.length,
        "chars",
        "- props:",
        componentProps,
      );

      try {
        // Clear the container
        viewerElement.innerHTML = "";

        // Merge default props with user-provided props
        const defaultProps = {
          layout: "horizontal",
          editorHeight: "400px",
          viewerHeight: "400px",
          autoRun: true,
          autoRunDelay: 500,
          // Note: Not setting showLog here - when controls are enabled,
          // we let it default to true so the toggle works properly
          showAutoUpdateToggle: false,
          showBottomControlPanel: false,
        };

        // Render the EditorWithViewer component
        render(
          h(EditorWithViewer, {
            initialCode: sceneCode,
            hiddenCode: storyCode,
            ...defaultProps,
            ...componentProps, // User props override defaults
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
