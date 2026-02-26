import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useDeferredValue, useState } from "react";
import { RepoList } from "@/components/RepoList";
import { useDashboardSearch } from "@/routes/dashboard";
import type { Repo } from "@/components/types";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardIndex,
});

function DashboardIndex() {
  const { search } = useDashboardSearch();
  const deferredSearch = useDeferredValue(search);
  const [page, setPage] = useState(1);

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

  const isSearching = deferredSearch.length > 0;
  const repos = isSearching
    ? (searchQuery.data?.repos ?? [])
    : (reposQuery.data?.repos ?? []);
  const loading = isSearching ? searchQuery.isLoading : reposQuery.isLoading;

  return (
    <RepoList
      repos={repos}
      isLoading={loading}
      search={search}
      page={page}
      onPageChange={setPage}
      hasMore={!isSearching && repos.length >= 30}
      showPagination={!isSearching}
    />
  );
}
