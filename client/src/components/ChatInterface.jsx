import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  HelpCircle, 
  AlertTriangle, 
  CheckCircle2, 
  RotateCcw, 
  Loader2, 
  Lightbulb, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import ChartRenderer from './ChartRenderer';
import { sendChatQuery } from '../services/api';

const SUGGESTED_QUESTIONS = [
  {
    icon: '📊',
    label: 'Pipeline Health',
    query: 'How is our sales pipeline looking for the energy sector this quarter?'
  },
  {
    icon: '🚜',
    label: 'Delayed Work Orders',
    query: 'Which work orders are currently delayed and what are the main execution risks?'
  },
  {
    icon: '🏢',
    label: 'Revenue by Sector',
    query: 'Provide a breakdown of deal values and work order revenue by sector.'
  },
  {
    icon: '👑',
    label: 'Leadership Summary',
    query: 'Generate a founder-level executive summary combining sales pipeline and project execution.'
  }
];

export default function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "👋 Welcome to **Skylark BI Agent**! I am your AI Business Intelligence assistant, connected live to your Monday.com **Deals** and **Work Orders** boards.\n\nAsk me founder-level questions about sales pipeline health, delayed project risks, sectoral performance, or request a complete leadership briefing.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (queryText) => {
    const q = queryText || inputQuery;
    if (!q || !q.trim() || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: q.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setIsLoading(true);

    // Dynamic Loading steps simulation
    setLoadingStep('Fetching Monday.com board data...');
    const t1 = setTimeout(() => setLoadingStep('Cleaning & normalizing records...'), 800);
    const t2 = setTimeout(() => setLoadingStep('Generating executive insights with Gemini AI...'), 1600);

    try {
      const data = await sendChatQuery(q.trim());
      clearTimeout(t1);
      clearTimeout(t2);

      const aiResponse = data.response;

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: aiResponse.answerMarkdown || 'No answer generated.',
        keyInsights: aiResponse.keyInsights,
        risksAndBlockers: aiResponse.risksAndBlockers,
        actionableRecommendations: aiResponse.actionableRecommendations,
        dataQualityCaveats: aiResponse.dataQualityCaveats,
        clarifyingQuestion: aiResponse.clarifyingQuestion,
        chartData: aiResponse.chartData,
        aiModelUsed: aiResponse.aiModelUsed,
        dataSource: data.dataSource,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      clearTimeout(t1);
      clearTimeout(t2);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'assistant',
          isError: true,
          text: `⚠️ **Connection Error**: Unable to complete query (${err.message}). Please verify your backend server status or API configuration.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'assistant',
        text: "Chat thread cleared. Ask a new business query or select a prompt preset below.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] min-h-[550px] glass-panel rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      
      {/* Chat Top Header */}
      <div className="px-6 py-3 border-b border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Interactive BI Conversational Session
          </span>
        </div>
        <button
          onClick={handleClearChat}
          className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-900 transition-all"
          title="Clear Conversation History"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        
        {messages.map(msg => (
          <div 
            key={msg.id}
            className={`flex gap-3 max-w-4xl ${msg.sender === 'user' ? 'ml-auto justify-end' : 'mr-auto'}`}
          >
            {/* Assistant Avatar */}
            {msg.sender === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 p-[1px] flex-shrink-0 mt-1">
                <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                  <Bot className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
            )}

            {/* Bubble Content */}
            <div className={`space-y-3 ${msg.sender === 'user' ? 'max-w-xl' : 'flex-1'}`}>
              
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                msg.sender === 'user' 
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white rounded-tr-none' 
                  : msg.isError 
                  ? 'bg-rose-950/40 border border-rose-800 text-rose-200 rounded-tl-none' 
                  : 'bg-slate-900/90 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>

                {/* Embedded Chart Visualization */}
                {msg.chartData && <ChartRenderer chartData={msg.chartData} />}

                {/* Structured Key Insights Section */}
                {msg.keyInsights && msg.keyInsights.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                      <Lightbulb className="w-3.5 h-3.5" />
                      <span>Executive Key Insights</span>
                    </div>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {msg.keyInsights.map((ins, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-cyan-400 font-bold">•</span>
                          <span>{ins}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Risks & Blockers Section */}
                {msg.risksAndBlockers && msg.risksAndBlockers.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Identified Risks & Blockers</span>
                    </div>
                    <ul className="space-y-1 text-xs text-amber-200/90">
                      {msg.risksAndBlockers.map((r, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actionable Recommendations */}
                {msg.actionableRecommendations && msg.actionableRecommendations.length > 0 && (
                  <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Actionable Recommendations</span>
                    </div>
                    <ul className="space-y-1 text-xs text-emerald-200/90">
                      {msg.actionableRecommendations.map((rec, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">→</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Clarifying Question Callout */}
                {msg.clarifyingQuestion && (
                  <div className="mt-3 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-start gap-2 text-xs text-indigo-300">
                    <HelpCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-indigo-200 mb-0.5">Clarifying Question for Leadership:</strong>
                      {msg.clarifyingQuestion}
                    </div>
                  </div>
                )}

                {/* Data Quality Caveat */}
                {msg.dataQualityCaveats && (
                  <div className="mt-2 text-[10px] text-slate-400 italic flex items-center gap-1">
                    <ShieldAlert className="w-3 h-3 text-slate-500" />
                    <span>{msg.dataQualityCaveats}</span>
                  </div>
                )}
              </div>

              {/* Timestamp & Footer Metadata */}
              <div className="flex items-center justify-between text-[10px] text-slate-500 px-1">
                <span>{msg.timestamp}</span>
                {msg.aiModelUsed && (
                  <span className="text-slate-400 font-medium">Model: {msg.aiModelUsed}</span>
                )}
              </div>

            </div>

            {/* User Avatar */}
            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-slate-300" />
              </div>
            )}

          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-4xl mr-auto">
            <div className="w-8 h-8 rounded-xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0 animate-spin">
              <Loader2 className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
              <span>{loadingStep || 'Analyzing board records...'}</span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Preset / Suggested Questions Chips */}
      <div className="px-4 py-2 border-t border-slate-800/60 bg-slate-950/40">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold text-slate-400 whitespace-nowrap flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> Suggested:
          </span>
          {SUGGESTED_QUESTIONS.map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(item.query)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-xs text-slate-300 hover:text-white transition-all whitespace-nowrap disabled:opacity-50 cursor-pointer"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask founder-level BI question (e.g., 'How is our pipeline looking for energy sector?')..."
            disabled={isLoading}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
          />
          <button
            type="submit"
            disabled={isLoading || !inputQuery.trim()}
            className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-bold transition-all shadow-lg shadow-cyan-900/30 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
