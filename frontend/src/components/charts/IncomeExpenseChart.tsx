import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface IncomeExpenseChartProps {
  incoming?: number;
  outgoing?: number;
}

export const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ incoming = 75000, outgoing = 32000 }) => {
  const chartData = [
    { name: 'Financial Movement', Inflow: incoming, Outflow: outgoing },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
          <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val / 1000}k`} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0A0F1D',
              borderColor: '#1E2B52',
              borderRadius: '0.75rem',
              color: '#fff',
              fontSize: '12px',
            }}
            formatter={(val: number) => [`₹${val.toLocaleString()}`]}
          />
          <Bar dataKey="Inflow" fill="#10B981" radius={[8, 8, 0, 0]} maxBarSize={45} />
          <Bar dataKey="Outflow" fill="#7C3AED" radius={[8, 8, 0, 0]} maxBarSize={45} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
