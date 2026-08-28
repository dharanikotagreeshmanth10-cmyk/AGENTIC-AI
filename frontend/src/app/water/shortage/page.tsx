'use client';
import React, { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Building2, Droplets } from 'lucide-react';
import { api } from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, CartesianGrid } from 'recharts';

const FACILITIES = ['BUILDING-A','BUILDING-B','BUILDING-C','BUILDING-D','BUILDING-E'];
const FN: Record<string,string> = {'BUILDING-A':'Admin Block','BUILDING-B':'Science Block','BUILDING-C':'Engineering Lab','BUILDING-D':'Arts & Media','BUILDING-E':'Lecture Hall Complex'};

export default function ShortagePredictionPage() {
  const [fid, setFid] = useState('BUILDING-B');
  const [data, setData] = useState<any>(null);
  const [allData, setAllData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);

  const load = async (f:string) => {
    try {
      setLoading(true); setError(null);
      const [d, all] = await Promise.all([api.getWaterShortagePrediction(f), Promise.all(FACILITIES.map(x=>api.getWaterShortagePrediction(x)))]);
      setData(d); setAllData(all);
    } catch(e:any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(fid); },[fid]);

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="w-10 h-10 text-cyan-400 animate-spin"/></div>;
  if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center"><AlertTriangle className="w-12 h-12 text-rose-400"/><p className="text-slate-400 text-sm">{error}</p><button onClick={()=>load(fid)} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">Retry</button></div>;

  const sc = data?.status==='CRITICAL'?'rose':data?.status==='WARNING'?'amber':'emerald';
  const chartData = [{name:'Predicted Demand',value:data?.predicted_daily_demand_liters||0,fill:'#f43f5e'},{name:'Predicted Supply',value:data?.predicted_daily_supply_liters||0,fill:'#10b981'}];
  const leaderChart = allData.map((d,i)=>({name:FN[FACILITIES[i]].split(' ')[0],level:d?.current_tank_level_pct||0,prob:Math.round((d?.shortage_probability||0)*100)}));

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1a233a] pb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2"><AlertTriangle className="text-amber-400"/>Water Shortage Prediction</h1>
          <p className="text-sm text-slate-400 mt-1">AI-driven shortage forecasting using tank levels, predicted demand, and supply balance</p>
          <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">⚠ Simulated Data</span>
        </div>
        <div className="flex items-center gap-2">
          <Building2 className="text-slate-400 w-4 h-4"/>
          <select value={fid} onChange={e=>setFid(e.target.value)} className="px-3 py-2 rounded-lg bg-[#0d1427] border border-[#1a233a] text-sm text-slate-200 focus:outline-none focus:border-cyan-400">
            {FACILITIES.map(f=><option key={f} value={f}>{FN[f]}</option>)}
          </select>
        </div>
      </div>

      {/* Status Hero */}
      <div className={`p-6 rounded-xl bg-${sc}-500/10 border border-${sc}-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
        <div>
          <div className={`text-xs font-bold text-${sc}-400 uppercase tracking-wider mb-1`}>Shortage Status — {data?.facility_name}</div>
          <div className={`text-4xl font-black text-${sc}-300`}>{data?.status}</div>
          <div className={`text-sm text-${sc}-200 mt-1`}>Probability: {Math.round((data?.shortage_probability||0)*100)}%{data?.expected_shortage_date?` · Expected: ${data.expected_shortage_date}`:''}</div>
        </div>
        <div className={`p-4 rounded-lg bg-${sc}-500/10 border border-${sc}-500/20 max-w-sm text-xs text-${sc}-200`}>
          <div className="font-bold mb-1">Recommended Action</div>
          <p>{data?.recommended_action}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tank Level */}
        <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2"><Droplets className="w-4 h-4 text-blue-400"/>Tank Level</h2>
          <div className="flex items-center gap-6 mb-4">
            <div className="relative w-20 h-32 bg-[#1a233a] rounded-lg border border-[#2a3a5a] overflow-hidden">
              <div className={`absolute bottom-0 left-0 right-0 transition-all bg-${sc}-400 opacity-80`} style={{height:`${data?.current_tank_level_pct}%`}}/>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-black text-lg">{data?.current_tank_level_pct}%</span>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <div><span className="text-slate-400">Current Level: </span><span className="text-white font-semibold">{(data?.current_tank_level_liters/1000||0).toFixed(1)} kL</span></div>
              <div><span className="text-slate-400">Tank Capacity: </span><span className="text-white font-semibold">{(data?.tank_capacity_liters/1000||0).toFixed(0)} kL</span></div>
              <div><span className="text-slate-400">Net Daily: </span><span className={`font-semibold ${(data?.net_daily_liters||0)<0?'text-rose-400':'text-emerald-400'}`}>{(data?.net_daily_liters/1000||0).toFixed(1)} kL/day</span></div>
              {data?.days_to_potential_shortage&&<div><span className="text-slate-400">Days to Shortage: </span><span className="text-rose-400 font-bold">{data.days_to_potential_shortage} days</span></div>}
            </div>
          </div>
        </div>

        {/* Demand vs Supply */}
        <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <h2 className="text-sm font-bold text-white mb-4">Predicted Demand vs Supply</h2>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a233a" vertical={false}/>
                <XAxis dataKey="name" stroke="#64748b" tick={{fill:'#64748b',fontSize:10}}/>
                <YAxis stroke="#64748b" tick={{fill:'#64748b',fontSize:10}}/>
                <Tooltip contentStyle={{backgroundColor:'#111a33',borderColor:'#1a233a',borderRadius:'8px'}} formatter={(v:any)=>[`${(v/1000).toFixed(1)} kL/day`,'']}/>
                <Bar dataKey="value" radius={4}>{chartData.map((e,i)=><Cell key={i} fill={e.fill}/>)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* All Facilities */}
      <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a]">
        <h2 className="text-sm font-bold text-white mb-4">Campus-Wide Tank Levels & Shortage Risk</h2>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={leaderChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a233a" vertical={false}/>
              <XAxis dataKey="name" stroke="#64748b" tick={{fill:'#64748b',fontSize:11}}/>
              <YAxis stroke="#64748b" tick={{fill:'#64748b',fontSize:11}}/>
              <Tooltip contentStyle={{backgroundColor:'#111a33',borderColor:'#1a233a',borderRadius:'8px'}}/>
              <ReferenceLine y={30} stroke="#f59e0b" strokeDasharray="4 4" label={{value:'Min 30%',fill:'#f59e0b',fontSize:10}}/>
              <Bar dataKey="level" name="Tank Level %" fill="#22d3ee" radius={[4,4,0,0]}>
                {leaderChart.map((e,i)=><Cell key={i} fill={e.level<30?'#f43f5e':e.level<60?'#f59e0b':'#22d3ee'}/>)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
