import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { WeeklyStatEntry } from "../../lib/api-client";

interface WeeklyChartProps {
  data: WeeklyStatEntry[];
}

export function WeeklyChart({ data }: WeeklyChartProps) {
  const formattedData = data.map(item => ({
    ...item,
    name: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    ratePercent: item.count
  })).reverse();

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            tickLine={false} 
            axisLine={false} 
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            dy={10}
          />
          <YAxis 
            tickLine={false} 
            axisLine={false} 
            tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', 
              borderColor: 'hsl(var(--border))',
              borderRadius: '8px',
              boxShadow: 'var(--shadow-sm)'
            }}
            formatter={(value: number) => [`${value}%`, 'Completion Rate']}
          />
          <Bar 
            dataKey="ratePercent" 
            fill="hsl(var(--primary))" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
