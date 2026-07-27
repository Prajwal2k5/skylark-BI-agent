import React from 'react';
import { 
  TrendingUp, 
  Briefcase, 
  Layers, 
  AlertOctagon, 
  CheckCircle, 
  Percent, 
  ShieldCheck 
} from 'lucide-react';

function formatCurrency(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

export default function KpiCards({ metrics, dataQuality }) {
  if (!metrics) return null;

  const cards = [
    {
      title: 'Total Pipeline Value',
      value: formatCurrency(metrics.totalPipelineValue),
      subtext: `${metrics.totalDeals || 0} total deal opportunities`,
      icon: TrendingUp,
      accent: 'from-cyan-500 to-blue-600',
      badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
    },
    {
      title: 'Active Open Deals',
      value: formatCurrency(metrics.openDealsValue),
      subtext: `${metrics.openDealsCount || 0} open deals in negotiation`,
      icon: Briefcase,
      accent: 'from-indigo-500 to-purple-600',
      badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
    },
    {
      title: 'Work Orders Execution',
      value: `${metrics.totalWorkOrders || 0} Projects`,
      subtext: `${metrics.completedWoCount || 0} completed (${metrics.completionRate || 0}%)`,
      icon: Layers,
      accent: 'from-emerald-500 to-teal-600',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    },
    {
      title: 'Delayed Projects Risk',
      value: `${metrics.delayedWoCount || 0} Delayed`,
      subtext: `${formatCurrency(metrics.delayedAtRiskValue || 0)} revenue at risk`,
      icon: AlertOctagon,
      accent: 'from-amber-500 to-rose-600',
      badgeBg: metrics.delayedWoCount > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div 
            key={idx} 
            className="glass-card rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700/80 transition-all duration-300 hover:translate-y-[-2px] shadow-lg group relative overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className={`absolute -right-8 -bottom-8 w-24 h-24 bg-gradient-to-br ${card.accent} opacity-10 blur-xl group-hover:opacity-20 transition-opacity`} />

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-cyan-400" />
              </div>
            </div>

            <div className="text-2xl font-extrabold text-white tracking-tight mb-1">
              {card.value}
            </div>

            <div className="text-xs text-slate-400 font-medium">
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
