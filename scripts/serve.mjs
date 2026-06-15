import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("../dist", import.meta.url)));
const port = Number.parseInt(process.env.PORT ?? "8080", 10);

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webmanifest", "application/manifest+json; charset=utf-8"]
]);

const send = (response, status, body, contentType = "text/plain; charset=utf-8") => {
  response.writeHead(status, { "content-type": contentType });
  response.end(body);
};

const resolveRequestPath = (requestUrl) => {
  const url = new URL(requestUrl ?? "/", `http://localhost:${port}`);
  const decodedPath = decodeURIComponent(url.pathname);
  const normalizedPath = normalize(decodedPath).replace(/^(\.\.[/\\])+/, "");
  const filePath = join(root, normalizedPath === sep ? "index.html" : normalizedPath);
  const resolvedPath = resolve(filePath);

  if (resolvedPath !== root && !resolvedPath.startsWith(`${root}${sep}`)) {
    return null;
  }

  return resolvedPath;
};

const server = createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    send(response, 405, "Method Not Allowed");
    return;
  }

  const filePath = resolveRequestPath(request.url);

  if (!filePath) {
    send(response, 403, "Forbidden");
    return;
  }

  try {
    const fileStat = await stat(filePath);
    const finalPath = fileStat.isDirectory() ? join(filePath, "index.html") : filePath;
    const contentType = contentTypes.get(extname(finalPath)) ?? "application/octet-stream";

    response.writeHead(200, {
      "content-length": (await stat(finalPath)).size,
      "content-type": contentType
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    createReadStream(finalPath).pipe(response);
  } catch {
    send(response, 404, "Not Found");
  }
});

server.listen(port, () => {
  console.log(`HIITBuddy static server listening on http://localhost:${port}`);
});
