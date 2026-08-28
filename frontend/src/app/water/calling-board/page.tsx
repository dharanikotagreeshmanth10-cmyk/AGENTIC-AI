"use client";
import React, { useState, useEffect, useRef } from "react";
import { 
  Phone, PhoneCall, PhoneOff, PhoneForwarded, User, ShieldAlert,
  AlertTriangle, CheckCircle2, Clock, Search, Filter, Plus, Trash2,
  RefreshCw, Radio, Volume2, VolumeX, Mic, MicOff, Sparkles, Building2,
  FileText, Activity, Users, Send, Check, ChevronRight, Zap, Edit2, Settings
} from "lucide-react";
import { api } from "@/lib/api";

interface CallingContact {
  id: string;
  name: string;
  phone: string;
  department: string;
  role?: string;
  priority: "Low" | "Medium" | "High" | "Critical";
  status: "Available" | "Calling" | "Completed" | "Pending";
  reason: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

interface CallLog {
  id: string;
  contact_id?: string;
  contact_name: string;
  phone: string;
  department: string;
  priority: string;
  reason: string;
  duration_seconds: number;
  status: string;
  started_at: string;
  ended_at: string;
  notes?: string;
}

// ─── DEFAULT HACKATHON TEAM ─────────────────────────────────────────────────
const DEFAULT_TEAM_MEMBERS: CallingContact[] = [
  {
    id: "TM-001",
    name: "D Greeshmanth",
    role: "Team Lead",
    department: "AI & Backend",
    phone: "+91 9701990435",
    priority: "Critical",
    reason: "Water intelligence and emergency response",
    status: "Available",
    notes: "Hackathon Team Lead"
  },
  {
    id: "TM-002",
    name: "G Naveen",
    role: "Frontend Developer",
    department: "Frontend & UI",
    phone: "+91 9390302955",
    priority: "High",
    reason: "Dashboard and user interface",
    status: "Available",
    notes: "UI/UX Lead"
  },
  {
    id: "TM-003",
    name: "E Phani",
    role: "Backend Developer",
    department: "FastAPI & Database",
    phone: "+91 6304045258",
    priority: "High",
    reason: "API, database and telemetry",
    status: "Available",
    notes: "Backend & DB Lead"
  },
  {
    id: "TM-004",
    name: "D.Charan",
    role: "AI/ML Engineer",
    department: "AI & Analytics",
    phone: "+91 7702327997",
    priority: "Medium",
    reason: "Anomaly detection and prediction",
    status: "Available",
    notes: "ML & Analytics Lead"
  },
  {
    id: "TM-005",
    name: "Sathya",
    role: "Research / Presentation",
    department: "Research & Demo",
    phone: "+91 6303785775",
    priority: "Medium",
    reason: "Research, documentation and judge presentation",
    status: "Available",
    notes: "Research & Presentation Lead"
  }
];

const LS_TEAM_KEY = "hackathon_team_members";

function getStoredTeam(): CallingContact[] {
  if (typeof window === "undefined") return DEFAULT_TEAM_MEMBERS;
  try {
    const raw = localStorage.getItem(LS_TEAM_KEY);
    if (raw) return JSON.parse(raw) as CallingContact[];
  } catch {}
  return DEFAULT_TEAM_MEMBERS;
}

function saveTeam(members: CallingContact[]) {
  try { localStorage.setItem(LS_TEAM_KEY, JSON.stringify(members)); } catch {}
}

export default function CallingBoardPage() {
  const [contacts, setContacts] = useState<CallingContact[]>([]);
  const [callHistory, setCallHistory] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");

  // Form State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    department: "",
    role: "Operational Lead",
    priority: "Medium" as "Low" | "Medium" | "High" | "Critical",
    reason: "",
    notes: ""
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  // ── Manage Team Modal state ────────────────────────────────────────────────
  const [showManageTeam, setShowManageTeam] = useState(false);
  const [teamMembers, setTeamMembers] = useState<CallingContact[]>([]);
  const [editingMember, setEditingMember] = useState<CallingContact | null>(null);
  const [teamForm, setTeamForm] = useState<{
    name: string; role: string; department: string;
    phone: string; priority: "Low" | "Medium" | "High" | "Critical";
    reason: string; status: "Available" | "Calling" | "Completed" | "Pending";
    notes: string;
  }>({
    name: "", role: "", department: "", phone: "",
    priority: "Medium", reason: "", status: "Available", notes: ""
  });
  const [teamFormErrors, setTeamFormErrors] = useState<Record<string, string>>({});

  // Active Call State
  const [activeCallContact, setActiveCallContact] = useState<CallingContact | null>(null);
  const [callState, setCallState] = useState<"IDLE" | "DIALING" | "CONNECTED" | "ENDED">("IDLE");
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callNotes, setCallNotes] = useState("");
  const [aiTranscript, setAiTranscript] = useState<string[]>([]);

  // Web Audio Context Reference for Dial/Ring Tones
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // ── Initialise teamMembers from localStorage on mount ──────────────────────
  useEffect(() => {
    const stored = getStoredTeam();
    setTeamMembers(stored);
  }, []);

  // Load Contacts & History
  // Team members are the canonical contact list (localStorage-first)
  const loadData = async () => {
    try {
      setLoading(true);

      // Always use team members as the primary contacts source
      const currentTeam = getStoredTeam();
      setTeamMembers(currentTeam);
      setContacts(currentTeam);

      // Load call history from API or localStorage fallback
      try {
        const historyData = await api.getCallHistory();
        if (Array.isArray(historyData)) {
          setCallHistory(historyData);
          localStorage.setItem("eco_call_history", JSON.stringify(historyData));
        }
      } catch {
        const cachedH = localStorage.getItem("eco_call_history");
        if (cachedH) setCallHistory(JSON.parse(cachedH));
      }
    } catch (err) {
      console.error("Error loading calling board:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, priorityFilter]);

  // Handle Web Audio Tones (Dial tone, Ring, End tone)
  const playTone = (type: "DIAL" | "RING" | "CONNECTED" | "END") => {
    if (!isSpeakerOn) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === "DIAL") {
        osc1.frequency.setValueAtTime(350, now);
        osc2.frequency.setValueAtTime(440, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.2);
        osc2.stop(now + 1.2);
      } else if (type === "CONNECTED") {
        osc1.type = "sine";
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.15); // E5
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
        osc1.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.4);
      } else if (type === "END") {
        osc1.frequency.setValueAtTime(480, now);
        osc2.frequency.setValueAtTime(620, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.35);
        osc2.stop(now + 0.35);
      }
    } catch (e) {
      console.log("Web Audio not supported or blocked:", e);
    }
  };

  // Live Call Timer & AI Transcript Simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (callState === "CONNECTED") {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [callState]);

  // Audio Waveform Canvas Animation
  useEffect(() => {
    let animId: number;
    if (callState === "CONNECTED" && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      let phase = 0;

      const render = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const width = canvas.width;
        const height = canvas.height;
        const centerY = height / 2;

        ctx.lineWidth = 2;
        ctx.strokeStyle = isMuted ? "#64748b" : "#06b6d4";
        ctx.beginPath();

        for (let x = 0; x < width; x++) {
          const amp = isMuted ? 2 : 14;
          const y = centerY + Math.sin(x * 0.05 + phase) * Math.cos(x * 0.02 + phase * 0.5) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Second harmonic wave
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = isMuted ? "#334155" : "#10b981";
        ctx.beginPath();
        for (let x = 0; x < width; x++) {
          const amp = isMuted ? 1 : 9;
          const y = centerY + Math.sin(x * 0.08 - phase * 0.8) * amp;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        phase += 0.1;
        animId = requestAnimationFrame(render);
      };
      render();
    }
    return () => cancelAnimationFrame(animId);
  }, [callState, isMuted]);

  // START CALL FLOW
  const handleStartCall = (contact: CallingContact) => {
    setActiveCallContact(contact);
    setCallState("DIALING");
    setCallDuration(0);
    setCallNotes("");
    setAiTranscript([
      `Initiating Water Agent secure VoIP connection to ${contact.name}...`,
      `Routing via EcoCore Emergency Protocol [PRIORITY: ${contact.priority.toUpperCase()}]`
    ]);

    playTone("DIAL");

    // Update status in list to Calling
    updateContactStatus(contact.id, "Calling");

    // Transition from DIALING to CONNECTED after 2.2 seconds
    setTimeout(() => {
      setCallState("CONNECTED");
      playTone("CONNECTED");
      setAiTranscript((prev) => [
        ...prev,
        `Line Connected with ${contact.name} (${contact.role || contact.department}).`,
        `Water Agent Dispatch Reason: "${contact.reason}"`,
        `Telemetry link active: Real-time sensor stream synchronized.`
      ]);
    }, 2200);
  };

  // END CALL FLOW
  const handleEndCall = async () => {
    if (!activeCallContact) return;
    setCallState("ENDED");
    playTone("END");

    const finalDuration = callDuration;
    const endedContact = activeCallContact;

    // Log call into database / backend
    const logPayload = {
      contact_id: endedContact.id,
      contact_name: endedContact.name,
      phone: endedContact.phone,
      department: endedContact.department,
      priority: endedContact.priority,
      reason: endedContact.reason,
      duration_seconds: finalDuration,
      status: "Completed",
      notes: callNotes || "Call completed normally via EcoMind Calling Board."
    };

    try {
      await api.logCall(logPayload);
    } catch {
      // Fallback local append
      const newLog: CallLog = {
        ...logPayload,
        id: `LOG-${Date.now().toString().slice(-6)}`,
        started_at: new Date(Date.now() - finalDuration * 1000).toISOString(),
        ended_at: new Date().toISOString()
      };
      const existingLogs = JSON.parse(localStorage.getItem("eco_call_history") || "[]");
      const updated = [newLog, ...existingLogs];
      setCallHistory(updated);
      localStorage.setItem("eco_call_history", JSON.stringify(updated));
    }

    // Update Contact status to Completed
    await updateContactStatus(endedContact.id, "Completed");
    loadData();
  };

  const closeCallHUD = () => {
    setCallState("IDLE");
    setActiveCallContact(null);
    setCallDuration(0);
  };

  // Update Status helper
  const updateContactStatus = async (contactId: string, status: CallingContact["status"]) => {
    try {
      await api.updateCallingStatus(contactId, status);
    } catch {
      // Local fallback
      const cached = JSON.parse(localStorage.getItem("eco_calling_contacts") || "[]");
      const updated = cached.map((c: CallingContact) => c.id === contactId ? { ...c, status } : c);
      localStorage.setItem("eco_calling_contacts", JSON.stringify(updated));
    }
    setContacts((prev) => prev.map((c) => c.id === contactId ? { ...c, status } : c));
  };

  // Delete Contact
  const handleDeleteContact = async (contactId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try { await api.deleteCallingContact(contactId); } catch {}
    const updated = contacts.filter((c) => c.id !== contactId);
    setContacts(updated);
    saveTeam(updated);
    setTeamMembers(updated);
  };

  // ── Manage Team helpers ────────────────────────────────────────────────────
  const openAddMember = () => {
    setEditingMember(null);
    setTeamForm({ name: "", role: "", department: "", phone: "", priority: "Medium", reason: "", status: "Available", notes: "" });
    setTeamFormErrors({});
  };

  const openEditMember = (m: CallingContact) => {
    setEditingMember(m);
    setTeamForm({
      name: m.name, role: m.role || "", department: m.department,
      phone: m.phone, priority: m.priority, reason: m.reason,
      status: m.status, notes: m.notes || ""
    });
    setTeamFormErrors({});
  };

  const validateTeamForm = () => {
    const errs: Record<string, string> = {};
    if (!teamForm.name.trim()) errs.name = "Name is required.";
    if (!teamForm.phone.trim()) errs.phone = "Phone is required.";
    if (!teamForm.department.trim()) errs.department = "Department is required.";
    if (!teamForm.reason.trim()) errs.reason = "Reason is required.";
    setTeamFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSaveTeamMember = () => {
    if (!validateTeamForm()) return;
    let updated: CallingContact[];
    if (editingMember) {
      updated = teamMembers.map((m) =>
        m.id === editingMember.id
          ? { ...m, ...teamForm }
          : m
      );
    } else {
      const newMember: CallingContact = {
        ...teamForm,
        id: `TM-${String(teamMembers.length + 1).padStart(3, "0")}-${Date.now().toString().slice(-4)}`,
        created_at: new Date().toISOString()
      };
      updated = [...teamMembers, newMember];
    }
    setTeamMembers(updated);
    setContacts(updated);
    saveTeam(updated);
    setEditingMember(null);
    setTeamForm({ name: "", role: "", department: "", phone: "", priority: "Medium", reason: "", status: "Available", notes: "" });
  };

  const handleDeleteTeamMember = (id: string) => {
    const updated = teamMembers.filter((m) => m.id !== id);
    setTeamMembers(updated);
    setContacts(updated);
    saveTeam(updated);
    if (editingMember?.id === id) {
      setEditingMember(null);
      setTeamForm({ name: "", role: "", department: "", phone: "", priority: "Medium", reason: "", status: "Available", notes: "" });
    }
  };

  // Form Validation
  const validateForm = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = "Person / Team name is required.";
    if (!formData.phone.trim() || formData.phone.length < 7) {
      errs.phone = "Valid phone number is required (min 7 digits).";
    }
    if (!formData.department.trim()) errs.department = "Department / Zone is required.";
    if (!formData.reason.trim() || formData.reason.length < 5) {
      errs.reason = "Please enter a specific reason for call (min 5 characters).";
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateContact = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        department: formData.department.trim(),
        role: formData.role.trim() || "Operational Lead",
        priority: formData.priority,
        reason: formData.reason.trim(),
        notes: formData.notes.trim()
      };

      try {
        const created = await api.createCallingContact(payload);
        if (created) {
          setContacts((prev) => [created, ...prev]);
        }
      } catch {
        const newContact: CallingContact = {
          ...payload,
          id: `CALL-${Date.now().toString().slice(-6)}`,
          status: "Available",
          created_at: new Date().toISOString()
        };
        const cached = JSON.parse(localStorage.getItem("eco_calling_contacts") || "[]");
        const updated = [newContact, ...cached];
        setContacts(updated);
        localStorage.setItem("eco_calling_contacts", JSON.stringify(updated));
      }

      setShowAddModal(false);
      setFormData({
        name: "",
        phone: "",
        department: "",
        role: "Operational Lead",
        priority: "Medium",
        reason: "",
        notes: ""
      });
      loadData();
    } finally {
      setSubmitting(false);
    }
  };

  const fillPreset = (preset: CallingContact) => {
    setFormData({
      name: preset.name,
      phone: preset.phone,
      department: preset.department,
      role: preset.role || "",
      priority: preset.priority,
      reason: preset.reason,
      notes: preset.notes || ""
    });
    setFormErrors({});
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "Critical":
        return "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse";
      case "High":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      case "Medium":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/40";
    }
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case "Calling":
        return "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]";
      case "Completed":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "Pending":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      default:
        return "bg-cyan-500/20 text-cyan-300 border-cyan-500/40";
    }
  };

  // Filtered Contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesSearch = 
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.department.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.reason.toLowerCase().includes(search.toLowerCase()) ||
      (c.role && c.role.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === "ALL" || c.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || c.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 px-2 sm:px-4 text-slate-200">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1a233a] pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-500/10">
              <PhoneCall className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                Water Agent Calling Board
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE DISPATCH
                </span>
              </h1>
              <p className="text-xs md:text-sm text-slate-400">
                Autonomous emergency communications, personnel dispatch & real-time telemetry voice links
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="p-2.5 rounded-xl bg-[#0f172a] hover:bg-[#1e293b] border border-slate-800 text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1.5"
            title="Refresh Calling Board Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-cyan-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            id="manage-team-btn"
            onClick={() => { setShowManageTeam(true); setEditingMember(null); setTeamForm({ name: "", role: "", department: "", phone: "", priority: "Medium", reason: "", status: "Available", notes: "" }); }}
            className="px-4 py-2.5 rounded-xl bg-[#0f172a] hover:bg-violet-500/20 border border-violet-500/40 text-violet-300 font-bold text-xs transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Settings className="w-4 h-4" />
            Manage Team
          </button>

          <button
            id="add-contact-modal-btn"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs hover:from-cyan-400 hover:to-emerald-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Queue New Call
          </button>
        </div>
      </div>

      {/* METRIC KPI STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
        <div className="p-4 rounded-2xl bg-[#0d1427]/80 border border-slate-800/80 backdrop-blur-md relative overflow-hidden">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Total Contacts</div>
          <div className="text-2xl font-mono font-black text-cyan-400">{contacts.length}</div>
          <div className="text-[10px] text-slate-500 mt-1">Operational Directory</div>
          <Users className="w-8 h-8 text-cyan-500/10 absolute right-3 bottom-3 pointer-events-none" />
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1427]/80 border border-slate-800/80 backdrop-blur-md relative overflow-hidden">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Active Line Status</div>
          <div className="text-2xl font-mono font-black text-emerald-400">
            {contacts.filter(c => c.status === "Calling").length > 0 ? "1 ACTIVE" : "STANDBY"}
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            VoIP Mesh Ready
          </div>
          <Radio className="w-8 h-8 text-emerald-500/10 absolute right-3 bottom-3 pointer-events-none" />
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1427]/80 border border-slate-800/80 backdrop-blur-md relative overflow-hidden">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Calls Completed</div>
          <div className="text-2xl font-mono font-black text-blue-400">{callHistory.length}</div>
          <div className="text-[10px] text-slate-500 mt-1">Logged Sessions</div>
          <CheckCircle2 className="w-8 h-8 text-blue-500/10 absolute right-3 bottom-3 pointer-events-none" />
        </div>

        <div className="p-4 rounded-2xl bg-[#0d1427]/80 border border-slate-800/80 backdrop-blur-md relative overflow-hidden">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">Critical Priority</div>
          <div className="text-2xl font-mono font-black text-rose-400">
            {contacts.filter(c => c.priority === "Critical").length}
          </div>
          <div className="text-[10px] text-rose-500/80 mt-1">High Risk Leaks/Alarms</div>
          <ShieldAlert className="w-8 h-8 text-rose-500/10 absolute right-3 bottom-3 pointer-events-none" />
        </div>
      </div>

      {/* QUICK DIAL — HACKATHON TEAM */}
      <div className="p-4 rounded-2xl bg-[#090d18]/90 border border-cyan-500/20 backdrop-blur-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-300 font-mono">
              Quick-Dial — Hackathon Team
            </span>
          </div>
          <span className="text-[10px] text-slate-500">1-click direct dispatch</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {teamMembers.map((member, idx) => (
            <div
              key={member.id}
              className="p-3 rounded-xl bg-[#0f172a]/80 hover:bg-[#17223b] border border-slate-800 hover:border-cyan-500/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate max-w-[80px]">
                    {member.name}
                  </span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${getPriorityBadge(member.priority)}`}>
                    {member.priority}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate mb-1">{member.role}</div>
                <div className="text-[10px] text-slate-500 line-clamp-2 italic mb-2">
                  &quot;{member.reason}&quot;
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  const match = contacts.find(c => c.id === member.id);
                  handleStartCall(match || member);
                }}
                className="w-full py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-500 border border-cyan-500/40 text-cyan-300 hover:text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Phone className="w-3 h-3" />
                Direct Call
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3 rounded-2xl bg-[#0d1427]/90 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, department, phone, reason..."
            className="w-full bg-[#111827] border border-slate-700/60 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {/* Status Tabs */}
          <div className="flex items-center bg-[#111827] p-1 rounded-xl border border-slate-800 text-xs">
            {["ALL", "Available", "Calling", "Completed", "Pending"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-lg transition-all text-[11px] font-semibold whitespace-nowrap ${
                  statusFilter === status
                    ? "bg-cyan-500 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Priority Dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#111827] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* CALLING BOARD TABLE / LIST */}
      <div className="rounded-2xl bg-[#0d1427]/80 border border-slate-800 overflow-hidden backdrop-blur-md shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0a0f1e]/80">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" />
            <h2 className="font-bold text-white text-sm">Hackathon Response Team</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Showing {filteredContacts.length} of {contacts.length} entries
          </span>
        </div>

        {filteredContacts.length === 0 ? (
          <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
            <PhoneOff className="w-10 h-10 text-slate-600 mb-1" />
            <p className="text-sm font-semibold text-slate-400">No personnel found matching criteria</p>
            <p className="text-xs text-slate-600">Try adjusting your search or priority filter, or add a new call entry.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090d18] text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Contact & Role</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Department / Zone</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Reason for Call</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredContacts.map((contact) => (
                  <tr 
                    key={contact.id}
                    className="hover:bg-cyan-500/[0.03] transition-colors group"
                  >
                    {/* Contact & Role */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-md">
                          {contact.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {contact.name}
                          </div>
                          <div className="text-[11px] text-slate-400">{contact.role || "Operational Lead"}</div>
                        </div>
                      </div>
                    </td>

                    {/* Phone */}
                    <td className="py-3.5 px-4 font-mono text-cyan-400/90 whitespace-nowrap">
                      {contact.phone}
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 text-slate-300">
                      {contact.department}
                    </td>

                    {/* Priority */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full border font-mono font-semibold ${getPriorityBadge(contact.priority)}`}>
                        {contact.priority}
                      </span>
                    </td>

                    {/* Reason for Call */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="text-slate-200 line-clamp-2" title={contact.reason}>
                        {contact.reason}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 text-[10px] px-2.5 py-0.5 rounded-full border font-mono font-bold ${getStatusBadge(contact.status)}`}>
                          {contact.status === "Calling" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                          {contact.status}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          id={`call-btn-${contact.id}`}
                          onClick={() => handleStartCall(contact)}
                          disabled={callState !== "IDLE" && activeCallContact?.id === contact.id}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 hover:scale-105 active:scale-95 disabled:opacity-50"
                          title={`Start Call to ${contact.name}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Call</span>
                        </button>

                        <button
                          onClick={() => { setShowManageTeam(true); openEditMember(contact); }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                          title="Edit Member"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => handleDeleteContact(contact.id, e)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Remove from Calling Board"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CALL HISTORY AUDIT LOG */}
      <div className="rounded-2xl bg-[#0d1427]/80 border border-slate-800 overflow-hidden backdrop-blur-md shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0a0f1e]/80">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <h2 className="font-bold text-white text-sm">Call History & Dispatch Audit Trail</h2>
          </div>
          <span className="text-xs font-mono text-slate-400">
            {callHistory.length} recorded sessions
          </span>
        </div>

        {callHistory.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs">
            No past calls logged yet. Initiate a call above to populate the audit trail.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#090d18] text-slate-400 uppercase tracking-wider text-[10px] font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-4">Contact Name</th>
                  <th className="py-2.5 px-4">Department</th>
                  <th className="py-2.5 px-4">Reason</th>
                  <th className="py-2.5 px-4">Duration</th>
                  <th className="py-2.5 px-4">Priority</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {callHistory.slice(0, 8).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-bold text-white">{log.contact_name}</td>
                    <td className="py-3 px-4 text-slate-400">{log.department}</td>
                    <td className="py-3 px-4 text-slate-300 max-w-xs truncate">{log.reason}</td>
                    <td className="py-3 px-4 font-mono text-cyan-300">{formatSeconds(log.duration_seconds)}</td>
                    <td className="py-3 px-4">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${getPriorityBadge(log.priority)}`}>
                        {log.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {log.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {new Date(log.ended_at || log.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ACTIVE CALL HUD MODAL (DIALING -> CONNECTED -> ENDED) */}
      {/* ========================================================================= */}
      {callState !== "IDLE" && activeCallContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="bg-[#0b1329] border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-[0_0_50px_rgba(6,182,212,0.25)] relative overflow-hidden">
            
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* CALL STATE 1: DIALING */}
            {callState === "DIALING" && (
              <div className="flex flex-col items-center text-center py-6">
                <div className="relative mb-6">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-cyan-600 to-emerald-500 p-1 animate-pulse shadow-[0_0_30px_rgba(6,182,212,0.4)]">
                    <div className="w-full h-full rounded-full bg-[#0a0f1c] flex items-center justify-center">
                      <PhoneForwarded className="w-10 h-10 text-cyan-400 animate-bounce" />
                    </div>
                  </div>
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-cyan-500"></span>
                  </span>
                </div>

                <div className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-1 animate-pulse">
                  ESTABLISHING SECURE VOICE LINK...
                </div>
                {/* PROMINENT CONTACT NAME DISPLAY */}
                <h2 className="text-3xl font-black text-white tracking-tight mb-1">
                  {activeCallContact.name}
                </h2>
                <p className="text-sm text-slate-400 mb-1">{activeCallContact.role || activeCallContact.department}</p>
                <p className="text-xs font-mono text-cyan-300/80 mb-4">{activeCallContact.phone}</p>

                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 max-w-sm mb-6">
                  <span className="font-semibold text-cyan-400">Reason: </span>
                  {activeCallContact.reason}
                </div>

                <button
                  type="button"
                  onClick={closeCallHUD}
                  className="px-6 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 text-rose-300 hover:text-white font-bold text-xs transition-all flex items-center gap-2"
                >
                  <PhoneOff className="w-4 h-4" />
                  Cancel Dialing
                </button>
              </div>
            )}

            {/* CALL STATE 2: CONNECTED / ACTIVE CALL */}
            {callState === "CONNECTED" && (
              <div className="flex flex-col items-center text-center">
                {/* Call Header Status */}
                <div className="w-full flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    LIVE VOICE SESSION
                  </div>
                  <div className="text-lg font-mono font-black text-white px-3 py-1 rounded-lg bg-slate-900 border border-slate-800">
                    {formatSeconds(callDuration)}
                  </div>
                </div>

                {/* ENTERED PERSON'S NAME PROMINENT DISPLAY */}
                <div className="mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-emerald-400 p-[2px] mx-auto mb-2 shadow-[0_0_20px_rgba(6,182,212,0.3)]">
                    <div className="w-full h-full rounded-full bg-[#0a0f1c] flex items-center justify-center">
                      <User className="w-8 h-8 text-cyan-400" />
                    </div>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    {activeCallContact.name}
                  </h2>
                  <p className="text-xs text-cyan-300 font-medium">
                    {activeCallContact.role} • {activeCallContact.department}
                  </p>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">{activeCallContact.phone}</p>
                </div>

                {/* Real-time Audio Waveform Visualizer */}
                <div className="w-full h-16 bg-[#070b16] rounded-2xl border border-cyan-500/20 p-2 mb-4 relative overflow-hidden flex items-center justify-center">
                  <canvas ref={canvasRef} width={400} height={60} className="w-full h-full" />
                  <div className="absolute top-1 right-2 text-[9px] font-mono text-cyan-500/60 uppercase">
                    {isMuted ? "Mic Muted" : "VoIP Stream 48kHz"}
                  </div>
                </div>

                {/* Live AI Dispatch Stream / Transcript */}
                <div className="w-full text-left bg-slate-900/90 rounded-xl p-3 border border-slate-800 mb-4 max-h-24 overflow-y-auto text-[11px] font-mono space-y-1">
                  {aiTranscript.map((t, idx) => (
                    <div key={idx} className="text-slate-300 flex items-start gap-1.5">
                      <span className="text-cyan-400">▶</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>

                {/* In-Call Operator Notes */}
                <div className="w-full mb-6">
                  <input
                    type="text"
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    placeholder="Enter dispatch notes / action items for audit log..."
                    className="w-full bg-[#0f172a] border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                {/* In-Call Control Actions */}
                <div className="w-full flex items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isMuted
                        ? "bg-amber-500/20 border-amber-500 text-amber-300"
                        : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300"
                    }`}
                    title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                  >
                    {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      isSpeakerOn
                        ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                        : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-400"
                    }`}
                    title={isSpeakerOn ? "Speaker On" : "Speaker Muted"}
                  >
                    {isSpeakerOn ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                  </button>

                  {/* PROMINENT END CALL BUTTON */}
                  <button
                    id="end-call-btn"
                    type="button"
                    onClick={handleEndCall}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-rose-600/30 hover:scale-105 active:scale-95"
                  >
                    <PhoneOff className="w-5 h-5" />
                    <span>End Call</span>
                  </button>
                </div>
              </div>
            )}

            {/* CALL STATE 3: CALL ENDED SUMMARY */}
            {callState === "ENDED" && (
              <div className="flex flex-col items-center text-center py-4">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  <CheckCircle2 className="w-8 h-8" />
                </div>

                <h2 className="text-2xl font-bold text-white mb-1">Call Session Completed</h2>
                <p className="text-xs text-slate-400 mb-5">
                  Call with <strong className="text-white">{activeCallContact.name}</strong> successfully recorded and logged.
                </p>

                <div className="w-full bg-[#080d1a] border border-slate-800 rounded-2xl p-4 mb-6 text-left space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Contact:</span>
                    <span className="text-cyan-300 font-bold">{activeCallContact.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Total Duration:</span>
                    <span className="text-emerald-400 font-bold">{formatSeconds(callDuration)}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">Status Updated:</span>
                    <span className="text-cyan-400 font-bold">COMPLETED</span>
                  </div>
                  {callNotes && (
                    <div className="pt-1">
                      <span className="text-slate-400 block mb-0.5">Operator Notes:</span>
                      <span className="text-slate-200 italic">{callNotes}</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={closeCallHUD}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold text-xs hover:from-cyan-400 hover:to-emerald-400 transition-all shadow-lg shadow-cyan-500/20"
                >
                  Return to Calling Board
                </button>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* QUEUE NEW CONTACT / CALL MODAL */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0b1329] border border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative">
            <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Queue New Personnel Call</h3>
                  <p className="text-xs text-slate-400">Add operational contact to the active dispatch roster</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-sm font-mono p-1"
              >
                ✕
              </button>
            </div>

            {/* Quick Fill — Hackathon Team Presets inside Modal */}
            <div className="mb-5 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider block mb-2 font-mono">
                Auto-Fill from Team:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {teamMembers.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => fillPreset(m)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[#162038] hover:bg-cyan-500/20 hover:text-cyan-300 border border-slate-700 text-slate-300 transition-colors"
                  >
                    {m.name.split(" ")[0]} ({m.priority})
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleCreateContact} className="space-y-4 text-xs">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Person / Team Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Elena Vance or Maintenance Team A"
                  className={`w-full bg-[#111827] border rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none ${
                    formErrors.name ? "border-rose-500" : "border-slate-700 focus:border-cyan-500"
                  }`}
                />
                {formErrors.name && <p className="text-rose-400 text-[10px] mt-1">{formErrors.name}</p>}
              </div>

              {/* Phone & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className={`w-full bg-[#111827] border rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none font-mono ${
                      formErrors.phone ? "border-rose-500" : "border-slate-700 focus:border-cyan-500"
                    }`}
                  />
                  {formErrors.phone && <p className="text-rose-400 text-[10px] mt-1">{formErrors.phone}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Department / Facility *
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Water Treatment Lab"
                    className={`w-full bg-[#111827] border rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none ${
                      formErrors.department ? "border-rose-500" : "border-slate-700 focus:border-cyan-500"
                    }`}
                  />
                  {formErrors.department && <p className="text-rose-400 text-[10px] mt-1">{formErrors.department}</p>}
                </div>
              </div>

              {/* Role & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Role / Position
                  </label>
                  <input
                    type="text"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. Chief Hydrologist"
                    className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Low">Low (Standard Sync)</option>
                    <option value="Medium">Medium (Advisory Check)</option>
                    <option value="High">High (Threshold Warning)</option>
                    <option value="Critical">Critical (Immediate Emergency)</option>
                  </select>
                </div>
              </div>

              {/* Reason for Call */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Reason for Call *
                </label>
                <textarea
                  rows={2}
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Specify anomaly, valve alert, inspection objective or action item..."
                  className={`w-full bg-[#111827] border rounded-xl px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none ${
                    formErrors.reason ? "border-rose-500" : "border-slate-700 focus:border-cyan-500"
                  }`}
                />
                {formErrors.reason && <p className="text-rose-400 text-[10px] mt-1">{formErrors.reason}</p>}
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2.5 justify-end pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold hover:from-cyan-400 hover:to-emerald-400 transition-all flex items-center gap-2 shadow-lg shadow-cyan-500/20"
                >
                  {submitting ? "Adding..." : "Add to Calling Board"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MANAGE TEAM MODAL                                                          */}
      {/* ========================================================================= */}
      {showManageTeam && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-8 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0b1329] border border-violet-500/30 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative mb-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Manage Hackathon Team</h3>
                  <p className="text-xs text-slate-400">Add, edit or delete team members — saved to localStorage</p>
                </div>
              </div>
              <button
                onClick={() => { setShowManageTeam(false); setEditingMember(null); }}
                className="text-slate-400 hover:text-white text-sm font-mono p-1"
              >
                ✕
              </button>
            </div>

            {/* Current Members List */}
            <div className="mb-5">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Current Members ({teamMembers.length})</div>
              <div className="space-y-2">
                {teamMembers.map((m) => (
                  <div key={m.id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    editingMember?.id === m.id
                      ? "bg-violet-500/10 border-violet-500/40"
                      : "bg-[#0f172a] border-slate-800 hover:border-slate-700"
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{m.name}</div>
                        <div className="text-[10px] text-slate-400">{m.role} · {m.department}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${getPriorityBadge(m.priority)}`}>{m.priority}</span>
                      <button
                        onClick={() => openEditMember(m)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-500/10 transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTeamMember(m.id)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Add / Edit Form */}
            <div className="border-t border-slate-800 pt-5">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-3">
                {editingMember ? `Editing: ${editingMember.name}` : "Add New Member"}
              </div>
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Name *</label>
                    <input type="text" value={teamForm.name}
                      onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })}
                      placeholder="e.g. D Greeshmanth"
                      className={`w-full bg-[#111827] border rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none ${
                        teamFormErrors.name ? "border-rose-500" : "border-slate-700 focus:border-violet-500"
                      }`} />
                    {teamFormErrors.name && <p className="text-rose-400 text-[10px] mt-1">{teamFormErrors.name}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Role</label>
                    <input type="text" value={teamForm.role}
                      onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value })}
                      placeholder="e.g. Team Lead"
                      className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-violet-500" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Department *</label>
                    <input type="text" value={teamForm.department}
                      onChange={(e) => setTeamForm({ ...teamForm, department: e.target.value })}
                      placeholder="e.g. AI & Backend"
                      className={`w-full bg-[#111827] border rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none ${
                        teamFormErrors.department ? "border-rose-500" : "border-slate-700 focus:border-violet-500"
                      }`} />
                    {teamFormErrors.department && <p className="text-rose-400 text-[10px] mt-1">{teamFormErrors.department}</p>}
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Phone *</label>
                    <input type="text" value={teamForm.phone}
                      onChange={(e) => setTeamForm({ ...teamForm, phone: e.target.value })}
                      placeholder="+91 XXXXX XXXXX"
                      className={`w-full bg-[#111827] border rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none font-mono ${
                        teamFormErrors.phone ? "border-rose-500" : "border-slate-700 focus:border-violet-500"
                      }`} />
                    {teamFormErrors.phone && <p className="text-rose-400 text-[10px] mt-1">{teamFormErrors.phone}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Priority</label>
                    <select value={teamForm.priority}
                      onChange={(e) => setTeamForm({ ...teamForm, priority: e.target.value as any })}
                      className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Status</label>
                    <select value={teamForm.status}
                      onChange={(e) => setTeamForm({ ...teamForm, status: e.target.value as any })}
                      className="w-full bg-[#111827] border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-violet-500">
                      <option value="Available">Available</option>
                      <option value="Pending">Pending</option>
                      <option value="Calling">Calling</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">Reason for Call *</label>
                  <input type="text" value={teamForm.reason}
                    onChange={(e) => setTeamForm({ ...teamForm, reason: e.target.value })}
                    placeholder="e.g. Water intelligence and emergency response"
                    className={`w-full bg-[#111827] border rounded-xl px-3 py-2 text-white placeholder-slate-500 focus:outline-none ${
                      teamFormErrors.reason ? "border-rose-500" : "border-slate-700 focus:border-violet-500"
                    }`} />
                  {teamFormErrors.reason && <p className="text-rose-400 text-[10px] mt-1">{teamFormErrors.reason}</p>}
                </div>
              </div>

              <div className="flex gap-2.5 justify-end pt-4 mt-2 border-t border-slate-800">
                {editingMember && (
                  <button type="button" onClick={() => { setEditingMember(null); setTeamForm({ name: "", role: "", department: "", phone: "", priority: "Medium", reason: "", status: "Available", notes: "" }); }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs">
                    Clear
                  </button>
                )}
                <button type="button" onClick={handleSaveTeamMember}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-slate-950 font-bold text-xs hover:from-violet-400 hover:to-cyan-400 transition-all shadow-lg shadow-violet-500/20 flex items-center gap-2">
                  <Check className="w-3.5 h-3.5" />
                  {editingMember ? "Save Changes" : "Add Member"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
