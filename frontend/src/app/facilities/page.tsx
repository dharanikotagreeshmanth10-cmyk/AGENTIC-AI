"use client";
import React, { useEffect, useState } from 'react';
import { Building2, TrendingUp, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const data = await api.getFacilities();
      setFacilities(data);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white">Campus Facility Directory & Benchmarks</h1>
        <p className="text-xs text-slate-400">Comparative sustainability scorecards and efficiency indices for all 8 buildings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {facilities.map((bldg) => (
          <div key={bldg.id} className="p-5 rounded-2xl bg-[#0d1427] border border-[#1a233a] flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-cyan-400">{bldg.id}</span>
                <span className="text-xs font-bold text-slate-300">Rank #{bldg.rank}</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-1">{bldg.name}</h3>
              <p className="text-xs text-slate-400">{bldg.type} • {bldg.area?.toLocaleString()} m²</p>
            </div>

            <div className="p-3 rounded-xl bg-[#111a33] flex items-center justify-between">
              <span className="text-xs text-slate-400">Sustainability Score:</span>
              <span className="text-lg font-black text-cyan-400">{bldg.sustainability_score} / 100</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
