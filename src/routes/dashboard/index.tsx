import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useDeferredValue } from "react";
import { Navbar } from "@/components/Navbar";
import { RepoList } from "@/components/RepoList";
import type { Repo } from "@/components/types";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(1);

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

  const searchQuery = useQuery({
    queryKey: ["repos-search", deferredSearch],
    queryFn: async () => {
      const res = await fetch(
        `/api/github/repos/search?q=${encodeURIComponent(deferredSearch)}`
      );
      if (!res.ok) throw new Error("Search failed");
      return res.json() as Promise<{ repos: Repo[] }>;
    },
    enabled: deferredSearch.length > 0,
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

  const isSearching = deferredSearch.length > 0;
  const repos = isSearching
    ? (searchQuery.data?.repos ?? [])
    : (reposQuery.data?.repos ?? []);
  const loading = isSearching ? searchQuery.isLoading : reposQuery.isLoading;

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="fixed inset-0 w-screen h-screen bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_1px,_transparent_1px)] bg-[length:24px_24px] pointer-events-none" />
      <Navbar user={userQuery.data?.user} />
      <RepoList
        repos={repos}
        isLoading={loading}
        search={search}
        onSearchChange={setSearch}
        page={page}
        onPageChange={setPage}
        hasMore={!isSearching && repos.length >= 30}
        showPagination={!isSearching}
      />
    </div>
  );
}
