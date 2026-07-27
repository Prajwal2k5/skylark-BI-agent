import React, { useState } from 'react';
import { 
  Bot, 
  Settings, 
  Database, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  Save, 
  RefreshCw,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { getStoredConfig, saveStoredConfig } from '../services/api';

export default function Header({ statusInfo, onRefresh }) {
  const [showSettings, setShowSettings] = useState(false);
  const [config, setConfig] = useState(getStoredConfig());
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    saveStoredConfig(config);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
    onRefresh();
  };

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-purple-600 p-[1px] shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-cyan-300 bg-clip-text text-transparent">
                Skylark BI Agent
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                v1.0 Executive
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Monday.com & AI Business Intelligence</p>
          </div>
        </div>

        {/* Live Status Badges & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Monday.com Connection Badge */}
          <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            statusInfo?.mondayConnected 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
              : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
          }`}>
            <Database className="w-3.5 h-3.5" />
            <span>{statusInfo?.mondayConnected ? 'Monday.com GraphQL (Live)' : 'Local Dataset (Fallback)'}</span>
          </div>

          {/* Gemini AI Status Badge */}
          <div className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            statusInfo?.geminiConnected 
              ? 'bg-purple-500/10 text-purple-300 border-purple-500/30' 
              : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{statusInfo?.geminiConnected ? 'Google Gemini AI' : 'Local AI Engine'}</span>
          </div>

          {/* Hygiene Score Badge */}
          {statusInfo?.dataHygieneScore !== undefined && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Hygiene: <strong className="text-cyan-400">{statusInfo.dataHygieneScore}%</strong></span>
            </div>
          )}

          {/* Refresh Button */}
          <button 
            onClick={onRefresh} 
            title="Refresh Board Data"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-all hover:text-white"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* API Settings Modal Toggle */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-cyan-900/30 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">API Config</span>
          </button>
        </div>
      </div>

      {/* API Key & Board Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-md glass-panel rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-bold text-white">API Credentials & Config</h2>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Configure your live Monday.com and Google Gemini credentials. If empty, the app runs on local data and local AI engine.
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Monday.com API Key (GraphQL v2)</label>
                <input 
                  type="password"
                  value={config.mondayApiKey}
                  onChange={(e) => setConfig({ ...config, mondayApiKey: e.target.value })}
                  placeholder="Paste MONDAY_API_KEY..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Google Gemini API Key</label>
                <input 
                  type="password"
                  value={config.geminiApiKey}
                  onChange={(e) => setConfig({ ...config, geminiApiKey: e.target.value })}
                  placeholder="Paste GEMINI_API_KEY..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Deals Board ID (Optional)</label>
                  <input 
                    type="text"
                    value={config.dealsBoardId}
                    onChange={(e) => setConfig({ ...config, dealsBoardId: e.target.value })}
                    placeholder="Auto-discovered"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Work Orders Board ID</label>
                  <input 
                    type="text"
                    value={config.woBoardId}
                    onChange={(e) => setConfig({ ...config, woBoardId: e.target.value })}
                    placeholder="Auto-discovered"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold shadow-lg shadow-cyan-900/30"
              >
                {isSaved ? <CheckCircle2 className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
                <span>{isSaved ? 'Saved & Applying!' : 'Save & Reload'}</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
}
