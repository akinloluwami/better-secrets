import { createFileRoute } from "@tanstack/react-router";
import { createUser, createSession } from "@/server/auth";

export const Route = createFileRoute("/api/auth/github/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");

        // Validate state
        const cookies = request.headers.get("cookie") ?? "";
        const storedState = cookies
          .split(";")
          .map((c) => c.trim())
          .find((c) => c.startsWith("oauth_state="))
          ?.split("=")[1];

        if (!code || !state || state !== storedState) {
          return new Response("Invalid OAuth state", { status: 400 });
        }

        // Exchange code for access token
        const tokenRes = await fetch(
          "https://github.com/login/oauth/access_token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify({
              client_id: process.env.GITHUB_CLIENT_ID,
              client_secret: process.env.GITHUB_CLIENT_SECRET,
              code,
            }),
          }
        );

        const tokenData = (await tokenRes.json()) as {
          access_token?: string;
          error?: string;
        };
        if (!tokenData.access_token) {
          return new Response("Failed to get access token", { status: 400 });
        }

        // Fetch GitHub user profile
        const userRes = await fetch("https://api.github.com/user", {
          headers: { Authorization: `Bearer ${tokenData.access_token}` },
        });
        const ghUser = (await userRes.json()) as {
          id: number;
          login: string;
          avatar_url: string;
        };

        // Create or update user, then create session
        const user = await createUser(
          ghUser.id,
          ghUser.login,
          ghUser.avatar_url,
          tokenData.access_token
        );
        const session = await createSession(user.id);

        const headers = new Headers();
        headers.append("Location", "/");
        headers.append(
          "Set-Cookie",
          `session=${session.id}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`
        );
        headers.append(
          "Set-Cookie",
          "oauth_state=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0"
        );

        return new Response(null, { status: 302, headers });
      },
    },
  },
});