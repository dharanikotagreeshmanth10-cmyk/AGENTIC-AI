"use client";
import React, { useEffect, useState } from 'react';
import { CheckSquare, Shield, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { api } from '@/lib/api';

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [actionMessage, setActionMessage] = useState<string>('');

  const loadData = async () => {
    const data = await api.getApprovals();
    setApprovals(data);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id: string) => {
    await api.approveRecommendation(id, "Authorized by Facilities Operations Lead");
    setActionMessage(`Approved item ${id}. Transitioned to IMPLEMENTED status.`);
    loadData();
  };

  const handleReject = async (id: string) => {
    await api.rejectRecommendation(id, "Rejected by Reviewer");
    setActionMessage(`Rejected item ${id}.`);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Human-in-the-Loop Governance & Approvals</h1>
          <p className="text-xs text-slate-400">Zero autonomous physical changes without explicit human operator authorization</p>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> {actionMessage}
        </div>
      )}

      <div className="space-y-4">
        {approvals.map((item) => {
          const app = item.approval;
          const rec = item.recommendation || {};
          const isPending = app.status === 'PENDING';

          return (
            <div key={app.id} className="p-5 rounded-2xl bg-[#0d1427] border border-[#1a233a] space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">{app.id}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                      isPending ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-white mt-1">{rec.title}</h3>
                  <p className="text-xs text-slate-300 mt-1">{rec.description}</p>
                </div>

                <div className="text-right">
                  <div className="text-base font-bold text-emerald-400">₹{rec.estimated_cost_saving?.toLocaleString()}/mo</div>
                  <div className="text-[10px] text-slate-400">Payback: {rec.payback_period_months} months</div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 rounded-xl bg-[#111a33] text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Facility</span>
                  <span className="font-bold text-slate-200">{rec.facility_id || 'Building B'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Water Recovery</span>
                  <span className="font-bold text-cyan-400">{rec.estimated_water_saving?.toLocaleString()} L/mo</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Capital Outlay</span>
                  <span className="font-bold text-slate-200">₹{rec.implementation_cost?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block">Safety & Risk</span>
                  <span className="font-bold text-emerald-400">{rec.risk || 'LOW'}</span>
                </div>
              </div>

              {isPending && (
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => handleApprove(app.id)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Approve & Execute Work Order
                  </button>
                  <button
                    onClick={() => handleReject(app.id)}
                    className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-semibold text-xs border border-rose-500/30 flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" /> Reject
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
