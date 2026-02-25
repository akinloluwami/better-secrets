import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "motion/react";
import { useState } from "react";

export function SecretForm({
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

  function parseEnv(raw: string): { name: string; value: string }[] {
    const parsed: { name: string; value: string }[] = [];
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eqIndex = trimmed.indexOf("=");
      if (eqIndex === -1) continue;
      const name = trimmed.slice(0, eqIndex).trim().toUpperCase();
      let value = trimmed.slice(eqIndex + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (name) parsed.push({ name, value });
    }
    return parsed;
  }

  function handleNamePaste(e: React.ClipboardEvent, index: number) {
    const text = e.clipboardData.getData("text");
    if (text.includes("=") || text.includes("\n")) {
      e.preventDefault();
      const parsed = parseEnv(text);
      if (parsed.length > 0) {
        setEntries((prev) => {
          const before = prev.slice(0, index);
          const after = prev.slice(index + 1);
          return [...before, ...parsed, ...after];
        });
        setError("");
      }
    }
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
        <button type="button" onClick={onDone} className="text-xs text-stone-500 hover:text-stone-300 transition-colors">
          Cancel
        </button>
      </div>

      {!isEditing && entries.length === 1 && !entries[0].name && (
        <div className="text-xs text-stone-500 bg-stone-800/50 border border-stone-700/50 rounded-md px-3 py-2">
          Tip: paste .env contents into the name field to auto-populate multiple secrets
        </div>
      )}

      <div className="space-y-4">
        {entries.map((entry, i) => (
          <div key={i} className="space-y-2 bg-stone-800/50 border border-stone-700/50 rounded-lg p-3">
            {entries.length > 1 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">Secret {i + 1}</span>
                <button type="button" onClick={() => removeEntry(i)} className="text-xs text-stone-500 hover:text-red-400 transition-colors">
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
                onPaste={(e) => !isEditing && handleNamePaste(e, i)}
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
        <button type="button" onClick={addEntry} className="w-full py-2 text-xs text-stone-500 border border-dashed border-stone-700 rounded-md hover:border-stone-500 hover:text-stone-300 transition-colors">
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
            : `Create ${entries.length > 1 ? `${entries.length} secrets` : "secret"}`}
      </button>
    </motion.form>
  );
}
