import test from "node:test";
import assert from "node:assert/strict";
import { once } from "node:events";
import { createTrainingServer } from "../server.js";

test("servidor entrega somente os recursos públicos e rejeita envio de dados", async (t) => {
  const server = createTrainingServer();
  t.after(() => new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  }));
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const base = `http://127.0.0.1:${server.address().port}`;

  await t.test("carrega HTML, CSS e módulos com tipos apropriados", async () => {
    const assets = [
      ["/", "text/html"],
      ["/index.html", "text/html"],
      ["/styles.css", "text/css"],
      ["/src/app.js", "text/javascript"],
      ["/src/scenarios.js", "text/javascript"]
    ];
    for (const [path, contentType] of assets) {
      const response = await fetch(`${base}${path}`);
      assert.equal(response.status, 200);
      assert.ok(response.headers.get("content-type").startsWith(contentType));
      assert.equal(response.headers.get("x-content-type-options"), "nosniff");
      assert.ok((await response.text()).length > 0);
    }
    const head = await fetch(base, { method: "HEAD" });
    assert.equal(head.status, 200);
    assert.equal(await head.text(), "");
  });

  await t.test("recursos continuam acessíveis quando a página é hospedada em uma subpasta", async () => {
    const response = await fetch(base);
    const html = await response.text();
    const projectUrl = new URL("https://exemplo.invalid/cibersecurity-desafio-phishing/");
    const resources = Array.from(
      html.matchAll(/(?:href|src)="([^"]+\.(?:css|js))"/g),
      (match) => match[1]
    );
    assert.ok(resources.length > 0, "A página deve referenciar os recursos da demonstração");

    for (const resource of resources) {
      const resourceUrl = new URL(resource, projectUrl);
      assert.equal(resourceUrl.origin, projectUrl.origin);
      assert.ok(
        resourceUrl.pathname.startsWith(projectUrl.pathname),
        `O recurso ${resource} não pode escapar da subpasta do projeto`
      );
      const relativePath = resourceUrl.pathname.slice(projectUrl.pathname.length);
      const asset = await fetch(new URL(relativePath, `${base}/`));
      assert.equal(asset.status, 200);
      await asset.arrayBuffer();
    }
  });

  await t.test("não expõe arquivos internos, configurações ou caminhos arbitrários", async () => {
    for (const path of ["/server.js", "/package.json", "/.git/config", "/.env", "/README.md", "/%2e%2e/server.js"]) {
      const response = await fetch(`${base}${path}`);
      assert.equal(response.status, 404);
      await response.text();
    }
  });

  await t.test("não oferece endpoints para coleta de dados", async () => {
    for (const path of ["/", "/login", "/collect"]) {
      const response = await fetch(`${base}${path}`, {
        method: "POST",
        body: "exemplo-ficticio"
      });
      assert.equal(response.status, 405);
      assert.equal(response.headers.get("allow"), "GET, HEAD");
      await response.text();
    }
  });
});
