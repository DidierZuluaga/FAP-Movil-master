// src/services/firestore/loansService.ts
import { supabase } from '../../config/supabase';
import { Loan, Payment } from '../../types';

class LoansService {
  // Crear solicitud de préstamo
  async createLoan(
    userId: string,
    amount: number,
    term: number,
    description: string,
    rate: number,
    codeudorId?: string
  ): Promise<string> {
    try {
      console.log('📝 Creando préstamo:', { userId, amount, term, rate });

      // Calcular cuota mensual usando fórmula de amortización
      const monthlyRate = rate / 100 / 12;
      const monthlyPayment = Math.round(
        (amount * monthlyRate * Math.pow(1 + monthlyRate, term)) /
        (Math.pow(1 + monthlyRate, term) - 1)
      );

      console.log('💰 Cuota mensual calculada:', monthlyPayment);

      const loanData = {
        user_id: userId,
        codeudor_id: codeudorId || null,
        amount,
        balance: amount,
        term,
        interest_rate: rate,
        monthly_payment: monthlyPayment,
        description,
        status: 'pendiente' as const,
        codeudor_status: codeudorId ? ('pending' as const) : null,
      };

      console.log('📤 Enviando a Supabase...');
      
      const { data, error } = await supabase
        .from('loans')
        .insert([loanData])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No se recibió respuesta del servidor');

      console.log('✅ Préstamo creado con ID:', data.id);
      return data.id;
    } catch (error: any) {
      console.error('❌ Error al crear préstamo:', error);
      throw new Error(`No se pudo solicitar el préstamo: ${error.message}`);
    }
  }

  // Obtener préstamos de un usuario
  async getUserLoans(userId: string): Promise<Loan[]> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('user_id', userId)
        .order('request_date', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map((loan) => ({
        id: loan.id,
        userId: loan.user_id,
        codeudorId: loan.codeudor_id,
        amount: loan.amount,
        balance: loan.balance,
        term: loan.term,
        interestRate: loan.interest_rate,
        monthlyPayment: loan.monthly_payment,
        status: loan.status,
        description: loan.description,
        requestDate: new Date(loan.request_date),
        approvalDate: loan.approval_date ? new Date(loan.approval_date) : undefined,
        codeudorStatus: loan.codeudor_status,
        documentsURL: loan.documents_url,
        createdAt: new Date(loan.created_at),
        updatedAt: new Date(loan.updated_at),
      }));
    } catch (error: any) {
      console.error('Error al obtener préstamos:', error);
      return [];
    }
  }

  // Obtener todos los préstamos (admin)
  async getAllLoans(): Promise<Loan[]> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .order('request_date', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      console.log(`📊 Cargados ${data.length} préstamos del sistema`);

      return data.map((loan) => ({
        id: loan.id,
        userId: loan.user_id,
        codeudorId: loan.codeudor_id,
        amount: loan.amount,
        balance: loan.balance,
        term: loan.term,
        interestRate: loan.interest_rate,
        monthlyPayment: loan.monthly_payment,
        status: loan.status,
        description: loan.description,
        requestDate: new Date(loan.request_date),
        approvalDate: loan.approval_date ? new Date(loan.approval_date) : undefined,
        codeudorStatus: loan.codeudor_status,
        documentsURL: loan.documents_url,
        createdAt: new Date(loan.created_at),
        updatedAt: new Date(loan.updated_at),
      }));
    } catch (error: any) {
      console.error('Error al obtener todos los préstamos:', error);
      return [];
    }
  }

  // Registrar abono/pago
  async registerPayment(
    loanId: string,
    userId: string,
    amount: number,
    receiptURL?: string
  ): Promise<string> {
    try {
      // Obtener préstamo actual
      const { data: loanData, error: loanError } = await supabase
        .from('loans')
        .select('balance')
        .eq('id', loanId)
        .single();

      if (loanError || !loanData) {
        throw new Error('Préstamo no encontrado');
      }

      const currentBalance = loanData.balance;
      const newBalance = Math.max(0, currentBalance - amount);

      // Crear registro de pago
      const paymentData = {
        loan_id: loanId,
        user_id: userId,
        amount,
        new_balance: newBalance,
        receipt_url: receiptURL || null,
        status: 'confirmado' as const,
      };

      const { data: payment, error: paymentError } = await supabase
        .from('payments')
        .insert([paymentData])
        .select()
        .single();

      if (paymentError) throw paymentError;
      if (!payment) throw new Error('No se pudo crear el pago');

      // Actualizar saldo del préstamo
      const updateData: any = {
        balance: newBalance,
      };

      // Si el saldo llega a 0, marcar como pagado
      if (newBalance === 0) {
        updateData.status = 'pagado';
      }

      const { error: updateError } = await supabase
        .from('loans')
        .update(updateData)
        .eq('id', loanId);

      if (updateError) throw updateError;

      console.log('✅ Pago registrado:', payment.id);
      return payment.id;
    } catch (error: any) {
      console.error('❌ Error al registrar pago:', error);
      throw new Error('No se pudo registrar el abono. Intenta de nuevo.');
    }
  }

  // Obtener historial de pagos de un préstamo
  async getLoanPayments(loanId: string): Promise<Payment[]> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('loan_id', loanId)
        .order('date', { ascending: false });

      if (error) throw error;
      if (!data) return [];

      return data.map((payment) => ({
        id: payment.id,
        loanId: payment.loan_id,
        userId: payment.user_id,
        amount: payment.amount,
        date: new Date(payment.date),
        newBalance: payment.new_balance,
        receiptURL: payment.receipt_url,
        status: payment.status,
        createdAt: new Date(payment.created_at),
      }));
    } catch (error: any) {
      console.error('Error al obtener pagos:', error);
      return [];
    }
  }

  // Actualizar estado del préstamo (admin)
  async updateLoanStatus(
    loanId: string,
    status: 'pendiente' | 'aprobado' | 'rechazado' | 'activo' | 'pagado'
  ): Promise<void> {
    try {
      const updateData: any = {
        status,
      };

      if (status === 'aprobado' || status === 'activo') {
        updateData.approval_date = new Date().toISOString();
      }

      const { error } = await supabase
        .from('loans')
        .update(updateData)
        .eq('id', loanId);

      if (error) throw error;

      console.log('✅ Estado del préstamo actualizado');
    } catch (error: any) {
      console.error('❌ Error al actualizar estado:', error);
      throw new Error('No se pudo actualizar el estado del préstamo.');
    }
  }

  // Obtener préstamos activos de un usuario
  async getActiveLoans(userId: string): Promise<Loan[]> {
    try {
      const allLoans = await this.getUserLoans(userId);
      return allLoans.filter(
        loan => loan.status === 'activo' || loan.status === 'aprobado'
      );
    } catch (error: any) {
      console.error('Error al obtener préstamos activos:', error);
      return [];
    }
  }

  // Calcular próxima fecha de pago (aproximada)
  getNextPaymentDate(loan: Loan): Date {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 6);
    return nextMonth;
  }

  // Aprobar préstamo (para administradores)
  async approveLoan(loanId: string): Promise<void> {
    try {
      console.log('✅ Aprobando préstamo:', loanId);

      const { error } = await supabase
        .from('loans')
        .update({
          status: 'activo',
          approval_date: new Date().toISOString(),
        })
        .eq('id', loanId);

      if (error) throw error;

      console.log('✅ Préstamo aprobado exitosamente');
    } catch (error: any) {
      console.error('❌ Error aprobando préstamo:', error);
      throw new Error('No se pudo aprobar el préstamo');
    }
  }

  // Rechazar préstamo (para administradores)
  async rejectLoan(loanId: string, reason?: string): Promise<void> {
    try {
      console.log('❌ Rechazando préstamo:', loanId);

      const { error } = await supabase
        .from('loans')
        .update({
          status: 'rechazado',
        })
        .eq('id', loanId);

      if (error) throw error;

      console.log('✅ Préstamo rechazado exitosamente');
    } catch (error: any) {
      console.error('❌ Error rechazando préstamo:', error);
      throw new Error('No se pudo rechazar el préstamo');
    }
  }

  // Obtener todos los préstamos pendientes (para administradores)
  async getPendingLoans(): Promise<Loan[]> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('status', 'pendiente')
        .order('request_date', { ascending: true });

      if (error) throw error;
      if (!data) return [];

      return data.map((loan) => ({
        id: loan.id,
        userId: loan.user_id,
        codeudorId: loan.codeudor_id,
        amount: loan.amount,
        balance: loan.balance,
        term: loan.term,
        interestRate: loan.interest_rate,
        monthlyPayment: loan.monthly_payment,
        status: loan.status,
        description: loan.description,
        requestDate: new Date(loan.request_date),
        approvalDate: loan.approval_date ? new Date(loan.approval_date) : undefined,
        codeudorStatus: loan.codeudor_status,
        documentsURL: loan.documents_url,
        createdAt: new Date(loan.created_at),
        updatedAt: new Date(loan.updated_at),
      }));
    } catch (error: any) {
      console.error('Error al obtener préstamos pendientes:', error);
      return [];
    }
  }
}

export const loansService = new LoansService();  