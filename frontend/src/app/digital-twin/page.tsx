"use client";
import React, { useEffect, useState } from 'react';
import { Box, Building2, Droplets, Zap, Users, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function DigitalTwinPage() {
  const [facilities, setFacilities] = useState<any[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      const data = await api.getFacilities();
      setFacilities(data);
      if (data.length > 0) {
        setSelectedFacility(data[1]); // Select Building B by default to showcase anomaly
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Campus 3D Digital Twin</h1>
          <p className="text-xs text-slate-400">Interactive spatial visualization of 8 facilities with real-time status telemetry</p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1 text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Optimal (78-100)</span>
          <span className="flex items-center gap-1 text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-400" /> Attention (65-77)</span>
          <span className="flex items-center gap-1 text-rose-400"><span className="w-2 h-2 rounded-full bg-rose-400" /> Critical (&lt;65)</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Campus Map 2.5D Visual Grid (8 Cols) */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#090e1d] border border-[#1c2742] min-h-[480px] flex flex-col justify-between relative overflow-hidden">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Interactive Campus Zone Map (Click building to inspect)
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 z-10">
            {facilities.map((bldg) => {
              const isSelected = selectedFacility?.id === bldg.id;
              return (
                <button
                  key={bldg.id}
                  onClick={() => setSelectedFacility(bldg)}
                  className={`p-4 rounded-xl border flex flex-col items-start justify-between min-h-[140px] transition-all duration-200 text-left ${
                    isSelected
                      ? 'bg-[#152445] border-cyan-400 shadow-xl shadow-cyan-500/20 scale-105'
                      : bldg.status_color === 'GREEN'
                      ? 'bg-[#0f1d2e] border-emerald-500/30 hover:border-emerald-400'
                      : bldg.status_color === 'YELLOW'
                      ? 'bg-[#1b1c1e] border-amber-500/30 hover:border-amber-400'
                      : 'bg-[#241117] border-rose-500/40 hover:border-rose-400'
                  }`}
                >
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 font-mono">{bldg.id}</span>
                    <span className={`w-2.5 h-2.5 rounded-full ${
                      bldg.status_color === 'GREEN' ? 'bg-emerald-400' : (bldg.status_color === 'YELLOW' ? 'bg-amber-400' : 'bg-rose-500 animate-ping')
                    }`} />
                  </div>

                  <div className="my-2">
                    <div className="text-xs font-bold text-white">{bldg.name}</div>
                    <div className="text-[10px] text-slate-400">{bldg.type} • {bldg.area?.toLocaleString()} m²</div>
                  </div>

                  <div className="w-full flex items-center justify-between pt-2 border-t border-[#202e52] text-[10px]">
                    <span className="text-slate-400">Score:</span>
                    <span className="font-bold text-white text-xs">{bldg.sustainability_score}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 text-[11px] text-slate-500 z-10 flex items-center justify-between">
            <span>Building telemetry streams update every 30 mins</span>
            <span>Selected: <strong className="text-cyan-300">{selectedFacility?.name}</strong></span>
          </div>
        </div>

        {/* Selected Building 360° Inspector (4 Cols) */}
        <div className="lg:col-span-4 p-5 rounded-2xl bg-[#0d1427] border border-[#1a233a] flex flex-col justify-between">
          {selectedFacility ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1c2949] pb-3">
                <div>
                  <h3 className="text-sm font-bold text-white">{selectedFacility.name}</h3>
                  <span className="text-[11px] text-slate-400">{selectedFacility.type} • Rank #{selectedFacility.rank}</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-cyan-400">{selectedFacility.sustainability_score}</div>
                  <div className="text-[10px] text-slate-400">Score / 100</div>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 rounded-lg bg-[#111a33] flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5"><Droplets className="w-3.5 h-3.5 text-cyan-400" /> Potable Water</span>
                  <span className="font-bold text-white">{selectedFacility.id === 'BUILDING-B' ? '75.2 L/min (LEAK)' : '5.2 L/min (Normal)'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111a33] flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-amber-400" /> Active Load</span>
                  <span className="font-bold text-white">580 kWh (+15%)</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#111a33] flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-purple-400" /> Occupancy Headcount</span>
                  <span className="font-bold text-white">135 / {selectedFacility.capacity} (30%)</span>
                </div>
              </div>

              {selectedFacility.id === 'BUILDING-B' && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-300">
                  <div className="font-bold flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-rose-400" /> Critical Water Anomaly</div>
                  <p className="mt-1 text-[11px] text-slate-300">Continuous 75.2 L/min nocturnal loss detected. 54,600 L/mo avoidable waste.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs text-slate-500 text-center py-8">Select a building on the map.</div>
          )}

          <a
            href={`/agent?query=Investigate%20${encodeURIComponent(selectedFacility?.name || '')}&facility=${selectedFacility?.id || 'BUILDING-B'}`}
            className="w-full py-2.5 text-center rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition mt-4"
          >
            Launch Multi-Agent AI Audit →
          </a>
        </div>
      </div>
    </div>
  );
}
