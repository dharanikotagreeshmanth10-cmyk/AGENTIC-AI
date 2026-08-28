"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Lightbulb, ShieldCheck, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';

export default function RecommendationsPage() {
  const [recs, setRecs] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const data = await api.getRecommendations();
      setRecs(data);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white">Autonomous Action Recommendations</h1>
        <p className="text-xs text-slate-400">Multi-agent formulated sustainability interventions with quantified ROI</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recs.map((rec) => (
          <div key={rec.id} className="p-5 rounded-2xl bg-[#0d1427] border border-[#1a233a] space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">{rec.category}</span>
                <h3 className="text-sm font-bold text-white mt-1.5">{rec.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{rec.description}</p>
              </div>
              <div className="text-right">
                <span className="text-base font-black text-emerald-400">₹{rec.estimated_cost_saving?.toLocaleString()}/mo</span>
                <span className="text-[10px] text-slate-500 block">Est. Monthly Saving</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-[#111a33] text-xs">
              <div>
                <span className="text-[10px] text-slate-500 block">Payback</span>
                <span className="font-bold text-white">{rec.payback_period_months} mo</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Annual ROI</span>
                <span className="font-bold text-cyan-400">{rec.roi}x</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Confidence</span>
                <span className="font-bold text-emerald-400">{(rec.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>

            <Link
              href="/approvals"
              className="w-full py-2 text-center rounded-xl bg-[#141e38] hover:bg-[#1b2a4f] text-cyan-300 border border-[#233561] text-xs font-semibold block transition"
            >
              Request Governance Review & Approval →
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
