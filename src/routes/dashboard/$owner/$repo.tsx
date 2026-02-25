import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Key, Search, Plus, Trash2, Pencil, Check,
  ArrowDownAZ, CalendarArrowDown, ArrowLeft,
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { SecretForm } from "@/components/SecretForm";
import { DeleteConfirmDialog } from "@/components/DeleteConfirmDialog";
import { FormSheet } from "@/components/FormSheet";
import type { Secret } from "@/components/types";

export const Route = createFileRoute("/dashboard/$owner/$repo")({
  component: SecretsPage,
});

function SecretsPage() {
  const { owner, repo } = Route.useParams();
  const fullName = `${owner}/${repo}`;
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingSecret, setEditingSecret] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [deleteTarget, setDeleteTarget] = useState<string[] | null>(null);
  const queryClient = useQueryClient();

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

  const secretsQuery = useQuery({
    queryKey: ["secrets", fullName],
    queryFn: async () => {
      const res = await fetch(
        `/api/github/secrets?owner=${owner}&repo=${repo}`
      );
      if (!res.ok) throw new Error("Failed to fetch secrets");
      return res.json() as Promise<{
        total_count: number;
        secrets: Secret[];
      }>;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (names: string[]) => {
      const res = await fetch("/api/github/secrets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo, names }),
      });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      setSelected(new Set());
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["secrets", fullName] });
    },
  });

  const secrets = secretsQuery.data?.secrets ?? [];
  const filtered = secrets
    .filter((s) => s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) =>
      sortBy === "name"
        ? a.name.localeCompare(b.name)
        : new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  const allSelected =
    filtered.length > 0 && filtered.every((s) => selected.has(s.name));

  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);

  function handleSelect(name: string, index: number, shiftKey: boolean) {
    if (shiftKey && lastClickedIndex !== null) {
      const start = Math.min(lastClickedIndex, index);
      const end = Math.max(lastClickedIndex, index);
      setSelected((prev) => {
        const next = new Set(prev);
        for (let i = start; i <= end; i++) {
          next.add(filtered[i].name);
        }
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(name)) next.delete(name);
        else next.add(name);
        return next;
      });
    }
    setLastClickedIndex(index);
  }

  function toggleAll() {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map((s) => s.name)));
  }

  if (userQuery.isError) {
    if (typeof window !== "undefined") window.location.href = "/login";
    return null;
  }

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="fixed inset-0 w-screen h-screen bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_1px,_transparent_1px)] bg-[length:24px_24px] pointer-events-none" />
      <Navbar user={userQuery.data?.user} />

      <div className="relative max-w-4xl mx-auto px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            to="/dashboard"
            className="text-stone-500 hover:text-stone-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="text-xl font-heading">{fullName}</div>
            <div className="text-xs text-stone-500 mt-0.5">
              {secretsQuery.isLoading
                ? "Loading..."
                : `${secretsQuery.data?.total_count ?? 0} secrets`}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-500" />
            <input
              type="text"
              placeholder="Filter secrets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-stone-900 border border-stone-700 rounded-md pl-9 pr-4 py-2 text-sm text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-accent"
            />
          </div>
          {selected.size > 0 && (
            <button
              onClick={() => setDeleteTarget([...selected])}
              className="flex items-center gap-1.5 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete {selected.size}
            </button>
          )}
          <button
            onClick={() => {
              setShowForm(true);
              setEditingSecret(null);
            }}
            className="flex items-center gap-1.5 bg-accent text-stone-950 px-4 py-2 rounded-md text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>

        {secretsQuery.isLoading ? (
            <div className="text-stone-400 text-center py-16">
              Loading secrets...
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-stone-500 text-center py-16">
              {search ? "No secrets match your filter" : "No secrets yet"}
            </div>
          ) : (
            <div className="grid gap-2">
              <div className="flex items-center justify-between mb-1 px-1">
                <button
                  onClick={toggleAll}
                  className="flex items-center gap-2 text-xs text-stone-500 hover:text-stone-300 transition-colors"
                >
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center ${allSelected ? "bg-accent border-accent" : "border-stone-600"}`}
                  >
                    {allSelected && (
                      <Check className="w-3 h-3 text-stone-950" />
                    )}
                  </div>
                  {allSelected ? "Deselect all" : "Select all"}
                </button>
                <button
                  onClick={() =>
                    setSortBy((s) => (s === "name" ? "date" : "name"))
                  }
                  className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-300 transition-colors"
                >
                  {sortBy === "name" ? (
                    <>
                      <ArrowDownAZ className="w-3.5 h-3.5" /> A–Z
                    </>
                  ) : (
                    <>
                      <CalendarArrowDown className="w-3.5 h-3.5" /> Recent
                    </>
                  )}
                </button>
              </div>
              {filtered.map((secret, i) => (
                <div
                  key={secret.name}
                  className="flex items-center gap-3 bg-stone-900 border border-stone-800 rounded-lg px-5 py-4 group"
                >
                  <button onClick={(e) => handleSelect(secret.name, i, e.shiftKey)}>
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${selected.has(secret.name) ? "bg-accent border-accent" : "border-stone-600"}`}
                    >
                      {selected.has(secret.name) && (
                        <Check className="w-3 h-3 text-stone-950" />
                      )}
                    </div>
                  </button>
                  <Key className="w-4 h-4 text-accent shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-mono truncate">
                      {secret.name}
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      Updated{" "}
                      {new Date(secret.updated_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingSecret(secret.name);
                        setShowForm(true);
                      }}
                      className="p-1.5 text-stone-500 hover:text-stone-300 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget([secret.name])}
                      className="p-1.5 text-stone-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </div>

      <FormSheet
        open={showForm}
        onClose={() => { setShowForm(false); setEditingSecret(null); }}
        title={editingSecret ? `Update ${editingSecret}` : "Add secrets"}
      >
        <SecretForm
          owner={owner}
          repoName={repo}
          repoFullName={fullName}
          editingName={editingSecret}
          onDone={() => { setShowForm(false); setEditingSecret(null); }}
        />
      </FormSheet>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteConfirmDialog
            names={deleteTarget}
            isPending={deleteMutation.isPending}
            onConfirm={() => deleteMutation.mutate(deleteTarget)}
            onCancel={() => setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
