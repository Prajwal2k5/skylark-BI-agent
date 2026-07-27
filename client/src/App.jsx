import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  LayoutDashboard, 
  Database, 
  Crown, 
  RefreshCw,
  Sparkles
} from 'lucide-react';

import Header from './components/Header';
import KpiCards from './components/KpiCards';
import ChatInterface from './components/ChatInterface';
import DashboardView from './components/DashboardView';
import DataInspector from './components/DataInspector';
import LeadershipStudio from './components/LeadershipStudio';

import { fetchStatus, fetchBiData } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [statusInfo, setStatusInfo] = useState(null);
  const [biData, setBiData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const statusRes = await fetchStatus();
      setStatusInfo(statusRes);

      const dataRes = await fetchBiData();
      setBiData(dataRes);
    } catch (err) {
      console.error('Error loading BI app data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-white">
      
      {/* Header Bar */}
      <Header statusInfo={statusInfo} onRefresh={loadData} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* KPI Cards Bar */}
        <KpiCards 
          metrics={biData?.metrics || statusInfo?.kpis} 
          dataQuality={biData?.dataQuality} 
        />

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'chat'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-900/30'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>AI Chat Assistant</span>
          </button>

          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-900/30'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Executive BI Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('inspector')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'inspector'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-900/30'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Data Hygiene & Inspector</span>
          </button>

          <button
            onClick={() => setActiveTab('leadership')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'leadership'
                ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 text-slate-950 font-extrabold shadow-lg shadow-amber-900/30'
                : 'bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Crown className="w-4 h-4" />
            <span>Leadership Studio</span>
          </button>
        </div>

        {/* Tab Content Views */}
        <div className="min-h-[500px]">
          {activeTab === 'chat' && <ChatInterface />}
          {activeTab === 'dashboard' && <DashboardView biData={biData} />}
          {activeTab === 'inspector' && <DataInspector biData={biData} />}
          {activeTab === 'leadership' && <LeadershipStudio />}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-4 text-center text-xs text-slate-500">
        <p>🦅 Skylark BI Agent • Monday.com GraphQL API v2 & Google Gemini AI Engine</p>
      </footer>

    </div>
  );
}
