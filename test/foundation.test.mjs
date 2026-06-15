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
  assert.match(html, /favicon\.ico/);
  assert.match(html, /favicon\.svg/);
  assert.match(html, /favicon-32\.png/);
  assert.match(html, /apple-touch-icon\.png/);
  assert.match(main, /HIITBuddy/);
  assert.match(main, /serviceWorker\.register/);
  assert.match(styles, /--color-action/);
  assert.equal(parsedManifest.name, "HIITBuddy");
  assert.deepEqual(
    parsedManifest.icons.map((entry) => entry.src),
    ["./icon-192.png", "./icon-512.png", "./icon-512.png"]
  );
  assert.match(serviceWorker, /CACHE_NAME/);
  assert.match(serviceWorker, /favicon\.ico/);
  assert.match(serviceWorker, /icon-192\.png/);
  assert.match(serviceWorker, /favicon-32\.png/);
  assert.match(icon, /HIITBuddy App Icon/);
  assert.match(favicon, /HIITBuddy Favicon/);
  assert.equal(pkg.scripts.build, "node scripts/build.mjs");
  assert.equal(pkg.scripts.start, "node scripts/serve.mjs");
  assert.match(await readFile("scripts/serve.mjs", "utf8"), /\.png", "image\/png"/);
});
