import { useState } from 'react'
import { format } from 'date-fns'
import { useGetUserProfile, useUpdateUserProfile, useListHabits, useGetStatsSummary, getGetUserProfileQueryKey } from '../lib/api-client'
import { useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import TiltedCard from '@/components/shared/TiltedCard'
import AnimatedList from '@/components/shared/AnimatedList'
import { HabitSummaryCardFront, HabitSummaryCardBack } from '@/components/shared/HabitSummaryCard'
import PageReveal from '@/components/shared/PageReveal'

const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
)

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const IconActivity = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
)

const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
)

const IconClock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
  </svg>
)

function formatJoinedAt(dateStr: string) {
  try {
    return format(new Date(dateStr), 'MMMM yyyy')
  } catch {
    return dateStr
  }
}

interface HabitActivity {
  id: string
  name: string
  color: string
  emoji: string
  streak: number
  frequency: string
  completedToday: boolean
}

export default function Profile() {
  const [flipped, setFlipped] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [timezone, setTimezone] = useState('')
  const [saving, setSaving] = useState(false)

  const { data: profile, isLoading: profileLoading } = useGetUserProfile()
  const { data: habitsData, isLoading: habitsLoading } = useListHabits()
  const { data: stats } = useGetStatsSummary()
  const updateProfile = useUpdateUserProfile()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const habits: HabitActivity[] = (habitsData || []).map((h) => ({
    id: h.id,
    name: h.name,
    color: h.color || '#247E84',
    emoji: h.icon || '✦',
    streak: h.currentStreak || 0,
    frequency: h.rrule.includes('DAILY') ? 'Daily' : h.rrule.includes('WEEKLY') ? 'Weekly' : 'Custom',
    completedToday: h.completedToday,
  }))

  const initials = profile?.displayName
    ? profile.displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'US'

  const handleEditOpen = () => {
    setDisplayName(profile?.displayName || '')
    setTimezone(profile?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)
    setIsEditOpen(true)
  }

  const handleSave = async () => {
    setSaving(true)
    updateProfile.mutate(
      { data: { displayName, timezone } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetUserProfileQueryKey() })
          setIsEditOpen(false)
          toast({ title: 'Profile updated successfully.' })
        },
        onError: () => {
          toast({ title: 'Failed to update profile.', variant: 'destructive' })
        },
        onSettled: () => setSaving(false),
      }
    )
  }

  const userInfoItems = profile
    ? [
        { label: 'Email', value: profile.email },
        { label: 'Timezone', value: profile.timezone || '—' },
        { label: 'Member Since', value: profile.joinedAt ? formatJoinedAt(profile.joinedAt) : '—' },
        { label: 'Total Habits', value: `${habits.length} active` },
      ]
    : []

  const overlayContent = (
    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none [transform-style:preserve-3d]">
      <div className="relative w-full flex justify-end p-4 z-50 pointer-events-auto [transform:translateZ(60px)]">
        <button
          onClick={(e) => { e.stopPropagation(); setFlipped((f) => !f) }}
          className="h-10 w-10 rounded-full bg-background/50 backdrop-blur-2xl border border-white/[0.08] flex items-center justify-center text-foreground shadow-lg hover:bg-background/80 transition-colors active:scale-95"
          aria-label="Flip Card"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 4v6h6" /><path d="M23 20v-6h-6" />
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
          </svg>
        </button>
      </div>
      <div className="flex-1 w-full" />
    </div>
  )

  return (
    <AppLayout>
      <PageReveal>
        <section className="min-h-screen w-full pb-24">
          <div className="w-full pt-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Profile</h1>

            <div className="flex flex-col lg:flex-row items-stretch gap-10">
              {/* Left — Tilted Summary Card */}
              <div className="w-full lg:w-[480px] xl:w-[540px] shrink-0 flex flex-col items-center lg:items-start">
                <div className="relative w-full md:w-[460px] lg:w-full h-full flex flex-col items-center lg:items-start min-h-[400px] sm:min-h-[450px] lg:min-h-0">

                  {/* Desktop: Tilted 3D Card */}
                  <div className="w-full h-[460px] lg:h-[520px] xl:h-[560px] z-10 hidden sm:block">
                    {profileLoading ? (
                      <Skeleton className="w-full h-full rounded-[24px]" />
                    ) : (
                      <TiltedCard
                        displayOverlayContent
                        overlayContent={overlayContent}
                        frontContent={
                          <HabitSummaryCardFront
                            displayName={profile?.displayName || 'User'}
                            email={profile?.email || ''}
                            joinedAt={profile?.joinedAt ? formatJoinedAt(profile.joinedAt) : '—'}
                            timezone={profile?.timezone}
                            totalHabits={stats?.totalHabits ?? habits.length}
                            currentStreak={stats?.activeStreaks ?? 0}
                            longestStreak={stats?.longestStreak ?? 0}
                            initials={initials}
                          />
                        }
                        backContent={
                          <HabitSummaryCardBack
                            email={profile?.email || ''}
                            joinedAt={profile?.joinedAt ? formatJoinedAt(profile.joinedAt) : '—'}
                            timezone={profile?.timezone}
                            initials={initials}
                          />
                        }
                        containerHeight="100%"
                        containerWidth="100%"
                        imageHeight="100%"
                        imageWidth="100%"
                        scaleOnHover={1.03}
                        rotateAmplitude={10}
                        flipped={flipped}
                        onFlip={() => setFlipped((f) => !f)}
                        disableTilt={false}
                      />
                    )}
                  </div>

                  {/* Mobile: CSS flip card */}
                  <div
                    className="w-full min-h-[450px] relative z-10 sm:hidden cursor-pointer [perspective:1000px] mb-6"
                    onClick={() => setFlipped((f) => !f)}
                  >
                    {profileLoading ? (
                      <Skeleton className="w-full h-[450px] rounded-[24px]" />
                    ) : (
                      <div
                        className="absolute inset-0 transition-transform duration-700 [transform-style:preserve-3d]"
                        style={{
                          transform: flipped ? 'rotateY(180deg) scale(0.95)' : 'rotateY(0) scale(1)',
                          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                        }}
                      >
                        <div className="absolute inset-0 [backface-visibility:hidden] rounded-[24px] overflow-hidden shadow-xl" style={{ pointerEvents: flipped ? 'none' : 'auto' }}>
                          <HabitSummaryCardFront
                            displayName={profile?.displayName || 'User'}
                            email={profile?.email || ''}
                            joinedAt={profile?.joinedAt ? formatJoinedAt(profile.joinedAt) : '—'}
                            timezone={profile?.timezone}
                            totalHabits={stats?.totalHabits ?? habits.length}
                            currentStreak={stats?.activeStreaks ?? 0}
                            longestStreak={stats?.longestStreak ?? 0}
                            initials={initials}
                          />
                          <div className="absolute inset-0">{overlayContent}</div>
                        </div>
                        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-[24px] overflow-hidden shadow-xl" style={{ pointerEvents: flipped ? 'auto' : 'none' }}>
                          <HabitSummaryCardBack
                            email={profile?.email || ''}
                            joinedAt={profile?.joinedAt ? formatJoinedAt(profile.joinedAt) : '—'}
                            timezone={profile?.timezone}
                            initials={initials}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right — Info & Activity */}
              <div className="flex-1 flex flex-col gap-5">
                {/* User Info Card */}
                <div className="bg-card border border-border rounded-2xl p-5 md:p-6">
                  <div className="flex items-end justify-between mb-6 pb-4 border-b border-border/40">
                    <h3 className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-foreground/70 flex items-center gap-2">
                      <IconUser />
                      User Info
                    </h3>
                    <button
                      onClick={handleEditOpen}
                      className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-md hover:bg-muted"
                      aria-label="Edit Profile"
                    >
                      <IconEdit />
                    </button>
                  </div>

                  {profileLoading ? (
                    <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex flex-col gap-2">
                          <Skeleton className="h-3 w-16" />
                          <Skeleton className="h-5 w-32" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-x-4 md:gap-x-6 gap-y-6 mt-2">
                      {userInfoItems.map((item) => (
                        <div key={item.label} className="flex flex-col gap-2 group overflow-hidden">
                          <p className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/70 transition-colors group-hover:text-muted-foreground truncate">
                            {item.label}
                          </p>
                          <div className="text-[14px] md:text-[16px] font-medium tracking-tight text-foreground truncate">
                            {item.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Habits Card */}
                <div className="bg-card border border-border rounded-2xl p-5 md:p-6 mb-8">
                  <div className="flex items-end justify-between mb-6 pb-4 border-b border-border/40">
                    <h3 className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-foreground/70 flex items-center gap-2">
                      <IconActivity />
                      Recent Activity
                    </h3>
                    <span className="text-[10px] md:text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {habits.length} habit{habits.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {habitsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4 py-3">
                          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                          <div className="flex-1 space-y-1.5">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-20" />
                          </div>
                          <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                      ))}
                    </div>
                  ) : habits.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No habits yet. Start building your routine!
                    </p>
                  ) : (
                    <AnimatedList
                      items={habits.slice(0, 5)}
                      className="w-full"
                      displayScrollbar={false}
                      showGradients={false}
                      renderItem={(habit, _i, isSelected) => (
                        <div
                          className={`group flex items-center justify-between py-3 border-b border-border/30 last:border-0 transition-colors ${
                            isSelected
                              ? 'bg-muted/30 px-3 -mx-3 rounded-lg border-transparent'
                              : 'hover:bg-muted/20 hover:px-3 hover:-mx-3 rounded-lg border-transparent'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div
                              className="h-10 w-10 md:h-11 md:w-11 rounded-full flex items-center justify-center text-[18px] shrink-0"
                              style={{ backgroundColor: `${habit.color}20`, border: `1.5px solid ${habit.color}40` }}
                            >
                              <span>{habit.emoji}</span>
                            </div>
                            <div className="flex flex-col gap-1.5 overflow-hidden">
                              <p className="font-medium tracking-tight text-foreground text-[14px] md:text-[16px] truncate">
                                {habit.name}
                              </p>
                              <p className="text-[11px] md:text-[12px] font-medium tracking-wide text-muted-foreground/80 flex items-center gap-1.5 uppercase truncate">
                                <IconClock />
                                <span>{habit.frequency} · {habit.streak}d streak</span>
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end shrink-0 pl-2">
                            <span
                              className="text-[9px] md:text-[10px] font-semibold uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1"
                              style={{
                                backgroundColor: `${habit.color}18`,
                                color: habit.color,
                              }}
                            >
                              <IconCheck />
                              Active
                            </span>
                          </div>
                        </div>
                      )}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Edit Profile Sheet */}
          <Sheet open={isEditOpen} onOpenChange={setIsEditOpen}>
            <SheetContent>
              <SheetHeader className="mb-6">
                <SheetTitle>Edit Profile</SheetTitle>
              </SheetHeader>
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={timezone} onValueChange={setTimezone}>
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                      <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                      <SelectItem value="Europe/London">London (GMT)</SelectItem>
                      <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                      <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      <SelectItem value="Australia/Sydney">Sydney (AEDT)</SelectItem>
                      <SelectItem value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                        Local ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  onClick={handleSave}
                  disabled={saving || updateProfile.isPending}
                >
                  {saving || updateProfile.isPending ? 'Saving…' : 'Save Changes'}
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </section>
      </PageReveal>
    </AppLayout>
  )
}
