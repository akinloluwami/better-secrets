import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Lock, LogOut, Search, ChevronRight, X, Key } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

interface Repo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string; avatar_url: string };
  private: boolean;
  updated_at: string;
}

interface Secret {
  name: string;
  created_at: string;
  updated_at: string;
}

function Dashboard() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);

  const userQuery = useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) throw new Error("Not authenticated");
      return res.json() as Promise<{
        user: { id: string; username: string; avatar_url: string };
      }>;
    },
  });

  const reposQuery = useQuery({
    queryKey: ["repos", page],
    queryFn: async () => {
      const res = await fetch(`/api/github/repos?page=${page}`);
      if (!res.ok) throw new Error("Failed to fetch repos");
      return res.json() as Promise<{ repos: Repo[] }>;
    },
  });

  if (userQuery.isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 text-stone-100 flex items-center justify-center">
        <p className="text-stone-400">Loading...</p>
      </div>
    );
  }

  if (userQuery.isError) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  const user = userQuery.data?.user;
  const repos = reposQuery.data?.repos ?? [];
  const filtered = repos.filter((r) =>
    r.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="fixed inset-0 w-screen h-screen bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_1px,_transparent_1px)] bg-[length:24px_24px] pointer-events-none" />

      <div className="relative flex items-center justify-between px-8 py-4 max-w-6xl mx-auto border-b border-stone-800">
        <span className="font-heading text-lg text-accent">GH Secrets</span>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-2">
              <img src={user.avatar_url} alt={user.username} className="w-7 h-7 rounded-full" />
              <span className="text-sm text-stone-300">{user.username}</span>
            </div>
          )}
          <form method="POST" action="/api/auth/logout">
            <button type="submit" className="text-stone-500 hover:text-stone-300 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="relative max-w-6xl mx-auto px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="text-2xl font-heading">Repositories</div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              type="text"
              placeholder="Search repos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-stone-900 border border-stone-700 rounded-md pl-9 pr-4 py-2 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-accent w-64"
            />
          </div>
        </div>

        {reposQuery.isLoading ? (
          <div className="text-stone-400 text-center py-20">Loading repositories...</div>
        ) : (
          <>
            <div className="grid gap-3">
              {filtered.map((repo) => (
                <button
                  key={repo.id}
                  onClick={() => setSelectedRepo(repo)}
                  className="flex items-center justify-between bg-stone-900 border border-stone-800 rounded-lg px-5 py-4 hover:border-stone-600 transition-colors group w-full text-left"
                >
                  <div className="flex items-center gap-3">
                    <img src={repo.owner.avatar_url} alt={repo.owner.login} className="w-8 h-8 rounded-full" />
                    <div>
                      <div className="text-sm font-medium">{repo.full_name}</div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        Updated {new Date(repo.updated_at).toLocaleDateString()}
                        {repo.private && (
                          <span className="ml-2 inline-flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Private
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-stone-600 group-hover:text-stone-400 transition-colors" />
                </button>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="text-stone-500 text-center py-20">
                {search ? "No repos match your search" : "No repositories found"}
              </div>
            )}

            <div className="flex justify-center gap-3 mt-8">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-stone-700 rounded-md hover:border-stone-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-stone-500">Page {page}</span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={repos.length < 30}
                className="px-4 py-2 text-sm border border-stone-700 rounded-md hover:border-stone-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>

      {selectedRepo && (
        <SecretsSheet repo={selectedRepo} onClose={() => setSelectedRepo(null)} />
      )}
    </div>
  );
}

function SecretsSheet({ repo, onClose }: { repo: Repo; onClose: () => void }) {
  const [owner, name] = repo.full_name.split("/");

  const secretsQuery = useQuery({
    queryKey: ["secrets", repo.full_name],
    queryFn: async () => {
      const res = await fetch(
        `/api/github/secrets?owner=${owner}&repo=${name}`
      );
      if (!res.ok) throw new Error("Failed to fetch secrets");
      return res.json() as Promise<{
        total_count: number;
        secrets: Secret[];
      }>;
    },
  });

  const secrets = secretsQuery.data?.secrets ?? [];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-stone-900 border-l border-stone-800 z-50 overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800">
          <div>
            <div className="text-sm font-medium">{repo.full_name}</div>
            <div className="text-xs text-stone-500 mt-0.5">
              {secretsQuery.isLoading
                ? "Loading..."
                : `${secretsQuery.data?.total_count ?? 0} secrets`}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-500 hover:text-stone-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {secretsQuery.isLoading ? (
            <div className="text-stone-400 text-center py-12">Loading secrets...</div>
          ) : secrets.length === 0 ? (
            <div className="text-stone-500 text-center py-12">No secrets found</div>
          ) : (
            <div className="grid gap-2">
              {secrets.map((secret) => (
                <div
                  key={secret.name}
                  className="flex items-center gap-3 bg-stone-800 border border-stone-700 rounded-md px-4 py-3"
                >
                  <Key className="w-4 h-4 text-accent shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-mono truncate">{secret.name}</div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      Updated {new Date(secret.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
