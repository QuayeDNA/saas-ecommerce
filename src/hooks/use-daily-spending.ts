import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { orderService } from '../services/order.service';

export const useDailySpending = () => {
  const [dailySpending, setDailySpending] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();

  // Fetch daily spending from backend
  const loadDailySpending = useCallback(async () => {
    setIsLoading(true);
    try {
      const userId = authState.user?.id || authState.user?._id;
      if (!userId) {
        setDailySpending(0);
        setIsLoading(false);
        return;
      }

      const data = await orderService.getDailySpending();
      setDailySpending(data.dailySpending || 0);
    } catch (error) {
      console.error('Error loading daily spending:', error);
      setDailySpending(0);
    } finally {
      setIsLoading(false);
    }
  }, [authState.user]);

  // Refresh daily spending (can be called manually)
  const refreshDailySpending = useCallback(async () => {
    await loadDailySpending();
  }, [loadDailySpending]);

  useEffect(() => {
    loadDailySpending();

    // Listen for order updates to refresh daily spending
    const handleOrderUpdate = () => {
      // Refresh after a short delay to ensure backend is updated
      setTimeout(() => {
        loadDailySpending();
      }, 1000);
    };

    // Listen for various order events that might affect daily spending
    window.addEventListener('orderCompleted', handleOrderUpdate);
    window.addEventListener('orderCreated', handleOrderUpdate);
    window.addEventListener('dailySpendingUpdated', handleOrderUpdate);
    
    return () => {
      window.removeEventListener('orderCompleted', handleOrderUpdate);
      window.removeEventListener('orderCreated', handleOrderUpdate);
      window.removeEventListener('dailySpendingUpdated', handleOrderUpdate);
    };
  }, [loadDailySpending]);

  return { 
    dailySpending, 
    refreshDailySpending,
    loadDailySpending,
    isLoading
  };
};
