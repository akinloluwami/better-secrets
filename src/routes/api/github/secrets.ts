import { createFileRoute } from "@tanstack/react-router";
import { getAuthenticatedUser } from "@/server/session";
import {
  listRepoSecrets,
  getRepoPublicKey,
  createOrUpdateSecret,
  deleteSecret,
} from "@/server/github";
import { encryptSecret } from "@/server/secret-crypto";
export const Route = createFileRoute("/api/github/secrets")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const auth = await getAuthenticatedUser(request);
        if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(request.url);
        const owner = url.searchParams.get("owner");
        const repo = url.searchParams.get("repo");
        if (!owner || !repo) return Response.json({ error: "owner and repo required" }, { status: 400 });

        try {
          const data = await listRepoSecrets(auth.user.github_token, owner, repo);
          return Response.json(data);
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Unknown error";
          const status = msg.includes("404") ? 404 : 500;
          return Response.json({ error: msg }, { status });
        }
      },

      PUT: async ({ request }) => {
        const auth = await getAuthenticatedUser(request);
        if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const body = (await request.json()) as {
          owner: string;
          repo: string;
          secrets: { name: string; value: string }[];
        };

        if (!body.owner || !body.repo || !body.secrets?.length) {
          return Response.json({ error: "owner, repo, and secrets required" }, { status: 400 });
        }

        const pubKey = await getRepoPublicKey(auth.user.github_token, body.owner, body.repo);

        await Promise.all(
          body.secrets.map(async (s) => {
            const encrypted = await encryptSecret(s.value, pubKey.key);
            await createOrUpdateSecret(
              auth.user.github_token,
              body.owner,
              body.repo,
              s.name,
              encrypted,
              pubKey.key_id
            );
          })
        );

        return Response.json({ ok: true });
      },

      DELETE: async ({ request }) => {
        const auth = await getAuthenticatedUser(request);
        if (!auth) return Response.json({ error: "Unauthorized" }, { status: 401 });

        const body = (await request.json()) as {
          owner: string;
          repo: string;
          names: string[];
        };

        if (!body.owner || !body.repo || !body.names?.length) {
          return Response.json({ error: "owner, repo, and names required" }, { status: 400 });
        }

        await Promise.all(
          body.names.map((name) =>
            deleteSecret(auth.user.github_token, body.owner, body.repo, name)
          )
        );

        return Response.json({ ok: true });
      },
    },
  },
});
