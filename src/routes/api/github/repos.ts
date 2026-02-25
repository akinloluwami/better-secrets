import { createFileRoute } from "@tanstack/react-router";
import { validateSession } from "@/server/auth";
import { listRepos } from "@/server/github";

export const Route = createFileRoute("/api/github/repos")({
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
        const page = Number(url.searchParams.get("page") ?? "1");

        try {
          const repos = await listRepos(result.user.github_token, page);
          return Response.json({ repos });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Unknown error";
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  },
});