import { cp, mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";

const hashContent = (content) => createHash("sha256").update(content).digest("hex").slice(0, 10);

const run = (command, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: "inherit", shell: process.platform === "win32" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${command} ${args.join(" ")} exited with code ${code}`));
    });
  });

await rm("dist", { recursive: true, force: true });
await run("tsc", []);
await mkdir("dist", { recursive: true });
await cp("src/public", "dist", { recursive: true });

const [mainJs, mainJsMap, stylesCss, indexHtml] = await Promise.all([
  readFile("dist/main.js", "utf8"),
  readFile("dist/main.js.map", "utf8"),
  readFile("src/styles.css", "utf8"),
  readFile("src/index.html", "utf8")
]);

const mainHash = hashContent(mainJs);
const stylesHash = hashContent(stylesCss);
const hashedMainJsName = `main.${mainHash}.js`;
const hashedMainJsMapName = `main.${mainHash}.js.map`;
const hashedStylesName = `styles.${stylesHash}.css`;

const hashedMainJs = mainJs.replace(/\/\/# sourceMappingURL=main\.js\.map\s*$/u, `//# sourceMappingURL=${hashedMainJsMapName}`);
const hashedMainJsMap = mainJsMap.replace(/"file":"main\.js"/u, `"file":"${hashedMainJsName}"`);
const hashedIndexHtml = indexHtml
  .replace("./styles.css", `./${hashedStylesName}`)
  .replace("./main.js", `./${hashedMainJsName}`);

await Promise.all([
  writeFile(`dist/${hashedMainJsName}`, hashedMainJs),
  writeFile(`dist/${hashedMainJsMapName}`, hashedMainJsMap),
  writeFile(`dist/${hashedStylesName}`, stylesCss),
  writeFile("dist/index.html", hashedIndexHtml),
  rm("dist/main.js"),
  rm("dist/main.js.map")
]);
