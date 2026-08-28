"use client";
import React, { useState, useEffect } from 'react';
import { Sliders, Zap, Droplets, TrendingUp, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';

export default function SimulationPage() {
  const [params, setParams] = useState({
    hvac_temperature_change: 1.5,
    lighting_reduction_pct: 25,
    operating_hours_reduction: 2,
    water_leak_fixed: true,
    irrigation_optimization: true,
    occupancy_change_pct: 0
  });

  const [simResult, setSimResult] = useState<any>(null);

  const calculate = async () => {
    try {
      const res = await api.runSimulation(params);
      setSimResult(res);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    calculate();
  }, [params]);

  const current = simResult?.current_metrics || {};
  const projected = simResult?.projected_metrics || {};
  const savings = simResult?.savings || {};
  const fin = simResult?.financial_metrics || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">What-If Sustainability Simulation Lab</h1>
          <p className="text-xs text-slate-400">Real-time physics calculation of energy, water, financial ROI, and avoided carbon</p>
        </div>
        <button
          onClick={() => setParams({
            hvac_temperature_change: 2.0,
            lighting_reduction_pct: 35,
            operating_hours_reduction: 3,
            water_leak_fixed: true,
            irrigation_optimization: true,
            occupancy_change_pct: 10
          })}
          className="px-3 py-1.5 rounded-lg bg-[#141d36] hover:bg-[#1c2747] border border-[#233157] text-xs font-semibold text-cyan-300 flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" /> Max Savings Preset
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sliders Control Panel (5 Cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0d1427] border border-[#1a233a] space-y-5">
          <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
            Operational Parameter Levers
          </div>

          {/* HVAC Temp */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">HVAC Temperature Setpoint Offset</span>
              <span className="font-bold text-cyan-400">+{params.hvac_temperature_change}°C</span>
            </div>
            <input
              type="range"
              min="0"
              max="4"
              step="0.5"
              value={params.hvac_temperature_change}
              onChange={(e) => setParams({ ...params, hvac_temperature_change: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500">
              <span>0°C (Default)</span>
              <span>+4°C (Max Economy)</span>
            </div>
          </div>

          {/* Lighting Dimming */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Lighting Dimming / Daylight Harvesting</span>
              <span className="font-bold text-amber-400">{params.lighting_reduction_pct}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={params.lighting_reduction_pct}
              onChange={(e) => setParams({ ...params, lighting_reduction_pct: parseInt(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer"
            />
          </div>

          {/* Operating Hours */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-300 font-medium">Operating Hours Reduction</span>
              <span className="font-bold text-purple-400">-{params.operating_hours_reduction} hrs/day</span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              step="1"
              value={params.operating_hours_reduction}
              onChange={(e) => setParams({ ...params, operating_hours_reduction: parseInt(e.target.value) })}
              className="w-full accent-purple-400 cursor-pointer"
            />
          </div>

          {/* Leak Fix Toggle */}
          <div className="pt-3 border-t border-[#18233d] flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-200">Building B Water Leak Repair</div>
              <div className="text-[10px] text-slate-400">Eliminates 54,600 L/mo nocturnal loss</div>
            </div>
            <input
              type="checkbox"
              checked={params.water_leak_fixed}
              onChange={(e) => setParams({ ...params, water_leak_fixed: e.target.checked })}
              className="w-4 h-4 accent-cyan-400 cursor-pointer"
            />
          </div>

          {/* Irrigation Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-200">Smart Weather Irrigation Control</div>
              <div className="text-[10px] text-slate-400">Optimizes landscape watering schedules</div>
            </div>
            <input
              type="checkbox"
              checked={params.irrigation_optimization}
              onChange={(e) => setParams({ ...params, irrigation_optimization: e.target.checked })}
              className="w-4 h-4 accent-emerald-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Live Simulation Projection Dashboard (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#101c3b] to-[#0a1021] border border-cyan-500/40 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f2d52] pb-3">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Projected Outcomes</span>
              <span className="text-xs px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                Payback: {fin.payback_months} Months
              </span>
            </div>

            {/* Big Stat Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-xl bg-[#131e3d]">
                <span className="text-[10px] text-slate-400 uppercase">Monthly Savings</span>
                <div className="text-xl font-black text-emerald-400 mt-1">₹{savings.cost_inr?.toLocaleString()}</div>
                <span className="text-[10px] text-slate-400">₹{savings.annual_cost_inr?.toLocaleString()}/yr</span>
              </div>
              <div className="p-3 rounded-xl bg-[#131e3d]">
                <span className="text-[10px] text-slate-400 uppercase">Water Recovered</span>
                <div className="text-xl font-black text-cyan-400 mt-1">{savings.water_liters?.toLocaleString()} L</div>
                <span className="text-[10px] text-cyan-300 font-medium">-{savings.water_pct}% cut</span>
              </div>
              <div className="p-3 rounded-xl bg-[#131e3d]">
                <span className="text-[10px] text-slate-400 uppercase">Energy Saved</span>
                <div className="text-xl font-black text-amber-400 mt-1">{savings.energy_kwh?.toLocaleString()} kWh</div>
                <span className="text-[10px] text-amber-300 font-medium">-{savings.energy_pct}% load</span>
              </div>
              <div className="p-3 rounded-xl bg-[#131e3d]">
                <span className="text-[10px] text-slate-400 uppercase">Avoided Carbon</span>
                <div className="text-xl font-black text-purple-400 mt-1">{savings.co2_tonnes} t</div>
                <span className="text-[10px] text-slate-400">CO2e / month</span>
              </div>
            </div>

            {/* Before vs After Comparison Table */}
            <div className="p-3.5 rounded-xl bg-[#0c142b] border border-[#1b2b52] text-xs space-y-2">
              <div className="font-bold text-slate-200">Before vs. Projected Simulation Comparison</div>
              <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 text-slate-400">
                <div>Energy Consumption:</div>
                <div className="line-through text-slate-500">{current.energy_kwh?.toLocaleString()} kWh</div>
                <div className="font-bold text-amber-400">{projected.energy_kwh?.toLocaleString()} kWh</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <div>Water Consumption:</div>
                <div className="line-through text-slate-500">{current.water_liters?.toLocaleString()} L</div>
                <div className="font-bold text-cyan-400">{projected.water_liters?.toLocaleString()} L</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                <div>Monthly Utility Bill:</div>
                <div className="line-through text-slate-500">₹{current.cost_inr?.toLocaleString()}</div>
                <div className="font-bold text-emerald-400">₹{projected.cost_inr?.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
