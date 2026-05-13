import React from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useTheme } from "../../components/theme-provider";
import { ThemeAnimationType, useModeAnimation } from "react-theme-switch-animation";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  // Calculate if we're currently in dark mode even if it's set to 'system'
  const [isDark, setIsDark] = React.useState(false);
  
  React.useEffect(() => {
    setIsDark(
      theme === "dark" || 
      (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  }, [theme]);

  const { ref, toggleSwitchTheme } = useModeAnimation({
    animationType: ThemeAnimationType.BLUR_CIRCLE,
    duration: 700,
    blurAmount: 2,
    isDarkMode: isDark,
    onDarkModeChange: (newIsDark) => {
      setTheme(newIsDark ? "dark" : "light");
    }
  });

  return (
    <Button
      variant="ghost"
      size="icon"
      ref={ref}
      onClick={toggleSwitchTheme}
      className="h-8 w-8 text-foreground"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
