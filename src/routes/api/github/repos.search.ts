import { createFileRoute } from "@tanstack/react-router";
import { getAuthenticatedUser } from "@/server/session";
import { searchRepos } from "@/server/github";

export const Route = createFileRoute("/api/github/repos/search")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await getAuthenticatedUser(request);
        if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(request.url);
        const q = url.searchParams.get("q") ?? "";
        if (!q.trim()) return Response.json({ repos: [] });

        try {
          const repos = await searchRepos(auth.user.github_token, q);
          return Response.json({ repos });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Unknown error";
          return Response.json({ error: msg }, { status: 500 });
        }
      },
    },
  },
});