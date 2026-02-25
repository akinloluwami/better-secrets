import { createFileRoute } from "@tanstack/react-router";
import { validateSession } from "@/server/auth";

export const Route = createFileRoute("/api/auth/me")({
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
          return Response.json({ user: null }, { status: 401 });
        }

        const result = await validateSession(sessionId);
        if (!result) {
          return Response.json({ user: null }, { status: 401 });
        }

        return Response.json({
          user: {
            id: result.user.id,
            username: result.user.username,
            avatar_url: result.user.avatar_url,
          },
        });
      },
    },
  },
});