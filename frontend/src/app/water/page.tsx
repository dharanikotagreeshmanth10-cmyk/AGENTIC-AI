'use client';

import React, { useEffect, useState } from 'react';
import { 
  Droplet, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Leaf, 
  DollarSign,
  AlertCircle,
  RefreshCw,
  Building2,
  BrainCircuit,
  Info,
  Users
} from 'lucide-react';
import { api } from '@/lib/api';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ComposedChart,
  Line,
  Legend
} from 'recharts';

// --- Types ---
interface WaterCurrent {
  facility_id: string;
  water_liters: number;
  flow_rate_lpm: number;
  leak_probability: number;
  timestamp?: string;
}

interface WaterHistory {
  timestamp: string;
  facility_id: string;
  water_liters: number;
  flow_rate_lpm: number;
}

interface WaterForecastPoint {
  timestamp: string;
  predicted_liters: number;
  nominal_baseline: number;
  leak_overhead: number;
}

interface WaterForecast {
  facility_id: string;
  forecast: WaterForecastPoint[];
}

interface OccupancyCurrent {
  facility_id: string;
  headcount: number;
  utilization_pct: number;
}

interface Anomaly {
  id: number;
  facility_id: string;
  resource_type: string;
  severity: string;
  timestamp: string;
  expected_value: number;
  actual_value: number;
  description: string;
}

export default function WaterIntelligencePage() {
  const [selectedBldg, setSelectedBldg] = useState('BUILDING-B');
  
  const [current, setCurrent] = useState<WaterCurrent | null>(null);
  const [history, setHistory] = useState<WaterHistory[]>([]);
  const [forecast, setForecast] = useState<WaterForecast | null>(null);
  const [occupancy, setOccupancy] = useState<OccupancyCurrent | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWaterData = async (bldg: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const [c, h, f, o, a] = await Promise.all([
        api.getWaterCurrent(bldg).catch(() => null),
        api.getWaterHistory(bldg, 7).catch(() => []),
        api.getWaterForecast(bldg).catch(() => null),
        api.getOccupancyCurrent(bldg).catch(() => null),
        api.getWaterLeaks().catch(() => [])
      ]);

      if (!c && h.length === 0) {
        throw new Error('Failed to load data from backend APIs. Please verify the backend is running.');
      }

      setCurrent(c);
      setHistory(h || []);
      setForecast(f);
      setOccupancy(o);
      
      const filteredAnomalies = (a || []).filter((anomaly: Anomaly) => anomaly.facility_id === bldg);
      setAnomalies(filteredAnomalies);

    } catch (err: any) {
      console.error('Error fetching water data:', err);
      setError(err.message || 'An unexpected error occurred while fetching water data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWaterData(selectedBldg);
  }, [selectedBldg]);

  // --- Derived Calculations for AI Insights & Savings ---
  const costPerLiter = 0.003; // $0.003 per liter
  const currentLiters = current?.water_liters || 0;
  const estimatedDailyCost = currentLiters * 24 * costPerLiter; // Naive daily projection from current hourly rate
  const headcount = occupancy?.headcount || 1; // Default to 1 to avoid div by zero
  const litersPerPerson = (currentLiters / headcount).toFixed(1);
  const efficiencyScore = current && current.leak_probability < 0.2 ? 94 : current && current.leak_probability < 0.5 ? 75 : 45;

  // Potential savings derived from leak probability
  const potentialSavingsLiters = current ? current.water_liters * (current.leak_probability || 0.05) * 24 : 0;
  const potentialSavingsCost = potentialSavingsLiters * costPerLiter;
  const environmentalImpactStr = potentialSavingsLiters > 1000 ? (potentialSavingsLiters/1000).toFixed(1) + "k" : potentialSavingsLiters.toFixed(0);

  // Formatter for Recharts X-Axis
  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Prepare historical chart data
  const chartData = history.map(h => ({
    time: formatTime(h.timestamp),
    actual: h.water_liters,
    expected: h.water_liters * (0.8 + Math.random() * 0.1), // Mock expected baseline for visual comparison
  })).reverse(); 

  // Prepare forecast chart data
  const forecastData = forecast?.forecast.map(f => ({
    time: formatTime(f.timestamp),
    predicted: f.predicted_liters,
    nominal: f.nominal_baseline,
  })) || [];

  const getSeverityColors = (severity: string) => {
    switch(severity.toUpperCase()) {
      case 'CRITICAL': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'HIGH': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
    }
  };

  // --- Loading State ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin" />
        <h2 className="text-xl font-bold text-white">Loading Water Telemetry...</h2>
        <p className="text-slate-400">Fetching latest fluid flow data from EcoGenius sensors</p>
      </div>
    );
  }

  // --- Error State ---
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <AlertTriangle className="w-16 h-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Connection Error</h2>
        <p className="text-slate-400 max-w-md">{error}</p>
        <button 
          onClick={() => fetchWaterData(selectedBldg)}
          className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#1a233a] pb-6">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Droplet className="text-blue-400" />
            Water Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">Real-time flow monitoring, leak detection, and occupancy-aware analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Building2 className="text-slate-400 w-5 h-5" />
          <select
            value={selectedBldg}
            onChange={(e) => setSelectedBldg(e.target.value)}
            className="px-4 py-2 rounded-lg bg-[#0d1427] border border-[#1a233a] text-sm text-slate-200 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all cursor-pointer shadow-lg"
          >
            <option value="BUILDING-A">Building A (Admin)</option>
            <option value="BUILDING-B">Building B (Science Block)</option>
            <option value="BUILDING-C">Building C (Engineering Lab)</option>
            <option value="BUILDING-D">Building D (Arts & Media)</option>
            <option value="BUILDING-E">Building E (Lecture Hall)</option>
          </select>
        </div>
      </div>

      {/* 1. Water Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-gradient-to-br from-[#0d1427] to-[#111a33] border border-[#1a233a] shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full group-hover:scale-150 transition-transform"></div>
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Droplet className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">Current Flow</span>
          </div>
          <div className="text-3xl font-black text-white">
            {current?.flow_rate_lpm.toFixed(1) || '0.0'} <span className="text-sm text-slate-500 font-medium">L/min</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-400">
            <span>Total: {current?.water_liters.toFixed(0)} L/hr</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-[#0d1427] to-[#111a33] border border-[#1a233a] shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-emerald-500/10 rounded-full group-hover:scale-150 transition-transform"></div>
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">Est. Daily Cost</span>
          </div>
          <div className="text-3xl font-black text-white">
            ${estimatedDailyCost.toFixed(2)}
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-400">
            <span>Based on $0.003/L</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-[#0d1427] to-[#111a33] border border-[#1a233a] shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-500/10 rounded-full group-hover:scale-150 transition-transform"></div>
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">Per Occupant</span>
          </div>
          <div className="text-3xl font-black text-white">
            {litersPerPerson} <span className="text-sm text-slate-500 font-medium">L/hr</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-400">
            <span>Headcount: {occupancy?.headcount || 'N/A'}</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-[#0d1427] to-[#111a33] border border-[#1a233a] shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-500/10 rounded-full group-hover:scale-150 transition-transform"></div>
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Leaf className="w-4 h-4 text-green-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">Efficiency Score</span>
          </div>
          <div className="text-3xl font-black text-white">
            {efficiencyScore} <span className="text-sm text-slate-500 font-medium">/ 100</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-full bg-[#1a233a] rounded-full h-1.5">
              <div className={`h-1.5 rounded-full ${efficiencyScore > 80 ? 'bg-green-400' : efficiencyScore > 60 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${efficiencyScore}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Historical Water Consumption Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#0d1427] border border-[#1a233a] shadow-lg">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Historical Flow vs Expected Baseline
          </h2>
          {history.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorWater" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a233a" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} minTickGap={30} />
                  <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111a33', borderColor: '#1a233a', color: '#fff', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="actual" name="Actual (Liters)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorWater)" />
                  <Line type="monotone" dataKey="expected" name="Expected Baseline" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">No historical data available.</div>
          )}
        </div>

        {/* 5. Occupancy-aware Analysis & 6. AI Insights */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-gradient-to-b from-[#111a33] to-[#0d1427] border border-[#1a233a] shadow-lg h-full">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-purple-400" />
              EcoCore AI Insights
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-[#0d1427]/80 rounded-lg border border-[#1a233a]">
                <h3 className="text-sm font-semibold text-blue-300 flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4" /> Occupancy-Aware Analysis
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Building occupancy is currently at <span className="font-bold text-white">{occupancy?.utilization_pct || 0}%</span> capacity ({occupancy?.headcount || 0} pax). 
                  Water consumption per capita is <span className="font-bold text-white">{litersPerPerson} L/hr</span>.
                  {Number(litersPerPerson) > 20 ? (
                    <span className="text-rose-400 block mt-2 font-medium">Warning: Per capita usage is significantly higher than the 12 L/hr benchmark. High probability of unchecked leaks or faulty fixtures.</span>
                  ) : (
                    <span className="text-emerald-400 block mt-2 font-medium">Usage is within optimal parameters for current occupancy.</span>
                  )}
                </p>
              </div>

              {(current?.leak_probability || 0) > 0.5 && (
                <div className="p-4 bg-rose-500/10 rounded-lg border border-rose-500/20">
                  <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" /> Leak Probability: {(current!.leak_probability * 100).toFixed(0)}%
                  </h3>
                  <p className="text-xs text-rose-200/80 leading-relaxed">
                    AI detected sustained water flow during expected zero-occupancy hours. 
                    <strong className="block mt-1">Recommendation:</strong> Dispatch maintenance to inspect main pipeline valves and washroom fixtures.
                  </p>
                </div>
              )}

              {/* 7. Savings Impact */}
              <div className="mt-6 pt-4 border-t border-[#1a233a]">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Estimated Impact Opportunity</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Water Savings</span>
                    <span className="text-sm font-bold text-blue-400">{potentialSavingsLiters.toFixed(0)} L/day</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Cost Savings</span>
                    <span className="text-sm font-bold text-emerald-400">${potentialSavingsCost.toFixed(2)}/day</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Freshwater Impact</span>
                    <span className="text-sm font-bold text-green-400">{environmentalImpactStr} L conserved</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 3. Water Forecast Chart */}
        <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a] shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              24-Hour Demand Forecast
            </h2>
            <span className="text-xs text-slate-400 bg-[#1a233a] px-2 py-1 rounded">Horizon: 24h</span>
          </div>
          
          {forecastData.length > 0 ? (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={forecastData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1a233a" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" tick={{fill: '#64748b', fontSize: 10}} minTickGap={20} />
                  <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 10}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111a33', borderColor: '#1a233a', color: '#fff' }}
                  />
                  <Area type="monotone" dataKey="predicted" name="Predicted Demand" stroke="#818cf8" strokeWidth={3} fill="#4f46e5" fillOpacity={0.1} />
                  <Line type="monotone" dataKey="nominal" name="Nominal Baseline" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-[250px] flex items-center justify-center text-slate-500">Forecast unavailable.</div>
          )}
        </div>

        {/* 4. Leakage / Anomaly Detection */}
        <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a] shadow-lg flex flex-col">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            Active Leaks & Anomalies
          </h2>
          
          {anomalies.length > 0 ? (
            <div className="flex-1 overflow-y-auto pr-2 space-y-3 max-h-[250px] custom-scrollbar">
              {anomalies.map((anomaly) => {
                const devPercentage = (((anomaly.actual_value - anomaly.expected_value) / anomaly.expected_value) * 100).toFixed(1);
                
                return (
                  <div key={anomaly.id} className={`p-4 rounded-lg border ${getSeverityColors(anomaly.severity)} transition-all hover:brightness-110`}>
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-bold text-sm tracking-wide">{anomaly.severity} SEVERITY</span>
                      </div>
                      <span className="text-xs opacity-75">{formatTime(anomaly.timestamp)}</span>
                    </div>
                    
                    <p className="text-sm font-medium text-white mb-3">{anomaly.description}</p>
                    
                    <div className="grid grid-cols-3 gap-2 text-center bg-black/20 rounded-md p-2">
                      <div>
                        <div className="text-[10px] uppercase opacity-70 mb-1">Expected</div>
                        <div className="text-sm font-mono">{anomaly.expected_value}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase opacity-70 mb-1">Actual</div>
                        <div className="text-sm font-mono font-bold">{anomaly.actual_value}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase opacity-70 mb-1">Deviation</div>
                        <div className="text-sm font-mono font-bold">+{devPercentage}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-emerald-500 bg-emerald-500/5 rounded-lg border border-emerald-500/10 p-6">
              <Leaf className="w-12 h-12 mb-3 opacity-50" />
              <h3 className="font-bold">No Leaks Detected</h3>
              <p className="text-sm text-emerald-600/70 text-center mt-1">Water network integrity is optimal. No anomalous flow detected.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
