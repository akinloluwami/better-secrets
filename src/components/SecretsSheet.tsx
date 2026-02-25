import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, Key, Search, Plus, Trash2, Pencil, Check, ArrowDownAZ, CalendarArrowDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import type { Repo, Secret } from "./types";

interface SecretsSheetProps {
  repo: Repo | null;
  onClose: () => void;
}

export function SecretsSheet({ repo, onClose }: SecretsSheetProps) {
  return (
    <AnimatePresence>
      {repo && <SheetContent repo={repo} onClose={onClose} />}
    </AnimatePresence>
  );
}

function SheetContent({ repo, onClose }: { repo: Repo; onClose: () => void }) {
  const [owner, name] = repo.full_name.split("/");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showForm, setShowForm] = useState(false);
  const [editingSecret, setEditingSecret] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"name" | "date">("date");
  const [deleteTarget, setDeleteTarget] = useState<string[] | null>(null);
  const queryClient = useQueryClient();

  const secretsQuery = useQuery({
    queryKey: ["secrets", repo.full_name],
    queryFn: async () => {
      const res = await fetch(`/api/github/secrets?owner=${owner}&repo=${name}`);
      if (!res.ok) throw new Error("Failed to fetch secrets");
      return res.json() as Promise<{ total_count: number; secrets: Secret[] }>;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (names: string[]) => {
      const res = await fetch("/api/github/secrets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner, repo: name, names }),
      });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => {
      setSelected(new Set());
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ["secrets", repo.full_name] });
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
  const allSelected = filtered.length > 0 && filtered.every((s) => selected.has(s.name));

  function toggleSelect(secretName: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(secretName)) next.delete(secretName);
      else next.add(secretName);
      return next;
    });
  }

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((s) => s.name)));
    }
  }

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/50 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed top-0 right-0 h-full w-full max-w-2xl bg-stone-900 border-l border-stone-800 z-50 flex flex-col shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <div className="sticky top-0 bg-stone-900 z-10 border-b border-stone-800">
          <div className="flex items-center justify-between px-6 py-4">
            <div>
              <div className="text-base font-medium">{repo.full_name}</div>
              <div className="text-xs text-stone-500 mt-0.5">
                {secretsQuery.isLoading
                  ? "Loading..."
                  : `${secretsQuery.data?.total_count ?? 0} secrets`}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowForm(true); setEditingSecret(null); }}
                className="flex items-center gap-1.5 bg-accent text-stone-950 px-3 py-1.5 rounded-md text-xs font-bold hover:opacity-90 transition-opacity"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
              <button
                onClick={onClose}
                className="text-stone-500 hover:text-stone-300 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="px-6 pb-3 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-500" />
              <input
                type="text"
                placeholder="Filter secrets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-stone-800 border border-stone-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none focus:border-accent"
              />
            </div>
            {selected.size > 0 && (
              <button
                onClick={() => setDeleteTarget([...selected])}
                className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-md text-xs font-bold hover:bg-red-700 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete {selected.size}
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {showForm ? (
              <SecretForm
                key="form"
                owner={owner}
                repoName={name}
                repoFullName={repo.full_name}
                editingName={editingSecret}
                onDone={() => { setShowForm(false); setEditingSecret(null); }}
              />
            ) : secretsQuery.isLoading ? (
              <motion.div key="loading" className="text-stone-400 text-center py-12">
                Loading secrets...
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div key="empty" className="text-stone-500 text-center py-12">
                {search ? "No secrets match your filter" : "No secrets yet"}
              </motion.div>
            ) : (
              <motion.div key="list" className="grid gap-2">
                <div className="flex items-center justify-between mb-1 px-1">
                  <button
                    onClick={toggleAll}
                    className="flex items-center gap-2 text-xs text-stone-500 hover:text-stone-300 transition-colors"
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${allSelected ? "bg-accent border-accent" : "border-stone-600"}`}>
                      {allSelected && <Check className="w-3 h-3 text-stone-950" />}
                    </div>
                    {allSelected ? "Deselect all" : "Select all"}
                  </button>
                  <button
                    onClick={() => setSortBy((s) => (s === "name" ? "date" : "name"))}
                    className="flex items-center gap-1.5 text-xs text-stone-500 hover:text-stone-300 transition-colors"
                  >
                    {sortBy === "name" ? (
                      <><ArrowDownAZ className="w-3.5 h-3.5" /> A–Z</>
                    ) : (
                      <><CalendarArrowDown className="w-3.5 h-3.5" /> Recent</>
                    )}
                  </button>
                </div>
                {filtered.map((secret) => (
                  <div
                    key={secret.name}
                    className="flex items-center gap-3 bg-stone-800 border border-stone-700 rounded-md px-4 py-3 group"
                  >
                    <button onClick={() => toggleSelect(secret.name)}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${selected.has(secret.name) ? "bg-accent border-accent" : "border-stone-600"}`}>
                        {selected.has(secret.name) && <Check className="w-3 h-3 text-stone-950" />}
                      </div>
                    </button>
                    <Key className="w-4 h-4 text-accent shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-mono truncate">{secret.name}</div>
                      <div className="text-xs text-stone-500 mt-0.5">
                        Updated {new Date(secret.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { setEditingSecret(secret.name); setShowForm(true); }}
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

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
    </>
  );
}

function DeleteConfirmDialog({
  names,
  isPending,
  onConfirm,
  onCancel,
}: {
  names: string[];
  isPending: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const [confirmation, setConfirmation] = useState("");
  const expected = names.length === 1 ? names[0] : "delete";
  const isValid = confirmation === expected;

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/60 z-[60]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      />
      <motion.div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-sm bg-stone-900 border border-stone-700 rounded-lg p-6 shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
      >
        <div className="text-sm font-medium mb-1">Confirm deletion</div>
        <p className="text-xs text-stone-400 mb-4">
          {names.length === 1
            ? <>This will permanently delete <span className="font-mono text-stone-200">{names[0]}</span>.</>
            : <>This will permanently delete <span className="text-stone-200">{names.length} secrets</span>.</>}
        </p>
        <p className="text-xs text-stone-400 mb-3">
          Type <span className="font-mono text-stone-200 bg-stone-800 px-1.5 py-0.5 rounded">{expected}</span> to confirm.
        </p>
        <input
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder={expected}
          autoFocus
          className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-sm font-mono text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-red-500 mb-4"
        />
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 text-xs border border-stone-700 rounded-md hover:border-stone-500 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isValid || isPending}
            className="flex-1 px-3 py-2 text-xs bg-red-600 text-white rounded-md font-bold hover:bg-red-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {isPending ? "Deleting..." : "Delete"}
          </button>
        </div>
      </motion.div>
    </>
  );
}

function SecretForm({
  owner,
  repoName,
  repoFullName,
  editingName,
  onDone,
}: {
  owner: string;
  repoName: string;
  repoFullName: string;
  editingName: string | null;
  onDone: () => void;
}) {
  const isEditing = !!editingName;
  const [entries, setEntries] = useState<{ name: string; value: string }[]>(
    [{ name: editingName ?? "", value: "" }]
  );
  const [error, setError] = useState("");
  const queryClient = useQueryClient();

  function updateEntry(index: number, field: "name" | "value", val: string) {
    setEntries((prev) =>
      prev.map((e, i) =>
        i === index
          ? { ...e, [field]: field === "name" ? val.toUpperCase() : val }
          : e
      )
    );
  }

  function addEntry() {
    setEntries((prev) => [...prev, { name: "", value: "" }]);
  }

  function removeEntry(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index));
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/github/secrets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          owner,
          repo: repoName,
          secrets: entries.map((e) => ({ name: e.name, value: e.value })),
        }),
      });
      if (!res.ok) throw new Error("Save failed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["secrets", repoFullName] });
      onDone();
    },
    onError: () => setError("Failed to save secrets"),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    for (const entry of entries) {
      if (!/^[A-Z_][A-Z0-9_]*$/.test(entry.name)) {
        setError(`Invalid name: ${entry.name || "(empty)"}`);
        return;
      }
      if (!entry.value) {
        setError(`Value is required for ${entry.name}`);
        return;
      }
    }

    saveMutation.mutate();
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">
          {isEditing ? `Update ${editingName}` : `New secret${entries.length > 1 ? "s" : ""}`}
        </div>
        <button
          type="button"
          onClick={onDone}
          className="text-xs text-stone-500 hover:text-stone-300 transition-colors"
        >
          Cancel
        </button>
      </div>

      <div className="space-y-4">
        {entries.map((entry, i) => (
          <div key={i} className="space-y-2 bg-stone-800/50 border border-stone-700/50 rounded-lg p-3">
            {entries.length > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Secret {i + 1}</span>
                <button
                  type="button"
                  onClick={() => removeEntry(i)}
                  className="text-xs text-stone-500 hover:text-red-400 transition-colors"
                >
                  Remove
                </button>
              </div>
            )}
            <div>
              <label className="block text-xs text-stone-400 mb-1">Name</label>
              <input
                type="text"
                value={entry.name}
                onChange={(e) => updateEntry(i, "name", e.target.value)}
                disabled={isEditing}
                placeholder="MY_SECRET_NAME"
                className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-sm font-mono text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-accent disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-400 mb-1">Value</label>
              <textarea
                value={entry.value}
                onChange={(e) => updateEntry(i, "value", e.target.value)}
                placeholder="Enter secret value..."
                rows={2}
                className="w-full bg-stone-800 border border-stone-700 rounded-md px-3 py-2 text-sm font-mono text-stone-100 placeholder:text-stone-600 focus:outline-none focus:border-accent resize-none"
              />
            </div>
          </div>
        ))}
      </div>

      {!isEditing && (
        <button
          type="button"
          onClick={addEntry}
          className="w-full py-2 text-xs text-stone-500 border border-dashed border-stone-700 rounded-md hover:border-stone-500 hover:text-stone-300 transition-colors"
        >
          + Add another secret
        </button>
      )}

      {error && <div className="text-xs text-red-400">{error}</div>}

      <button
        type="submit"
        disabled={saveMutation.isPending}
        className="w-full bg-accent text-stone-950 py-2 rounded-md text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {saveMutation.isPending
          ? "Saving..."
          : isEditing
            ? "Update secret"
            : `Create ${entries.length} secret${entries.length > 1 ? "s" : ""}`}
      </button>
    </motion.form>
  );
}
