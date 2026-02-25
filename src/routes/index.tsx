import { createFileRoute } from "@tanstack/react-router";
import { Shield, Search, Zap, Copy, GitBranch, Eye, Users, Lock, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100">
      <div className="fixed inset-0 w-screen h-screen bg-[radial-gradient(circle,_rgba(255,255,255,0.06)_1px,_transparent_1px)] bg-[length:24px_24px] pointer-events-none" />

      <div className="relative flex items-center justify-between px-8 py-5 max-w-6xl mx-auto">
        <span className="font-heading text-xl text-accent">GH Secrets</span>
        <a
          href="/api/auth/github"
          className="bg-accent text-stone-950 px-5 py-2 rounded-md text-sm font-bold hover:opacity-90 transition-opacity"
        >
          Sign in with GitHub
        </a>
      </div>

      <div className="relative max-w-4xl mx-auto px-8 pt-24 pb-20 text-center">
        <div
          className="text-5xl md:text-7xl leading-tight xanh-mono-regular-italic"
        >
          GitHub Secrets
          <br />
          <span className="italic bg-gradient-to-r from-green-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">without the pain</span>
        </div>
        <p className="mt-6 text-stone-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Search, bulk-edit, and manage your GitHub Actions secrets across all your repos — from one place.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <a
            href="/api/auth/github"
            className="bg-accent text-stone-950 px-8 py-3 rounded-md font-bold hover:opacity-90 transition-opacity"
          >
            Get started
          </a>
          <a
            href="https://github.com/akinloluwami/github-secrets"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-stone-700 text-stone-300 px-8 py-3 rounded-md hover:border-stone-500 transition-colors"
          >
            View source
          </a>
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-8 py-24">
        <div className="font-heading text-2xl text-center mb-4">
          What GitHub should've built
        </div>
        <p className="text-stone-500 text-center text-sm mb-16 max-w-lg mx-auto">
          The stuff you'd expect from a secrets UI. We built it.
        </p>

        <div className="space-y-6">
          <div className="flex items-start gap-6 bg-stone-900/50 border border-stone-800 rounded-xl p-6 hover:border-stone-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Search className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="font-bold mb-1">Search and filter secrets</div>
              <p className="text-stone-400 text-sm leading-relaxed">
                Filter secrets by name within any repo. Search across all your repositories from the dashboard.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-6 bg-stone-900/50 border border-stone-800 rounded-xl p-6 hover:border-stone-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="font-bold mb-1">Bulk operations</div>
              <p className="text-stone-400 text-sm leading-relaxed">
                Select multiple secrets with shift-click, delete them in one go, or paste an entire .env file to create many at once.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-6 bg-stone-900/50 border border-stone-800 rounded-xl p-6 hover:border-stone-700 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
              <Copy className="w-5 h-5 text-accent" />
            </div>
            <div>
              <div className="font-bold mb-1">Copy secrets across repos</div>
              <p className="text-stone-400 text-sm leading-relaxed">
                Select secrets and copy them to another repo. Pick the target, fill in values, done.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative max-w-5xl mx-auto px-8 py-24">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <div className="font-heading text-2xl">Coming soon</div>
        </div>
        <p className="text-stone-500 text-center text-sm mb-16 max-w-lg mx-auto">
          We're not done. These are next on the list.
        </p>

        <div className="grid md:grid-cols-3 gap-px bg-stone-800 rounded-xl overflow-hidden border border-stone-800">
          <div className="bg-stone-950 p-8 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-700 border-dashed flex items-center justify-center">
              <Search className="w-5 h-5 text-stone-500" />
            </div>
            <div className="font-bold text-sm">Cross-repo search</div>
            <p className="text-stone-500 text-xs leading-relaxed">
              Search secrets across every repo at once. Find that one API key wherever it lives.
            </p>
          </div>
          <div className="bg-stone-950 p-8 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-700 border-dashed flex items-center justify-center">
              <Users className="w-5 h-5 text-stone-500" />
            </div>
            <div className="font-bold text-sm">Org-level secrets</div>
            <p className="text-stone-500 text-xs leading-relaxed">
              Manage organization secrets with visibility controls — all repos, private, or selected.
            </p>
          </div>
          <div className="bg-stone-950 p-8 flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-stone-900 border border-stone-700 border-dashed flex items-center justify-center">
              <Lock className="w-5 h-5 text-stone-500" />
            </div>
            <div className="font-bold text-sm">Environment secrets</div>
            <p className="text-stone-500 text-xs leading-relaxed">
              Manage environment-scoped secrets without digging through GitHub's nested UI.
            </p>
          </div>
        </div>
      </div>

      <div className="relative max-w-4xl mx-auto px-8 py-24">
        <div className="font-heading text-2xl text-center mb-16">Built with trust</div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-center gap-12 md:gap-16">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-accent shrink-0" />
            <div>
              <div className="text-sm font-bold">Encrypted at rest</div>
              <p className="text-xs text-stone-500 mt-0.5">AES-256 for tokens, libsodium for secrets</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Eye className="w-5 h-5 text-accent shrink-0" />
            <div>
              <div className="text-sm font-bold">No secrets stored</div>
              <p className="text-xs text-stone-500 mt-0.5">Reads and writes directly via GitHub API</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <GitBranch className="w-5 h-5 text-accent shrink-0" />
            <div>
              <div className="text-sm font-bold">Fully open source</div>
              <p className="text-xs text-stone-500 mt-0.5">Audit it, self-host it, fork it</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-16 text-center">
        <a
          href="https://github.com/akinloluwami/github-secrets"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-stone-700 text-stone-300 px-6 py-3 rounded-md hover:border-stone-500 transition-colors"
        >
          <GitBranch className="w-4 h-4" />
          Star on GitHub
        </a>
      </div>

      <div className="border-t border-stone-800 py-8 text-center text-stone-500 text-sm">
        Not affiliated with GitHub.
      </div>
    </div>
  );
}
