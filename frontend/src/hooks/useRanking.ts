import { useState, useEffect } from 'react';
import { RankingData } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const useRanking = () => {
  const [data, setData] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRanking = async (useCache = true) => {
    try {
      setLoading(true);
      setError(null);

      // Try to use ranking-select-main API first, fallback to main ranking API
      const endpoint = useCache ? '/dashboard/ranking/cached' : '/dashboard/ranking';
      let response = await fetch(`${API_URL}${endpoint}`);
      
      // If not found, try main ranking API
      if (!response.ok && response.status === 404) {
        response = await fetch(`${API_URL}/ranking`);
      }

      if (!response.ok) {
        throw new Error('Failed to fetch ranking data');
      }

      const rankingData = await response.json();
      setData(rankingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const refreshRanking = async () => {
    try {
      setLoading(true);
      const timestamp = new Date().getTime();
      // Try ranking-select-main refresh endpoint first
      let response = await fetch(`${API_URL}/dashboard/ranking/refresh?t=${timestamp}`, {
        method: 'POST',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      // If not found, try main ranking API
      if (!response.ok && response.status === 404) {
        response = await fetch(`${API_URL}/ranking?t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

      if (!response.ok) {
        throw new Error('Failed to refresh ranking data');
      }

      const result = await response.json();
      // Handle both response formats (ranking-select-main returns { data }, main returns direct data)
      const rankingData = result.data || result;
      setData(rankingData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRanking();

    // Auto refresh every 5 minutes
    const interval = setInterval(async () => {
      try {
        const timestamp = new Date().getTime();
        const response = await fetch(`${API_URL}/ranking?t=${timestamp}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (response.ok) {
          const result = await response.json();
          // Handle both response formats
          const rankingData = result.data || result;
          setData(rankingData);
        }
      } catch (err) {
        console.error('Auto-refresh error:', err);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, []);

  return {
    data,
    loading,
    error,
    refreshRanking,
    refetch: () => fetchRanking(false)
  };
};

