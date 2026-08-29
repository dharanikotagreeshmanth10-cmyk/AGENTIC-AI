const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://agentic-ai-2-g2zu.onrender.com/api';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });
    if (!res.ok) {
      throw new Error(`API error: ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    console.error(`Fetch failed for ${url}:`, err);
    throw err;
  }
}

export const api = {
  getKPIs: () => fetchApi<any>('/dashboard/kpis'),
  getOverview: () => fetchApi<any>('/dashboard/overview'),
  getFacilities: () => fetchApi<any[]>('/facilities/benchmark'),
  getFacility: (id: string) => fetchApi<any>(`/facilities/${id}`),
  getAgents: () => fetchApi<any[]>('/agents'),
  getAgentTimeline: () => fetchApi<any[]>('/agents/timeline'),
  getAnomalies: () => fetchApi<any[]>('/anomalies'),
  getEnergyAnomalies: () => fetchApi<any[]>('/energy/anomalies'),
  getWaterLeaks: () => fetchApi<any[]>('/water/leaks'),
  getEnergyCurrent: (id = 'BUILDING-B') => fetchApi<any>(`/energy/current?facility_id=${id}`),
  getEnergyHistory: (id = 'BUILDING-B', days = 7) => fetchApi<any[]>(`/energy/history?facility_id=${id}&days=${days}`),
  getEnergyForecast: (id = 'BUILDING-B') => fetchApi<any>(`/energy/forecast?facility_id=${id}`),
  getWaterCurrent: (id = 'BUILDING-B') => fetchApi<any>(`/water/current?facility_id=${id}`),
  getWaterHistory: (id = 'BUILDING-B', days = 7) => fetchApi<any[]>(`/water/history?facility_id=${id}&days=${days}`),
  getWaterForecast: (id = 'BUILDING-B') => fetchApi<any>(`/water/forecast?facility_id=${id}`),
  getWasteHistory: () => fetchApi<any[]>('/waste/history'),
  getWasteAnalysis: () => fetchApi<any>('/waste/analysis'),
  getAirCurrent: (id = 'BUILDING-E') => fetchApi<any>(`/air/current?facility_id=${id}`),
  getAirHistory: (id = 'BUILDING-E') => fetchApi<any[]>(`/air/history?facility_id=${id}`),
  getOccupancyCurrent: (id = 'BUILDING-B') => fetchApi<any>(`/occupancy/current?facility_id=${id}`),
  getOccupancyHistory: (id = 'BUILDING-B') => fetchApi<any[]>(`/occupancy/history?facility_id=${id}`),
  getRecommendations: () => fetchApi<any[]>('/recommendations'),
  getApprovals: () => fetchApi<any[]>('/approvals'),
  approveRecommendation: (id: string, comment = '') => fetchApi<any>(`/approvals/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify({ comment })
  }),
  rejectRecommendation: (id: string, comment = '') => fetchApi<any>(`/approvals/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify({ comment })
  }),
  runSimulation: (params: any) => fetchApi<any>('/simulation/run', {
    method: 'POST',
    body: JSON.stringify(params)
  }),
  getImpact: () => fetchApi<any>('/impact'),
  generateReport: () => fetchApi<any>('/reports/generate', { method: 'POST' }),
  chatWithEcoCore: (message: string, facility_id = 'BUILDING-B') => fetchApi<any>('/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, facility_id })
  }),
  register: (data: any) => fetchApi<any>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Water Advanced APIs (18 new features)
  getWaterDigitalTwin: (id = 'BUILDING-B') => fetchApi<any>(`/water/digital-twin?facility_id=${id}`),
  getWaterLeakDetection: (id = 'BUILDING-B') => fetchApi<any>(`/water/leak-detection?facility_id=${id}`),
  getWaterEfficiencyScores: () => fetchApi<any>('/water/efficiency-score'),
  getWaterRainwater: (id = 'BUILDING-B', rainfall = 85) => fetchApi<any>(`/water/rainwater?facility_id=${id}&rainfall_mm=${rainfall}`),
  getWaterGreywater: (id = 'BUILDING-B') => fetchApi<any>(`/water/greywater?facility_id=${id}`),
  runWaterCostSimulator: (params: any) => fetchApi<any>('/water/cost-simulator', { method: 'POST', body: JSON.stringify(params) }),
  getWaterShortagePrediction: (id = 'BUILDING-B') => fetchApi<any>(`/water/shortage-prediction?facility_id=${id}`),
  getWaterSensorHealth: () => fetchApi<any>('/water/sensor-health'),
  getWaterRootCause: (id = 'BUILDING-B', type = 'HIGH_FLOW') => fetchApi<any>(`/water/root-cause?facility_id=${id}&anomaly_type=${type}`),
  getWaterCrossResource: (id = 'BUILDING-B') => fetchApi<any>(`/water/cross-resource?facility_id=${id}`),
  getWaterQuality: (id = 'BUILDING-B') => fetchApi<any>(`/water/quality?facility_id=${id}`),
  getWaterAlerts: (status = 'all', type = 'all') => fetchApi<any>(`/water/alerts?status_filter=${status}&type_filter=${type}`),
  acknowledgeAlert: (id: string) => fetchApi<any>(`/water/alerts/${id}/acknowledge`, { method: 'POST', body: JSON.stringify({}) }),
  resolveAlert: (id: string) => fetchApi<any>(`/water/alerts/${id}/resolve`, { method: 'POST', body: JSON.stringify({}) }),
  getWaterGoals: () => fetchApi<any>('/water/goals'),
  getWaterLeaderboard: () => fetchApi<any>('/water/leaderboard'),
  generateWaterReport: (params: any) => fetchApi<any>('/water/report', { method: 'POST', body: JSON.stringify(params) }),
  runWaterCommand: (command: string, facility_id = 'BUILDING-B') => fetchApi<any>('/water/command', { method: 'POST', body: JSON.stringify({ command, facility_id }) }),
  getWaterActivityTimeline: (id = 'BUILDING-B') => fetchApi<any>(`/water/activity-timeline?facility_id=${id}`),
  getWaterVerifiedImpact: (id = 'BUILDING-B') => fetchApi<any>(`/water/verified-impact?facility_id=${id}`),
  login: (data: any) => fetchApi<any>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(data)
  }),

  // Calling Board APIs
  getCallingContacts: (search = '', status = 'ALL', priority = 'ALL') => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (status && status !== 'ALL') params.append('status_filter', status);
    if (priority && priority !== 'ALL') params.append('priority_filter', priority);
    const qs = params.toString();
    return fetchApi<any[]>(`/calling-board/contacts${qs ? `?${qs}` : ''}`);
  },
  createCallingContact: (data: any) => fetchApi<any>('/calling-board/contacts', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  updateCallingStatus: (contactId: string, status: string) => fetchApi<any>(`/calling-board/contacts/${contactId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status })
  }),
  deleteCallingContact: (contactId: string) => fetchApi<any>(`/calling-board/contacts/${contactId}`, {
    method: 'DELETE'
  }),
  getCallHistory: () => fetchApi<any[]>('/calling-board/history'),
  logCall: (data: any) => fetchApi<any>('/calling-board/calls', {
    method: 'POST',
    body: JSON.stringify(data)
  }),
  seedCallingBoard: () => fetchApi<any>('/calling-board/seed', {
    method: 'POST'
  })
};
