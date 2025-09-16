export interface Customer {
  id: number;
  email: string;
  name: string;
  tier: 'free' | 'basic' | 'premium' | 'enterprise';
  spend: number;
  status: 'active' | 'suspended' | 'deleted';
  lastActivity: string;
  segment: 'standard' | 'medium_value' | 'high_value' | 'enterprise';
}

export interface SensorReading {
  device_id: string;
  sensor_type: string;
  reading_timestamp: string;
  value: number;
  received_at: string;
  processed_at?: string;
  data_quality_score: number;
}

export interface InventoryItem {
  product_id: string;
  warehouse_id: string;
  available_quantity: number;
  reserved_quantity: number;
  reorder_point: number;
  low_stock_alert: boolean;
  last_updated: string;
}

export interface MergeResult {
  executionTime: string;
  rowsProcessed: number;
  rowsInserted: number;
  rowsUpdated: number;
  rowsDeleted: number;
  success: boolean;
  error?: string;
}

export interface ConnectionConfig {
  database: string;
  username: string;
  password: string;
  endpoint: string;
  port: string;
}

export interface PerformanceMetric {
  timestamp: string;
  executionTime: number;
  rowsProcessed: number;
  operation: string;
}
