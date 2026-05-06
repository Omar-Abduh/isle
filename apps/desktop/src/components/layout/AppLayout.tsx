import React from "react";
import { Nav } from "./Nav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground flex-col">
      <Nav />
      {/* Desktop: fixed top nav needs spacer. Mobile: bottom nav, no top spacer needed but bottom padding */}
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 pt-20 lg:pt-[calc(2%+6vw)] pb-28 lg:pb-8">
        <div className="mx-auto max-w-5xl w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
