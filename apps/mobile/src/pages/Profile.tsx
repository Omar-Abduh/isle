import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  useAuthStore,
  useHabitStore,
  HabitSummaryCardFront,
  pageVariants,
  Button,
  Input,
  Label,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  usePreferences,
  useIsMobile,
  useToast,
  IsleLogoFont,
} from '@isle/shared'
import ThemeToggle from '../components/ThemeToggle'

function formatJoinedAt(dateStr?: string) {
  try {
    if (!dateStr) return '—'
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  } catch {
    return dateStr || '—'
  }
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [editOpen, setEditOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editTimezone, setEditTimezone] = useState('')
  const [saving, setSaving] = useState(false)

  const user = useAuthStore((s) => s.user)
  const updateProfile = useAuthStore((s) => s.updateProfile)
  const logout = useAuthStore((s) => s.logout)
  const habits = useHabitStore((s) => s.habits)
  const { prefs, update: updatePrefs } = usePreferences()
  const { toast } = useToast()
  const isMobile = useIsMobile()

  const displayName = user?.displayName || 'User'
  const email = user?.email || ''
  const timezone = user?.timezone || 'UTC'
  const joinedAt = user?.joinedAt

  const totalHabits = habits.length
  const currentStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.currentStreak), 0) : 0
  const longestStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.longestStreak), 0) : 0

  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const recentHabits = habits.slice(0, 3).map((h) => ({
    id: h.id,
    name: h.name,
    color: h.color || '#247E84',
    streak: h.currentStreak || 0,
    frequency: h.rrule.includes('DAILY') ? 'Daily' : h.rrule.includes('WEEKLY') ? 'Weekly' : 'Custom',
  }))

  function handleEditOpen() {
    setEditName(displayName || '')
    setEditTimezone(timezone || Intl.DateTimeFormat().resolvedOptions().timeZone)
    setEditOpen(true)
  }

  function handleSave() {
    setSaving(true)
    try {
      updateProfile({ displayName: editName, timezone: editTimezone })
      setEditOpen(false)
      toast({ title: 'Profile updated successfully.' })
    } catch {
      toast({ title: 'Failed to update profile.', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      className="px-4 pt-10 pb-28"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      role="region"
      aria-label="Profile"
    >
      <header className="mb-5">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Profile</h1>
      </header>

      <div className="w-full px-4 mb-4">
        <div className="max-w-[340px] h-[380px] mx-auto">
          <HabitSummaryCardFront
            displayName={displayName}
            email={email}
            joinedAt={joinedAt || new Date().toISOString()}
            timezone={timezone}
            totalHabits={totalHabits}
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            initials={initials}
          />
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/40">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/70">User Info</h3>
          <button
            onClick={handleEditOpen}
            className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Edit profile"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          {[
            { label: 'Email', value: email },
            { label: 'Timezone', value: timezone },
            { label: 'Member Since', value: formatJoinedAt(joinedAt) },
            { label: 'Total Habits', value: `${totalHabits} active` },
          ].map((item) => (
            <div key={item.label} className="flex flex-col gap-1.5 min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">
                {item.label}
              </p>
              <p className={`text-[14px] font-medium tracking-tight text-foreground truncate ${item.label === 'Email' ? 'max-w-[180px]' : ''}`}>
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/40">
          <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground/70">Recent Activity</h3>
          <button
            className="text-[11px] font-semibold text-primary hover:underline"
            onClick={() => navigate('/recent-activity')}
          >
            View All
          </button>
        </div>
        <div className="space-y-1">
          {recentHabits.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No habits yet</p>
          ) : (
            recentHabits.map((habit) => (
              <div key={habit.id} className="flex items-center gap-3 py-2.5">
                <div className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: habit.color }} />
                <span className="text-sm text-foreground flex-1 truncate">{habit.name}</span>
                <span className="text-[11px] text-muted-foreground/70 whitespace-nowrap">
                  {habit.frequency} · {habit.streak}d
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-card border border-border/50 rounded-2xl p-5 mb-4">
        <h2 className="text-sm font-semibold text-foreground mb-4">Preferences</h2>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-foreground">Theme</span>
          <ThemeToggle />
        </div>
        <div className="border-t border-border/40 mt-4 pt-4">
          <p className="text-[10px] text-muted-foreground/70 uppercase tracking-wider mb-0.5">App version</p>
          <p className="text-sm font-medium text-foreground">1.1.0-beta.5</p>
        </div>
      </div>

      <button
        onClick={logout}
        className="w-full py-3 bg-destructive/10 text-destructive rounded-xl font-medium
          active:scale-[0.98] transition-transform touch-manipulation min-h-[48px] text-sm"
      >
        Sign Out
      </button>

      <div className="flex justify-center mt-8 mb-4 opacity-30">
        <IsleLogoFont className="h-10 w-auto" />
      </div>

      <Drawer open={editOpen} onOpenChange={setEditOpen} direction={isMobile ? 'bottom' : 'right'}>
        <DrawerContent
          className="bg-background text-foreground border-border/40
            data-[vaul-drawer-direction=bottom]:max-h-[85vh] flex flex-col p-0"
        >
          <DrawerHeader className="p-6 pb-2 shrink-0 border-b border-border/40 relative">
            <DrawerTitle className="text-xl font-bold tracking-tight">Edit Profile</DrawerTitle>
            <DrawerDescription className="mt-1 text-muted-foreground text-sm">
              Update your display name and timezone.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input id="displayName" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={editTimezone} onValueChange={setEditTimezone}>
                <SelectTrigger id="timezone"><SelectValue placeholder="Select timezone" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
                  <SelectItem value="Africa/Cairo">Cairo (EET)</SelectItem>
                  <SelectItem value="Asia/Dubai">Dubai (GST)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="pt-4 border-t border-border/40 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/70">Preferences</p>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="islamicMessages" className="text-sm font-medium">Islamic messages</Label>
                  <p className="text-xs text-muted-foreground">Prayer-time aware greetings on the dashboard</p>
                </div>
                <Switch id="islamicMessages" checked={prefs.islamicMessages} onCheckedChange={(checked) => updatePrefs({ islamicMessages: checked })} />
              </div>
            </div>
          </div>
          <DrawerFooter className="border-t border-border/40 p-4 flex flex-row gap-3">
            <DrawerClose asChild><Button variant="outline" className="flex-1">Cancel</Button></DrawerClose>
            <Button className="flex-1" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : 'Save Changes'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </motion.div>
  )
}
