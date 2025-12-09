/**
 * Ad Performance MERGE Demo
 * 
 * Demonstrates Firebolt's first-class MERGE support for AdTech workloads:
 * - Attribution Updates: 50/50 inserts and updates (late-arriving conversion data)
 * - Fraud Detection: DELETE matched fraudulent records
 * - Real-time Analytics: Sub-second queries on updating data
 * 
 * @version 2.0.0
 */

import { useState, useCallback, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Play,
  RotateCcw,
  Database,
  AlertCircle,
  BarChart3,
  Zap,
  Target,
  Activity,
  Shield,
  RefreshCw,
  Trash2,
  ArrowUpDown
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import type { TestResult, ComparisonMetrics, PerformanceMetric, DatabaseStatus, ApiResponse } from '../types';

type TestType = 'attribution' | 'fraud' | 'both';

const AdPerformanceDemo = () => {
  // State management
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string>('');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [comparison, setComparison] = useState<ComparisonMetrics | null>(null);
  const [dataScale, setDataScale] = useState<'1x' | '5x' | '10x' | '25x' | '50x'>('1x');
  const [testType, setTestType] = useState<TestType>('attribution');
  const [logs, setLogs] = useState<string[]>([]);
  const [showSQLComparison, setShowSQLComparison] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isResettingDatabase, setIsResettingDatabase] = useState(false);
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking');

  // ============================================================================
  // Utility Functions
  // ============================================================================

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  const formatBytes = useCallback((bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
    } else if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    } else {
      return `${bytes.toLocaleString()} bytes`;
    }
  }, []);

  const getMultiplier = (scale: string): number => {
    switch (scale) {
      case '1x': return 1;
      case '5x': return 5;
      case '10x': return 10;
      case '25x': return 25;
      case '50x': return 50;
      default: return 1;
    }
  };

  // ============================================================================
  // API Functions
  // ============================================================================

  const executeQuery = useCallback(async (sql: string): Promise<ApiResponse<unknown[]>> => {
    try {
      addLog(`🔍 Executing: ${sql.substring(0, 80)}${sql.length > 80 ? '...' : ''}`);
      
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql })
      });
      
      const result = await response.json();
      
      if (!result.success) {
        addLog(`❌ Query error: ${result.error}`);
        throw new Error(result.error);
      }
      
      addLog(`✅ Query completed successfully`);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Query execution failed: ${errorMessage}`);
      throw error;
    }
  }, [addLog]);

  const checkConnection = useCallback(async () => {
    try {
      const response = await fetch('/api/health');
      const result = await response.json();
      
      if (result.status === 'ok' && result.config?.hasCredentials) {
        setConnectionStatus('connected');
        addLog(`✅ Connected to Firebolt Cloud (${result.config.database})`);
      } else {
        setConnectionStatus('error');
        addLog(`⚠️ Firebolt credentials not configured`);
      }
    } catch {
      setConnectionStatus('error');
      addLog(`❌ Cannot connect to API server - ensure server is running on port 3001`);
    }
  }, [addLog]);

  const checkDatabaseStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/status');
      const result = await response.json();
      
      if (result.success) {
        setDatabaseStatus(result.tables);
      } else {
        setDatabaseStatus({ ad_performance: 0, attribution_updates: 0, detected_fraud: 0 });
      }
    } catch {
      setDatabaseStatus({ ad_performance: 0, attribution_updates: 0, detected_fraud: 0 });
    }
  }, []);

  // ============================================================================
  // Database Setup Functions
  // ============================================================================

  const createTables = async () => {
    if (isResettingDatabase) return;
    setIsResettingDatabase(true);

    try {
      addLog(`🗑️ Dropping existing tables...`);
      
      await executeQuery(`DROP TABLE IF EXISTS detected_fraud`);
      await executeQuery(`DROP TABLE IF EXISTS attribution_updates`);
      await executeQuery(`DROP TABLE IF EXISTS ad_performance`);

      addLog(`🏗️ Creating ad_performance table...`);
      await executeQuery(`
        CREATE FACT TABLE ad_performance (
          click_id TEXT,
          campaign_id INT,
          ad_group_id INT,
          keyword_id INT,
          product_id TEXT,
          click_time TIMESTAMP,
          conversion_value DECIMAL(10,2),
          attributed_at TIMESTAMP,
          spend DECIMAL(10,2),
          impressions INT,
          clicks INT,
          orders INT,
          sales DECIMAL(10,2),
          event_date DATE,
          last_updated TIMESTAMP
        ) PRIMARY INDEX click_id
      `);

      addLog(`🏗️ Creating attribution_updates table...`);
      await executeQuery(`
        CREATE FACT TABLE attribution_updates (
          click_id TEXT,
          campaign_id INT,
          ad_group_id INT,
          keyword_id INT,
          product_id TEXT,
          click_time TIMESTAMP,
          conversion_value DECIMAL(10,2),
          attributed_at TIMESTAMP,
          spend DECIMAL(10,2),
          impressions INT,
          clicks INT,
          orders INT,
          sales DECIMAL(10,2),
          event_date DATE
        ) PRIMARY INDEX click_id
      `);

      addLog(`🏗️ Creating detected_fraud table...`);
      await executeQuery(`
        CREATE FACT TABLE detected_fraud (
          click_id TEXT,
          detection_time TIMESTAMP,
          fraud_type TEXT,
          confidence_score DECIMAL(5,4)
        ) PRIMARY INDEX click_id
      `);

      addLog(`✅ All tables created successfully`);
      await checkDatabaseStatus();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Failed to create tables: ${errorMessage}`);
    } finally {
      setIsResettingDatabase(false);
    }
  };

  const loadInitialData = async () => {
    if (isLoadingData) return;
    setIsLoadingData(true);

    try {
      const baseRows = 10000;
      addLog(`📊 Generating ${baseRows.toLocaleString()} ad performance records...`);

      // Generate ad performance data in batches
      const batchSize = 1000;
      const batches = Math.ceil(baseRows / batchSize);

      for (let batch = 0; batch < batches; batch++) {
        const startId = batch * batchSize + 1;
        addLog(`  📦 Loading batch ${batch + 1}/${batches}...`);

        await executeQuery(`
          INSERT INTO ad_performance (
            click_id, campaign_id, ad_group_id, keyword_id, product_id,
            click_time, conversion_value, attributed_at, spend, impressions,
            clicks, orders, sales, event_date, last_updated
          )
          SELECT
            'click_' || (${startId} + ROW_NUMBER() OVER ()) as click_id,
            (${startId} + ROW_NUMBER() OVER ()) % 100 + 1 as campaign_id,
            (${startId} + ROW_NUMBER() OVER ()) % 500 + 1 as ad_group_id,
            (${startId} + ROW_NUMBER() OVER ()) % 2000 + 1 as keyword_id,
            'ASIN_' || LPAD(CAST((${startId} + ROW_NUMBER() OVER ()) % 1000 AS TEXT), 5, '0') as product_id,
            CURRENT_TIMESTAMP() - INTERVAL '1 second' * ((${startId} + ROW_NUMBER() OVER ()) % 2592000) as click_time,
            CASE WHEN (${startId} + ROW_NUMBER() OVER ()) % 20 = 0 
                 THEN ROUND(CAST(RANDOM() * 100 AS DECIMAL(10,2)), 2) 
                 ELSE NULL END as conversion_value,
            CASE WHEN (${startId} + ROW_NUMBER() OVER ()) % 20 = 0 
                 THEN (CURRENT_TIMESTAMP() - INTERVAL '1 second' * ((${startId} + ROW_NUMBER() OVER ()) % 2592000)) 
                      + INTERVAL '1 day' * ((${startId} + ROW_NUMBER() OVER ()) % 7)
                 ELSE NULL END as attributed_at,
            ROUND(CAST(0.5 + RANDOM() * 2 AS DECIMAL(10,2)), 2) as spend,
            10 + ((${startId} + ROW_NUMBER() OVER ()) % 100) as impressions,
            1 + ((${startId} + ROW_NUMBER() OVER ()) % 5) as clicks,
            CASE WHEN (${startId} + ROW_NUMBER() OVER ()) % 20 = 0 THEN 1 ELSE 0 END as orders,
            CASE WHEN (${startId} + ROW_NUMBER() OVER ()) % 20 = 0 
                 THEN ROUND(CAST(10 + RANDOM() * 90 AS DECIMAL(10,2)), 2) 
                 ELSE 0 END as sales,
            CURRENT_DATE() - INTERVAL '1 day' * ((${startId} + ROW_NUMBER() OVER ()) % 30) as event_date,
            CURRENT_TIMESTAMP() as last_updated
          FROM GENERATE_SERIES(1, ${batchSize})
        `);
      }

      addLog(`✅ Loaded ${baseRows.toLocaleString()} ad performance records`);
      await checkDatabaseStatus();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      addLog(`❌ Failed to load data: ${errorMessage}`);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fullDatabaseReset = async () => {
    setLogs([]);
    await createTables();
    await loadInitialData();
  };

  // ============================================================================
  // Test Data Setup
  // ============================================================================

  const setupAttributionTestData = async (scale: string) => {
    const multiplier = getMultiplier(scale);
    const updateCount = 1000 * multiplier;
    const newClicksCount = Math.floor(updateCount * 0.5); // 50/50 workload

    addLog(`🔧 Setting up attribution test data (${scale} = ${updateCount.toLocaleString()} records)...`);
    addLog(`  📊 Workload split: ~50% updates, ~50% new inserts`);

    // Clear previous test data
    await executeQuery(`DELETE FROM attribution_updates`);

    // Generate attribution updates - mix of updates to existing clicks and new clicks
    await executeQuery(`
      INSERT INTO attribution_updates (
        click_id, campaign_id, ad_group_id, keyword_id, product_id,
        click_time, conversion_value, attributed_at, spend, impressions,
        clicks, orders, sales, event_date
      )
      -- Updates for existing clicks (late attribution)
      SELECT
        click_id,
        campaign_id,
        ad_group_id,
        keyword_id,
        product_id,
        click_time,
        ROUND(CAST(10 + RANDOM() * 90 AS DECIMAL(10,2)), 2) as conversion_value,
        CURRENT_TIMESTAMP() as attributed_at,
        spend,
        impressions,
        clicks,
        1 as orders,
        ROUND(CAST(10 + RANDOM() * 90 AS DECIMAL(10,2)), 2) as sales,
        event_date
      FROM ad_performance
      WHERE conversion_value IS NULL
      LIMIT ${updateCount - newClicksCount}
    `);

    // Generate new clicks that don't exist yet
    await executeQuery(`
      INSERT INTO attribution_updates (
        click_id, campaign_id, ad_group_id, keyword_id, product_id,
        click_time, conversion_value, attributed_at, spend, impressions,
        clicks, orders, sales, event_date
      )
      SELECT
        'new_click_' || ROW_NUMBER() OVER () as click_id,
        (ROW_NUMBER() OVER ()) % 100 + 1 as campaign_id,
        (ROW_NUMBER() OVER ()) % 500 + 1 as ad_group_id,
        (ROW_NUMBER() OVER ()) % 2000 + 1 as keyword_id,
        'ASIN_' || LPAD(CAST((ROW_NUMBER() OVER ()) % 1000 AS TEXT), 5, '0') as product_id,
        CURRENT_TIMESTAMP() as click_time,
        ROUND(CAST(10 + RANDOM() * 90 AS DECIMAL(10,2)), 2) as conversion_value,
        CURRENT_TIMESTAMP() as attributed_at,
        ROUND(CAST(0.5 + RANDOM() * 2 AS DECIMAL(10,2)), 2) as spend,
        10 + ((ROW_NUMBER() OVER ()) % 100) as impressions,
        1 + ((ROW_NUMBER() OVER ()) % 5) as clicks,
        1 as orders,
        ROUND(CAST(10 + RANDOM() * 90 AS DECIMAL(10,2)), 2) as sales,
        CURRENT_DATE() as event_date
      FROM GENERATE_SERIES(1, ${newClicksCount})
    `);

    addLog(`✅ Test data ready: ${updateCount.toLocaleString()} attribution updates`);
  };

  const setupFraudTestData = async (scale: string) => {
    const multiplier = getMultiplier(scale);
    const fraudCount = 500 * multiplier;

    addLog(`🔧 Setting up fraud detection test data (${fraudCount.toLocaleString()} fraudulent clicks)...`);

    await executeQuery(`DELETE FROM detected_fraud`);

    await executeQuery(`
      INSERT INTO detected_fraud (click_id, detection_time, fraud_type, confidence_score)
      SELECT
        click_id,
        CURRENT_TIMESTAMP() as detection_time,
        CASE (ROW_NUMBER() OVER ()) % 4
          WHEN 0 THEN 'click_injection'
          WHEN 1 THEN 'click_spam'
          WHEN 2 THEN 'sdk_spoofing'
          ELSE 'device_farm'
        END as fraud_type,
        ROUND(CAST(0.85 + RANDOM() * 0.15 AS DECIMAL(5,4)), 4) as confidence_score
      FROM ad_performance
      WHERE (CAST(SUBSTR(click_id, 7) AS INT) % 20) = 0
      LIMIT ${fraudCount}
    `);

    addLog(`✅ Test data ready: ${fraudCount.toLocaleString()} fraudulent clicks marked`);
  };

  // ============================================================================
  // MERGE Tests
  // ============================================================================

  const runAttributionMergeTest = async (): Promise<TestResult> => {
    addLog('🚀 === STARTING ATTRIBUTION MERGE TEST ===');
    addLog('📋 Single MERGE operation handles both: UPDATE existing + INSERT new');

    const startTime = Date.now();
    const result = await executeQuery(`
      MERGE INTO ad_performance AS target
      USING attribution_updates AS source
      ON target.click_id = source.click_id
      WHEN MATCHED AND source.conversion_value IS NOT NULL THEN
        UPDATE SET
          conversion_value = source.conversion_value,
          attributed_at = source.attributed_at,
          orders = source.orders,
          sales = source.sales,
          last_updated = CURRENT_TIMESTAMP()
      WHEN NOT MATCHED THEN
        INSERT (click_id, campaign_id, ad_group_id, keyword_id, product_id,
                click_time, conversion_value, attributed_at, spend, impressions,
                clicks, orders, sales, event_date, last_updated)
        VALUES (source.click_id, source.campaign_id, source.ad_group_id,
                source.keyword_id, source.product_id, source.click_time,
                source.conversion_value, source.attributed_at, source.spend,
                source.impressions, source.clicks, source.orders, source.sales,
                source.event_date, CURRENT_TIMESTAMP())
    `);

    const executionTime = (Date.now() - startTime) / 1000;
    
    addLog(`✅ MERGE COMPLETED in ${executionTime.toFixed(3)}s`);
    addLog(`📊 Stats: ${result.statistics?.rows_read || 0} rows, ${formatBytes(result.statistics?.bytes_read || 0)}`);

    return {
      testName: `Attribution MERGE (${dataScale})`,
      approach: 'MERGE',
      executionTime,
      rowsProcessed: result.statistics?.rows_read || 0,
      bytesScanned: result.statistics?.bytes_read || 0,
      operationCount: 1,
      timestamp: new Date().toISOString()
    };
  };

  const runAttributionTraditionalTest = async (): Promise<TestResult> => {
    addLog('🔄 === STARTING TRADITIONAL ATTRIBUTION TEST ===');
    addLog('📋 Will execute 3 separate operations: CHECK → UPDATE → INSERT');

    const startTime = Date.now();
    let totalRows = 0;
    let totalBytes = 0;

    // Step 1: Update existing records
    addLog('  1/3 Updating existing clicks with new attribution...');
    const updateResult = await executeQuery(`
      UPDATE ad_performance AS target
      SET
        conversion_value = source.conversion_value,
        attributed_at = source.attributed_at,
        orders = source.orders,
        sales = source.sales,
        last_updated = CURRENT_TIMESTAMP()
      FROM attribution_updates AS source
      WHERE target.click_id = source.click_id
        AND source.conversion_value IS NOT NULL
    `);
    totalRows += updateResult.statistics?.rows_read || 0;
    totalBytes += updateResult.statistics?.bytes_read || 0;

    // Step 2: Find new clicks that don't exist
    addLog('  2/3 Identifying new clicks...');
    const checkResult = await executeQuery(`
      SELECT COUNT(*) as new_count
      FROM attribution_updates AS source
      LEFT JOIN ad_performance AS target ON source.click_id = target.click_id
      WHERE target.click_id IS NULL
    `);
    totalRows += checkResult.statistics?.rows_read || 0;
    totalBytes += checkResult.statistics?.bytes_read || 0;

    // Step 3: Insert new clicks
    addLog('  3/3 Inserting new clicks...');
    const insertResult = await executeQuery(`
      INSERT INTO ad_performance (
        click_id, campaign_id, ad_group_id, keyword_id, product_id,
        click_time, conversion_value, attributed_at, spend, impressions,
        clicks, orders, sales, event_date, last_updated
      )
      SELECT
        source.click_id, source.campaign_id, source.ad_group_id,
        source.keyword_id, source.product_id, source.click_time,
        source.conversion_value, source.attributed_at, source.spend,
        source.impressions, source.clicks, source.orders, source.sales,
        source.event_date, CURRENT_TIMESTAMP()
      FROM attribution_updates AS source
      LEFT JOIN ad_performance AS target ON source.click_id = target.click_id
      WHERE target.click_id IS NULL
    `);
    totalRows += insertResult.statistics?.rows_read || 0;
    totalBytes += insertResult.statistics?.bytes_read || 0;

    const executionTime = (Date.now() - startTime) / 1000;

    addLog(`✅ TRADITIONAL COMPLETED in ${executionTime.toFixed(3)}s`);
    addLog(`📊 Stats: ${totalRows} total rows, ${formatBytes(totalBytes)}`);

    return {
      testName: `Attribution Traditional (${dataScale})`,
      approach: 'TRADITIONAL',
      executionTime,
      rowsProcessed: totalRows,
      bytesScanned: totalBytes,
      operationCount: 3,
      timestamp: new Date().toISOString()
    };
  };

  const runFraudMergeTest = async (): Promise<TestResult> => {
    addLog('🚀 === STARTING FRAUD DETECTION MERGE TEST ===');
    addLog('📋 Single MERGE DELETE removes fraudulent clicks atomically');

    const startTime = Date.now();
    const result = await executeQuery(`
      MERGE INTO ad_performance AS target
      USING detected_fraud AS source
      ON target.click_id = source.click_id
      WHEN MATCHED THEN DELETE
    `);

    const executionTime = (Date.now() - startTime) / 1000;

    addLog(`✅ FRAUD MERGE COMPLETED in ${executionTime.toFixed(3)}s`);
    addLog(`📊 Stats: ${result.statistics?.rows_read || 0} rows, ${formatBytes(result.statistics?.bytes_read || 0)}`);

    return {
      testName: `Fraud MERGE DELETE (${dataScale})`,
      approach: 'MERGE',
      executionTime,
      rowsProcessed: result.statistics?.rows_read || 0,
      bytesScanned: result.statistics?.bytes_read || 0,
      operationCount: 1,
      timestamp: new Date().toISOString()
    };
  };

  const runFraudTraditionalTest = async (): Promise<TestResult> => {
    addLog('🔄 === STARTING TRADITIONAL FRAUD DELETION TEST ===');
    addLog('📋 Will execute 2 separate operations: SELECT → DELETE');

    const startTime = Date.now();
    let totalRows = 0;
    let totalBytes = 0;

    // Step 1: Find fraud clicks in ad_performance
    addLog('  1/2 Finding fraudulent clicks in ad_performance...');
    const findResult = await executeQuery(`
      SELECT target.click_id
      FROM ad_performance AS target
      INNER JOIN detected_fraud AS source ON target.click_id = source.click_id
    `);
    totalRows += findResult.statistics?.rows_read || 0;
    totalBytes += findResult.statistics?.bytes_read || 0;

    // Step 2: Delete fraudulent clicks
    addLog('  2/2 Deleting fraudulent clicks...');
    const deleteResult = await executeQuery(`
      DELETE FROM ad_performance
      WHERE click_id IN (SELECT click_id FROM detected_fraud)
    `);
    totalRows += deleteResult.statistics?.rows_read || 0;
    totalBytes += deleteResult.statistics?.bytes_read || 0;

    const executionTime = (Date.now() - startTime) / 1000;

    addLog(`✅ TRADITIONAL COMPLETED in ${executionTime.toFixed(3)}s`);
    addLog(`📊 Stats: ${totalRows} total rows, ${formatBytes(totalBytes)}`);

    return {
      testName: `Fraud Traditional (${dataScale})`,
      approach: 'TRADITIONAL',
      executionTime,
      rowsProcessed: totalRows,
      bytesScanned: totalBytes,
      operationCount: 2,
      timestamp: new Date().toISOString()
    };
  };

  // ============================================================================
  // Main Test Runner
  // ============================================================================

  const calculateComparison = (mergeResult: TestResult, traditionalResult: TestResult): ComparisonMetrics => {
    const timeImprovement = ((traditionalResult.executionTime - mergeResult.executionTime) / traditionalResult.executionTime) * 100;
    const efficiencyGain = traditionalResult.rowsProcessed > 0 
      ? ((traditionalResult.rowsProcessed - mergeResult.rowsProcessed) / traditionalResult.rowsProcessed) * 100 
      : 0;
    const ioReduction = traditionalResult.bytesScanned > 0
      ? ((traditionalResult.bytesScanned - mergeResult.bytesScanned) / traditionalResult.bytesScanned) * 100
      : 0;
    const simplificationFactor = traditionalResult.operationCount / mergeResult.operationCount;

    return {
      timeImprovement: Math.round(timeImprovement * 100) / 100,
      efficiencyGain: Math.round(efficiencyGain * 100) / 100,
      ioReduction: Math.round(ioReduction * 100) / 100,
      simplificationFactor: Math.round(simplificationFactor * 100) / 100
    };
  };

  const runPerformanceTest = async () => {
    if (isRunning) return;

    setIsRunning(true);
    setLogs([]);
    setTestResults([]);
    setComparison(null);

    try {
      addLog(`🚀 Starting MERGE Performance Test (${dataScale} scale)`);
      addLog(`📋 Test type: ${testType === 'attribution' ? 'Attribution Updates (50/50 workload)' : testType === 'fraud' ? 'Fraud Detection (DELETE)' : 'Both'}`);

      let mergeResult: TestResult;
      let traditionalResult: TestResult;

      if (testType === 'attribution' || testType === 'both') {
        // Setup attribution test data
        await setupAttributionTestData(dataScale);

        // Run MERGE test
        setCurrentTest('Running Attribution MERGE...');
        mergeResult = await runAttributionMergeTest();
        setTestResults(prev => [...prev, mergeResult]);

        // Reset and setup again for fair comparison
        await setupAttributionTestData(dataScale);

        // Run Traditional test
        setCurrentTest('Running Traditional Attribution...');
        traditionalResult = await runAttributionTraditionalTest();
        setTestResults(prev => [...prev, traditionalResult]);

        // Calculate comparison
        const comparisonMetrics = calculateComparison(mergeResult, traditionalResult);
        setComparison(comparisonMetrics);

        // Update chart metrics
        setPerformanceMetrics([
          { timestamp: new Date().toISOString(), executionTime: mergeResult.executionTime, rowsProcessed: mergeResult.rowsProcessed, operation: 'MERGE' },
          { timestamp: new Date().toISOString(), executionTime: traditionalResult.executionTime, rowsProcessed: traditionalResult.rowsProcessed, operation: 'Traditional' }
        ]);

        addLog(`🎯 Test completed! MERGE is ${comparisonMetrics.timeImprovement > 0 ? comparisonMetrics.timeImprovement.toFixed(1) + '% faster' : Math.abs(comparisonMetrics.timeImprovement).toFixed(1) + '% slower'}`);
      }

      if (testType === 'fraud') {
        // Setup fraud test data
        await setupFraudTestData(dataScale);

        // Run MERGE test
        setCurrentTest('Running Fraud MERGE DELETE...');
        mergeResult = await runFraudMergeTest();
        setTestResults(prev => [...prev, mergeResult]);

        // Reset and setup again
        await loadInitialData();
        await setupFraudTestData(dataScale);

        // Run Traditional test
        setCurrentTest('Running Traditional Fraud Deletion...');
        traditionalResult = await runFraudTraditionalTest();
        setTestResults(prev => [...prev, traditionalResult]);

        const comparisonMetrics = calculateComparison(mergeResult, traditionalResult);
        setComparison(comparisonMetrics);

        setPerformanceMetrics([
          { timestamp: new Date().toISOString(), executionTime: mergeResult.executionTime, rowsProcessed: mergeResult.rowsProcessed, operation: 'MERGE' },
          { timestamp: new Date().toISOString(), executionTime: traditionalResult.executionTime, rowsProcessed: traditionalResult.rowsProcessed, operation: 'Traditional' }
        ]);

        addLog(`🎯 Test completed! MERGE is ${comparisonMetrics.timeImprovement > 0 ? comparisonMetrics.timeImprovement.toFixed(1) + '% faster' : Math.abs(comparisonMetrics.timeImprovement).toFixed(1) + '% slower'}`);
      }

      setCurrentTest('');
      await checkDatabaseStatus();

    } catch (error) {
      console.error('Performance test failed:', error);
      addLog(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCurrentTest('');
    } finally {
      setIsRunning(false);
    }
  };

  // ============================================================================
  // Effects
  // ============================================================================

  useEffect(() => {
    checkConnection();
    checkDatabaseStatus();
  }, [checkConnection, checkDatabaseStatus]);

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
          <Target className="w-8 h-8 text-firebolt-red mr-3" />
          Ad Performance MERGE Demo
          <span className="ml-3 px-2 py-1 text-sm bg-firebolt-red text-white rounded-full">v2.0</span>
        </h1>
        <p className="text-gray-600">
          Demonstrating Firebolt's first-class MERGE support for AdTech workloads with 50/50 insert/update patterns
        </p>
        <div className="mt-2 flex items-center text-sm text-gray-500">
          {connectionStatus === 'connected' && (
            <span className="text-green-600 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
              Connected to Firebolt Cloud
            </span>
          )}
          {connectionStatus === 'error' && (
            <span className="text-red-600 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              Connection Error — Start API server on port 3001
            </span>
          )}
          {connectionStatus === 'checking' && (
            <span className="text-gray-500 flex items-center">
              Checking connection...
            </span>
          )}
        </div>
      </div>

      {/* Database Status */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Database className="w-5 h-5 mr-2 text-firebolt-blue" />
            Database Status
          </h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={checkDatabaseStatus}
              disabled={isResettingDatabase || isLoadingData}
              className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </button>
          </div>
        </div>

        {databaseStatus ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center">
                <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-blue-900">ad_performance</p>
                  <p className="text-2xl font-bold text-blue-600">{databaseStatus.ad_performance?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center">
                <ArrowUpDown className="w-5 h-5 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-900">attribution_updates</p>
                  <p className="text-2xl font-bold text-green-600">{databaseStatus.attribution_updates?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-red-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-red-900">detected_fraud</p>
                  <p className="text-2xl font-bold text-red-600">{databaseStatus.detected_fraud?.toLocaleString() || 0}</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 rounded-lg p-4 mb-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-yellow-900">Tables Not Found</p>
                <p className="text-xs text-yellow-700">Click "Full Reset" to create tables and load sample data</p>
              </div>
            </div>
          </div>
        )}

        {/* Database Management */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Database Management</h4>
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <button
              onClick={createTables}
              disabled={isRunning || isResettingDatabase || isLoadingData}
              className="flex items-center px-3 py-2 text-sm bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50"
            >
              <Database className="w-4 h-4 mr-1" />
              Create Tables
            </button>
            <button
              onClick={loadInitialData}
              disabled={isRunning || isResettingDatabase || isLoadingData}
              className="flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              <Database className="w-4 h-4 mr-1" />
              Load 10K Records
            </button>
            <button
              onClick={fullDatabaseReset}
              disabled={isRunning || isResettingDatabase || isLoadingData}
              className="flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Full Reset
            </button>
          </div>
        </div>

        {(isResettingDatabase || isLoadingData) && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Activity className="w-4 h-4 text-blue-600 mr-2 animate-spin" />
              <span className="text-sm font-medium text-blue-800">
                {isResettingDatabase ? 'Creating tables...' : 'Loading data...'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Test Controls */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Performance Test Controls</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Test Type */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Test Type</label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value as TestType)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              disabled={isRunning}
            >
              <option value="attribution">Attribution Updates (50/50 workload)</option>
              <option value="fraud">Fraud Detection (DELETE)</option>
            </select>
          </div>

          {/* Data Scale */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Data Scale</label>
            <select
              value={dataScale}
              onChange={(e) => setDataScale(e.target.value as '1x' | '5x' | '10x' | '25x' | '50x')}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              disabled={isRunning}
            >
              <option value="1x">1x (1,000 records)</option>
              <option value="5x">5x (5,000 records)</option>
              <option value="10x">10x (10,000 records)</option>
              <option value="25x">25x (25,000 records)</option>
              <option value="50x">50x (50,000 records)</option>
            </select>
          </div>

          {/* Run Button */}
          <div className="flex items-end">
            <button
              onClick={runPerformanceTest}
              disabled={isRunning || connectionStatus !== 'connected'}
              className="w-full flex items-center justify-center px-4 py-2 bg-firebolt-red text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Performance Test
                </>
              )}
            </button>
          </div>
        </div>

        {currentTest && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center">
              <Activity className="w-4 h-4 text-blue-600 mr-2 animate-spin" />
              <span className="text-sm font-medium text-blue-800">{currentTest}</span>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      {comparison && (
        <div>
          <div className="bg-gradient-to-r from-firebolt-red to-firebolt-blue rounded-lg shadow p-6 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-2">
              {testType === 'attribution' ? 'Attribution MERGE' : 'Fraud Detection MERGE'} vs Traditional Results
            </h2>
            <p className="text-white/90">
              {testType === 'attribution' 
                ? 'Comparing single MERGE operation against 3 traditional SQL operations (CHECK → UPDATE → INSERT)'
                : 'Comparing MERGE DELETE against 2 traditional operations (SELECT → DELETE)'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Time Performance</p>
                  <p className={`text-2xl font-bold ${comparison.timeImprovement > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {comparison.timeImprovement > 0 ? '+' : ''}{comparison.timeImprovement}%
                  </p>
                  <p className="text-xs text-gray-500">
                    {comparison.timeImprovement > 0 ? 'MERGE Faster' : 'Traditional Faster'}
                  </p>
                </div>
                {comparison.timeImprovement > 0 ? (
                  <TrendingUp className="w-8 h-8 text-green-600" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-red-600" />
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Efficiency Gain</p>
                  <p className={`text-2xl font-bold ${comparison.efficiencyGain > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                    {comparison.efficiencyGain > 0 ? '+' : ''}{comparison.efficiencyGain}%
                  </p>
                  <p className="text-xs text-gray-500">Rows processed</p>
                </div>
                <Database className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">I/O Reduction</p>
                  <p className={`text-2xl font-bold ${comparison.ioReduction > 0 ? 'text-green-600' : 'text-gray-600'}`}>
                    {comparison.ioReduction > 0 ? '+' : ''}{comparison.ioReduction}%
                  </p>
                  <p className="text-xs text-gray-500">Bytes scanned</p>
                </div>
                <Zap className="w-8 h-8 text-firebolt-red" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Simplification</p>
                  <p className="text-2xl font-bold text-firebolt-blue">
                    {comparison.simplificationFactor}x
                  </p>
                  <p className="text-xs text-gray-500">Fewer operations</p>
                </div>
                <Target className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results View Toggle */}
      {comparison && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setShowSQLComparison(false)}
                className={`py-3 px-6 text-sm font-medium border-b-2 ${
                  !showSQLComparison
                    ? 'border-firebolt-red text-firebolt-red'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                📊 Performance Results
              </button>
              <button
                onClick={() => setShowSQLComparison(true)}
                className={`py-3 px-6 text-sm font-medium border-b-2 ${
                  showSQLComparison
                    ? 'border-firebolt-red text-firebolt-red'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                💻 SQL Query Comparison
              </button>
            </nav>
          </div>

          {showSQLComparison ? (
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {testType === 'attribution' ? 'Attribution Updates' : 'Fraud Detection'} SQL Comparison
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* MERGE Query */}
                <div className="border border-firebolt-red rounded-lg">
                  <div className="bg-firebolt-red text-white px-4 py-2 rounded-t-lg">
                    <h4 className="font-semibold">🚀 MERGE Approach (1 Operation)</h4>
                  </div>
                  <div className="p-4">
                    <pre className="text-xs bg-gray-900 text-green-400 p-3 rounded overflow-x-auto">
{testType === 'attribution' ? `-- Single atomic operation for 50/50 workload
MERGE INTO ad_performance AS target
USING attribution_updates AS source
ON target.click_id = source.click_id
WHEN MATCHED AND source.conversion_value IS NOT NULL THEN
  UPDATE SET
    conversion_value = source.conversion_value,
    attributed_at = source.attributed_at,
    orders = source.orders,
    sales = source.sales,
    last_updated = CURRENT_TIMESTAMP()
WHEN NOT MATCHED THEN
  INSERT (click_id, campaign_id, ad_group_id, ...)
  VALUES (source.click_id, source.campaign_id, ...);` : `-- Remove fraudulent clicks atomically
MERGE INTO ad_performance AS target
USING detected_fraud AS source
ON target.click_id = source.click_id
WHEN MATCHED THEN DELETE;`}
                    </pre>
                    <div className="mt-3 text-sm text-gray-600">
                      ✅ {testType === 'attribution' 
                        ? 'Handles both updates AND inserts in one atomic operation' 
                        : 'Deletes all matched fraudulent clicks atomically'}
                    </div>
                  </div>
                </div>

                {/* Traditional Query */}
                <div className="border border-blue-600 rounded-lg">
                  <div className="bg-blue-600 text-white px-4 py-2 rounded-t-lg">
                    <h4 className="font-semibold">🔄 Traditional Approach ({testType === 'attribution' ? '3' : '2'} Operations)</h4>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      {testType === 'attribution' ? (
                        <>
                          <div>
                            <div className="text-xs font-semibold text-blue-600 mb-1">1/3 - UPDATE existing</div>
                            <pre className="text-xs bg-gray-900 text-blue-400 p-2 rounded overflow-x-auto">
{`UPDATE ad_performance SET
  conversion_value = source.conversion_value,
  attributed_at = source.attributed_at
FROM attribution_updates AS source
WHERE ad_performance.click_id = source.click_id;`}
                            </pre>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-blue-600 mb-1">2/3 - CHECK for new</div>
                            <pre className="text-xs bg-gray-900 text-blue-400 p-2 rounded overflow-x-auto">
{`SELECT source.click_id FROM attribution_updates source
LEFT JOIN ad_performance target 
  ON source.click_id = target.click_id
WHERE target.click_id IS NULL;`}
                            </pre>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-blue-600 mb-1">3/3 - INSERT new</div>
                            <pre className="text-xs bg-gray-900 text-blue-400 p-2 rounded overflow-x-auto">
{`INSERT INTO ad_performance (...)
SELECT ... FROM attribution_updates source
WHERE NOT EXISTS (...);`}
                            </pre>
                          </div>
                        </>
                      ) : (
                        <>
                          <div>
                            <div className="text-xs font-semibold text-blue-600 mb-1">1/2 - FIND fraudulent</div>
                            <pre className="text-xs bg-gray-900 text-blue-400 p-2 rounded overflow-x-auto">
{`SELECT click_id FROM ad_performance
WHERE click_id IN (
  SELECT click_id FROM detected_fraud
);`}
                            </pre>
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-blue-600 mb-1">2/2 - DELETE</div>
                            <pre className="text-xs bg-gray-900 text-blue-400 p-2 rounded overflow-x-auto">
{`DELETE FROM ad_performance
WHERE click_id IN (
  SELECT click_id FROM detected_fraud
);`}
                            </pre>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      ⚠️ Multiple operations, potential race conditions
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits Summary */}
              <div className="mt-6 bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border-l-4 border-firebolt-blue">
                <p className="text-gray-800 font-medium mb-2">🔥 Why First-Class MERGE Matters</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• <strong>Atomic Operations:</strong> No race conditions between UPDATE and INSERT</li>
                  <li>• <strong>Single Query Plan:</strong> Optimized execution by Firebolt's query planner</li>
                  <li>• <strong>ACID Compliance:</strong> Immediate consistency for all reads</li>
                  <li>• <strong>Reduced I/O:</strong> Single table scan instead of multiple operations</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="p-6">
              {/* Performance Chart */}
              {performanceMetrics.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Execution Time Comparison</h3>
                    <BarChart3 className="w-5 h-5 text-gray-400" />
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={performanceMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="operation" />
                      <YAxis label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
                      <Tooltip formatter={(value) => [`${value}s`, 'Execution Time']} />
                      <Legend />
                      <Bar dataKey="executionTime" fill="#FF6B35" name="Execution Time (s)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Results Table */}
              {testResults.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Results</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Test</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approach</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rows</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bytes</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ops</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {testResults.map((result, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {result.testName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                result.approach === 'MERGE'
                                  ? 'bg-firebolt-red text-white'
                                  : 'bg-gray-200 text-gray-800'
                              }`}>
                                {result.approach}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {result.executionTime.toFixed(3)}s
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {result.rowsProcessed.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatBytes(result.bytesScanned)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {result.operationCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Execution Logs */}
      {logs.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Execution Log</h3>
            <button
              onClick={() => setLogs([])}
              className="flex items-center px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Clear
            </button>
          </div>
          <div className="bg-gray-900 rounded-lg p-4 max-h-64 overflow-y-auto">
            <pre className="text-green-400 text-sm font-mono">
              {logs.map((log, index) => (
                <div key={index} className="mb-1">{log}</div>
              ))}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdPerformanceDemo;

