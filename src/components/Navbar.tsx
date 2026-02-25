import { LogOut } from "lucide-react";
import type { User } from "./types";

export function Navbar({ user }: { user?: User }) {
  return (
    <div className="relative flex items-center justify-between px-8 py-4 max-w-6xl mx-auto border-b border-stone-800">
      <span className="font-heading text-lg text-accent">Better Secrets</span>
      <div className="flex items-center gap-4">
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
  );
}
