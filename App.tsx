
import React, { useState, useEffect, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { evaluateIdea } from './services/gemini';
import { Message, EvaluationResult, UserProfile, ResearchSource } from './types';
import IdeaInput from './components/IdeaInput';
import MetricsRadar from './components/MetricsRadar';

const STORAGE_KEY = 'flareonix_history';
const USER_KEY = 'flareonix_user';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [activeTab, setActiveTab] = useState<'intel' | 'market' | 'hiring'>('intel');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
    }
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (messages.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  // FIX: Added loginDemo function to handle login simulation
  const loginDemo = () => {
    const demoUser: UserProfile = {
      name: "Founder X",
      email: "founder@flareonix.ai",
    };
    setUser(demoUser);
    localStorage.setItem(USER_KEY, JSON.stringify(demoUser));
    setShowLogin(false);
  };

  const handleAnalyze = async (text: string) => {
    setLoading(true);
    setError(null);
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const result = await evaluateIdea(text, user);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Deep evaluation finalized. Analysis levels: Strategic, Competitive, and Structural.",
        evaluation: result.evaluation,
        sources: result.sources,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setError(err.message || "Intelligence engine timeout.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = (msgId: string, type: 'positive' | 'negative') => {
    setMessages(prev => prev.map(m => m.id === msgId ? { ...m, feedback: type } : m));
  };

  return (
    <div className="min-h-screen flex flex-col font-sans bg-dark-bg text-white">
      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center space-x-3 text-red-200 backdrop-blur-md animate-bounce">
          <i className="fas fa-exclamation-circle"></i>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <nav className="glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-dark-border">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.reload()}>
          <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/30">
            <i className="fas fa-fire-alt text-white text-xl"></i>
          </div>
          <span className="font-display font-bold text-2xl tracking-tight bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">FLAREONIX</span>
        </div>
        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3 bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{user.name}</span>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} className="bg-white text-black px-6 py-2 rounded-full text-sm font-bold hover:scale-105 transition-all">Join Platform</button>
          )}
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-12">
        {messages.length === 0 && (
          <div className="text-center space-y-6 pt-20">
            <h1 className="text-5xl md:text-8xl font-display font-bold leading-tight tracking-tighter">
              Know your <span className="text-brand-500 italic">Edge.</span>
            </h1>
            <p className="text-zinc-500 max-w-3xl mx-auto text-xl font-medium">Flareonix evaluates the survival rate, competitive landscape, and execution roadmap of your startup ideas using planetary-scale intelligence.</p>
            <div className="pt-12"><IdeaInput onAnalyze={handleAnalyze} loading={loading} /></div>
          </div>
        )}

        <div className="space-y-16 max-w-6xl mx-auto pb-40" ref={scrollRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`w-full ${msg.role === 'user' ? 'max-w-xl' : 'max-w-full'}`}>
                {msg.role === 'user' ? (
                  <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl ml-auto">
                    <p className="text-zinc-300 font-medium text-lg">{msg.content}</p>
                  </div>
                ) : (
                  <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    {/* Header with Feedback */}
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-brand-500 rounded-xl flex items-center justify-center shadow-xl shadow-brand-500/20">
                          <i className="fas fa-brain text-white text-xl"></i>
                        </div>
                        <div>
                          <h2 className="text-2xl font-display font-bold">Strategic Intelligence Node</h2>
                          <p className="text-zinc-500 text-sm">Session {msg.timestamp.toLocaleTimeString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button onClick={() => handleFeedback(msg.id, 'positive')} className={`p-3 rounded-xl transition-all ${msg.feedback === 'positive' ? 'bg-green-500/20 text-green-500' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}><i className="fas fa-thumbs-up"></i></button>
                        <button onClick={() => handleFeedback(msg.id, 'negative')} className={`p-3 rounded-xl transition-all ${msg.feedback === 'negative' ? 'bg-red-500/20 text-red-500' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}><i className="fas fa-thumbs-down"></i></button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Left: Summary & Analysis */}
                      <div className="lg:col-span-8 space-y-8">
                        <div className="bg-dark-card border border-dark-border p-8 rounded-[2rem] shadow-2xl">
                          <h3 className="text-zinc-500 uppercase text-xs font-black tracking-widest mb-4">Core Thesis</h3>
                          <p className="text-2xl font-medium leading-relaxed text-zinc-100">"{msg.evaluation?.summary}"</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-12 border-t border-zinc-800">
                            <div>
                              <h4 className="text-xs font-bold text-zinc-500 uppercase mb-6 tracking-tighter">Viability Radar</h4>
                              <MetricsRadar data={msg.evaluation?.metrics || []} />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-zinc-500 uppercase mb-6 tracking-tighter">Market Entry Trends (Success %)</h4>
                              <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                  <LineChart data={msg.evaluation?.historicalTrends}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                                    <XAxis dataKey="year" stroke="#71717a" fontSize={10} />
                                    <YAxis stroke="#71717a" fontSize={10} domain={[0, 100]} />
                                    <Tooltip contentStyle={{ backgroundColor: '#161618', borderColor: '#27272a', borderRadius: '12px' }} />
                                    <Line type="monotone" dataKey="successRate" stroke="#f97316" strokeWidth={3} dot={{ fill: '#f97316' }} />
                                  </LineChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Competitor Analysis */}
                        <div className="bg-dark-card border border-dark-border p-8 rounded-[2rem]">
                          <h3 className="text-xl font-display font-bold mb-8">Competitive Landscape Matrix</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {msg.evaluation?.competitors.map((c, i) => (
                              <div key={i} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-4">
                                <div className="flex justify-between items-start">
                                  <span className="text-lg font-bold text-white">{c.name}</span>
                                  <span className="text-[10px] bg-brand-500/10 text-brand-500 px-2 py-1 rounded uppercase font-bold">{c.stage}</span>
                                </div>
                                <p className="text-xs text-zinc-500 italic">Strategy: {c.strategy}</p>
                                <div className="space-y-2 pt-2">
                                  <div className="text-[10px] font-bold uppercase text-green-500">Strengths</div>
                                  {c.strengths.map((s, idx) => <div key={idx} className="text-xs text-zinc-400 leading-tight">• {s}</div>)}
                                </div>
                                <div className="space-y-2 pt-2 border-t border-zinc-800">
                                  <div className="text-[10px] font-bold uppercase text-red-500">Weaknesses</div>
                                  {c.weaknesses.map((w, idx) => <div key={idx} className="text-xs text-zinc-400 leading-tight">• {w}</div>)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions & Tools */}
                      <div className="lg:col-span-4 space-y-6">
                        <div className="bg-brand-500 p-8 rounded-[2rem] text-white shadow-2xl shadow-brand-500/20">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Initial Success Rate</span>
                          <div className="text-7xl font-display font-black my-2">{msg.evaluation?.successRate}%</div>
                          <div className="bg-black/20 p-4 rounded-xl mt-4">
                            <span className="text-xs font-bold">Flareonix Optimization Path</span>
                            <div className="text-2xl font-bold">Target: {msg.evaluation?.improvedSuccessRate}%</div>
                          </div>
                        </div>

                        {/* Hiring Guide */}
                        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem]">
                          <h4 className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-6">Talent Acquisition Map</h4>
                          <div className="space-y-4">
                            {msg.evaluation?.specialistHiringGuide.map((h, i) => (
                              <div key={i} className="flex items-start space-x-3 group">
                                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-500 transition-colors">
                                  <i className="fas fa-user-plus text-[10px]"></i>
                                </div>
                                <p className="text-sm text-zinc-300 leading-relaxed font-medium">{h}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Research Nodes */}
                        <div className="bg-dark-card border border-dark-border p-8 rounded-[2rem]">
                           <h4 className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-6">Live Research Nodes</h4>
                           <div className="space-y-2">
                             {msg.sources?.map((s, i) => (
                               <a key={i} href={s.url} target="_blank" rel="noreferrer" className="block p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-brand-500 transition-all truncate text-xs font-medium text-zinc-400 hover:text-white">
                                 <i className="fas fa-link mr-2 text-[10px]"></i> {s.title}
                               </a>
                             ))}
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-6 rounded-3xl border border-white/5 flex flex-col justify-between">
                         <h5 className="font-bold text-lg mb-2">Deep Market Map</h5>
                         <p className="text-xs text-zinc-500 mb-4">{msg.evaluation?.deepMarketMap.riskHeatmap}</p>
                         <button className="w-full py-3 bg-zinc-700 hover:bg-zinc-600 rounded-xl text-xs font-bold transition-all">Export JSON Map</button>
                      </div>
                      <div className="bg-zinc-900 p-6 rounded-3xl border border-white/5">
                        <h5 className="font-bold text-lg mb-2">Strategic Pivots</h5>
                        <div className="space-y-2">
                          {msg.evaluation?.strategicSuggestions.slice(0, 2).map((s, i) => <div key={i} className="text-xs text-zinc-400 italic font-medium">"{s}"</div>)}
                        </div>
                      </div>
                      <div className="bg-brand-500/10 p-6 rounded-3xl border border-brand-500/20 flex flex-col justify-between">
                        <h5 className="font-bold text-lg text-brand-500 mb-2">Production Readiness</h5>
                        <p className="text-xs text-zinc-400 mb-4">Integrate high-fidelity market data into your business plan automatically.</p>
                        <button className="w-full py-3 bg-brand-500 text-white rounded-xl text-xs font-black hover:scale-105 transition-all">Generate Full Pitch Deck</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="space-y-8 w-full max-w-5xl">
                 <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-zinc-800 rounded-xl animate-pulse"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-48 bg-zinc-800 rounded animate-pulse"></div>
                      <div className="h-3 w-32 bg-zinc-800 rounded animate-pulse opacity-50"></div>
                    </div>
                 </div>
                 <div className="h-[400px] w-full bg-zinc-900 border border-zinc-800 rounded-[2rem] shimmer"></div>
              </div>
            </div>
          )}
        </div>

        {messages.length > 0 && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50">
            <div className="glass-panel p-2 rounded-3xl shadow-2xl border border-white/10 flex items-center backdrop-blur-3xl">
              <input 
                type="text" 
                placeholder="Ask Flareonix a follow-up or provide a new pivot idea..."
                className="flex-1 bg-transparent border-none outline-none text-white px-8 py-4 placeholder:text-zinc-600 font-medium text-lg"
                onKeyDown={(e) => { if (e.key === 'Enter' && !loading) { handleAnalyze(e.currentTarget.value); e.currentTarget.value = ''; }}}
              />
              <button disabled={loading} onClick={() => { const i = document.querySelector('input') as HTMLInputElement; if (i.value && !loading) { handleAnalyze(i.value); i.value = ''; }}} className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all ${loading ? 'bg-zinc-800 text-zinc-500' : 'bg-brand-500 text-white hover:scale-105'}`}>
                {loading ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-arrow-right"></i>}
              </button>
            </div>
          </div>
        )}
      </main>

      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
          <div className="bg-dark-card border border-dark-border max-w-md w-full p-12 rounded-[3rem] space-y-10 shadow-2xl text-center">
            <div className="w-20 h-20 bg-brand-500 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-brand-500/40">
              <i className="fas fa-fire-alt text-white text-4xl"></i>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-display font-bold">Secure Access</h2>
              <p className="text-zinc-500">The world's most powerful startup brain awaits.</p>
            </div>
            <div className="space-y-4">
              <button onClick={loginDemo} className="w-full bg-white text-black py-5 rounded-2xl font-black flex items-center justify-center space-x-4 hover:scale-[1.02] transition-all">
                <i className="fab fa-google text-xl"></i>
                <span>Founder ID Login</span>
              </button>
              <button onClick={loginDemo} className="w-full bg-zinc-800 text-white py-5 rounded-2xl font-black flex items-center justify-center space-x-4 hover:scale-[1.02] transition-all">
                <i className="fas fa-shield-alt text-xl"></i>
                <span>Enterprise Shield</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
