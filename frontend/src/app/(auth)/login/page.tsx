"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Eye, EyeOff, LogIn, AlertCircle, Sparkles, Activity, Droplet, 
  Database, Cpu, Bird, Lock, ShieldCheck, Zap, Server, Settings,
  BarChart, ActivitySquare, ShieldAlert, CheckCircle2, User, KeyRound,
  Volume2, VolumeX, Search, HelpCircle, ArrowRight, Radio, Compass
} from "lucide-react";
import { api } from "@/lib/api";

interface DemoPersona {
  role: string;
  name: string;
  uniqueId: string;
  password: string;
  tag: string;
  color: string;
  badge: string;
}

const DEMO_PERSONAS: DemoPersona[] = [
  {
    role: "Team Lead",
    name: "D Greeshmanth",
    uniqueId: "ECO-WATER-01",
    password: "password123",
    tag: "AI & Backend",
    color: "cyan",
    badge: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  },
  {
    role: "Frontend Developer",
    name: "G.Naveen",
    uniqueId: "ECO-WATER-02",
    password: "password123",
    tag: "Frontend & UI",
    color: "emerald",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  {
    role: "Backend Developer",
    name: "E.Phani",
    uniqueId: "ECO-WATER-03",
    password: "password123",
    tag: "FastAPI & Database",
    color: "blue",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  {
    role: "AI/ML Engineer",
    name: "D.Charan",
    uniqueId: "ECO-WATER-04",
    password: "password123",
    tag: "AI & Analytics",
    color: "violet",
    badge: "bg-violet-500/10 text-violet-400 border-violet-500/30",
  },
  {
    role: "Research / Presentation",
    name: "D.Sathya",
    uniqueId: "ECO-WATER-05",
    password: "password123",
    tag: "Research & Demo",
    color: "amber",
    badge: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
];

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ uniqueId: "", name: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Nature Bird sound state
  const [birdMessage, setBirdMessage] = useState("");
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const birdAudioRef = useRef<HTMLAudioElement | null>(null);

  // Recovery modal state
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryResult, setRecoveryResult] = useState<string | null>(null);
  const [recoveryError, setRecoveryError] = useState("");

  // Prompt carousel
  const [activePromptIndex, setActivePromptIndex] = useState(0);
  const prompts = [
    "Find the biggest water anomaly across campus",
    "Predict tomorrow's cooling tower water demand",
    "Detect micro-leaks in Building-B pipeline",
    "Calculate greywater recycling potential",
    "Optimize valve pressure for zero-waste flow"
  ];

  // Selected agent tooltip preview in orbital visualizer
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);

  // Live telemetry stream ticker
  const [telemetry, setTelemetry] = useState({
    flowRate: 142.8,
    leakRisk: "LOW (0.02%)",
    tdsPpm: 218,
    activeAgents: 12,
    sensorMesh: "99.8% ONLINE"
  });

  useEffect(() => {
    // Seed default demo personas into local storage if eco_users is empty
    const existingUsers = localStorage.getItem("eco_users");
    if (!existingUsers) {
      const defaultUsers = DEMO_PERSONAS.map(p => ({
        uniqueId: p.uniqueId,
        name: p.name,
        email: `${p.name.toLowerCase().replace(/\s+/g, ".")}@ecogenius.ai`,
        phone: "+1 800 555 0199",
        password: p.password,
        role: p.role,
        createdAt: new Date().toISOString()
      }));
      localStorage.setItem("eco_users", JSON.stringify(defaultUsers));
    }

    // Audio setup
    birdAudioRef.current = new Audio("https://cdn.freesound.org/previews/172/172314_2991040-lq.mp3");
    if (birdAudioRef.current) {
      birdAudioRef.current.volume = 0.4;
    }

    // Prompt rotation
    const interval = setInterval(() => {
      setActivePromptIndex((prev) => (prev + 1) % prompts.length);
    }, 4500);

    // Live telemetry simulation tick
    const teleInterval = setInterval(() => {
      setTelemetry({
        flowRate: +(140 + Math.random() * 6).toFixed(1),
        leakRisk: Math.random() > 0.85 ? "MED (1.4%)" : "LOW (0.02%)",
        tdsPpm: Math.floor(214 + Math.random() * 8),
        activeAgents: 12,
        sensorMesh: "99.8% ONLINE"
      });
    }, 3000);

    return () => {
      clearInterval(interval);
      clearInterval(teleInterval);
    };
  }, [prompts.length]);

  const handleBirdClick = () => {
    if (isAudioMuted) {
      setBirdMessage("Audio muted 🔇");
      setTimeout(() => setBirdMessage(""), 2500);
      return;
    }
    if (birdAudioRef.current) {
      birdAudioRef.current.currentTime = 0;
      birdAudioRef.current.play().catch(e => console.log("Audio playback notice:", e));
    }
    setBirdMessage("🌿 EcoCore: Preserving life & natural ecosystems");
    setTimeout(() => setBirdMessage(""), 3500);
  };

  const handleQuickFill = (persona: DemoPersona) => {
    // Only fill the Full Name field; leave Unique ID and Password for the user
    setForm(prev => ({
      ...prev,
      name: persona.name,
    }));
    setError("");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setRecoveryError("");
    setRecoveryResult(null);

    if (!recoveryEmail.trim()) {
      setRecoveryError("Please enter your registered email address.");
      return;
    }

    const users: any[] = JSON.parse(localStorage.getItem("eco_users") || "[]");
    const matched = users.find(u => u.email?.toLowerCase() === recoveryEmail.trim().toLowerCase());

    if (matched) {
      setRecoveryResult(`Found Account: ${matched.name} | ID: ${matched.uniqueId}`);
      setForm(prev => ({
        ...prev,
        uniqueId: matched.uniqueId,
        name: matched.name
      }));
    } else {
      setRecoveryError("No account found matching that email. You can register a new one.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.uniqueId.trim() || !form.name.trim() || !form.password) {
      setError("Please enter your Unique ID, Full Name, and Password.");
      return;
    }

    setLoading(true);

    try {
      // 1. Try Backend API login
      let loggedInUser: any = null;
      try {
        const backendRes = await api.login({
          uniqueId: form.uniqueId.trim(),
          name: form.name.trim(),
          password: form.password
        });
        if (backendRes && backendRes.uniqueId) {
          loggedInUser = backendRes;
        }
      } catch {
        // Backend might be offline or Mongo not configured, fall through to localStorage validation
      }

      // 2. Fallback to localStorage and demo personas
      if (!loggedInUser) {
        const users: any[] = JSON.parse(localStorage.getItem("eco_users") || "[]");
        const match = users.find(
          (u: any) =>
            u.uniqueId?.toUpperCase() === form.uniqueId.trim().toUpperCase() &&
            u.name?.toLowerCase() === form.name.trim().toLowerCase() &&
            u.password === form.password
        );

        if (match) {
          loggedInUser = match;
        }
      }

      if (!loggedInUser) {
        setError("Invalid credentials. Please verify your Unique ID, Name, or Password.");
        setLoading(false);
        return;
      }

      setSuccess(true);
      const sessionData = {
        uniqueId: loggedInUser.uniqueId,
        name: loggedInUser.name,
        email: loggedInUser.email || `${loggedInUser.name.toLowerCase().replace(/\s+/g, ".")}@ecogenius.ai`,
        role: loggedInUser.role || "Sustainability Officer",
        loginTime: new Date().toISOString(),
        rememberMe
      };
      
      localStorage.setItem("eco_session", JSON.stringify(sessionData));
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 900);
    } catch {
      setError("System connection error. Please try again.");
      setLoading(false);
    }
  };

  const handleGuestDemo = () => {
    const demo = DEMO_PERSONAS[0];
    setForm({
      uniqueId: demo.uniqueId,
      name: demo.name,
      password: demo.password
    });
    setSuccess(true);
    localStorage.setItem("eco_session", JSON.stringify({
      uniqueId: demo.uniqueId,
      name: demo.name,
      email: "elena.vance@ecogenius.ai",
      role: demo.role,
      loginTime: new Date().toISOString()
    }));
    setTimeout(() => {
      router.push("/dashboard");
    }, 800);
  };

  const handleHackathonDemo = () => {
    const demo = DEMO_PERSONAS[0];
    setForm({
      uniqueId: demo.uniqueId,
      name: demo.name,
      password: demo.password
    });
    setSuccess(true);
    
    // Store specific flag for hackathon demo mode
    sessionStorage.setItem("hackathon_demo_mode", "true");
    
    localStorage.setItem("eco_session", JSON.stringify({
      uniqueId: demo.uniqueId,
      name: demo.name,
      email: "elena.vance@ecogenius.ai",
      role: demo.role,
      loginTime: new Date().toISOString(),
      isHackathonDemo: true
    }));
    setTimeout(() => {
      router.push("/dashboard");
    }, 800);
  };

  const agentsList = [
    { name: "Water Agent", icon: Droplet, color: "text-cyan-400", border: "border-cyan-500/40", status: "Active (0.02% leak risk)", throughput: "142.8 L/min" },
    { name: "Optimization Core", icon: ActivitySquare, color: "text-emerald-400", border: "border-emerald-500/40", status: "Optimizing 4 chillers", throughput: "+18.4% Efficiency" },
    { name: "Forecast Model", icon: BarChart, color: "text-blue-400", border: "border-blue-500/40", status: "24h Horizon Ready", throughput: "98.7% Accuracy" }
  ];

  return (
    <div 
      className="min-h-screen flex flex-col md:flex-row relative overflow-hidden font-sans text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200"
      style={{
        backgroundImage: "url('/login-bg.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      {/* Dark Translucent Overlay */}
      <div className="absolute inset-0 bg-[#050b16]/70 z-0"></div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-16px) rotate(3deg); }
          100% { transform: translateY(0px) rotate(0deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.35; filter: blur(50px); }
          50% { opacity: 0.8; filter: blur(75px); }
        }
        @keyframes orbit {
          0% { transform: rotate(0deg) translateX(128px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(128px) rotate(-360deg); }
        }
        @keyframes flow {
          0% { stroke-dashoffset: 120; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes fly {
          0% { transform: translateX(105vw) translateY(4vh) scale(0.9); }
          100% { transform: translateX(-10vw) translateY(16vh) scale(0.9); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-glow { animation: pulse-glow 5s ease-in-out infinite; }
        .animate-orbit { animation: orbit 22s linear infinite; }
        .animate-flow { animation: flow 3s linear infinite; }
        .animate-fly { animation: fly 40s linear infinite; }
        .glass-panel {
          background: rgba(11, 20, 36, 0.88);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(30, 41, 59, 0.65);
          box-shadow: 0 0 20px rgba(6, 182, 212, 0.2), 0 0 40px rgba(16, 185, 129, 0.1);
        }
        .text-gradient {
          background: linear-gradient(135deg, #06b6d4 0%, #10b981 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .focus-glow:focus-within {
          box-shadow: 0 0 24px rgba(6, 182, 212, 0.25);
          border-color: rgba(6, 182, 212, 0.6);
        }
      `}} />

      {/* BACKGROUND ELEMENTS */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Animated grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "linear-gradient(#06b6d4 1px, transparent 1px), linear-gradient(90deg, #06b6d4 1px, transparent 1px)",
            backgroundSize: "55px 55px",
          }}
        />
        {/* Glow orbs */}
        <div className="absolute top-[8%] left-[15%] w-[550px] h-[550px] bg-cyan-600/15 rounded-full animate-glow mix-blend-screen" />
        <div className="absolute bottom-[15%] right-[8%] w-[650px] h-[650px] bg-emerald-600/15 rounded-full animate-glow mix-blend-screen" style={{ animationDelay: "2.5s" }} />
        <div className="absolute top-[35%] left-[55%] w-[450px] h-[450px] bg-blue-600/10 rounded-full animate-glow mix-blend-screen" style={{ animationDelay: "1.2s" }} />
      </div>

      {/* TOP RIGHT CONTROLS & STATUS */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-4">
        
        {/* SYSTEM HEALTH STRIP */}
        <div className="hidden xl:flex items-center gap-3 px-4 py-2 bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-full shadow-lg">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest">System Online</span>
          </div>
          <span className="text-slate-700 text-[10px]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span className="text-[9px] font-mono font-bold text-cyan-300 uppercase tracking-widest">API Connected</span>
          </div>
          <span className="text-slate-700 text-[10px]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span className="text-[9px] font-mono font-bold text-cyan-300 uppercase tracking-widest">Database Ready</span>
          </div>
          <span className="text-slate-700 text-[10px]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span className="text-[9px] font-mono font-bold text-cyan-300 uppercase tracking-widest">AI Engine Ready</span>
          </div>
          <span className="text-slate-700 text-[10px]">|</span>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            <span className="text-[9px] font-mono font-bold text-cyan-300 uppercase tracking-widest">Telemetry Live</span>
          </div>
        </div>

        {/* CALLING BIRD & NATURE AUDIO TOGGLE */}
        <button
          onClick={() => setIsAudioMuted(!isAudioMuted)}
          className="p-2.5 rounded-full bg-slate-900/80 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-500/40 transition-all text-xs flex items-center gap-1.5 backdrop-blur-md shadow-lg"
          title={isAudioMuted ? "Unmute Nature Sounds" : "Mute Nature Sounds"}
        >
          {isAudioMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />}
          <span className="hidden sm:inline text-[11px] font-mono">{isAudioMuted ? "Sound Off" : "Ambient SFX"}</span>
        </button>
      </div>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-20">
        <button 
          onClick={handleBirdClick}
          className="absolute z-30 pointer-events-auto animate-fly flex items-center justify-center opacity-70 hover:opacity-100 transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded-full p-2.5 group cursor-pointer"
          aria-label="Play bird sound"
          title="Click the bird to hear nature sound"
        >
          <div className="relative">
            <Bird className="w-7 h-7 text-emerald-400 group-hover:scale-125 transition-transform filter drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
          </div>
          {birdMessage && (
            <span className="absolute -bottom-10 whitespace-nowrap bg-emerald-950/90 text-emerald-200 text-xs px-3 py-1.5 rounded-lg backdrop-blur-md border border-emerald-500/40 shadow-xl shadow-black/40">
              {birdMessage}
            </span>
          )}
        </button>
      </div>

      {/* LEFT PANEL: HERO COMMAND EXPERIENCE */}
      <div className="relative z-10 w-full md:w-1/2 lg:w-3/5 p-8 md:p-12 lg:p-16 flex flex-col justify-between border-r border-slate-800/60">
        
        <div>
          {/* Live Status Indicator */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
            </div>
            <span className="text-emerald-400 text-xs font-mono tracking-widest uppercase font-semibold">
              ECOCORE MULTI-AGENT INTELLIGENCE • ONLINE
            </span>
          </div>

          <div className="mb-6">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight mb-3">
              <span className="text-white">EcoGenius </span>
              <span className="text-gradient">AI</span>
            </h1>
            <h2 className="text-lg md:text-xl text-cyan-100/90 font-medium tracking-wide mb-4">
              Autonomous Water, Energy & Sustainability Command System
            </h2>
            <p className="text-slate-400 max-w-xl text-sm md:text-base leading-relaxed">
              Transform high-frequency telemetry into real-time anomaly prevention, predictive demand routing, and zero-waste environmental impact.
            </p>
          </div>

          {/* QUICK DEMO PERSONAS BAR */}
          <div className="mt-6 p-4 rounded-2xl bg-[#0b1220]/80 border border-slate-800/80 backdrop-blur-md">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-mono text-cyan-400/90 uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" />
                Instant Demo Personas (1-Click Fill)
              </span>
              <span className="text-[10px] text-slate-500">Zero setup required</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {DEMO_PERSONAS.map((persona, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickFill(persona)}
                  className="flex flex-col text-left p-2.5 rounded-xl bg-[#0f172a]/90 hover:bg-[#1e293b] border border-slate-800 hover:border-cyan-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition-colors">
                      {persona.name}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${persona.badge}`}>
                      {persona.uniqueId}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{persona.role}</span>
                </button>
              ))}
            </div>
          </div>

          {/* WATER INTELLIGENCE VISUALIZATION & ORBIT */}
          <div className="relative h-[280px] w-full max-w-xl mt-8 hidden md:block select-none">
            {/* Central AI Core */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 animate-float cursor-pointer group"
                 title="EcoCore Central Orchestrator">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-600 via-emerald-500 to-blue-500 p-[2px] shadow-[0_0_45px_rgba(6,182,212,0.45)] group-hover:scale-105 transition-transform">
                <div className="w-full h-full rounded-full bg-[#0a0f1c] flex items-center justify-center flex-col relative overflow-hidden">
                  <div className="absolute inset-0 bg-cyan-500/10 animate-pulse" />
                  <Sparkles className="w-8 h-8 text-cyan-400 mb-1 filter drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]" />
                  <span className="text-[9px] font-bold text-emerald-400 tracking-wider font-mono">ECOCORE</span>
                </div>
              </div>
            </div>

            {/* Orbital Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full border border-cyan-500/20 border-dashed animate-[spin_40s_linear_infinite]" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-emerald-500/15 animate-[spin_60s_linear_infinite_reverse]" />

            {/* Orbiting Agents */}
            <div className="absolute top-1/2 left-1/2 z-10 w-0 h-0">
              {agentsList.map((agent, i) => (
                <div 
                  key={i}
                  className="absolute animate-orbit flex items-center gap-2 group cursor-pointer"
                  style={{ animationDelay: `-${i * 7.33}s` }}
                  onClick={() => setSelectedAgent(selectedAgent === i ? null : i)}
                >
                  <div className={`w-9 h-9 rounded-full bg-[#0d1427] border ${agent.border} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:border-cyan-400 transition-all`}>
                    <agent.icon className={`w-4.5 h-4.5 ${agent.color}`} />
                  </div>
                  <div className="px-2.5 py-1.5 rounded-lg bg-[#0d1427]/90 backdrop-blur-md border border-slate-700/80 text-[10px] font-mono text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity absolute left-11 w-[130px] shadow-xl pointer-events-none">
                    <div className="font-bold text-white">{agent.name}</div>
                    <div className="text-[8px] text-emerald-400 mt-0.5 font-semibold">● {agent.status}</div>
                    <div className="text-[8px] text-cyan-300">{agent.throughput}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stylized Network / Pipeline lines (SVG) */}
            <svg className="absolute inset-0 w-full h-full z-0 opacity-45">
              <path d="M 10 140 Q 140 140 165 140" stroke="#06b6d4" strokeWidth="2" fill="none" strokeDasharray="5 5" className="animate-flow" />
              <path d="M 480 140 Q 340 140 315 140" stroke="#10b981" strokeWidth="2" fill="none" strokeDasharray="5 5" className="animate-[flow_3s_linear_infinite_reverse]" />
              <path d="M 240 10 L 240 50" stroke="#3b82f6" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-flow" />
              <path d="M 240 270 L 240 230" stroke="#06b6d4" strokeWidth="2" fill="none" strokeDasharray="4 4" className="animate-[flow_2.5s_linear_infinite]" />
            </svg>
          </div>
        </div>

        {/* AI Command Preview & Live Telemetry Footer */}
        <div className="mt-8 pt-4 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-[11px] font-mono text-cyan-400 border border-cyan-500/30 px-2.5 py-1 rounded-md bg-cyan-500/10 flex items-center gap-1.5">
              <Compass className="w-3 h-3 text-cyan-400" />
              AI INTEL
            </div>
            <div className="text-slate-300 text-xs italic overflow-hidden h-[18px] relative w-[240px]">
              {prompts.map((prompt, i) => (
                <div 
                  key={i} 
                  className={`absolute inset-0 transition-all duration-500 transform ${i === activePromptIndex ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}
                >
                  &quot;{prompt}&quot;
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400">
            <span>Mesh: <strong className="text-emerald-400">{telemetry.sensorMesh}</strong></span>
            <span>•</span>
            <span>Flow: <strong className="text-cyan-400">{telemetry.flowRate} L/m</strong></span>
          </div>
        </div>

      </div>

      {/* RIGHT PANEL: ADVANCED LOGIN CARD */}
      <div className="relative z-10 w-full md:w-1/2 lg:w-2/5 p-6 md:p-10 lg:p-12 flex flex-col justify-center items-center min-h-[640px]">
        
        {/* System Status Panel (Above Card) */}
        <div className="w-full max-w-md mb-5 grid grid-cols-4 gap-2">
          <div className="glass-panel rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">Agents</span>
            <span className="text-cyan-400 text-xs font-mono font-bold">{telemetry.activeAgents} ACTIVE</span>
          </div>
          <div className="glass-panel rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">Flow</span>
            <span className="text-emerald-400 text-xs font-mono font-bold">{telemetry.flowRate} L/m</span>
          </div>
          <div className="glass-panel rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">Leak Risk</span>
            <span className="text-blue-400 text-xs font-mono font-bold">{telemetry.leakRisk}</span>
          </div>
          <div className="glass-panel rounded-xl p-2.5 flex flex-col items-center justify-center text-center">
            <span className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold mb-0.5">Quality</span>
            <span className="text-purple-400 text-xs font-mono font-bold">{telemetry.tdsPpm} TDS</span>
          </div>
        </div>

        {/* The Card */}
        <div className="w-full max-w-md glass-panel rounded-3xl p-7 md:p-9 shadow-2xl relative overflow-hidden group">
          
          {/* Card subtle shine effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

          {/* Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-13 h-13 p-3 rounded-2xl bg-gradient-to-br from-[#111827] to-[#1e293b] border border-cyan-500/30 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.25)] mb-3">
              <ShieldCheck className="w-7 h-7 text-cyan-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Sustainability HQ</h2>
            <p className="text-xs text-slate-400 mt-0.5">Sign in to EcoCore Intelligence Environment</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs px-3.5 py-2.5 rounded-xl animate-[pulse_2s_ease-in-out_infinite]">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="flex items-center gap-2 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs px-3.5 py-2.5 rounded-xl">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                <span>Access verified. Launching EcoCore Command Center...</span>
              </div>
            )}

            {/* Unique ID */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="login-uniqueId" className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Unique ID
                </label>
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(true)}
                  className="text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors underline decoration-cyan-500/30"
                >
                  Forgot ID?
                </button>
              </div>
              <div className="focus-glow rounded-xl transition-all duration-300 border border-[#1e293b] bg-[#0f172a]/90 overflow-hidden flex items-center px-3.5">
                <Activity className="w-4 h-4 text-cyan-500/70 flex-shrink-0" />
                <input
                  id="login-uniqueId"
                  name="uniqueId"
                  type="text"
                  autoComplete="username"
                  value={form.uniqueId}
                  onChange={handleChange}
                  placeholder="e.g. ECO-WATER-01 or ECO-123456"
                  className="w-full bg-transparent border-none py-3.5 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0 font-mono"
                />
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="login-name" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="focus-glow rounded-xl transition-all duration-300 border border-[#1e293b] bg-[#0f172a]/90 overflow-hidden flex items-center px-3.5">
                <User className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <input
                  id="login-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. D Greeshmanth"
                  className="w-full bg-transparent border-none py-3.5 px-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Password / Security Key
              </label>
              <div className="focus-glow rounded-xl transition-all duration-300 border border-[#1e293b] bg-[#0f172a]/90 overflow-hidden flex items-center px-3.5 relative">
                <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter security key"
                  className="w-full bg-transparent border-none py-3.5 px-3 pr-10 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-500 hover:text-cyan-400 transition-colors focus:outline-none"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-cyan-500/20"
                />
                Remember this workstation
              </label>
              <span className="text-[10px] text-emerald-400 font-mono">TLS 256-bit Encrypted</span>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading || success}
              className={`w-full relative overflow-hidden group py-3.5 px-4 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2
                ${success 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-[0_0_24px_rgba(16,185,129,0.35)]' 
                  : 'bg-gradient-to-r from-cyan-600 to-emerald-600 text-white hover:from-cyan-500 hover:to-emerald-500 shadow-[0_0_20px_rgba(6,182,212,0.25)] hover:shadow-[0_0_30px_rgba(16,185,129,0.45)] border border-cyan-400/30'}
                ${loading ? 'opacity-80 cursor-wait' : 'hover:scale-[1.01] active:scale-[0.99]'}
              `}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  AUTHENTICATING WITH ECOCORE...
                </>
              ) : success ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  CREDENTIALS CONFIRMED
                </>
              ) : (
                <>
                  ENTER COMMAND CENTER
                  <LogIn className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>

            {/* Direct Guest Entry Option */}
            <button
              type="button"
              onClick={handleGuestDemo}
              className="w-full py-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Instant Guest / Sandbox Mode
              <ArrowRight className="w-3 h-3 text-slate-500" />
            </button>

            {/* Hackathon Demo Mode Option */}
            <button
              type="button"
              onClick={handleHackathonDemo}
              className="w-full mt-2 py-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-700/50 hover:border-cyan-500/80 text-cyan-300 flex flex-col items-center justify-center gap-0.5 transition-all shadow-[0_0_15px_rgba(6,182,212,0.15)] group"
            >
              <div className="flex items-center gap-1.5 font-bold text-sm">
                <span className="text-yellow-400">⚡</span>
                HACKATHON DEMO MODE
              </div>
              <span className="text-[10px] text-cyan-400/70 font-medium">Launch complete AI water-leak scenario</span>
            </button>
          </form>

          {/* Registration link */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col items-center gap-2">
            <p className="text-xs text-slate-400">
              Need a new enterprise account?{" "}
              <Link href="/register" className="text-cyan-400 hover:text-cyan-300 font-semibold underline decoration-cyan-500/30 underline-offset-2">
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Small Environmental Live Metrics (Below Card) */}
        <div className="w-full max-w-md mt-5 flex justify-between gap-3">
          <div className="flex-1 border border-slate-800/60 bg-[#0f172a]/50 rounded-xl p-2.5 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
            <div className="text-[9px] text-slate-500 uppercase font-semibold mb-0.5">Water Saved</div>
            <div className="text-base font-mono font-bold text-cyan-400">24.8K L</div>
          </div>
          <div className="flex-1 border border-slate-800/60 bg-[#0f172a]/50 rounded-xl p-2.5 relative overflow-hidden group hover:border-rose-500/30 transition-colors">
            <div className="text-[9px] text-slate-500 uppercase font-semibold mb-0.5">Anomalies</div>
            <div className="text-base font-mono font-bold text-rose-400">03 Resolved</div>
          </div>
          <div className="flex-1 border border-slate-800/60 bg-[#0f172a]/50 rounded-xl p-2.5 relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <div className="text-[9px] text-slate-500 uppercase font-semibold mb-0.5">Opt. Potential</div>
            <div className="text-base font-mono font-bold text-emerald-400">+18.4%</div>
          </div>
        </div>
      </div>

      {/* FORGOT UNIQUE ID MODAL */}
      {showRecoveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0d1427] border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Retrieve Unique ID</h3>
              </div>
              <button 
                onClick={() => setShowRecoveryModal(false)}
                className="text-slate-400 hover:text-white text-sm font-mono"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Enter your registered email address to look up your unique system ID and identity credentials.
            </p>

            {recoveryError && (
              <div className="mb-4 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {recoveryError}
              </div>
            )}

            {recoveryResult && (
              <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                <div className="font-semibold mb-1">Account Located!</div>
                <div className="font-mono text-cyan-300 font-bold">{recoveryResult}</div>
                <div className="mt-2 text-[10px] text-slate-400">Credentials auto-populated into the login form.</div>
              </div>
            )}

            <form onSubmit={handleRecovery} className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                  Email Address
                </label>
                <div className="flex items-center bg-[#111827] border border-slate-800 rounded-xl px-3 focus-within:border-cyan-500">
                  <Search className="w-4 h-4 text-slate-500 mr-2" />
                  <input
                    type="email"
                    value={recoveryEmail}
                    onChange={(e) => setRecoveryEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-transparent border-none py-3 text-xs text-white placeholder-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowRecoveryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs hover:from-cyan-400 hover:to-emerald-400"
                >
                  Lookup ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="absolute bottom-3 left-0 w-full px-8 flex flex-col md:flex-row justify-between items-center text-[10px] text-slate-600 font-mono z-10 pointer-events-none">
        <div>EcoGenius AI Platform &nbsp;|&nbsp; Autonomous Sustainability Intelligence v2.4</div>
        <div className="flex items-center gap-2 mt-1 md:mt-0">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Water • Energy • Waste • Air Quality • Carbon Operations
        </div>
      </div>
    </div>
  );
}
