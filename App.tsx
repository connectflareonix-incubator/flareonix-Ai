import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { evaluateIdea } from './services/gemini';
import { Message, EvaluationResult, UserProfile, ResearchSource } from './types';
import IdeaInput from './components/IdeaInput';
import MetricsRadar from './components/MetricsRadar';

const STORAGE_KEY = 'flareonix_history';
const USER_KEY = 'flareonix_user';

/* ---------------- Ember particles ---------------- */
function Embers() {
  const particles = useMemo(() =>
    Array.from({ length: 22 }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 2 + Math.random() * 4,
      delay: Math.random() * 14,
      duration: 14 + Math.random() * 14,
      dx: (Math.random() - 0.5) * 120,
      hue: Math.random() > 0.5 ? '#ff4d1a' : '#f97316',
    })), []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {particles.map((p) => (
        <span key={p.id} className="absolute bottom-0 rounded-full"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.hue,
            boxShadow: `0 0 ${p.size * 3}px ${p.hue}`,
            animation: `ember-rise ${p.duration}s linear ${p.delay}s infinite`,
            ['--dx' as any]: `${p.dx}px`,
          }}
        />
      ))}
    </div>
  );
}

/* ---------------- Logo ---------------- */
function Logo() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/30">
        <i className="fas fa-fire-alt text-white text-xl"></i>
      </div>
      <div className="flex flex-col leading-none">
        <span className="font-bold tracking-tight text-lg text-white">FLAREONIX</span>
        <span className="mt-1 text-[10px] uppercase tracking-[0.22em] text-zinc-500">Startup Intelligence</span>
      </div>
    </div>
  );
}

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showLanding, setShowLanding] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem(STORAGE_KEY);
    const savedUser = localStorage.getItem(USER_KEY);
    if (savedMessages) {
      const parsed = JSON.parse(savedMessages).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
      setMessages(parsed);
      if (parsed.length > 0) setShowLanding(false);
    }
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (messages.length > 0) localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const loginDemo = () => {
    const demoUser: UserProfile = { name: "Founder", email: "founder@flareonix.ai" };
    setUser(demoUser);
    localStorage.setItem(USER_KEY, JSON.stringify(demoUser));
    setShowLogin(false);
  };

  const handleAnalyze = async (text: string) => {
    setShowLanding(false);
    setLoading(true);
    setError(null);
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    try {
      const result = await evaluateIdea(text, user);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Deep evaluation finalized.",
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
    <div className="min-h-screen flex flex-col font-sans bg-[#0a0a0b] text-white">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700;800&display=swap');
        @keyframes ember-rise {
          0% { transform: translate3d(0,0,0) scale(1); opacity: 0; }
          10% { opacity: 0.9; }
          100% { transform: translate3d(var(--dx,0px),-120vh,0) scale(0.3); opacity: 0; }
        }
        @keyframes glow-pulse {
          0%,100% { opacity:0.55; transform:scale(1); }
          50% { opacity:0.85; transform:scale(1.05); }
        }
        @keyframes float-slow {
          0%,100% { transform:translateY(0); }
          50% { transform:translateY(-10px); }
        }
        .animate-glow-pulse { animation: glow-pulse 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 6s ease-in-out infinite; }
        .brand-gradient { background: linear-gradient(135deg,#ff3a1a 0%,#f97316 50%,#ffb347 100%); }
        .text-brand-gradient {
          background: linear-gradient(135deg,#ff3a1a 0%,#f97316 50%,#ffb347 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0a0a0b; }
        ::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
      `}</style>

      <Embers />

      {/* Error toast */}
      {error && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-md p-4 bg-red-500/10 border border-red-500/50 rounded-xl flex items-center space-x-3 text-red-200 backdrop-blur-md">
          <i className="fas fa-exclamation-circle"></i>
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-zinc-800/60 bg-[#0a0a0b]/70 backdrop-blur-xl">
        <div className="cursor-pointer" onClick={() => { setShowLanding(true); setMessages([]); }}>
          <Logo />
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-zinc-500">
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#pipeline" className="hover:text-white transition-colors">How it works</a>
          <a href="https://flareonix.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Flareonix.in ↗</a>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest bg-zinc-900 px-4 py-2 rounded-full border border-zinc-800">{user.name}</span>
              <button onClick={() => { setUser(null); localStorage.removeItem(USER_KEY); }} className="text-xs text-zinc-500 hover:text-white transition-colors">Sign out</button>
            </div>
          ) : (
            <button onClick={() => setShowLogin(true)} className="inline-flex items-center gap-1.5 rounded-full brand-gradient px-5 py-2 text-sm font-semibold text-black shadow-lg shadow-orange-500/30 hover:scale-[1.03] transition-transform">
              <i className="fas fa-fire-alt text-xs"></i>
              Enter the Fire
            </button>
          )}
        </div>
      </nav>

      <main className="flex-1 relative z-10">
        {/* Landing page */}
        {showLanding && (
          <div className="relative overflow-hidden">
            {/* Radial glow */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10"
              style={{ background: 'radial-gradient(ellipse 70% 55% at 50% 10%, rgba(249,115,22,0.28), transparent 70%)' }} />
            {/* Grid */}
            <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 opacity-[0.05]"
              style={{
                backgroundImage: 'linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)',
                backgroundSize: '64px 64px',
                maskImage: 'radial-gradient(ellipse 70% 60% at 50% 30%,black 30%,transparent 80%)'
              }} />

            {/* Hero */}
            <section className="mx-auto max-w-5xl px-6 pb-28 pt-20 text-center sm:pt-28">
              <div className="relative mx-auto mb-10 h-32 w-32 sm:h-40 sm:w-40">
                <div aria-hidden className="absolute inset-0 -z-10 animate-glow-pulse rounded-full blur-3xl"
                  style={{ background: 'radial-gradient(circle,rgba(255,77,26,0.55),rgba(249,115,22,0.2) 50%,transparent 70%)' }} />
                <div className="h-full w-full animate-float-slow flex items-center justify-center">
                  <div className="w-28 h-28 bg-brand-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-orange-500/40" style={{ background: 'linear-gradient(135deg,#ff3a1a,#f97316)' }}>
                    <i className="fas fa-fire-alt text-white text-6xl"></i>
                  </div>
                </div>
              </div>

              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.32em] text-brand-gradient">
                Rise · Ignite · Conquer
              </p>

              <h1 className="text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl md:text-7xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Know your <span className="italic text-brand-gradient">Edge.</span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-400 sm:text-lg">
                Flareonix evaluates the survival rate, competitive landscape, and execution roadmap of your startup idea.
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <button onClick={() => document.getElementById('idea-input')?.focus()}
                  className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-orange-500/30 hover:scale-[1.03] transition-transform brand-gradient">
                  <i className="fas fa-fire-alt text-xs"></i>
                  Evaluate your idea
                </button>
                <button className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-6 py-3 text-sm font-medium text-white hover:bg-zinc-900 transition-colors">
                  Watch demo
                  <i className="fas fa-arrow-right text-xs"></i>
                </button>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                {[
                  { icon: 'fa-fire-alt', label: 'Trained on 12k+ ventures' },
                  { icon: 'fa-shield-alt', label: 'Investor-grade output' },
                  { icon: 'fa-bolt', label: 'Results in 60 seconds' },
                ].map(({ icon, label }) => (
                  <span key={label} className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs text-zinc-400 backdrop-blur">
                    <i className={`fas ${icon} text-orange-500 text-[10px]`}></i>
                    {label}
                  </span>
                ))}
              </div>

              {/* Idea input */}
              <div className="mt-16">
                <IdeaInput onAnalyze={handleAnalyze} loading={loading} />
              </div>
            </section>

            {/* Stats */}
            <section className="border-t border-zinc-800/60">
              <div className="mx-auto grid max-w-7xl grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-zinc-800">
                {[
                  { value: '94%', label: 'Verdict accuracy' },
                  { value: '12k+', label: 'Ventures benchmarked' },
                  { value: '<60s', label: 'From idea to brief' },
                  { value: '6', label: 'Lenses per evaluation' },
                ].map((s) => (
                  <div key={s.label} className="p-8">
                    <div className="text-4xl font-bold tracking-tight text-brand-gradient sm:text-5xl">{s.value}</div>
                    <div className="mt-2 text-xs uppercase tracking-[0.18em] text-zinc-500">{s.label}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Features */}
            <section id="features" className="border-t border-zinc-800/60">
              <div className="mx-auto max-w-7xl px-6 py-24">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gradient">Intelligence layer</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  Six lenses on your idea — one <span className="italic text-brand-gradient">verdict.</span>
                </h2>
                <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-800 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { icon: 'fa-shield-alt', title: 'Survival score', body: 'A data-grounded probability your startup makes it past the first 24 months.' },
                    { icon: 'fa-crosshairs', title: 'Competitive landscape', body: 'Map incumbents, fast-movers, and adjacent threats before you commit.' },
                    { icon: 'fa-map', title: 'Execution roadmap', body: 'A milestone-by-milestone plan tuned to your stage — from first build to distribution.' },
                    { icon: 'fa-compass', title: 'Market signal', body: 'Real-time demand, hiring, and funding signals across your category.' },
                    { icon: 'fa-star', title: 'Edge synthesis', body: 'Surfaces the unfair advantages — talent, timing, tech — that compound into a moat.' },
                    { icon: 'fa-fire-alt', title: 'Decision-ready briefs', body: 'Investor-grade output, formatted for the room: clear, concise, built to defend.' },
                  ].map((f) => (
                    <div key={f.title} className="group relative overflow-hidden bg-[#161618] p-7 hover:bg-zinc-900/70 transition-colors">
                      <div aria-hidden className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                        style={{ background: 'rgba(249,115,22,0.35)' }} />
                      <div className="relative mb-5 inline-flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-800 bg-[#0a0a0b] text-orange-500">
                        <i className={`fas ${f.icon} text-sm`}></i>
                      </div>
                      <h3 className="relative text-base font-semibold">{f.title}</h3>
                      <p className="relative mt-2 text-sm leading-relaxed text-zinc-400">{f.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* How it works */}
            <section id="pipeline" className="border-t border-zinc-800/60">
              <div className="mx-auto max-w-7xl px-6 py-24">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-gradient">How it works</p>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-5xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  From spark to <span className="italic text-brand-gradient">strategy.</span>
                </h2>
                <div className="mt-14 grid gap-6 md:grid-cols-3">
                  {[
                    { n: '01', title: 'Describe your idea', body: 'One paragraph is enough. Flareonix infers stage, category, and intent.' },
                    { n: '02', title: 'We benchmark in real time', body: 'We pull live market, competitor, and capital signals across your category.' },
                    { n: '03', title: 'Read your verdict', body: 'Survival score, edge analysis, and a milestone roadmap — ready to defend.' },
                  ].map((s, i) => (
                    <div key={s.n} className="relative rounded-2xl border border-zinc-800 bg-[#161618] p-7">
                      <div className="mb-6 flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-[0.18em] text-zinc-500">Step {s.n}</span>
                        <span className="text-2xl font-bold text-brand-gradient">{String(i + 1).padStart(2, '0')}</span>
                      </div>
                      <h3 className="text-lg font-semibold">{s.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-zinc-400">{s.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-zinc-800/60">
              <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-6 py-10 sm:flex-row sm:items-center">
                <Logo />
                <div className="flex flex-col items-start gap-1 text-xs text-zinc-500 sm:items-end">
                  <p>© {new Date().getFullYear()} Flareonix. Startup intelligence, refined.</p>
                  <p>Part of the <a href="https://flareonix.in" target="_blank" rel="noreferrer" className="text-orange-500 hover:brightness-125 transition-all">flareonix.in</a> ecosystem.</p>
                </div>
              </div>
            </footer>
          </div>
        )}

        {/* Chat / Results view */}
        {!showLanding && (
          <div className="max-w-7xl mx-auto w-full p-4 md:p-8 space-y-12 pb-40" ref={scrollRef}>
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`w-full ${msg.role === 'user' ? 'max-w-xl' : 'max-w-full'}`}>
                  {msg.role === 'user' ? (
                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-3xl ml-auto">
                      <p className="text-zinc-300 font-medium text-lg">{msg.content}</p>
                    </div>
                  ) : (
                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                      <div className="flex items-center justify-between border-b border-zinc-800 pb-6">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-xl shadow-orange-500/20 brand-gradient">
                            <i className="fas fa-brain text-white text-xl"></i>
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Strategic Intelligence Node</h2>
                            <p className="text-zinc-500 text-sm">Session {msg.timestamp.toLocaleTimeString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => handleFeedback(msg.id, 'positive')} className={`p-3 rounded-xl transition-all ${msg.feedback === 'positive' ? 'bg-green-500/20 text-green-500' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}><i className="fas fa-thumbs-up"></i></button>
                          <button onClick={() => handleFeedback(msg.id, 'negative')} className={`p-3 rounded-xl transition-all ${msg.feedback === 'negative' ? 'bg-red-500/20 text-red-500' : 'bg-zinc-900 text-zinc-500 hover:text-white'}`}><i className="fas fa-thumbs-down"></i></button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-8">
                          <div className="bg-[#161618] border border-zinc-800 p-8 rounded-[2rem] shadow-2xl">
                            <h3 className="text-zinc-500 uppercase text-xs font-black tracking-widest mb-4">Core Thesis</h3>
                            <p className="text-2xl font-medium leading-relaxed text-zinc-100">"{msg.evaluation?.summary}"</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 pt-12 border-t border-zinc-800">
                              <div>
                                <h4 className="text-xs font-bold text-zinc-500 uppercase mb-6 tracking-tighter">Viability Radar</h4>
                                <MetricsRadar data={msg.evaluation?.metrics || []} />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-zinc-500 uppercase mb-6 tracking-tighter">Market Entry Trends</h4>
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

                          <div className="bg-[#161618] border border-zinc-800 p-8 rounded-[2rem]">
                            <h3 className="text-xl font-bold mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Competitive Landscape Matrix</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {msg.evaluation?.competitors.map((c, i) => (
                                <div key={i} className="p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl space-y-4">
                                  <div className="flex justify-between items-start">
                                    <span className="text-lg font-bold text-white">{c.name}</span>
                                    <span className="text-[10px] bg-orange-500/10 text-orange-500 px-2 py-1 rounded uppercase font-bold">{c.stage}</span>
                                  </div>
                                  <p className="text-xs text-zinc-500 italic">Strategy: {c.strategy}</p>
                                  <div className="space-y-2 pt-2">
                                    <div className="text-[10px] font-bold uppercase text-green-500">Strengths</div>
                                    {c.strengths.map((s, idx) => <div key={idx} className="text-xs text-zinc-400">• {s}</div>)}
                                  </div>
                                  <div className="space-y-2 pt-2 border-t border-zinc-800">
                                    <div className="text-[10px] font-bold uppercase text-red-500">Weaknesses</div>
                                    {c.weaknesses.map((w, idx) => <div key={idx} className="text-xs text-zinc-400">• {w}</div>)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="lg:col-span-4 space-y-6">
                          <div className="p-8 rounded-[2rem] text-white shadow-2xl shadow-orange-500/20 brand-gradient">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Initial Success Rate</span>
                            <div className="text-7xl font-bold my-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{msg.evaluation?.successRate}%</div>
                            <div className="bg-black/20 p-4 rounded-xl mt-4">
                              <span className="text-xs font-bold">Flareonix Optimization Path</span>
                              <div className="text-2xl font-bold">Target: {msg.evaluation?.improvedSuccessRate}%</div>
                            </div>
                          </div>

                          <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem]">
                            <h4 className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-6">Talent Acquisition Map</h4>
                            <div className="space-y-4">
                              {msg.evaluation?.specialistHiringGuide.map((h, i) => (
                                <div key={i} className="flex items-start space-x-3 group">
                                  <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500 transition-colors">
                                    <i className="fas fa-user-plus text-[10px]"></i>
                                  </div>
                                  <p className="text-sm text-zinc-300 leading-relaxed font-medium">{h}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="bg-[#161618] border border-zinc-800 p-8 rounded-[2rem]">
                            <h4 className="text-xs font-black uppercase text-zinc-500 tracking-widest mb-6">Live Research Nodes</h4>
                            <div className="space-y-2">
                              {msg.sources?.map((s, i) => (
                                <a key={i} href={s.url} target="_blank" rel="noreferrer" className="block p-3 bg-zinc-900 border border-zinc-800 rounded-xl hover:border-orange-500 transition-all truncate text-xs font-medium text-zinc-400 hover:text-white">
                                  <i className="fas fa-link mr-2 text-[10px]"></i>{s.title}
                                </a>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

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
                        <div className="bg-orange-500/10 p-6 rounded-3xl border border-orange-500/20 flex flex-col justify-between">
                          <h5 className="font-bold text-lg text-orange-500 mb-2">Production Readiness</h5>
                          <p className="text-xs text-zinc-400 mb-4">Integrate high-fidelity market data into your business plan automatically.</p>
                          <button className="w-full py-3 brand-gradient text-black rounded-xl text-xs font-black hover:scale-105 transition-all">Generate Full Pitch Deck</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="space-y-4 w-full max-w-5xl">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-xl animate-pulse brand-gradient opacity-50"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-64 bg-zinc-800 rounded animate-pulse"></div>
                      <div className="h-3 w-48 bg-zinc-800 rounded animate-pulse opacity-50"></div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-orange-500 text-sm font-medium animate-pulse">
                      <i className="fas fa-fire-alt mr-2"></i>
                      Flareonix is analyzing your idea across 6 intelligence lenses...
                    </p>
                    <p className="text-zinc-500 text-xs">Benchmarking competitors · Mapping market signals · Calculating survival rate</p>
                  </div>
                  <div className="h-[400px] w-full bg-zinc-900 border border-zinc-800 rounded-[2rem] animate-pulse"></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Floating input bar (after first analysis) */}
        {!showLanding && (
          <div className="fixed bottom-10 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50">
            <div className="p-2 rounded-3xl shadow-2xl border border-zinc-800/60 flex items-center bg-[#0a0a0b]/80 backdrop-blur-3xl">
              <input
                type="text"
                placeholder="Ask a follow-up or evaluate a new idea..."
                className="flex-1 bg-transparent border-none outline-none text-white px-8 py-4 placeholder:text-zinc-600 font-medium text-lg"
                onKeyDown={(e) => { if (e.key === 'Enter' && !loading) { handleAnalyze(e.currentTarget.value); e.currentTarget.value = ''; } }}
              />
              <button disabled={loading} onClick={() => { const i = document.querySelector('input[type="text"]') as HTMLInputElement; if (i?.value && !loading) { handleAnalyze(i.value); i.value = ''; } }}
                className={`w-14 h-14 flex items-center justify-center rounded-2xl transition-all ${loading ? 'bg-zinc-800 text-zinc-500' : 'brand-gradient text-black hover:scale-105'}`}>
                {loading ? <i className="fas fa-circle-notch animate-spin"></i> : <i className="fas fa-arrow-right"></i>}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Login modal */}
      {showLogin && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl">
          <div className="bg-[#161618] border border-zinc-800 max-w-md w-full p-12 rounded-[3rem] space-y-10 shadow-2xl text-center">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-orange-500/40 brand-gradient">
              <i className="fas fa-fire-alt text-white text-4xl"></i>
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Secure Access</h2>
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
              <button onClick={() => setShowLogin(false)} className="text-xs text-zinc-500 hover:text-white transition-colors">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
