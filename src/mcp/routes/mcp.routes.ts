import { Router, Request, Response } from "express";
import { randomUUID } from "node:crypto";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp";
import { authenticateOAuthToken } from "~/middlewares/oauth-auth.middleware";
import { createMcpServer } from "~/mcp/server";

const mcpRouter = Router();

// One server instance shared across all sessions — tools registered once
const mcpServer = createMcpServer();

// Session map: Mcp-Session-Id → transport
const transports = new Map<string, StreamableHTTPServerTransport>();

function isInitRequest(body: unknown): boolean {
  return (
    typeof body === "object" &&
    body !== null &&
    (body as Record<string, unknown>).method === "initialize"
  );
}

async function mcpHandler(req: Request, res: Response) {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;

  if (sessionId && transports.has(sessionId)) {
    await transports
      .get(sessionId)!
      .handleRequest(req as any, res as any, req.body);
    return;
  }

  if (!sessionId && isInitRequest(req.body)) {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: () => randomUUID(),
      onsessioninitialized: (sid): any => transports.set(sid, transport),
    });

    transport.onclose = () => {
      if (transport.sessionId) transports.delete(transport.sessionId);
    };

    await mcpServer.connect(transport);
    await transport.handleRequest(req as any, res as any, req.body);
    return;
  }

  res.status(400).json({
    jsonrpc: "2.0",
    error: { code: -32000, message: "Bad Request: missing or invalid session" },
    id: null,
  });
}

mcpRouter.post("/", authenticateOAuthToken, mcpHandler);
mcpRouter.get("/", authenticateOAuthToken, mcpHandler);
mcpRouter.delete("/", authenticateOAuthToken, async (req, res) => {
  const sessionId = req.headers["mcp-session-id"] as string | undefined;
  if (sessionId && transports.has(sessionId)) {
    await transports.get(sessionId)!.close();
    transports.delete(sessionId);
  }
  res.status(204).end();
});

export default mcpRouter;
