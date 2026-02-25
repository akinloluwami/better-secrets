import { createFileRoute } from "@tanstack/react-router";
import { destroySession } from "@/server/auth";

export const Route = createFileRoute("/api/auth/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const cookies = request.headers.get("cookie") ?? "";
        const sessionId = cookies
          .split(";")
          .map((c) => c.trim())
          .find((c) => c.startsWith("session="))
          ?.split("=")[1];

        if (sessionId) {
          await destroySession(sessionId);
        }

        return new Response(null, {
          status: 302,
          headers: {
            Location: "/login",
            "Set-Cookie":
              "session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0",
          },
        });
      },
    },
  },
});