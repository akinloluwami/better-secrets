import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { RepoList } from "@/components/RepoList";
import { SecretsSheet } from "@/components/SecretsSheet";
import type { Repo } from "@/components/types";

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

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

  const repos = reposQuery.data?.repos ?? [];

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="fixed inset-0 w-screen h-screen bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_1px,_transparent_1px)] bg-[length:24px_24px] pointer-events-none" />
      <Navbar user={userQuery.data?.user} />
      <RepoList
        repos={repos}
        isLoading={reposQuery.isLoading}
        search={search}
        onSearchChange={setSearch}
        page={page}
        onPageChange={setPage}
        hasMore={repos.length >= 30}
        onSelectRepo={setSelectedRepo}
      />
      <SecretsSheet repo={selectedRepo} onClose={() => setSelectedRepo(null)} />
    </div>
  );
}
