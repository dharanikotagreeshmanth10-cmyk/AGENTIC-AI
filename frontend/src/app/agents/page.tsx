"use client";
import React, { useEffect, useState } from 'react';
import { Bot, Cpu, CheckCircle2, AlertCircle, Clock, ShieldCheck, Activity } from 'lucide-react';
import { api } from '@/lib/api';

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [agentsData, timelineData] = await Promise.all([
          api.getAgents(),
          api.getAgentTimeline()
        ]);
        setAgents(agentsData);
        setTimeline(timelineData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Agent Fleet & Autonomous Services</h1>
          <p className="text-xs text-slate-400">12 Specialized domain agents orchestrated by EcoCore Supervisor</p>
        </div>
        <div className="px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          Fleet Status: 100% Operational
        </div>
      </div>

      {/* Grid of Agent Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <div key={agent.id} className="p-4 rounded-xl bg-[#0d1427] border border-[#1a233a] hover:border-cyan-500/40 transition space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">{agent.name}</h3>
                  <span className="text-[10px] text-slate-400">{agent.id}</span>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                agent.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400'
              }`}>
                {agent.status}
              </span>
            </div>

            <p className="text-[11px] text-slate-300 line-clamp-2">{agent.description}</p>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#18233d] text-[11px]">
              <div>
                <span className="text-[10px] text-slate-500 block">Health</span>
                <span className="font-bold text-emerald-400">{agent.health_score}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Confidence</span>
                <span className="font-bold text-cyan-400">{(agent.confidence * 100).toFixed(0)}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Latency</span>
                <span className="font-bold text-slate-300">{agent.execution_duration_ms}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Live Event Timeline */}
      <div className="p-5 rounded-2xl bg-[#0d1427] border border-[#1a233a]">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white">Live Agent Activity Timeline</h2>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {timeline.length === 0 ? (
            <div className="text-xs text-slate-500 py-4 text-center">No recent event bus logs. Launch a demo or ask a query in Supervisor.</div>
          ) : (
            timeline.slice().reverse().map((evt, idx) => (
              <div key={idx} className="p-2.5 rounded-lg bg-[#111a33] border border-[#1d2b4d] flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono font-bold">
                    {evt.event_type}
                  </span>
                  <span className="text-slate-200">{evt.message}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{evt.timestamp?.split('T')[1]?.split('.')[0] || 'Now'}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
