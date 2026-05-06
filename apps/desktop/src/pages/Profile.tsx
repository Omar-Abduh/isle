import { useState } from 'react'
import { format } from 'date-fns'
import { useGetUserProfile, useUpdateUserProfile, useListHabits, useGetStatsSummary, getGetUserProfileQueryKey } from '../lib/api-client'
import { useQueryClient } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  DrawerClose,
} from '@/components/ui/drawer'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { useIsMobile } from '@/hooks/use-mobile'
import AnimatedList from '@/components/shared/AnimatedList'
import { HabitSummaryCardFront } from '@/components/shared/HabitSummaryCard'
import PageReveal from '@/components/shared/PageReveal'
import { cn } from '@/lib/utils'

// ─── Inline Icons ──────────────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────

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

// ─── Main Component ───────────────────────────────────────────

export default function Profile() {
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [timezone, setTimezone] = useState('')
  const [saving, setSaving] = useState(false)

  const isMobile = useIsMobile()
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

  return (
    <AppLayout>
      <PageReveal>
        <section className="min-h-screen w-full pb-24">
          <div className="w-full pt-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Profile</h1>

            <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-10">
              {/* Left — Profile Summary Card */}
              <div className="w-full lg:w-[420px] xl:w-[460px] shrink-0 flex flex-col items-center lg:items-start">
                <div className="w-full max-w-sm">
                  {profileLoading ? (
                    <Skeleton className="w-full h-[400px] rounded-[24px]" />
                  ) : (
                    <div className="w-full h-[400px] relative">
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
                    </div>
                  )}
                </div>
              </div>

              {/* Right — Info & Activity */}
              <div className="flex-1 flex flex-col gap-5 w-full">
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
                              className="h-10 w-10 md:h-11 md:w-11 rounded-full flex items-center justify-center shrink-0"
                              style={{ backgroundColor: `${habit.color}20`, border: `1.5px solid ${habit.color}40` }}
                            >
                              <span className="text-[14px] font-bold" style={{ color: habit.color }}>
                                {habit.name.charAt(0).toUpperCase()}
                              </span>
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

          {/* ── Edit Profile Drawer (side on desktop, bottom on mobile) ──── */}
          <Drawer open={isEditOpen} onOpenChange={setIsEditOpen} direction={isMobile ? 'bottom' : 'right'}>
            <DrawerContent
              className={cn(
                "bg-background text-foreground border-border/40",
                "data-[vaul-drawer-direction=right]:w-[90vw] data-[vaul-drawer-direction=right]:sm:max-w-md",
                "data-[vaul-drawer-direction=bottom]:max-h-[85vh] flex flex-col p-0"
              )}
            >
              <DrawerHeader className="p-6 pb-2 shrink-0 border-b border-border/40 relative">
                <DrawerTitle className="text-xl font-bold tracking-tight">
                  Edit Profile
                </DrawerTitle>
                <DrawerDescription className="mt-1 text-muted-foreground text-sm">
                  Update your display name and timezone.
                </DrawerDescription>
                <DrawerClose asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-6 right-6 h-8 w-8 rounded-full hidden sm:flex"
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4"><path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
                    <span className="sr-only">Close</span>
                  </Button>
                </DrawerClose>
              </DrawerHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
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
                      <SelectItem value="Africa/Cairo">Cairo (EET)</SelectItem>
                      <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                      <SelectItem value="Australia/Sydney">Sydney (AEDT)</SelectItem>
                      <SelectItem value={Intl.DateTimeFormat().resolvedOptions().timeZone}>
                        Local ({Intl.DateTimeFormat().resolvedOptions().timeZone})
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3">
                <DrawerClose asChild>
                  <Button variant="outline" className="flex-1">Cancel</Button>
                </DrawerClose>
                <Button
                  className="flex-1"
                  onClick={handleSave}
                  disabled={saving || updateProfile.isPending}
                >
                  {saving || updateProfile.isPending ? 'Saving…' : 'Save Changes'}
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </section>
      </PageReveal>
    </AppLayout>
  )
}
