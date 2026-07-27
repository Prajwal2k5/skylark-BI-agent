import React, { useState } from 'react';
import { 
  PieChart as PieIcon, 
  BarChart3, 
  AlertTriangle, 
  TrendingUp, 
  Filter, 
  Calendar, 
  DollarSign, 
  CheckCircle2,
  Building2
} from 'lucide-react';
import ChartRenderer from './ChartRenderer';

function formatCurrency(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

export default function DashboardView({ biData }) {
  const [selectedSector, setSelectedSector] = useState('ALL');

  if (!biData || !biData.breakdowns) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl border border-slate-800 text-slate-400">
        Loading analytics dashboard data...
      </div>
    );
  }

  const { metrics, breakdowns } = biData;

  // Process Deals by Sector Chart Data
  const sectorDealsList = Object.entries(breakdowns.dealsBySector || {}).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  // Process Deals by Stage Chart Data
  const stageDealsList = Object.entries(breakdowns.dealsByStage || {}).map(([name, value]) => ({
    name,
    value
  }));

  // Process Work Orders Status Data
  const woStatusList = Object.entries(breakdowns.woByStatus || {}).map(([name, value]) => ({
    name,
    value
  }));

  // List of unique sectors for dropdown filter
  const allSectors = ['ALL', ...new Set([...Object.keys(breakdowns.dealsBySector || {}), ...Object.keys(breakdowns.woBySector || {})])];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Filter Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          <h2 className="text-base font-bold text-white">Executive BI Analytics Overview</h2>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-400">Sector Filter:</span>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-cyan-500"
          >
            {allSectors.map((sec, idx) => (
              <option key={idx} value={sec}>{sec}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Sector Revenue Distribution */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-200">Deals Pipeline Value by Sector</h3>
            </div>
            <span className="text-xs text-slate-400">{sectorDealsList.length} sectors</span>
          </div>

          <ChartRenderer 
            chartData={{
              type: 'bar',
              title: 'Pipeline Revenue by Sector',
              data: selectedSector === 'ALL' 
                ? sectorDealsList.slice(0, 7) 
                : sectorDealsList.filter(s => s.name === selectedSector)
            }}
          />
        </div>

        {/* Work Order Execution Distribution */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-200">Work Orders Execution Status</h3>
            </div>
            <span className="text-xs text-slate-400">{metrics.totalWorkOrders} Total WO</span>
          </div>

          <ChartRenderer 
            chartData={{
              type: 'pie',
              title: 'Execution Status Distribution',
              data: woStatusList
            }}
          />
        </div>

      </div>

      {/* Deals Funnel & Delayed Projects Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Deal Stage Funnel Breakdown */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-200">Deal Stage Distribution</h3>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="space-y-2">
            {stageDealsList.map((stg, i) => (
              <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-300 truncate max-w-[160px]">{stg.name}</span>
                <span className="font-extrabold text-cyan-400">{stg.value} deals</span>
              </div>
            ))}
          </div>
        </div>

        {/* Delayed Projects Risk Table */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="text-sm font-bold text-slate-200">Top Delayed Work Orders (At Risk)</h3>
            </div>
            <span className="text-xs font-bold text-rose-400 bg-rose-500/10 border border-rose-500/20 px-2 py-0.5 rounded-full">
              {metrics.delayedWoCount} Delayed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="py-2 px-3 font-semibold">Serial #</th>
                  <th className="py-2 px-3 font-semibold">Deal Name</th>
                  <th className="py-2 px-3 font-semibold">Sector</th>
                  <th className="py-2 px-3 font-semibold">Due Date</th>
                  <th className="py-2 px-3 font-semibold">Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {(breakdowns.delayedWoList || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-4 text-center text-slate-500 italic">
                      No delayed work orders flagged!
                    </td>
                  </tr>
                ) : (
                  (breakdowns.delayedWoList || []).map((wo, i) => (
                    <tr key={i} className="hover:bg-slate-900/50 text-slate-300">
                      <td className="py-2.5 px-3 font-mono font-bold text-cyan-400">{wo.serialNo}</td>
                      <td className="py-2.5 px-3 font-medium">{wo.dealName}</td>
                      <td className="py-2.5 px-3 text-slate-400">{wo.sector}</td>
                      <td className="py-2.5 px-3 text-rose-300 font-semibold">{wo.probableEndDate || 'Overdue'}</td>
                      <td className="py-2.5 px-3 font-bold text-white">{formatCurrency(wo.value)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
