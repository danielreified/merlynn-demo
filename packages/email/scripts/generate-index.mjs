import { readdirSync, writeFileSync } from "fs";
import { join } from "path";

const outDir = join(import.meta.dirname, "..", "out");
const files = readdirSync(outDir).filter((f) => f.endsWith(".html") && f !== "index.html");

const links = files
  .map((f) => {
    const name = f.replace(".html", "").replace(/([A-Z])/g, " $1").trim();
    return `      <a href="/${f}">${name}</a>`;
  })
  .join("\n");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Merlynn Email Templates</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0a0f1e; color: #e2e8f0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
    .container { max-width: 480px; width: 100%; padding: 2rem; }
    h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; }
    p { color: #64748b; font-size: 0.875rem; margin-bottom: 2rem; }
    .templates { display: flex; flex-direction: column; gap: 0.75rem; }
    a { display: block; padding: 1rem 1.25rem; background: #1e293b; border: 1px solid #334155; border-radius: 0.75rem; color: #60a5fa; text-decoration: none; font-weight: 500; transition: all 0.15s; }
    a:hover { background: #334155; border-color: #60a5fa; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Merlynn Email Templates</h1>
    <p>Preview rendered email templates</p>
    <div class="templates">
${links}
    </div>
  </div>
</body>
</html>`;

writeFileSync(join(outDir, "index.html"), html);
console.log(`Generated index.html with ${files.length} templates`);
