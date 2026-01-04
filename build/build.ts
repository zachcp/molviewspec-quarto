/// <reference lib="deno.ns" />
// deno-lint-ignore-file no-explicit-any

/**
 * Build script to compile molstar-components from JSR source
 * Outputs directly to the Quarto extension assets directory
 */

import * as esbuild from "esbuild";
import { denoPlugins } from "@luca/esbuild-deno-loader";
import { resolve } from "@std/path";

async function build() {
  console.log("Building molstar-components from JSR source...");

  const configPath = resolve(Deno.cwd(), "./deno.json");
  const extensionDir = "./_extensions/molviewspec-quarto";
  const assetsDir = `${extensionDir}/assets`;

  // Ensure directories exist
  try {
    await Deno.mkdir(assetsDir, { recursive: true });
  } catch {
    // Directory already exists
  }

  try {
    // Build the Quarto extension entry point (molviewspec.ts)
    console.log("\n1. Building molviewspec.js (Quarto entry point)...");
    await esbuild.build({
      plugins: [
        ...denoPlugins({
          configPath,
        }),
      ] as any,
      entryPoints: ["./build/molviewspec.ts"],
      outfile: `${extensionDir}/molviewspec.js`,
      bundle: true,
      format: "esm",
      platform: "browser",
      minify: true,
      target: "es2022",
      jsx: "automatic",
      jsxImportSource: "preact",
      loader: {
        ".ttf": "file",
        ".woff": "file",
        ".woff2": "file",
        ".eot": "file",
      },
      assetNames: "assets/[name]-[hash]",
      publicPath: "./",
    });
    console.log("✓ molviewspec.js created");

    // Build Monaco editor workers
    console.log("\n2. Building Monaco editor workers...");

    const workerConfig = {
      plugins: [
        ...denoPlugins({
          configPath,
        }),
      ] as any,
      bundle: true,
      format: "iife" as const,
      platform: "browser" as const,
      target: "es2022",
      minify: true,
      loader: {
        ".ttf": "file",
        ".woff": "file",
        ".woff2": "file",
        ".eot": "file",
      } as any,
    };

    // Base editor worker
    await esbuild.build({
      ...workerConfig,
      entryPoints: {
        "editor.worker":
          "npm:monaco-editor@0.45.0/esm/vs/editor/editor.worker.js",
      },
      outdir: assetsDir,
    });
    console.log("  ✓ editor.worker.js");

    // TypeScript/JavaScript worker
    await esbuild.build({
      ...workerConfig,
      entryPoints: {
        "ts.worker":
          "npm:monaco-editor@0.45.0/esm/vs/language/typescript/ts.worker.js",
      },
      outdir: assetsDir,
    });
    console.log("  ✓ ts.worker.js");

    console.log("\n✅ Build complete!");
    console.log("\nGenerated files:");
    console.log(`  - ${extensionDir}/molviewspec.js (Quarto entry point)`);
    console.log(`  - ${assetsDir}/molstar-components.css`);
    console.log(`  - ${assetsDir}/editor.worker.js`);
    console.log(`  - ${assetsDir}/ts.worker.js`);
    console.log(
      "\nAll components bundled with matching Preact version (10.28.1)",
    );
  } catch (error) {
    console.error("\n❌ Build failed:", error);
    Deno.exit(1);
  } finally {
    esbuild.stop();
  }
}

if (import.meta.main) {
  await build();
}
