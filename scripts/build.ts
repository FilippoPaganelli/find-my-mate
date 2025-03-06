// scripts/build.ts
import { ensureDir } from "https://deno.land/std/fs/mod.ts";

async function buildClient() {
  // Ensure output directory exists
  await ensureDir("dist/client");

  console.log("Compiling client TypeScript...");

  // Use the Deno.Command API to run the TypeScript compiler
  const tsc = new Deno.Command("tsc", {
    args: ["--project", "tsconfig.client.json"],
  });

  const output = await tsc.output();
  if (!output.success) {
    console.error("TypeScript compilation failed:");
    console.error(new TextDecoder().decode(output.stdout));
    Deno.exit(1);
  }

  // Copy any static assets like HTML, CSS, etc.
  console.log("Copying static assets...");
  try {
    await Deno.copyFile("src/client/index.html", "dist/client/index.html");
    // Add more files as needed
  } catch (e) {
    console.log("No index.html found, creating a basic one...");
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Deno TypeScript App</title>
  <script type="module" src="main.js"></script>
</head>
<body>
  <div id="app"></div>
</body>
</html>`;
    await Deno.writeTextFile("dist/client/index.html", html);
  }

  console.log("Client build completed!");
}

await buildClient();
