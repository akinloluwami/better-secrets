import { createFileRoute } from "@tanstack/react-router";
import { validateSession } from "@/server/auth";
import { listRepoSecrets } from "@/server/github";

export const Route = createFileRoute("/api/github/secrets")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const cookies = request.headers.get("cookie") ?? "";
        const sessionId = cookies
          .split(";")
          .map((c) => c.trim())
          .find((c) => c.startsWith("session="))
          ?.split("=")[1];

        if (!sessionId) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const result = await validateSession(sessionId);
        if (!result) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        const url = new URL(request.url);
        const owner = url.searchParams.get("owner");
        const repo = url.searchParams.get("repo");

        if (!owner || !repo) {
          return Response.json({ error: "owner and repo required" }, { status: 400 });
        }

        const data = await listRepoSecrets(result.user.github_token, owner, repo);
        return Response.json(data);
      },
    },
  },
})