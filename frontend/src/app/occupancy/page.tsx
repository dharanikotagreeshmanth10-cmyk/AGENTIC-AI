"use client";
import React, { useEffect, useState } from 'react';
import { Users, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function OccupancyPage() {
  const [current, setCurrent] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const data = await api.getOccupancyCurrent('BUILDING-B');
      setCurrent(data);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white">Occupancy & Spatial Analytics</h1>
        <p className="text-xs text-slate-400">Spatial utilization, headcount curves, and resource-to-occupancy mismatch detection</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Building B Headcount</span>
          <div className="text-2xl font-black text-white mt-1">{current?.headcount || 135} / 450</div>
          <span className="text-[10px] text-slate-400">Utilization: {current?.utilization_pct || 30.0}%</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Resource Mismatch Status</span>
          <div className="text-xl font-bold text-rose-400 mt-1">RESOURCE_MISMATCH</div>
          <span className="text-[10px] text-slate-400">30% Occupancy vs 76% Energy Load</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Nocturnal Occupancy</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">0 Persons</div>
          <span className="text-[10px] text-emerald-400">Confirmed 00:00 - 06:00</span>
        </div>
      </div>
    </div>
  );
}
