import { Sparkles } from "lucide-react";

import NotificationsBell from "@/components/animforge/notifications-bell";

export default function Template({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      <div className="fixed bottom-6 right-6 z-[100] flex items-center gap-3">

        <a
          href="/ai-studio"
          title="AnimForge AI Studio"
          className="flex h-11 items-center gap-2 rounded-2xl border border-violet-500/20 bg-[#111116]/90 px-4 text-sm font-semibold text-violet-300 shadow-xl shadow-black/30 backdrop-blur-xl transition hover:border-violet-500/40 hover:bg-violet-500/15 hover:text-white"
        >
          <Sparkles size={17} />

          <span className="hidden sm:inline">
            AI Studio
          </span>
        </a>

        <NotificationsBell />

      </div>
    </>
  );
}
