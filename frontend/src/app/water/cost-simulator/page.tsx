'use client';
import React, { useState } from 'react';
import { DollarSign, RefreshCw, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';
import { ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

export default function CostSimulatorPage() {
  const [params, setParams] = useState({current_liters_per_day:5000,reduction_pct:15,price_per_liter:0.003,operating_days:26});
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string|null>(null);

  const run = async () => {
    try { setLoading(true); setError(null); const d = await api.runWaterCostSimulator(params); setData(d); }
    catch(e:any) { setError(e.message); } finally { setLoading(false); }
  };

  const update = (k:string, v:number) => setParams(p=>({...p,[k]:v}));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="border-b border-[#1a233a] pb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2"><DollarSign className="text-emerald-400"/>Water Cost & Savings Simulator</h1>
        <p className="text-sm text-slate-400 mt-1">Model current vs optimized water costs and calculate daily, monthly, and annual savings potential</p>
        <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">⚠ Simulated Data</span>
      </div>

      {/* Input Panel */}
      <div className="p-6 rounded-xl bg-[#0d1427] border border-[#1a233a]">
        <h2 className="text-sm font-bold text-white mb-5">Simulation Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {key:'current_liters_per_day',label:'Daily Consumption (L)',min:100,max:50000,step:100,unit:'L/day'},
            {key:'reduction_pct',label:'Reduction Target (%)',min:1,max:50,step:1,unit:'%'},
            {key:'price_per_liter',label:'Water Price (₹/L)',min:0.001,max:0.05,step:0.001,unit:'₹/L'},
            {key:'operating_days',label:'Operating Days/Month',min:1,max:31,step:1,unit:'days'},
          ].map(f=>(
            <div key={f.key}>
              <label className="text-xs text-slate-400 block mb-1">{f.label}: <span className="text-cyan-300 font-bold">{params[f.key as keyof typeof params]} {f.unit}</span></label>
              <input type="range" min={f.min} max={f.max} step={f.step} value={params[f.key as keyof typeof params]} onChange={e=>update(f.key,Number(e.target.value))} className="w-full accent-cyan-400"/>
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5"><span>{f.min}</span><span>{f.max}</span></div>
            </div>
          ))}
        </div>
        <button onClick={run} disabled={loading} className="mt-5 px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-bold rounded-lg text-sm hover:opacity-90 transition disabled:opacity-50 flex items-center gap-2">
          {loading&&<RefreshCw className="w-4 h-4 animate-spin"/>}Run Simulation
        </button>
        {error&&<div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">{error}</div>}
      </div>

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              {label:'Daily Savings (L)',value:`${data.results?.daily_savings_liters?.toFixed(0)} L`,c:'blue'},
              {label:'Daily Current Cost',value:`₹${data.results?.daily_current_cost?.toFixed(2)}`,c:'rose'},
              {label:'Daily Optimized',value:`₹${data.results?.daily_optimized_cost?.toFixed(2)}`,c:'emerald'},
              {label:'Daily Savings',value:`₹${data.results?.daily_savings_cost?.toFixed(2)}`,c:'cyan'},
              {label:'Monthly Savings',value:`₹${data.results?.monthly_savings?.toFixed(0)}`,c:'purple'},
              {label:'Annual Savings',value:`₹${data.results?.annual_savings?.toFixed(0)}`,c:'amber'},
            ].map(c=>(
              <div key={c.label} className="p-4 rounded-xl bg-gradient-to-br from-[#0d1427] to-[#111a33] border border-[#1a233a]">
                <div className={`text-[10px] text-${c.c}-400 uppercase font-semibold mb-1`}>{c.label}</div>
                <div className="text-lg font-black text-white">{c.value}</div>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
            <h2 className="text-sm font-bold text-white mb-4">12-Month Cost Projection</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data.monthly_chart_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a233a" vertical={false}/>
                  <XAxis dataKey="month" stroke="#64748b" tick={{fill:'#64748b',fontSize:11}}/>
                  <YAxis stroke="#64748b" tick={{fill:'#64748b',fontSize:11}}/>
                  <Tooltip contentStyle={{backgroundColor:'#111a33',borderColor:'#1a233a',borderRadius:'8px'}} formatter={(v:any)=>[`₹${v.toFixed(2)}`,'']}/>
                  <Legend wrapperStyle={{fontSize:'12px'}}/>
                  <Bar dataKey="current_cost" name="Current Cost" fill="#f43f5e" opacity={0.7} radius={[4,4,0,0]}/>
                  <Bar dataKey="optimized_cost" name="Optimized Cost" fill="#10b981" opacity={0.7} radius={[4,4,0,0]}/>
                  <Line type="monotone" dataKey="savings" name="Monthly Savings" stroke="#22d3ee" strokeWidth={2} dot={{fill:'#22d3ee'}}/>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200">
            <strong>CO₂ Avoided:</strong> {data.results?.co2_avoided_kg_per_year} kg/year — equivalent to planting ~{Math.round((data.results?.co2_avoided_kg_per_year||0)/21)} trees.
          </div>
        </>
      )}
    </div>
  );
}
