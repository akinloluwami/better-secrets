import { createFileRoute } from "@tanstack/react-router";
import crypto from "node:crypto";

export const Route = createFileRoute("/api/auth/github")({
  server: {
    handlers: {
      GET: ({ request }) => {
        const state = crypto.randomBytes(16).toString("hex");
        const clientId = process.env.GITHUB_CLIENT_ID;
        if (!clientId) {
          return new Response("GITHUB_CLIENT_ID not configured", { status: 500 });
        }

        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: `${new URL(request.url).origin}/api/auth/github/callback`,
          scope: "repo",
          state,
        });

        return new Response(null, {
          status: 302,
          headers: {
            Location: `https://github.com/login/oauth/authorize?${params}`,
            "Set-Cookie": `oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`,
          },
        });
      },
    },
  },
});