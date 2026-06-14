import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

test("foundation files describe a framework-free HIITBuddy shell", async () => {
  const [html, main, styles, packageJson, manifest, serviceWorker, icon, favicon] = await Promise.all([
    readFile("src/index.html", "utf8"),
    readFile("src/main.ts", "utf8"),
    readFile("src/styles.css", "utf8"),
    readFile("package.json", "utf8"),
    readFile("src/public/manifest.webmanifest", "utf8"),
    readFile("src/public/service-worker.js", "utf8"),
    readFile("src/public/icon.svg", "utf8"),
    readFile("src/public/favicon.svg", "utf8")
  ]);

  const pkg = JSON.parse(packageJson);
  const parsedManifest = JSON.parse(manifest);

  assert.match(html, /<title>HIITBuddy<\/title>/);
  assert.match(html, /manifest\.webmanifest/);
  assert.match(html, /favicon\.svg/);
  assert.match(main, /HIITBuddy/);
  assert.match(main, /serviceWorker\.register/);
  assert.match(styles, /--color-action/);
  assert.equal(parsedManifest.name, "HIITBuddy");
  assert.match(serviceWorker, /CACHE_NAME/);
  assert.match(icon, /HIITBuddy App Icon/);
  assert.match(favicon, /HIITBuddy Favicon/);
  assert.equal(pkg.scripts.build, "node scripts/build.mjs");
  assert.equal(pkg.scripts.start, "node scripts/serve.mjs");
});
