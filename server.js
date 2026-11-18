import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";

const routes = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/src/app.js", ["src/app.js", "text/javascript; charset=utf-8"]],
  ["/src/scenarios.js", ["src/scenarios.js", "text/javascript; charset=utf-8"]]
]);

export function createTrainingServer() {
  return createServer(async (request, response) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.setHeader("Referrer-Policy", "no-referrer");
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("Content-Type", "text/plain; charset=utf-8");

    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end("Método não permitido. Esta demonstração não recebe dados.");
      return;
    }

    let pathname;
    try {
      pathname = new URL(request.url, "http://127.0.0.1").pathname;
    } catch {
      response.writeHead(400);
      response.end("Endereço de requisição inválido.");
      return;
    }

    const route = routes.get(pathname);
    if (!route) {
      response.writeHead(404);
      response.end("Arquivo não disponível.");
      return;
    }

    const [filename, contentType] = route;
    let content;
    try {
      content = await readFile(new URL(filename, import.meta.url));
    } catch (error) {
      console.error(`Falha ao ler o recurso estático ${filename}:`, error);
      response.writeHead(500);
      response.end("Não foi possível carregar o recurso estático.");
      return;
    }

    response.writeHead(200, { "Content-Type": contentType });
    response.end(request.method === "HEAD" ? undefined : content);
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const server = createTrainingServer();
  server.on("error", (error) => {
    console.error("Não foi possível iniciar o servidor local:", error.message);
    process.exitCode = 1;
  });
  server.listen(4173, "127.0.0.1", () => {
    console.log("Laboratório educativo: http://127.0.0.1:4173");
    console.log("Somente acesso local. Encerre com Ctrl+C.");
  });
}
