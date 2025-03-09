import * as esbuild from "https://deno.land/x/esbuild@v0.19.8/mod.js";
import { ensureDir, copy } from "https://deno.land/std/fs/mod.ts";
import * as path from "https://deno.land/std/path/mod.ts";

async function buildClient() {
  // Ensure output directory exists
  await ensureDir("dist/client");
  console.log("Compiling client TypeScript...");

  await esbuild.build({
    bundle: true,
    resolveExtensions: [".ts", ".js"],
    target: "es2020",
    format: "esm",
    entryPoints: ["src/client/ts/app.ts"],
    outdir: "dist/client",
  });

  // Copy any static assets like HTML, CSS, etc.
  console.log("Copying static assets...");

  // Copy index.html to dist directory
  await copy("src/client/index.html", "dist/index.html", { overwrite: true });

  // Copy chessboardjs directory if it exists
  if (await Deno.stat("src/client/chessboardjs").catch(() => null)) {
    await copy("src/client/chessboardjs", "dist/client/chessboardjs", {
      overwrite: true,
    });
  }

  console.log("Client build completed!");
}

await buildClient();
esbuild.stop();
