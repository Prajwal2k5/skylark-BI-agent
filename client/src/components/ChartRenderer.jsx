import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const COLORS = ['#06b6d4', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

function formatVal(val) {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  return String(val);
}

export default function ChartRenderer({ chartData }) {
  if (!chartData || !Array.isArray(chartData.data) || chartData.data.length === 0) {
    return null;
  }

  const { type, title, data } = chartData;

  return (
    <div className="my-4 glass-card rounded-xl p-4 border border-slate-800 bg-slate-900/60 shadow-lg">
      {title && (
        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-3 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          {title}
        </h4>
      )}

      <div className="w-full h-64 text-xs font-sans">
        {type === 'pie' ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                formatter={(val) => [typeof val === 'number' && val > 10000 ? formatVal(val) : val, 'Value']}
              />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                interval={0}
                angle={-20}
                textAnchor="end"
              />
              <YAxis 
                stroke="#64748b" 
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={(val) => formatVal(val)}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                formatter={(val) => [typeof val === 'number' && val > 10000 ? formatVal(val) : val, 'Value']}
              />
              <Bar dataKey="value" fill="#06b6d4" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`bar-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
