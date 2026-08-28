"use client";
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Droplets, Zap, Wind, ArrowRight, RefreshCw, ServerCrash } from 'lucide-react';
import { api } from '@/lib/api';

interface Anomaly {
  id: string;
  facility_id: string;
  resource_type: string;
  title: string;
  description: string;
  severity: string;
  actual_value: number;
  expected_value: number;
  deviation_pct: number;
  confidence: number;
  estimated_monthly_loss: number;
  detected_at: string;
  status: string;
}

const SEVERITY_STYLES: Record<string, string> = {
  CRITICAL: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
  HIGH: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  LOW: 'bg-slate-500/20 text-slate-400 border-slate-500/40',
};

const RESOURCE_ICON: Record<string, React.ReactNode> = {
  WATER: <Droplets className="w-5 h-5" />,
  ENERGY: <Zap className="w-5 h-5" />,
  AIR: <Wind className="w-5 h-5" />,
};

export default function AnomaliesPage() {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getAnomalies();
      setAnomalies(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to load anomalies:", err);
      setError(err?.message || "Failed to connect to the anomalies API.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-white">Anomaly Command Center</h1>
          <p className="text-xs text-slate-400">Real-time detected sensor deviations across campus facilities</p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30 transition disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-sm text-slate-400">Loading anomalies...</p>
        </div>
      )}

      {/* Error State */}
      {!loading && error && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-xl bg-[#0d1427] border border-rose-500/30 p-8">
          <ServerCrash className="w-10 h-10 text-rose-400" />
          <div className="text-center">
            <p className="text-sm font-bold text-rose-300">Failed to load anomalies</p>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">{error}</p>
          </div>
          <button
            onClick={loadData}
            className="px-4 py-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && anomalies.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-3 rounded-xl bg-[#0d1427] border border-[#1a233a]">
          <AlertTriangle className="w-8 h-8 text-slate-500" />
          <p className="text-sm text-slate-400">No anomalies detected. All systems nominal.</p>
        </div>
      )}

      {/* Anomaly List */}
      {!loading && !error && anomalies.length > 0 && (
        <div className="space-y-3">
          {anomalies.map((anom) => {
            const sevStyle = SEVERITY_STYLES[anom.severity] ?? SEVERITY_STYLES.LOW;
            const icon = RESOURCE_ICON[anom.resource_type] ?? <AlertTriangle className="w-5 h-5" />;

            return (
              <div
                key={anom.id}
                className="p-4 rounded-xl bg-[#0d1427] border border-[#1a233a] flex items-center justify-between hover:border-cyan-500/40 transition"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${sevStyle}`}>
                    {icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-white">{anom.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                        {anom.facility_id}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold ${sevStyle}`}>
                        {anom.severity}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400">
                        {anom.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">{anom.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right shrink-0">
                  <div>
                    <div className="text-xs font-bold text-rose-400">+{anom.deviation_pct?.toFixed(1)}%</div>
                    <div className="text-[10px] text-slate-400">
                      Loss: ₹{anom.estimated_monthly_loss?.toLocaleString()}/mo
                    </div>
                  </div>
                  <Link
                    href={`/agent?query=Investigate%20${encodeURIComponent(anom.title)}&facility=${anom.facility_id}`}
                    className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30 flex items-center gap-1 transition"
                  >
                    Investigate with EcoCore <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
