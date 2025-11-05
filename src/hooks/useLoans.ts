import React, { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { loansService } from '../services/firestore/loansService';
import { Loan } from '../types';

export const useLoans = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLoans = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const userLoans = await loansService.getUserLoans(user.id);
      setLoans(userLoans);
    } catch (err: any) {
      setError(err.message);
      console.error('Error loading loans:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const createLoan = async (
    amount: number,
    term: number,
    description: string,
    rate: number
  ) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      setIsLoading(true);
      setError(null);
      
      await loansService.createLoan(user.id, amount, term, description, rate);
      await loadLoans(); // Recargar datos
      
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const registerPayment = async (loanId: string, amount: number, receiptURL?: string) => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      setIsLoading(true);
      setError(null);
      
      // ✅ Ahora pasamos los 4 parámetros requeridos
      await loansService.registerPayment(loanId, user.id, amount, receiptURL);
      await loadLoans(); // Recargar datos
      
      return true;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, [user]);

  return {
    loans,
    isLoading,
    error,
    createLoan,
    registerPayment,
    refresh: loadLoans,
  };
};