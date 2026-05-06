import { motion } from "framer-motion";

interface StreakRingProps {
  currentStreak: number;
  longestStreak: number;
  size?: number;
  strokeWidth?: number;
}

export function StreakRing({ 
  currentStreak, 
  longestStreak: _longestStreak,
  size = 48, 
  strokeWidth = 4 
}: StreakRingProps) {
  const center = size / 2;
  const radius = center - strokeWidth;
  const circumference = 2 * Math.PI * radius;
  
  // Cap at 30 for visualization purposes
  const maxVisualStreak = 30;
  const progress = Math.min(currentStreak, maxVisualStreak) / maxVisualStreak;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-muted border-muted stroke-current"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
        />
        <motion.circle
          className="text-primary border-primary stroke-current"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={center}
          cy={center}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-xs font-bold leading-none text-foreground">{currentStreak}</span>
      </div>
    </div>
  );
}
