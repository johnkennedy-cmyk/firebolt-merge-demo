import { useState, useCallback } from 'react';
import type { MergeResult } from '../types';

export const useMergeOperation = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<MergeResult | null>(null);
  const [progress, setProgress] = useState(0);

  const executeMerge = useCallback(async (data: unknown[]) => {
    setIsExecuting(true);
    setProgress(0);
    setResults(null);

    try {
      const startTime = Date.now();
      
      // Simulate progressive execution
      for (let i = 0; i <= 100; i += 10) {
        setProgress(i);
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Simulate results based on operation type
      const executionTime = (Date.now() - startTime) / 1000;
      const mockResults: MergeResult = {
        executionTime: executionTime.toFixed(3),
        rowsProcessed: data.length,
        rowsInserted: Math.floor(data.length * 0.3),
        rowsUpdated: Math.floor(data.length * 0.5),
        rowsDeleted: Math.floor(data.length * 0.2),
        success: true
      };

      setResults(mockResults);
    } catch (error) {
      setResults({
        executionTime: '0',
        rowsProcessed: 0,
        rowsInserted: 0,
        rowsUpdated: 0,
        rowsDeleted: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsExecuting(false);
    }
  }, []);

  return { executeMerge, isExecuting, results, progress };
};
