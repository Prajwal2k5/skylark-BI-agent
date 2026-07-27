import React, { useState } from 'react';
import { 
  Crown, 
  Sparkles, 
  Copy, 
  Check, 
  FileText, 
  Download, 
  Loader2, 
  TrendingUp, 
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { generateLeadershipReport } from '../services/api';

export default function LeadershipStudio() {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await generateLeadershipReport();
      if (res.report) {
        setReport(res.report);
      }
    } catch (err) {
      alert(`Failed to generate leadership report: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!report) return;
    const textToCopy = typeof report === 'string' ? report : (report.answerMarkdown || JSON.stringify(report, null, 2));
    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Studio Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-purple-600 p-[1px] shadow-lg shadow-amber-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[15px] flex items-center justify-center">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Leadership Updates & Board Studio</h2>
            <p className="text-xs text-slate-400">
              Synthesize live deals pipeline & operational work order data into polished executive updates.
            </p>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-purple-600 hover:opacity-90 text-slate-950 font-extrabold text-xs tracking-wide transition-all shadow-xl shadow-amber-900/30 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Board Report...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>1-Click Generate Briefing</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Report Content Container */}
      {report ? (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 shadow-2xl">
          
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Executive Board Update Briefing</h3>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 transition-all"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Executive Report'}</span>
            </button>
          </div>

          <div className="prose prose-invert prose-sm max-w-none text-slate-200 leading-relaxed bg-slate-950/60 p-6 rounded-xl border border-slate-800/80">
            <ReactMarkdown>{report.answerMarkdown || report}</ReactMarkdown>
          </div>

          {/* Key Insights & Recommendations Cards */}
          {report.keyInsights && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>Strategic Highlights</span>
                </div>
                <ul className="space-y-1 text-xs text-slate-300">
                  {report.keyInsights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-cyan-400 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                  <Lightbulb className="w-4 h-4" />
                  <span>Recommended Action Items</span>
                </div>
                <ul className="space-y-1 text-xs text-slate-300">
                  {(report.actionableRecommendations || []).map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400 font-bold">→</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

        </div>
      ) : (
        <div className="p-12 text-center glass-panel rounded-2xl border border-slate-800 space-y-3">
          <Crown className="w-12 h-12 text-amber-400/40 mx-auto animate-bounce" />
          <h3 className="text-base font-bold text-slate-300">No Leadership Update Generated Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Click "1-Click Generate Briefing" above to synthesize live Monday.com deals and work orders into an executive update document.
          </p>
        </div>
      )}

    </div>
  );
}
