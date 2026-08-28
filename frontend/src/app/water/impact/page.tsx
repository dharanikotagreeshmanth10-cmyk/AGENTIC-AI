'use client';
import React, { useEffect, useState } from 'react';
import { TrendingUp, RefreshCw, AlertTriangle, Building2, CheckCircle2, Leaf, DollarSign } from 'lucide-react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

const FACILITIES = ['BUILDING-A','BUILDING-B','BUILDING-C','BUILDING-D','BUILDING-E'];
const FN: Record<string,string> = {'BUILDING-A':'Admin Block','BUILDING-B':'Science Block','BUILDING-C':'Engineering Lab','BUILDING-D':'Arts & Media','BUILDING-E':'Lecture Hall Complex'};

export default function VerifiedImpactPage() {
  const [fid, setFid] = useState('BUILDING-B');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  const load = async (f:string) => {
    try { setLoading(true); setError(null); const d = await api.getWaterVerifiedImpact(f); setData(d); }
    catch(e:any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(fid); },[fid]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="w-10 h-10 text-cyan-400 animate-spin"/></div>;
  if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center"><AlertTriangle className="w-12 h-12 text-rose-400"/><p className="text-slate-400 text-sm">{error}</p><button onClick={()=>load(fid)} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">Retry</button></div>;

  const ivs: any[] = data?.interventions || [];
  const cum = data?.cumulative || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1a233a] pb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2"><TrendingUp className="text-emerald-400"/>Verified Impact</h1>
          <p className="text-sm text-slate-400 mt-1">Post-implementation tracking: expected vs actual savings, water conserved, cost reduced, and CO₂ avoided</p>
          <div className="flex gap-2 mt-2">
            <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">⚠ Simulated Data</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-500/10 text-slate-400 border border-slate-500/20">{data?.note}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="text-slate-400 w-4 h-4"/>
          <select value={fid} onChange={e=>setFid(e.target.value)} className="px-3 py-2 rounded-lg bg-[#0d1427] border border-[#1a233a] text-sm text-slate-200 focus:outline-none focus:border-cyan-400">
            {FACILITIES.map(f=><option key={f} value={f}>{FN[f]}</option>)}
          </select>
        </div>
      </div>

      {/* Cumulative KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          {label:'Water Saved',value:`${(cum.total_water_saved_liters/1000||0).toFixed(0)} kL`,icon:RefreshCw,c:'blue'},
          {label:'Cost Saved',value:`₹${(cum.total_cost_saved_inr||0).toLocaleString()}`,icon:DollarSign,c:'emerald'},
          {label:'CO₂ Avoided',value:`${(cum.total_co2_avoided_kg||0).toFixed(0)} kg`,icon:Leaf,c:'green'},
          {label:'Trees Equiv.',value:`${cum.trees_equivalent||0}`,icon:Leaf,c:'emerald'},
          {label:'Interventions',value:`${cum.interventions_count||0}`,icon:CheckCircle2,c:'cyan'},
          {label:'Avg Accuracy',value:`${cum.avg_accuracy_pct||0}%`,icon:TrendingUp,c:'purple'},
        ].map(k=>(
          <div key={k.label} className={`p-4 rounded-xl bg-gradient-to-br from-${k.c}-500/10 to-[#0d1427] border border-${k.c}-500/20 text-center`}>
            <div className={`text-xs text-${k.c}-400 uppercase font-semibold mb-1`}>{k.label}</div>
            <div className="text-2xl font-black text-white">{k.value}</div>
          </div>
        ))}
      </div>

      {/* Intervention Cards */}
      <div className="space-y-4">
        {ivs.map((iv:any)=>{
          const acc = iv.accuracy_pct;
          const c = acc>=90?'emerald':acc>=70?'amber':'rose';
          const stc = iv.status==='VERIFIED'?'emerald':iv.status==='MONITORING'?'blue':'amber';
          const chartData = [
            {name:'Water Saved (L)',expected:iv.expected?.water_liters_per_month,actual:iv.actual?.water_liters_per_month},
            {name:'Cost Saved (₹)',expected:iv.expected?.cost_inr_per_month,actual:iv.actual?.cost_inr_per_month},
          ];
          return (
            <div key={iv.id} className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded bg-${stc}-500/20 text-${stc}-400 font-bold`}>{iv.status}</span>
                    <span className="text-[10px] text-slate-500">{iv.implemented_date}</span>
                  </div>
                  <div className="text-sm font-bold text-white">{iv.title}</div>
                  <div className="text-xs text-slate-400">{iv.facility}</div>
                </div>
                <div className="text-center flex-shrink-0">
                  <div className={`text-2xl font-black text-${c}-300`}>{acc}%</div>
                  <div className="text-[10px] text-slate-400">Accuracy</div>
                  <div className="text-[10px] text-slate-400">Conf: {Math.round(iv.confidence*100)}%</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-[150px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a233a" vertical={false}/>
                      <XAxis dataKey="name" stroke="#64748b" tick={{fill:'#64748b',fontSize:9}}/>
                      <YAxis stroke="#64748b" tick={{fill:'#64748b',fontSize:9}}/>
                      <Tooltip contentStyle={{backgroundColor:'#111a33',borderColor:'#1a233a',borderRadius:'8px'}}/>
                      <Legend wrapperStyle={{fontSize:'10px'}}/>
                      <Bar dataKey="expected" name="Expected" fill="#64748b" radius={[4,4,0,0]}/>
                      <Bar dataKey="actual" name="Actual" fill="#10b981" radius={[4,4,0,0]}/>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 text-xs">
                  {[
                    {label:'Water Saved',exp:`${iv.expected?.water_liters_per_month?.toLocaleString()} L`,act:`${iv.actual?.water_liters_per_month?.toLocaleString()} L`},
                    {label:'Cost Saved',exp:`₹${iv.expected?.cost_inr_per_month?.toLocaleString()}`,act:`₹${iv.actual?.cost_inr_per_month?.toLocaleString()}`},
                    {label:'CO₂ Avoided',exp:`${iv.expected?.co2_kg} kg`,act:`${iv.actual?.co2_kg} kg`},
                  ].map(r=>(
                    <div key={r.label} className="grid grid-cols-3 gap-1 p-2 rounded bg-[#111a33]">
                      <span className="text-slate-400">{r.label}</span>
                      <span className="text-slate-400 text-center">{r.exp}</span>
                      <span className="text-emerald-300 font-semibold text-right">{r.act}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
