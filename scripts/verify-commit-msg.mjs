import { readFileSync } from "node:fs";

const messageFile = process.argv[2];

if (!messageFile) {
  console.error("Missing commit message file path.");
  process.exit(1);
}

const message = readFileSync(messageFile, "utf8").trim();
const firstLine = message.split(/\r?\n/, 1)[0] ?? "";
const allowedTypes = ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"];
const typePattern = allowedTypes.join("|");
const conventionalPattern = new RegExp(`^(${typePattern})(!)?: .{1,100}$`);
const scopedPattern = new RegExp(`^(${typePattern})\\([^)]*\\)(!)?:`);

if (firstLine.startsWith("Merge ")) {
  process.exit(0);
}

if (scopedPattern.test(firstLine)) {
  console.error("Commit scopes are not allowed. Use `type: subject`, for example `fix: keep dialog cancel valid`.");
  process.exit(1);
}

if (!conventionalPattern.test(firstLine)) {
  console.error("Invalid commit message.");
  console.error(`Use Conventional Commits without scopes: ${allowedTypes.join("|")}: subject`);
  console.error("Example: `feat: add workout timer`");
  process.exit(1);
}
