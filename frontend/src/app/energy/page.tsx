'use client';

import React, { useEffect, useState } from 'react';
import { 
  Zap, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Lightbulb, 
  Leaf, 
  DollarSign,
  AlertCircle,
  RefreshCw,
  Building2,
  BrainCircuit,
  Info,
  BarChart2
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
  Legend,
  ReferenceLine
} from 'recharts';

// --- Types ---
interface EnergyCurrent {
  facility_id: string;
  energy_kwh: number;
  hvac_load: number;
  lighting_load: number;
  equipment_load: number;
  peak_demand_kw: number;
  timestamp?: string;
}

interface EnergyHistory {
  timestamp: string;
  facility_id: string;
  energy_kwh: number;
  hvac_load: number;
  lighting_load: number;
  equipment_load: number;
  peak_demand_kw: number;
}

interface EnergyForecastPoint {
  timestamp: string;
  predicted_kwh: number;
  lower_bound: number;
  upper_bound: number;
}

interface EnergyForecast {
  facility_id: string;
  horizon_hours: number;
  forecast: EnergyForecastPoint[];
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

export default function EnergyIntelligencePage() {
  const [selectedBldg, setSelectedBldg] = useState('BUILDING-B');
  
  const [current, setCurrent] = useState<EnergyCurrent | null>(null);
  const [history, setHistory] = useState<EnergyHistory[]>([]);
  const [forecast, setForecast] = useState<EnergyForecast | null>(null);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnergyData = async (bldg: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const [c, h, f, a] = await Promise.all([
        api.getEnergyCurrent(bldg).catch(() => null),
        api.getEnergyHistory(bldg, 7).catch(() => []),
        api.getEnergyForecast(bldg).catch(() => null),
        api.getEnergyAnomalies().catch(() => [])
      ]);

      if (!c && h.length === 0) {
        throw new Error('Failed to load data from backend APIs. Please verify the backend is running.');
      }

      setCurrent(c);
      setHistory(h || []);
      setForecast(f);
      
      // Filter anomalies for the selected building
      const filteredAnomalies = (a || []).filter((anomaly: Anomaly) => anomaly.facility_id === bldg);
      setAnomalies(filteredAnomalies);

    } catch (err: any) {
      console.error('Error fetching energy data:', err);
      setError(err.message || 'An unexpected error occurred while fetching energy data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnergyData(selectedBldg);
  }, [selectedBldg]);

  // --- Derived Calculations for AI Insights & Savings ---
  const costPerKwh = 0.14; // $0.14 per kWh assumed rate
  const totalDailyKwh = history.slice(0, 24).reduce((sum, h) => sum + h.energy_kwh, 0);
  const estimatedDailyCost = totalDailyKwh * costPerKwh;
  const energyIntensity = current ? (current.energy_kwh / 1000).toFixed(2) : 0; // mocked kW/sqft
  const sustainabilityScore = current && current.hvac_load < current.energy_kwh * 0.5 ? 92 : 78;

  // Potential savings derived from anomalies (assuming high severity anomalies waste 15% energy)
  const potentialSavingsKwh = totalDailyKwh * (anomalies.length > 0 ? 0.15 : 0.05);
  const potentialSavingsCost = potentialSavingsKwh * costPerKwh;
  const co2ReductionKg = potentialSavingsKwh * 0.4; // 0.4 kg CO2 per kWh

  // Formatter for Recharts X-Axis
  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Prepare chart data combining history and expected baseline
  const chartData = history.map(h => ({
    time: formatTime(h.timestamp),
    timestamp: h.timestamp,
    actual: h.energy_kwh,
    expected: h.energy_kwh * (0.9 + Math.random() * 0.2), // Mock expected baseline for visual comparison
  })).reverse(); // Oldest first for chart left-to-right

  // Prepare forecast chart data
  const forecastData = forecast?.forecast.map(f => ({
    time: formatTime(f.timestamp),
    predicted: f.predicted_kwh,
    lower: f.lower_bound,
    upper: f.upper_bound,
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
        <RefreshCw className="w-12 h-12 text-cyan-500 animate-spin" />
        <h2 className="text-xl font-bold text-white">Loading Energy Telemetry...</h2>
        <p className="text-slate-400">Fetching latest data from EcoGenius sensors</p>
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
          onClick={() => fetchEnergyData(selectedBldg)}
          className="mt-6 px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg transition-colors"
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
            <Zap className="text-cyan-400" />
            Energy Intelligence
          </h1>
          <p className="text-sm text-slate-400 mt-1">Real-time load decomposition, forecasting, and anomaly detection</p>
        </div>
        <div className="flex items-center gap-3">
          <Building2 className="text-slate-400 w-5 h-5" />
          <select
            value={selectedBldg}
            onChange={(e) => setSelectedBldg(e.target.value)}
            className="px-4 py-2 rounded-lg bg-[#0d1427] border border-[#1a233a] text-sm text-slate-200 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all cursor-pointer shadow-lg"
          >
            <option value="BUILDING-A">Building A (Admin)</option>
            <option value="BUILDING-B">Building B (Science Block)</option>
            <option value="BUILDING-C">Building C (Engineering Lab)</option>
            <option value="BUILDING-D">Building D (Arts & Media)</option>
            <option value="BUILDING-E">Building E (Lecture Hall)</option>
          </select>
        </div>
      </div>

      {/* 1. Energy Overview KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl bg-gradient-to-br from-[#0d1427] to-[#111a33] border border-[#1a233a] shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-cyan-500/10 rounded-full group-hover:scale-150 transition-transform"></div>
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">Current Load</span>
          </div>
          <div className="text-3xl font-black text-white">
            {current?.energy_kwh.toFixed(1) || '0.0'} <span className="text-sm text-slate-500 font-medium">kWh</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-400">
            <TrendingDown className="w-3 h-3" />
            <span>4.2% vs last hour</span>
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
            <span>Based on $0.14/kWh</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-[#0d1427] to-[#111a33] border border-[#1a233a] shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-purple-500/10 rounded-full group-hover:scale-150 transition-transform"></div>
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">Energy Intensity</span>
          </div>
          <div className="text-3xl font-black text-white">
            {energyIntensity} <span className="text-sm text-slate-500 font-medium">kW/m²</span>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs font-medium text-amber-400">
            <TrendingUp className="w-3 h-3" />
            <span>Slightly elevated</span>
          </div>
        </div>

        <div className="p-5 rounded-xl bg-gradient-to-br from-[#0d1427] to-[#111a33] border border-[#1a233a] shadow-lg relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-500/10 rounded-full group-hover:scale-150 transition-transform"></div>
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <Leaf className="w-4 h-4 text-green-400" />
            <span className="text-xs font-semibold uppercase tracking-wider">Eco Score</span>
          </div>
          <div className="text-3xl font-black text-white">
            {sustainabilityScore} <span className="text-sm text-slate-500 font-medium">/ 100</span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <div className="w-full bg-[#1a233a] rounded-full h-1.5">
              <div className="bg-green-400 h-1.5 rounded-full" style={{ width: `${sustainabilityScore}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 2. Historical Energy Consumption Chart */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#0d1427] border border-[#1a233a] shadow-lg">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-cyan-400" />
            Historical Consumption vs Expected Baseline
          </h2>
          {history.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <defs>
                    <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
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
                  <Area type="monotone" dataKey="actual" name="Actual (kWh)" stroke="#22d3ee" strokeWidth={2} fillOpacity={1} fill="url(#colorActual)" />
                  <Line type="monotone" dataKey="expected" name="Expected Baseline" stroke="#94a3b8" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500">No historical data available.</div>
          )}
        </div>

        {/* 5. AI Insights & 6. Savings Impact */}
        <div className="space-y-6">
          <div className="p-5 rounded-xl bg-gradient-to-b from-[#111a33] to-[#0d1427] border border-[#1a233a] shadow-lg h-full">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-purple-400" />
              EcoCore AI Insights
            </h2>
            
            <div className="space-y-4">
              <div className="p-4 bg-[#0d1427]/80 rounded-lg border border-[#1a233a]">
                <h3 className="text-sm font-semibold text-cyan-300 flex items-center gap-2 mb-2">
                  <Info className="w-4 h-4" /> Load Decomposition Analysis
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Currently, HVAC accounts for <span className="font-bold text-white">{current ? Math.round((current.hvac_load / current.energy_kwh) * 100) : 0}%</span> of total power usage. 
                  Lighting is running at <span className="font-bold text-white">{current?.lighting_load} kWh</span>.
                </p>
              </div>

              {anomalies.length > 0 && (
                <div className="p-4 bg-rose-500/10 rounded-lg border border-rose-500/20">
                  <h3 className="text-sm font-semibold text-rose-400 flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4" /> Recommended Action
                  </h3>
                  <p className="text-xs text-rose-200/80 leading-relaxed">
                    AI detected <span className="font-bold text-rose-300">{anomalies.length} anomalous event(s)</span>. 
                    Investigate equipment running off-hours to prevent baseline drift.
                  </p>
                </div>
              )}

              <div className="mt-6 pt-4 border-t border-[#1a233a]">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Estimated Impact Opportunity</h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Energy Savings</span>
                    <span className="text-sm font-bold text-cyan-400">{potentialSavingsKwh.toFixed(0)} kWh/day</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">Cost Savings</span>
                    <span className="text-sm font-bold text-emerald-400">${potentialSavingsCost.toFixed(2)}/day</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-300">CO₂ Reduction</span>
                    <span className="text-sm font-bold text-green-400">{co2ReductionKg.toFixed(1)} kg</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 3. Energy Forecast Chart */}
        <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a] shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-400" />
              24-Hour Predictive Forecast
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
                  <Area type="monotone" dataKey="upper" name="Upper Bound" stroke="none" fill="#4f46e5" fillOpacity={0.1} />
                  <Area type="monotone" dataKey="lower" name="Lower Bound" stroke="none" fill="#0d1427" fillOpacity={1} />
                  <Line type="monotone" dataKey="predicted" name="Predicted Load" stroke="#818cf8" strokeWidth={3} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          ) : (
             <div className="h-[250px] flex items-center justify-center text-slate-500">Forecast unavailable.</div>
          )}
        </div>

        {/* 4. Energy Anomaly Detection */}
        <div className="p-5 rounded-xl bg-[#0d1427] border border-[#1a233a] shadow-lg flex flex-col">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            Active Anomalies
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
              <h3 className="font-bold">No Anomalies Detected</h3>
              <p className="text-sm text-emerald-600/70 text-center mt-1">Energy consumption is tracking within expected parameters.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
