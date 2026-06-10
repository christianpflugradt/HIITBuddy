import { readFile } from "node:fs/promises";
import test from "node:test";
import assert from "node:assert/strict";

test("foundation files describe a framework-free HIITBuddy shell", async () => {
  const [html, main, styles, packageJson] = await Promise.all([
    readFile("src/index.html", "utf8"),
    readFile("src/main.ts", "utf8"),
    readFile("src/styles.css", "utf8"),
    readFile("package.json", "utf8")
  ]);

  const pkg = JSON.parse(packageJson);

  assert.match(html, /<title>HIITBuddy<\/title>/);
  assert.match(main, /HIITBuddy/);
  assert.match(styles, /--color-action/);
  assert.equal(pkg.scripts.build, "node scripts/build.mjs");
  assert.equal(pkg.scripts.start, "node scripts/serve.mjs");
});
