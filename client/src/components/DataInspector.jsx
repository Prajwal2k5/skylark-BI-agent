import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Search, 
  Database, 
  AlertCircle, 
  CheckCircle, 
  Table, 
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';

function formatCurrency(val) {
  if (val === null || val === undefined || isNaN(val)) return '₹0';
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(2)} L`;
  return `₹${Number(val).toLocaleString('en-IN')}`;
}

export default function DataInspector({ biData }) {
  const [activeTab, setActiveTab] = useState('deals');
  const [searchQuery, setSearchQuery] = useState('');

  if (!biData || !biData.deals) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl border border-slate-800 text-slate-400">
        Loading normalized data records...
      </div>
    );
  }

  const { deals, workOrders, dataQuality } = biData;

  // Filter deals based on search
  const filteredDeals = deals.filter(d => 
    d.dealName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.sector?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.ownerCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.dealStatus?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter work orders based on search
  const filteredWorkOrders = workOrders.filter(w =>
    w.serialNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.dealName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.sector?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.executionStatus?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Hygiene Score Summary Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Data Hygiene Score: <span className="text-cyan-400">{dataQuality.dataHygieneScore}%</span>
            </h2>
            <p className="text-xs text-slate-400">
              Analyzed {dataQuality.totalRecords} records across Monday.com Deals & Work Orders boards
            </p>
          </div>
        </div>

        {/* Quality Audit Stats */}
        <div className="flex items-center gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="block text-slate-400 mb-0.5">Missing Deal Fields</span>
            <strong className="text-amber-400">{dataQuality.missingDealsFields} items</strong>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-center">
            <span className="block text-slate-400 mb-0.5">Missing WO Fields</span>
            <strong className="text-amber-400">{dataQuality.missingWoFields} items</strong>
          </div>
        </div>
      </div>

      {/* Dataset Controls & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
        
        {/* Dataset Toggle Tabs */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('deals')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'deals' 
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Deals Board ({deals.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('workOrders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'workOrders' 
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-4 h-4" />
            <span>Work Orders Board ({workOrders.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search records, sector, stage..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

      </div>

      {/* Data Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="max-h-[500px] overflow-y-auto">
          {activeTab === 'deals' ? (
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Deal Name</th>
                  <th className="py-3 px-4 font-semibold">Sector</th>
                  <th className="py-3 px-4 font-semibold">Stage</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Probability</th>
                  <th className="py-3 px-4 font-semibold">Value</th>
                  <th className="py-3 px-4 font-semibold">Close Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredDeals.slice(0, 100).map((d, i) => (
                  <tr key={i} className="hover:bg-slate-900/50 text-slate-300">
                    <td className="py-3 px-4 font-bold text-white">{d.dealName}</td>
                    <td className="py-3 px-4">{d.sector}</td>
                    <td className="py-3 px-4 text-slate-400">{d.dealStage}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        d.dealStatus === 'Open' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        d.dealStatus === 'Closed Won' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                      }`}>
                        {d.dealStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{d.closureProbability}</td>
                    <td className="py-3 px-4 font-bold text-cyan-400">{formatCurrency(d.maskedDealValue)}</td>
                    <td className="py-3 px-4 text-slate-400">{d.tentativeCloseDate || d.closeDateActual || <span className="text-amber-500">Missing</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 font-semibold">Serial #</th>
                  <th className="py-3 px-4 font-semibold">Deal / Project</th>
                  <th className="py-3 px-4 font-semibold">Sector</th>
                  <th className="py-3 px-4 font-semibold">Execution Status</th>
                  <th className="py-3 px-4 font-semibold">Probable End</th>
                  <th className="py-3 px-4 font-semibold">Amount (Excl GST)</th>
                  <th className="py-3 px-4 font-semibold">Billed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredWorkOrders.slice(0, 100).map((w, i) => (
                  <tr key={i} className="hover:bg-slate-900/50 text-slate-300">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">{w.serialNo}</td>
                    <td className="py-3 px-4 font-medium text-white">{w.dealName}</td>
                    <td className="py-3 px-4">{w.sector}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        w.isDelayed ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        w.executionStatus === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {w.executionStatus} {w.isDelayed && '(Delayed)'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{w.probableEndDate || <span className="text-amber-500">Missing</span>}</td>
                    <td className="py-3 px-4 font-bold text-cyan-400">{formatCurrency(w.amountExclGst)}</td>
                    <td className="py-3 px-4 text-slate-300">{formatCurrency(w.billedValueExclGst)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
}
