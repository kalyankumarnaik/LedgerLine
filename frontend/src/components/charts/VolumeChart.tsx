import React from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface VolumeChartProps {
  data?: Array<{ date: string; volume: number }>;
}

export const VolumeChart: React.FC<VolumeChartProps> = ({ data }) => {
  const chartData = data && data.length > 0 ? data : [
    { date: 'Mon', volume: 12000 },
    { date: 'Tue', volume: 34000 },
    { date: 'Wed', volume: 22000 },
    { date: 'Thu', volume: 48000 },
    { date: 'Fri', volume: 65000 },
    { date: 'Sat', volume: 38000 },
    { date: 'Sun', volume: 54000 },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
          <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0A0F1D',
              borderColor: '#1E2B52',
              borderRadius: '0.75rem',
              color: '#fff',
              fontSize: '12px',
            }}
            formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Volume']}
          />
          <Area type="monotone" dataKey="volume" stroke="#7C3AED" strokeWidth={2.5} fillOpacity={1} fill="url(#violetGradient)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
