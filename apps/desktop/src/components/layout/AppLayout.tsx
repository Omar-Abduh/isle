import React from "react";
import { Nav } from "./Nav";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground flex-col relative overflow-x-hidden">
      
      {/* Optimized Ambient Background: using pure radial gradients instead of heavy DOM blur filters */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] opacity-10 dark:opacity-[0.03]" 
          style={{ background: 'radial-gradient(circle at center, var(--color-primary) 0%, transparent 65%)', transform: 'translateZ(0)' }} 
        />
        <div 
          className="absolute top-[40%] right-[-10%] w-[50vw] h-[50vw] opacity-5 dark:opacity-[0.02]" 
          style={{ background: 'radial-gradient(circle at center, var(--color-primary) 0%, transparent 65%)', transform: 'translateZ(0)' }} 
        />
      </div>

      <Nav />
      
      {/* Desktop: fixed top nav needs spacer. Mobile: bottom nav, no top spacer needed but bottom padding */}
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 pt-20 lg:pt-[calc(2%+6vw)] pb-28 lg:pb-8 relative z-10">
        <div className="mx-auto max-w-5xl w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
