// HabitSummaryCard — profile summary card component

interface HabitSummaryCardProps {
  displayName: string
  email: string
  joinedAt: string
  timezone?: string
  totalHabits?: number
  currentStreak?: number
  longestStreak?: number
  initials: string
  pictureUrl?: string
}

export function HabitSummaryCardFront({
  displayName,
  email,
  totalHabits = 0,
  currentStreak = 0,
  longestStreak = 0,
  initials,
  pictureUrl,
}: HabitSummaryCardProps) {
  return (
    <div className="relative w-full h-full [transform-style:preserve-3d] select-none">
      <div className="absolute inset-0 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.3)] [transform-style:preserve-3d]">
        <div className="absolute inset-0 rounded-[24px] bg-card border border-white/10 overflow-hidden [backface-visibility:hidden]">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/30 via-background to-primary/10 dark:from-primary/20 dark:via-background dark:to-primary/5 flex items-center justify-center">
            <span className="text-[10rem] md:text-[14rem] font-black tracking-[0.1em] uppercase text-foreground/[0.08] dark:text-foreground/[0.06] select-none pointer-events-none">
              {initials}
            </span>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="h-24 w-24 rounded-full bg-primary/15 border-2 border-primary/30 flex items-center justify-center shadow-lg">
                {pictureUrl ? (
                  <img
                    src={pictureUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl font-black text-primary">{initials}</span>
                )}
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-foreground">{displayName}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 flex flex-col justify-end pointer-events-none [transform-style:preserve-3d]">
        <div className="rounded-2xl bg-white/45 dark:bg-black/65 backdrop-blur-3xl border border-white/30 dark:border-white/10 flex flex-col gap-1 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.6)] pointer-events-auto [transform:translateZ(80px)] will-change-transform overflow-hidden [backface-visibility:hidden] p-4 m-4 md:p-5 md:m-6">
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none" />
          <div className="absolute -top-[100%] -left-[100%] w-[300%] h-[300%] bg-gradient-to-br from-white/35 via-transparent to-transparent pointer-events-none" />

          <div className="grid grid-cols-3 gap-3 relative z-10">
            {[
              { label: 'HABITS', value: totalHabits },
              { label: 'STREAK', value: `${currentStreak}d` },
              { label: 'BEST', value: `${longestStreak}d` },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500/80 dark:text-foreground/40">
                  {stat.label}
                </span>
                <span className="text-lg md:text-2xl font-black text-zinc-900 dark:text-foreground">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function HabitSummaryCardBack({
  email,
  joinedAt,
  timezone,
  initials: _initials,
}: Pick<HabitSummaryCardProps, 'email' | 'joinedAt' | 'timezone' | 'initials'>) {
  return (
    <div className="relative w-full h-full rounded-[24px] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40 dark:from-primary/60 dark:to-primary/20" />
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-8">
        <div className="h-16 w-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center">
          <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="flex flex-col items-center gap-4 text-white text-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Email</p>
            <p className="text-sm font-bold mt-1 truncate max-w-[200px]">{email}</p>
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Member Since</p>
            <p className="text-sm font-bold mt-1">{joinedAt}</p>
          </div>
          {timezone && (
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Timezone</p>
              <p className="text-sm font-bold mt-1">{timezone}</p>
            </div>
          )}
        </div>
        <div className="mt-auto">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Isle Habit Tracker</p>
        </div>
      </div>
    </div>
  )
}
