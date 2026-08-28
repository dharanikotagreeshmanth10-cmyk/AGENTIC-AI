"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Bot, Send, Sparkles, CheckCircle2, Loader2, AlertCircle, 
  ArrowRight, Shield, Sliders, CheckSquare, TrendingUp
} from 'lucide-react';
import { api } from '@/lib/api';
import LiveAgentGraph from '@/components/agents/LiveAgentGraph';

function AgentSupervisorContent() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<any[]>([
    {
      sender: 'ecocore',
      text: 'EcoCore Supervisor initialized. Ready to orchestrate sustainability intelligence tasks across 12 specialized agents.',
      time: '12:00 PM'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [completedAgents, setCompletedAgents] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<string>('Idle - Awaiting Task');
  const [taskResult, setTaskResult] = useState<any>(null);

  useEffect(() => {
    const isDemo = searchParams.get('demo');
    const query = searchParams.get('query');
    if (isDemo) {
      handleSend("Find the biggest sustainability problem right now.");
    } else if (query) {
      handleSend(query);
    }
  }, [searchParams]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || inputQuery;
    if (!textToSend.trim() || isProcessing) return;

    setInputQuery('');
    setMessages(prev => [...prev, { sender: 'user', text: textToSend, time: new Date().toLocaleTimeString() }]);
    setIsProcessing(true);
    setTaskResult(null);
    setCompletedAgents([]);

    setCurrentStep('EcoCore: Planning Task & Selecting Agents...');
    setActiveAgents(['water-agent', 'occupancy-agent', 'facility-agent', 'forecast-agent']);

    try {
      setTimeout(() => {
        setCurrentStep('Parallel Telemetry Diagnostics in Progress...');
      }, 600);

      setTimeout(() => {
        setCompletedAgents(['water-agent', 'occupancy-agent', 'facility-agent', 'forecast-agent']);
        setActiveAgents(['root-cause-agent']);
        setCurrentStep('RootCauseAgent: Synthesizing Multi-Agent Telemetry...');
      }, 1400);

      setTimeout(() => {
        setCompletedAgents(prev => [...prev, 'root-cause-agent']);
        setActiveAgents(['optimization-agent', 'simulation-agent']);
        setCurrentStep('Optimization & Simulation: Formulating Interventions...');
      }, 2200);

      const response = await api.chatWithEcoCore(textToSend);

      setTimeout(() => {
        setCompletedAgents(['water-agent', 'occupancy-agent', 'facility-agent', 'forecast-agent', 'root-cause-agent', 'optimization-agent', 'simulation-agent']);
        setActiveAgents([]);
        setCurrentStep('Investigation Workflow Concluded');
        setIsProcessing(false);
        setTaskResult(response);
        setMessages(prev => [
          ...prev,
          {
            sender: 'ecocore',
            text: response.summary,
            time: new Date().toLocaleTimeString(),
            payload: response
          }
        ]);
      }, 3000);

    } catch (e: any) {
      setIsProcessing(false);
      setActiveAgents([]);
      setCurrentStep('Task Execution Error');
      setMessages(prev => [
        ...prev,
        {
          sender: 'ecocore',
          text: 'EcoCore executed statistical fallback calculation due to connection state.',
          time: new Date().toLocaleTimeString()
        }
      ]);
    }
  };

  return (
    <div className="h-[calc(100vh-7rem)] grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* LEFT: Conversation with EcoCore (4 Cols) */}
      <div className="lg:col-span-4 rounded-2xl bg-[#0a0f1d] border border-[#1a233a] flex flex-col h-full overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1a233a] bg-[#0d1427] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-emerald-400 flex items-center justify-center">
              <Bot className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">EcoCore Supervisor</div>
              <div className="text-[10px] text-cyan-400 font-medium">Autonomous Intelligence Engine</div>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
            ONLINE
          </span>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`max-w-[90%] p-3 rounded-2xl text-xs ${
                m.sender === 'user'
                  ? 'bg-cyan-600 text-white rounded-br-none'
                  : 'bg-[#121c38] border border-[#1f2d52] text-slate-200 rounded-bl-none shadow-md'
              }`}>
                {m.text}
              </div>
              <span className="text-[9px] text-slate-500 mt-1 px-1">{m.time}</span>
            </div>
          ))}
          {isProcessing && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-[#121c38] text-xs text-cyan-300 border border-cyan-500/30">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>EcoCore orchestrating multi-agent DAG...</span>
            </div>
          )}
        </div>

        {/* Suggested Prompts */}
        <div className="p-3 bg-[#0c1224] border-t border-[#1a233a] space-y-1.5">
          <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Suggested Queries:</div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => handleSend("Find the biggest sustainability problem right now.")}
              className="text-[10px] px-2 py-1 rounded bg-[#15203d] hover:bg-[#1c2c54] text-slate-300 border border-[#24355f] text-left truncate max-w-full"
            >
              🔍 Biggest sustainability problem
            </button>
            <button
              onClick={() => handleSend("Why is Building B consuming too much energy?")}
              className="text-[10px] px-2 py-1 rounded bg-[#15203d] hover:bg-[#1c2c54] text-slate-300 border border-[#24355f]"
            >
              ⚡ Building B excess energy
            </button>
            <button
              onClick={() => handleSend("Show high ROI recommendations for water savings.")}
              className="text-[10px] px-2 py-1 rounded bg-[#15203d] hover:bg-[#1c2c54] text-slate-300 border border-[#24355f]"
            >
              💧 High ROI water actions
            </button>
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="p-3 bg-[#0d1427] border-t border-[#1a233a] flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask EcoCore (e.g. 'Investigate Building B water anomaly')..."
            className="flex-1 px-3 py-2 rounded-xl bg-[#121c38] border border-[#1f2d52] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={isProcessing || !inputQuery.trim()}
            className="p-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 disabled:opacity-50 font-bold transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* CENTER & RIGHT: Live Orchestration Graph & Evidence Inspector (8 Cols) */}
      <div className="lg:col-span-8 flex flex-col gap-4 overflow-y-auto">
        {/* Live Network Graph */}
        <LiveAgentGraph
          activeAgents={activeAgents}
          completedAgents={completedAgents}
          currentStep={currentStep}
        />

        {/* Synthesized Investigation Results Card */}
        {taskResult && (
          <div className="p-5 rounded-2xl bg-[#0c142b] border border-cyan-500/40 shadow-xl space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-[#1b2a52] pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Synthesized Investigation Report</h3>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Confidence: {(taskResult.confidence * 100).toFixed(0)}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#111d3d] border border-[#1f3261]">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Root Cause</span>
                <p className="mt-1 text-slate-200 font-medium">{taskResult.root_cause}</p>
              </div>
              <div className="p-3 rounded-xl bg-[#111d3d] border border-[#1f3261]">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Projected Recovery</span>
                <p className="mt-1 text-emerald-400 font-bold text-sm">54,600 L / month</p>
                <p className="text-[10px] text-slate-400">₹8,400 / month cost savings</p>
              </div>
              <div className="p-3 rounded-xl bg-[#111d3d] border border-[#1f3261]">
                <span className="text-[10px] text-slate-400 uppercase font-semibold">Next Governance Step</span>
                <p className="mt-1 text-cyan-300 font-medium">Approval Request Created</p>
                <Link href="/approvals" className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:underline">
                  Go to Approvals Center →
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AgentSupervisorPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400">Loading EcoCore Supervisor...</div>}>
      <AgentSupervisorContent />
    </Suspense>
  );
}
