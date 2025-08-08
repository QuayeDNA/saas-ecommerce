import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './use-auth';
import { orderService } from '../services/order.service';

export const useDailySpending = () => {
  const [dailySpending, setDailySpending] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { authState } = useAuth();

  const getTodayKey = () => {
    return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const getStorageKey = useCallback(() => {
    const userId = authState.user?.id || authState.user?._id || 'anonymous';
    return `dailySpending_${userId}`;
  }, [authState.user]);

  const loadDailySpending = useCallback(async () => {
    setIsLoading(true);
    try {
      const today = getTodayKey();
      const storageKey = getStorageKey();
      const storedData = localStorage.getItem(storageKey);
      
      if (storedData) {
        const { date, amount } = JSON.parse(storedData);
        
        // If it's a new day, reset to 0
        if (date !== today) {
          setDailySpending(0);
          localStorage.setItem(storageKey, JSON.stringify({ date: today, amount: 0 }));
          setIsLoading(false);
          return;
        }
        
        setDailySpending(amount);
      } else {
        // First time - start with 0 for today
        setDailySpending(0);
        localStorage.setItem(storageKey, JSON.stringify({ date: today, amount: 0 }));
      }
    } catch (error) {
      console.error('Error loading daily spending:', error);
      setDailySpending(0);
    } finally {
      setIsLoading(false);
    }
  }, [getStorageKey]);

  // Add method to sync daily spending with completed orders from backend
  const syncDailySpendingWithOrders = useCallback(async () => {
    try {
      const userId = authState.user?.id || authState.user?._id;
      if (!userId) return;

      // Get daily spending from backend (today's completed orders)
      const data = await orderService.getDailySpending();
      const backendSpending = data.dailySpending || 0;
      
      // Update local storage and state with backend data
      const today = getTodayKey();
      const storageKey = getStorageKey();
      const newData = { date: today, amount: backendSpending };
      localStorage.setItem(storageKey, JSON.stringify(newData));
      setDailySpending(backendSpending);
    } catch (error) {
      console.error('Error syncing daily spending with orders:', error);
    }
  }, [authState.user, getStorageKey]);

  const updateDailySpending = (newOrderAmount: number) => {
    const today = getTodayKey();
    const storageKey = getStorageKey();
    const newTotal = dailySpending + newOrderAmount;
    setDailySpending(newTotal);
    localStorage.setItem(storageKey, JSON.stringify({ date: today, amount: newTotal }));
  };

  const resetDailySpending = () => {
    const today = getTodayKey();
    const storageKey = getStorageKey();
    setDailySpending(0);
    localStorage.setItem(storageKey, JSON.stringify({ date: today, amount: 0 }));
  };

  useEffect(() => {
    loadDailySpending();
    // Also sync with backend to get accurate data from completed orders
    syncDailySpendingWithOrders();

    // Listen for external updates to daily spending
    const handleDailySpendingUpdate = (event: Event) => {
      const customEvent = event as CustomEvent;
      const currentUserId = authState.user?.id || authState.user?._id;
      const eventUserId = customEvent.detail?.userId;
      
      // Only update if the event is for the current user or no user specified
      if (!eventUserId || eventUserId === currentUserId) {
        const today = getTodayKey();
        const storageKey = getStorageKey();
        const storedData = localStorage.getItem(storageKey);
        
        if (storedData) {
          const { date, amount } = JSON.parse(storedData);
          if (date === today) {
            setDailySpending(amount);
          }
        }
      }
    };

    window.addEventListener('dailySpendingUpdated', handleDailySpendingUpdate);
    
    return () => {
      window.removeEventListener('dailySpendingUpdated', handleDailySpendingUpdate);
    };
  }, [loadDailySpending, syncDailySpendingWithOrders, authState.user, getStorageKey]);

  return { 
    dailySpending, 
    updateDailySpending, 
    resetDailySpending,
    loadDailySpending,
    syncDailySpendingWithOrders,
    isLoading
  };
};
