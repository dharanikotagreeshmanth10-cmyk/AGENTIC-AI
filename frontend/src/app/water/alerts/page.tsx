'use client';
import React, { useEffect, useState } from 'react';
import { ShieldAlert, RefreshCw, AlertTriangle, CheckCircle2, Bell, Eye } from 'lucide-react';
import { api } from '@/lib/api';

const ALERT_TYPES = ['all','leak','high_consumption','low_tank_level','water_quality','sensor_failure','predicted_shortage','unusual_occupancy','infrastructure'];
const STATUS_OPTS = ['all','OPEN','ACKNOWLEDGED','RESOLVED'];

export default function AlertsPage() {
  const [data, setData] = useState<any>(null);
  const [statusF, setStatusF] = useState('all');
  const [typeF, setTypeF] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string|null>(null);
  const [acting, setActing] = useState<string|null>(null);

  const load = async () => {
    try { setLoading(true); setError(null); const d = await api.getWaterAlerts(statusF, typeF); setData(d); }
    catch(e:any) { setError(e.message); } finally { setLoading(false); }
  };
  useEffect(()=>{ load(); },[statusF, typeF]);

  const ack = async (id:string) => { setActing(id); await api.acknowledgeAlert(id).catch(()=>{}); await load(); setActing(null); };
  const res = async (id:string) => { setActing(id); await api.resolveAlert(id).catch(()=>{}); await load(); setActing(null); };

  const sevColor = (s:string) => s==='CRITICAL'?'rose':s==='HIGH'?'orange':s==='WARNING'?'amber':s==='MEDIUM'?'blue':'slate';
  const staColor = (s:string) => s==='OPEN'?'rose':s==='ACKNOWLEDGED'?'amber':'emerald';

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><RefreshCw className="w-10 h-10 text-cyan-400 animate-spin"/></div>;
  if (error) return <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center"><AlertTriangle className="w-12 h-12 text-rose-400"/><p className="text-slate-400 text-sm">{error}</p><button onClick={load} className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm">Retry</button></div>;

  const alerts: any[] = data?.alerts || [];
  const open = alerts.filter(a=>a.status==='OPEN').length;
  const acked = alerts.filter(a=>a.status==='ACKNOWLEDGED').length;
  const resolved = alerts.filter(a=>a.status==='RESOLVED').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="border-b border-[#1a233a] pb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-2"><ShieldAlert className="text-rose-400"/>Smart Alert Center</h1>
        <p className="text-sm text-slate-400 mt-1">Centralized alerts for leaks, consumption anomalies, water quality, sensor failures, predicted shortages, and more</p>
        <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">⚠ Simulated Data</span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-3 gap-4">
        {[{label:'Open',value:open,c:'rose'},{label:'Acknowledged',value:acked,c:'amber'},{label:'Resolved',value:resolved,c:'emerald'}].map(k=>(
          <div key={k.label} className={`p-4 rounded-xl bg-${k.c}-500/10 border border-${k.c}-500/20 text-center`}>
            <div className={`text-3xl font-black text-${k.c}-300`}>{k.value}</div>
            <div className={`text-xs text-${k.c}-400 mt-1`}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <select value={statusF} onChange={e=>setStatusF(e.target.value)} className="px-3 py-1.5 rounded-lg bg-[#0d1427] border border-[#1a233a] text-xs text-slate-200 focus:outline-none">
          {STATUS_OPTS.map(s=><option key={s} value={s}>{s==='all'?'All Statuses':s}</option>)}
        </select>
        <select value={typeF} onChange={e=>setTypeF(e.target.value)} className="px-3 py-1.5 rounded-lg bg-[#0d1427] border border-[#1a233a] text-xs text-slate-200 focus:outline-none">
          {ALERT_TYPES.map(t=><option key={t} value={t}>{t==='all'?'All Types':t.replace(/_/g,' ')}</option>)}
        </select>
        <span className="text-xs text-slate-400 ml-auto">{alerts.length} alert{alerts.length!==1?'s':''}</span>
        <button onClick={load} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-slate-300 border border-[#1a233a] hover:border-cyan-500/30"><RefreshCw className="w-3 h-3"/>Refresh</button>
      </div>

      {/* Alert Cards */}
      {alerts.length===0?(
        <div className="flex flex-col items-center justify-center py-20 text-emerald-400 gap-3">
          <CheckCircle2 className="w-12 h-12 opacity-50"/>
          <p className="text-sm">No alerts match the current filters</p>
        </div>
      ):(
        <div className="space-y-3">
          {alerts.map((a:any)=>(
            <div key={a.id} className={`p-4 rounded-xl border bg-[#0d1427] border-[#1a233a] hover:border-cyan-500/20 transition-all`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold bg-${sevColor(a.severity)}-500/20 text-${sevColor(a.severity)}-400`}>{a.severity}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded border bg-${staColor(a.status)}-500/10 text-${staColor(a.status)}-400 border-${staColor(a.status)}-500/20`}>{a.status}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-500/10 text-slate-400">{a.type.replace(/_/g,' ')}</span>
                    <span className="text-[10px] text-slate-500">{a.facility_id}</span>
                    <span className="text-[10px] text-slate-500 ml-auto">{new Date(a.created_at).toLocaleString()}</span>
                  </div>
                  <div className="text-sm font-bold text-white">{a.title}</div>
                  <div className="text-xs text-slate-400 mt-1">{a.description}</div>
                  {a.acknowledged_by&&<div className="text-[10px] text-amber-400 mt-1">Ack by: {a.acknowledged_by}</div>}
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  {a.status==='OPEN'&&(
                    <button onClick={()=>ack(a.id)} disabled={acting===a.id} className="px-2 py-1 text-[10px] rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30 transition disabled:opacity-50">
                      {acting===a.id?<RefreshCw className="w-3 h-3 animate-spin"/>:'Ack'}
                    </button>
                  )}
                  {a.status!=='RESOLVED'&&(
                    <button onClick={()=>res(a.id)} disabled={acting===a.id} className="px-2 py-1 text-[10px] rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 transition disabled:opacity-50">
                      {acting===a.id?<RefreshCw className="w-3 h-3 animate-spin"/>:'Resolve'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
