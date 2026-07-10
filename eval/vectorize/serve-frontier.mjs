#!/usr/bin/env node
import http from "node:http";
import { readFileSync } from "node:fs";
import path from "node:path";
import { loadManifest, searchCatalog } from "../../src/catalog/search.ts";
import { MODEL, POLICY } from "./frontier-config.mjs";
import { REPO } from "./frontier-config.mjs";
import { loadFrontierArtifact, rerankSearchPage } from "./retrieval.mjs";

const argValue = (flag) => {
  const index = process.argv.indexOf(flag);
  return index === -1 ? undefined : process.argv[index + 1];
};
const port = Number(argValue("--port") ?? 8792);
const host = argValue("--host") ?? "127.0.0.1";
const catalog = loadManifest(JSON.parse(readFileSync(path.join(REPO, "catalog", "manifest.json"), "utf8")));
loadFrontierArtifact();

function jsonRpc(id, result) {
  return { jsonrpc: "2.0", id, result };
}

function send(res, value, status = 200) {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(value));
}

async function bodyOf(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method !== "POST" || !req.url?.replace(/\/+$/, "").endsWith("/mcp")) {
      return send(res, { error: "POST /mcp required" }, 404);
    }
    const request = await bodyOf(req);
    if (request.method === "initialize") {
      return send(
        res,
        jsonRpc(request.id, {
          protocolVersion: "2025-06-18",
          capabilities: { tools: {} },
          serverInfo: { name: "vectorize-frontier-isolated", version: "1" },
          instructions: `Isolated ${MODEL.id}@${MODEL.revision.slice(0, 12)} ${POLICY.id} experiment. Search only.`
        })
      );
    }
    if (request.method === "notifications/initialized") return send(res, { ok: true });
    if (request.method === "tools/list") {
      return send(
        res,
        jsonRpc(request.id, {
          tools: [
            {
              name: "search",
              description: "Experimental pinned Qwen3 semantic rerank over the shipped lexical catalog.",
              inputSchema: {
                type: "object",
                properties: {
                  query: { type: "string" },
                  limit: { type: "integer", minimum: 1, maximum: 50 },
                  kind: { type: "string" },
                  service: { type: "string" }
                },
                required: ["query"],
                additionalProperties: false
              }
            }
          ]
        })
      );
    }
    if (request.method === "tools/call" && request.params?.name === "search") {
      const args = request.params.arguments ?? {};
      if (typeof args.query !== "string" || !args.query.trim()) {
        return send(res, { jsonrpc: "2.0", id: request.id, error: { code: -32602, message: "query required" } });
      }
      const hits = await rerankSearchPage(searchCatalog, catalog, args);
      const payload = {
        hits,
        total: hits.length,
        truncated: false,
        experiment: { model: MODEL.id, revision: MODEL.revision, policy: POLICY.id }
      };
      return send(
        res,
        jsonRpc(request.id, {
          content: [{ type: "text", text: JSON.stringify(payload) }],
          structuredContent: payload
        })
      );
    }
    return send(res, { jsonrpc: "2.0", id: request.id, error: { code: -32601, message: "method not found" } });
  } catch (error) {
    send(res, { jsonrpc: "2.0", id: null, error: { code: -32603, message: error.message } }, 500);
  }
});

server.listen(port, host, () => {
  console.log(`vectorize frontier harness ready at http://${host}:${port}/mcp`);
  console.log(`${MODEL.id}@${MODEL.revision} ${MODEL.dtype} ${POLICY.id}`);
});
