import { useQuery } from "@tanstack/react-query";
import { X, Key } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
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
      <motion.div
        className="fixed inset-0 bg-black/50 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed top-0 right-0 h-full w-full max-w-2xl bg-stone-900 border-l border-stone-800 z-50 overflow-y-auto shadow-2xl"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-stone-800">
          <div>
            <div className="text-base font-medium">{repo.full_name}</div>
            <div className="text-xs text-stone-500 mt-1">
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
      </motion.div>
    </>
  );
}
