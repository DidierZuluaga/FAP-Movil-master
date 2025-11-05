import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { savingsService } from '../services/firestore/savingsService';
import { loansService } from '../services/firestore/loansService';
import { profileService } from '../services/firestore/profileService'; // ← AÑADE ESTA IMPORTACIÓN

export const useDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState({
    balance: 0,
    interests: 0,
    activeLoans: 0,
    nextMeetings: 2,
    monthlyContribution: 0, // ← CAMBIA A 0, se cargará desde Firebase
    recentTransactions: [] as any[],
    savingsGrowth: 8.5,
  });

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Cargar datos reales de Firebase
      const [totalBalance, interests, loans, savings, monthlyContribution] = await Promise.all([
        savingsService.getTotalBalance(user.id),
        savingsService.calculateInterests(user.id),
        loansService.getUserLoans(user.id),
        savingsService.getUserSavings(user.id),
        profileService.getMonthlyContribution(user.id) // ← AÑADE ESTA LÍNEA
      ]);

      // Contar préstamos activos
      const activeLoansCount = loans.filter(
        (loan) => loan.status === 'activo' || loan.status === 'aprobado'
      ).length;

      // Convertir savings a transacciones
      const transactions = savings.slice(0, 5).map((saving) => ({
        id: saving.id,
        type: 'saving',
        amount: saving.amount,
        description: saving.description,
        date: saving.date,
      }));

      setData({
        balance: totalBalance,
        interests,
        activeLoans: activeLoansCount,
        nextMeetings: 2,
        monthlyContribution: monthlyContribution, // ← USA EL VALOR REAL
        recentTransactions: transactions,
        savingsGrowth: 8.5,
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  return {
    data,
    isLoading,
    refresh: loadDashboardData,
  };
};