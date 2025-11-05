import { useState, useEffect } from 'react';
import { savingsService } from '../services/firestore/savingsService';
import { profileService } from '../services/firestore/profileService';
import { Saving } from '../types';
import { useAuth } from './useAuth';

export const useSavings = () => {
  const { user } = useAuth();
  const [savings, setSavings] = useState<Saving[]>([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [interests, setInterests] = useState(0);
  const [monthlyContribution, setMonthlyContribution] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAllData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      
      // Cargar todo en paralelo para mejor rendimiento
      const [userSavings, balance, calculatedInterests, monthlyContributionData] = await Promise.all([
        savingsService.getUserSavings(user.id),
        savingsService.getTotalBalance(user.id),
        savingsService.calculateInterests(user.id),
        profileService.getMonthlyContribution(user.id)
      ]);
      
      setSavings(userSavings);
      setTotalBalance(balance);
      setInterests(calculatedInterests);
      setMonthlyContribution(monthlyContributionData);
      
      console.log('✅ Datos de ahorros cargados:', {
        savings: userSavings.length,
        balance,
        interests: calculatedInterests,
        monthlyContribution: monthlyContributionData
      });
      
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading savings data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createSaving = async (amount: number, description: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      setIsLoading(true);
      setError(null);
      
      await savingsService.createSaving(user.id, amount, description);
      await loadAllData(); // Recargar todos los datos
      
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateMonthlyContribution = async (amount: number): Promise<boolean> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      setIsLoading(true);
      setError(null);
      
      await profileService.updateMonthlyContribution(user.id, amount);
      
      // Actualizar el estado local inmediatamente
      setMonthlyContribution(amount);
      
      console.log('✅ Aporte mensual actualizado en hook:', amount);
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar datos cuando el usuario cambie
  useEffect(() => {
    loadAllData();
  }, [user]);

  return {
    savings,
    totalBalance,
    interests,
    monthlyContribution,
    isLoading,
    error,
    createSaving,
    updateMonthlyContribution,
    refresh: loadAllData,
  };
};