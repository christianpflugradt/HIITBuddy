import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { generateNotes } from "@semantic-release/release-notes-generator";

test("semantic-release toolchain generates Conventional Commits release notes", async () => {
  const releaseConfig = JSON.parse(await readFile(new URL("../.releaserc.json", import.meta.url), "utf8"));
  const releaseNotesPlugin = releaseConfig.plugins.find(
    (plugin) => Array.isArray(plugin) && plugin[0] === "@semantic-release/release-notes-generator",
  );

  assert.ok(releaseNotesPlugin, "release-notes-generator must be configured");

  const notes = await generateNotes(releaseNotesPlugin[1], {
    cwd: process.cwd(),
    commits: [
      {
        hash: "abcdef1234567890",
        message: "fix: verify release notes",
      },
    ],
    lastRelease: { gitTag: "v1.0.0" },
    nextRelease: { gitTag: "v1.0.1", version: "1.0.1" },
    options: { repositoryUrl: "https://github.com/example/hiitbuddy.git" },
    logger: { log() {} },
  });

  assert.match(notes, /### Bug Fixes/u);
  assert.match(notes, /verify release notes/u);
});
