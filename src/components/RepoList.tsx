import { Link } from "@tanstack/react-router";
import { Lock, ChevronRight } from "lucide-react";
import type { Repo } from "./types";

interface RepoListProps {
  repos: Repo[];
  isLoading: boolean;
  search: string;
  page: number;
  onPageChange: (page: number) => void;
  hasMore: boolean;
  showPagination: boolean;
}

export function RepoList({
  repos,
  isLoading,
  search,
  page,
  onPageChange,
  hasMore,
  showPagination,
}: RepoListProps) {
  return (
    <div className="relative max-w-6xl mx-auto px-8 py-8">
      <div className="text-2xl font-heading mb-6">Repositories</div>

      {isLoading ? (
        <div className="text-stone-400 text-center py-20">Loading repositories...</div>
      ) : (
        <>
          <div className="grid gap-3">
            {repos.map((repo) => (
              <Link
                key={repo.id}
                to="/dashboard/$owner/$repo"
                params={{ owner: repo.owner.login, repo: repo.name }}
                className="flex items-center justify-between bg-stone-900 border border-stone-800 rounded-lg px-5 py-4 hover:border-stone-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 transition-all group"
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
                <ChevronRight className="w-4 h-4 text-stone-600 group-hover:text-accent transition-colors" />
              </Link>
            ))}
          </div>

          {repos.length === 0 && (
            <div className="text-stone-500 text-center py-20">
              {search ? "No repos match your search" : "No repositories found"}
            </div>
          )}

          {showPagination && (
            <div className="flex justify-center gap-3 mt-8">
              <button
                onClick={() => onPageChange(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 text-sm border border-stone-700 rounded-md hover:border-stone-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-sm text-stone-500">Page {page}</span>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={!hasMore}
                className="px-4 py-2 text-sm border border-stone-700 rounded-md hover:border-stone-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
