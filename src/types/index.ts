// ============================================================================
// AdTech MERGE Demo Types
// ============================================================================

/**
 * Ad Performance record - main fact table for ad clicks and conversions
 */
export interface AdPerformance {
  click_id: string;
  campaign_id: number;
  ad_group_id: number;
  keyword_id: number;
  product_id: string;
  click_time: string;
  conversion_value: number | null;
  attributed_at: string | null;
  spend: number;
  impressions: number;
  clicks: number;
  orders: number;
  sales: number;
  date: string;
  last_updated: string;
}

/**
 * Attribution update record - late-arriving conversion data
 * Represents the 50/50 workload pattern common in AdTech
 */
export interface AttributionUpdate {
  click_id: string;
  campaign_id: number;
  ad_group_id: number;
  keyword_id: number;
  product_id: string;
  click_time: string;
  conversion_value: number;
  attributed_at: string;
  spend: number;
  impressions: number;
  clicks: number;
  orders: number;
  sales: number;
  date: string;
}

/**
 * Detected fraud record - fraudulent clicks to be removed
 */
export interface DetectedFraud {
  click_id: string;
  detection_time: string;
  fraud_type: 'click_injection' | 'click_spam' | 'sdk_spoofing' | 'device_farm';
  confidence_score: number;
}

/**
 * ROAS (Return on Ad Spend) metrics for multi-temporal analysis
 */
export interface ROASMetrics {
  product_id: string;
  roas_30d: number;
  roas_lifetime: number;
  roas_trend: number;
  performance_trend: 'Improving' | 'Declining' | 'Stable';
  spend_30d: number;
  sales_30d: number;
  orders_30d: number;
}

/**
 * MERGE operation result with statistics
 */
export interface MergeResult {
  executionTime: number;
  rowsProcessed: number;
  rowsInserted: number;
  rowsUpdated: number;
  rowsDeleted: number;
  bytesScanned: number;
  success: boolean;
  error?: string;
}

/**
 * Test result for performance comparison
 */
export interface TestResult {
  testName: string;
  approach: 'MERGE' | 'TRADITIONAL';
  executionTime: number;
  rowsProcessed: number;
  bytesScanned: number;
  operationCount: number;
  timestamp: string;
}

/**
 * Comparison metrics between MERGE and Traditional approaches
 */
export interface ComparisonMetrics {
  timeImprovement: number;
  efficiencyGain: number;
  ioReduction: number;
  simplificationFactor: number;
}

/**
 * Performance metric for charting
 */
export interface PerformanceMetric {
  timestamp: string;
  executionTime: number;
  rowsProcessed: number;
  operation: string;
}

/**
 * Firebolt Cloud connection configuration
 */
export interface ConnectionConfig {
  account: string;
  clientId: string;
  clientSecret: string;
  database: string;
  engine: string;
}

/**
 * Database status with table row counts
 */
export interface DatabaseStatus {
  ad_performance: number;
  attribution_updates: number;
  detected_fraud: number;
}

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  statistics?: {
    execution_time_ms: number;
    rows_read: number;
    bytes_read: number;
  };
}
