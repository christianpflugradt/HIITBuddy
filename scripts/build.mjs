import { cp, mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";

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
await cp("src/index.html", "dist/index.html");
await cp("src/styles.css", "dist/styles.css");
