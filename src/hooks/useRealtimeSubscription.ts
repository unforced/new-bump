import { useState, useEffect, useRef } from 'react';
import { supabase, isDevelopment } from '../utils/supabaseClient';
import { logError } from '../utils/supabaseClient';

interface SubscriptionOptions {
  table: string;
  filter?: string;
  filterValue?: string | number | boolean;
  pollingInterval?: number; // in milliseconds
}

type SupabaseRecord = {
  id: string;
  [key: string]: any;
};

/**
 * Custom hook for fetching data with polling
 * Note: Full realtime subscription will be implemented in a future PR
 */
export function useDataSubscription<T extends SupabaseRecord>(
  options: SubscriptionOptions
): {
  data: T[];
  isLoading: boolean;
  error: string | null;
} {
  const {
    table,
    filter,
    filterValue,
    pollingInterval = 5000, // Default to 5 seconds
  } = options;

  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to store mutable values that shouldn't trigger re-renders
  const pollingIntervalRef = useRef<number | null>(null);
  const isMountedRef = useRef<boolean>(true);

  // Function to fetch data
  const fetchData = async () => {
    try {
      let query = supabase.from(table).select('*');

      // Apply filter if provided
      if (filter && filterValue !== undefined) {
        query = query.eq(filter, filterValue);
      }

      const { data: fetchedData, error: fetchError } = await query;

      if (fetchError) {
        throw fetchError;
      }

      if (isMountedRef.current) {
        setData(fetchedData as T[]);
        setIsLoading(false);
      }
    } catch (err) {
      if (isMountedRef.current) {
        logError(`Error fetching data from ${table}`, err);
        setError('Failed to fetch data. Please try again.');
        setIsLoading(false);
      }
    }
  };

  // Setup polling
  useEffect(() => {
    isMountedRef.current = true;
    setIsLoading(true);
    
    // Initial data fetch
    fetchData();

    // Set up polling
    pollingIntervalRef.current = window.setInterval(fetchData, pollingInterval);

    // Cleanup function
    return () => {
      isMountedRef.current = false;
      
      // Clean up polling interval
      if (pollingIntervalRef.current !== null) {
        window.clearInterval(pollingIntervalRef.current);
      }
    };
  }, [table, filter, filterValue, pollingInterval]);

  return { data, isLoading, error };
} 