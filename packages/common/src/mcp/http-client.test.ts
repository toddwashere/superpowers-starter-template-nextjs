import { describe, expect, it } from "vitest";
import { readMcpJsonRpcResponse } from "./http-client.js";

describe("readMcpJsonRpcResponse", () => {
  it("parses application/json responses", async () => {
    const res = new Response(JSON.stringify({ jsonrpc: "2.0", result: { ok: true }, id: 1 }), {
      headers: { "Content-Type": "application/json" },
    });
    await expect(readMcpJsonRpcResponse(res)).resolves.toEqual({
      jsonrpc: "2.0",
      result: { ok: true },
      id: 1,
    });
  });

  it("parses text/event-stream responses", async () => {
    const res = new Response('event: message\ndata: {"jsonrpc":"2.0","result":{},"id":1}\n\n', {
      headers: { "Content-Type": "text/event-stream" },
    });
    await expect(readMcpJsonRpcResponse(res)).resolves.toEqual({
      jsonrpc: "2.0",
      result: {},
      id: 1,
    });
  });
});
