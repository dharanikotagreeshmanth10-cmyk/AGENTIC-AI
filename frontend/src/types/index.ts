export interface Facility {
  id: string;
  name: string;
  type: string;
  area: number;
  capacity: number;
  operating_hours: string;
  floor_count: number;
  location: string;
  sustainability_score: number;
  rank?: number;
  status_color?: string;
  active_anomalies?: number;
}

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  status: 'ONLINE' | 'BUSY' | 'IDLE' | 'ERROR' | 'OFFLINE' | 'WAITING';
  current_task?: string;
  confidence: number;
  health_score: number;
  execution_duration_ms: number;
  last_execution_time?: string;
}

export interface Anomaly {
  id: string;
  facility_id: string;
  resource_type: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  actual_value: number;
  expected_value: number;
  deviation_pct: number;
  confidence: number;
  estimated_monthly_loss: number;
  status: string;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  facility_id?: string;
  category: string;
  priority: string;
  confidence: number;
  estimated_energy_saving: number;
  estimated_water_saving: number;
  estimated_cost_saving: number;
  estimated_co2_reduction: number;
  implementation_cost: number;
  roi: number;
  payback_period_months: number;
  risk: string;
  status: string;
}

export interface ApprovalItem {
  approval: {
    id: string;
    recommendation_id: string;
    reviewer: string;
    status: string;
    comment: string;
    created_at: string;
    reviewed_at?: string;
  };
  recommendation: Recommendation;
}

export interface DashboardKPIs {
  sustainability_score: number;
  active_anomalies: number;
  pending_recommendations: number;
  total_energy_saved_kwh: number;
  total_water_saved_liters: number;
  total_money_saved_inr: number;
  total_co2_avoided_tonnes: number;
  waste_diverted_kg: number;
  success_rate_pct: number;
}
