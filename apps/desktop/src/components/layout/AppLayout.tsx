import { Link, useLocation } from "wouter";
import { LogOut, Home, BarChart3, User, Menu, Sun, Moon } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background text-foreground">
        <Sidebar className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
          <SidebarHeader className="p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold tracking-tight text-primary">Isle</h2>
          </SidebarHeader>
          <SidebarContent className="px-2 py-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Today's Habits">
                  <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                    <Home className="h-5 w-5" />
                    <span>Today</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Analytics">
                  <Link href="/analytics" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                    <BarChart3 className="h-5 w-5" />
                    <span>Analytics</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Profile">
                  <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-sidebar-border flex flex-col gap-4">
             <div className="flex items-center justify-between w-full">
              <span className="text-sm font-medium text-sidebar-foreground">Theme</span>
               <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="h-8 w-8 text-sidebar-foreground"
                >
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
             </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start gap-3 px-2">
                  <Avatar className="h-8 w-8 border border-sidebar-border">
                    <AvatarFallback className="bg-primary/10 text-primary">{user?.displayName?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm font-medium">{user?.displayName || "User"}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-background">
          <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6 md:hidden">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold text-primary">Isle</h1>
          </header>
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-4xl w-full">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
