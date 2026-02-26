import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, LogOut } from "lucide-react";
import { useState } from "react";
import { DashboardContext } from "@/components/DashboardContext";

export const Route = createFileRoute("/dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const [search, setSearch] = useState("");
  const matchRoute = useMatchRoute();
  const isDashboardIndex = !!matchRoute({ to: "/dashboard" });

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

  return (
    <DashboardContext.Provider value={{ search, setSearch }}>
      <div className="min-h-screen bg-stone-950 text-stone-100">
        <div className="fixed inset-0 w-screen h-screen bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_1px,_transparent_1px)] bg-[length:24px_24px] pointer-events-none" />

        <div className="sticky top-0 z-10 bg-stone-950/80 backdrop-blur-md border-b border-stone-800/50">
          <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
            <span className="font-heading text-lg text-accent">Better Secrets</span>
            <div className="flex items-center gap-4">
              {isDashboardIndex && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
                  <input
                    type="text"
                    placeholder="Search all repos..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-stone-900 border border-stone-700 rounded-md pl-9 pr-4 py-2 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-accent w-64"
                  />
                </div>
              )}
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
        </div>

        <Outlet />
      </div>
    </DashboardContext.Provider>
  );
}
