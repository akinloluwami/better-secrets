import { createFileRoute } from "@tanstack/react-router";
import { Shield, Search, Zap, Users, Lock, GitBranch } from "lucide-react";

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
        <h1
          className="text-5xl md:text-7xl leading-tight xanh-mono-regular-italic"
        >
          GitHub Secrets
          <br />
          <span className="italic bg-gradient-to-r from-green-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">without the pain</span>
        </h1>
        <p className="mt-6 text-stone-400 text-lg max-w-2xl mx-auto leading-relaxed">
          Search, bulk-edit, and manage your GitHub Actions secrets across repos,
          environments, and orgs — all from one place.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <a
            href="/api/auth/github"
            className="bg-accent text-stone-950 px-8 py-3 rounded-md font-bold hover:opacity-90 transition-opacity"
          >
            Get started
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="border border-stone-700 text-stone-300 px-8 py-3 rounded-md hover:border-stone-500 transition-colors"
          >
            View source
          </a>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-20">
        <div className="font-heading text-2xl text-center mb-14">
          What GitHub should've built
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Search className="w-6 h-6" />}
            title="Search everything"
            description="Find secrets across all your repos instantly. Filter by name, repo, or environment."
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="Bulk operations"
            description="Update or delete secrets in bulk. No more clicking through repos one by one."
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Encrypted at rest"
            description="Your GitHub token is AES-256 encrypted. Secret values are encrypted with libsodium before hitting the API."
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Org-level view"
            description="See and manage org secrets with visibility controls — all repos, private, or selected."
          />
          <FeatureCard
            icon={<Lock className="w-6 h-6" />}
            title="Environment secrets"
            description="Manage environment-scoped secrets without digging through GitHub's nested UI."
          />
          <FeatureCard
            icon={<GitBranch className="w-6 h-6" />}
            title="No data stored"
            description="We don't store your secrets. Everything reads and writes directly through the GitHub API."
          />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-20 text-center">
        <div className="font-heading text-2xl mb-6">Open source, always</div>
        <p className="text-stone-400 leading-relaxed mb-8">
          This project is fully open source. Audit the code, self-host it, or
          contribute. Your secrets management shouldn't depend on trust — it
          should depend on transparency.
        </p>
        <a
          href="https://github.com"
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

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-stone-900 border border-stone-800 rounded-lg p-6 hover:border-stone-700 transition-colors">
      <div className="text-accent mb-3">{icon}</div>
      <div className="font-bold text-lg mb-2">{title}</div>
      <p className="text-stone-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}
