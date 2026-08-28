"use client";
import React from 'react';
import { 
  Bot, Zap, Droplets, Trash2, Wind, Users, Building2, 
  TrendingUp, Search, Sliders, CheckSquare, Sparkles, CheckCircle2, Loader2, AlertCircle
} from 'lucide-react';

interface AgentNodeProps {
  id: string;
  name: string;
  role: string;
  icon: any;
  status: 'idle' | 'active' | 'completed' | 'waiting' | 'error';
  color: string;
}

export default function LiveAgentGraph({ activeAgents = [], completedAgents = [], currentStep = '' }: { 
  activeAgents?: string[], 
  completedAgents?: string[],
  currentStep?: string 
}) {
  const specializedNodes: AgentNodeProps[] = [
    { id: 'water-agent', name: 'Water Agent', role: 'Hydraulic & Leak Detection', icon: Droplets, color: 'from-cyan-500 to-blue-600', status: completedAgents.includes('water-agent') ? 'completed' : (activeAgents.includes('water-agent') ? 'active' : 'idle') },
    { id: 'energy-agent', name: 'Energy Agent', role: 'Thermal & Load Analytics', icon: Zap, color: 'from-amber-400 to-orange-500', status: completedAgents.includes('energy-agent') ? 'completed' : (activeAgents.includes('energy-agent') ? 'active' : 'idle') },
    { id: 'occupancy-agent', name: 'Occupancy Agent', role: 'Spatial Utilization', icon: Users, color: 'from-purple-500 to-indigo-600', status: completedAgents.includes('occupancy-agent') ? 'completed' : (activeAgents.includes('occupancy-agent') ? 'active' : 'idle') },
    { id: 'facility-agent', name: 'Facility Agent', role: 'Campus Benchmarking', icon: Building2, color: 'from-emerald-400 to-teal-600', status: completedAgents.includes('facility-agent') ? 'completed' : (activeAgents.includes('facility-agent') ? 'active' : 'idle') },
    { id: 'forecast-agent', name: 'Forecast Agent', role: 'Regression & Prediction', icon: TrendingUp, color: 'from-blue-400 to-indigo-500', status: completedAgents.includes('forecast-agent') ? 'completed' : (activeAgents.includes('forecast-agent') ? 'active' : 'idle') },
    { id: 'root-cause-agent', name: 'Root Cause Agent', role: 'Multi-Evidence Synthesis', icon: Search, color: 'from-rose-500 to-red-600', status: completedAgents.includes('root-cause-agent') ? 'completed' : (activeAgents.includes('root-cause-agent') ? 'active' : 'idle') },
    { id: 'optimization-agent', name: 'Optimization Agent', role: 'ROI & Action Formulator', icon: Sliders, color: 'from-teal-400 to-emerald-600', status: completedAgents.includes('optimization-agent') ? 'completed' : (activeAgents.includes('optimization-agent') ? 'active' : 'idle') },
    { id: 'simulation-agent', name: 'Simulation Agent', role: 'Physics What-If Engine', icon: Sparkles, color: 'from-indigo-400 to-purple-600', status: completedAgents.includes('simulation-agent') ? 'completed' : (activeAgents.includes('simulation-agent') ? 'active' : 'idle') },
  ];

  return (
    <div className="relative w-full h-[520px] rounded-2xl bg-[#090e1d] border border-[#1c2742] p-6 flex items-center justify-center overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#131d33_1px,transparent_1px),linear-gradient(to_bottom,#131d33_1px,transparent_1px)] bg-[size:28px_28px] opacity-40" />

      {/* Pulse Status Banner */}
      <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
        <div className="px-3 py-1 rounded-full bg-[#121c38] border border-[#22335e] text-[11px] font-medium text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>Real-time Orchestration Network</span>
        </div>
        {currentStep && (
          <div className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-medium text-cyan-300">
            {currentStep}
          </div>
        )}
      </div>

      {/* Central EcoCore Supervisor Node */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative group">
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse" />
          <div className="relative w-28 h-28 rounded-full bg-[#0d152a] border-2 border-cyan-400 flex flex-col items-center justify-center p-3 text-center shadow-2xl">
            <Bot className="w-8 h-8 text-cyan-400 mb-1" />
            <span className="text-xs font-bold text-white tracking-wide">EcoCore</span>
            <span className="text-[9px] text-cyan-300 uppercase font-semibold">Supervisor</span>
          </div>
        </div>
      </div>

      {/* Orbiting Specialized Agents */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {specializedNodes.map((node, index) => {
          const total = specializedNodes.length;
          const angle = (index * (360 / total)) * (Math.PI / 180);
          const radius = 190;
          const x = Math.round(radius * Math.cos(angle));
          const y = Math.round(radius * Math.sin(angle));
          const Icon = node.icon;

          const isCompleted = node.status === 'completed';
          const isActive = node.status === 'active';

          return (
            <div
              key={node.id}
              style={{ transform: `translate(${x}px, ${y}px)` }}
              className="absolute pointer-events-auto transition-all duration-300"
            >
              {/* Connector line effect */}
              <div 
                className={`relative flex items-center gap-3 p-2.5 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? 'bg-[#152345] border-cyan-400 shadow-lg shadow-cyan-500/30 scale-105'
                    : isCompleted
                    ? 'bg-[#0f1d38] border-emerald-500/60 shadow-md shadow-emerald-500/20'
                    : 'bg-[#0e162c] border-[#1f2d4e] opacity-75 hover:opacity-100'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${node.color} flex items-center justify-center text-white shadow`}>
                  {isActive ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <div className="text-left pr-2">
                  <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    {node.name}
                    {isCompleted && <span className="text-[9px] text-emerald-400 font-bold">✓</span>}
                  </div>
                  <div className="text-[10px] text-slate-400">{node.role}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
