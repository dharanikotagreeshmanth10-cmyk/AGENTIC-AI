"use client";
import React, { useEffect, useState } from 'react';
import { Trash2, TrendingUp, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function WastePage() {
  const [analysis, setAnalysis] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const data = await api.getWasteAnalysis();
      setAnalysis(data);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white">Waste & Circularity Analytics</h1>
        <p className="text-xs text-slate-400">Landfill diversion rates, recycling stream contamination, and smart container pickups</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Total Campus Waste</span>
          <div className="text-2xl font-black text-white mt-1">{analysis?.campus_total_waste_kg || 5420} kg/wk</div>
          <span className="text-[10px] text-slate-400">Across 8 facilities</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Diversion Rate</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{analysis?.diversion_rate_pct || 64.9}%</div>
          <span className="text-[10px] text-emerald-400">Target: 75.0%</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Recycling Stream</span>
          <div className="text-2xl font-black text-cyan-400 mt-1">{analysis?.recycling_kg || 2180} kg</div>
          <span className="text-[10px] text-slate-400">Contamination: {analysis?.contamination_rate_pct || 12.4}%</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Compost Organic Capture</span>
          <div className="text-2xl font-black text-purple-400 mt-1">{analysis?.compost_kg || 1340} kg</div>
          <span className="text-[10px] text-purple-300 font-medium">98% purity</span>
        </div>
      </div>
    </div>
  );
}
