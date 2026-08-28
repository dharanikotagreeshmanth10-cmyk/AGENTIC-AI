"use client";
import React, { useEffect, useState } from 'react';
import { Wind, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function AirQualityPage() {
  const [air, setAir] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const data = await api.getAirCurrent('BUILDING-E');
      setAir(data);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-black text-white">Indoor Air Quality & Ventilation</h1>
        <p className="text-xs text-slate-400">Continuous IEQ telemetry: CO2 ppm, PM2.5, PM10, and demand-controlled air turnover</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Indoor CO2 (Building E)</span>
          <div className="text-2xl font-black text-rose-400 mt-1">{air?.co2 || 1180.0} ppm</div>
          <span className="text-[10px] text-rose-400 font-medium">Threshold: 800 ppm</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Overall Indoor AQI</span>
          <div className="text-2xl font-black text-amber-400 mt-1">{air?.aqi || 68.0}</div>
          <span className="text-[10px] text-amber-400">Moderate IEQ</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">PM2.5 Filtration</span>
          <div className="text-2xl font-black text-emerald-400 mt-1">{air?.pm25 || 18.4} µg/m³</div>
          <span className="text-[10px] text-emerald-400">Optimal HEPA filtration</span>
        </div>
        <div className="p-4 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <span className="text-[10px] text-slate-400 font-semibold uppercase">Ventilation Turnover</span>
          <div className="text-2xl font-black text-amber-400 mt-1">2.1 ACH</div>
          <span className="text-[10px] text-slate-400">Standard: 4.5 ACH</span>
        </div>
      </div>
    </div>
  );
}
