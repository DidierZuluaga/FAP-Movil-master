// src/services/firestore/savingsService.ts
import { supabase } from '../../config/supabase';
import { Saving } from '../../types';

class SavingsService {
  // Crear aporte/ahorro
  async createSaving(
    userId: string,
    amount: number,
    description: string,
    date: Date = new Date()
  ): Promise<string> {
    try {
      const savingData = {
        user_id: userId,
        amount,
        description,
        date: date.toISOString(),
        status: 'confirmado' as const,
        synced: true,
        accumulated_balance: 0,
      };

      const { data, error } = await supabase
        .from('savings')
        .insert([savingData])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No se recibió respuesta del servidor');

      console.log('✅ Aporte creado con ID:', data.id);
      return data.id;
    } catch (error: any) {
      console.error('❌ Error al crear aporte:', error);
      throw new Error('No se pudo registrar el aporte');
    }
  }

  // Obtener ahorros de un usuario
  async getUserSavings(userId: string): Promise<Saving[]> {
    try {
      console.log('🔍 Buscando ahorros para userId:', userId);

      const { data, error } = await supabase
        .from('savings')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;

      console.log('📊 Documentos encontrados:', data?.length || 0);

      if (!data || data.length === 0) {
        console.log('⚠️ No se encontraron ahorros');
        return [];
      }

      const savings = data.map((saving) => ({
        id: saving.id,
        userId: saving.user_id,
        amount: saving.amount,
        description: saving.description,
        date: new Date(saving.date),
        receiptURL: saving.receipt_url,
        signatureURL: saving.signature_url,
        accumulatedBalance: saving.accumulated_balance || 0,
        status: saving.status || 'confirmado',
        createdAt: new Date(saving.created_at),
        synced: saving.synced || true,
      }));

      console.log('✅ Total ahorros cargados:', savings.length);
      return savings;
    } catch (error: any) {
      console.error('❌ Error al obtener ahorros:', error);
      return [];
    }
  }

  // Obtener balance total
  async getTotalBalance(userId: string): Promise<number> {
    try {
      const savings = await this.getUserSavings(userId);
      const total = savings.reduce((sum, saving) => sum + saving.amount, 0);
      console.log('💰 Balance total calculado:', total);
      return total;
    } catch (error) {
      console.error('Error calculando balance:', error);
      return 0;
    }
  }

  // Calcular intereses
  async calculateInterests(userId: string, rate: number = 0.085): Promise<number> {
    try {
      const totalBalance = await this.getTotalBalance(userId);
      const interests = Math.round(totalBalance * rate);
      console.log('📈 Intereses calculados:', interests);
      return interests;
    } catch (error) {
      console.error('Error calculando intereses:', error);
      return 0;
    }
  }
}

export const savingsService = new SavingsService();