// src/services/firestore/notificationsService.ts
import { supabase } from '../../config/supabase';

export type NotificationType =
  | 'loan_approved'
  | 'loan_rejected'
  | 'payment_reminder'
  | 'meeting_reminder'
  | 'saving_confirmed'
  | 'general';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  createdAt: Date;
}

class NotificationsService {
  // Crear notificación
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    actionUrl?: string
  ): Promise<string> {
    try {
      const notificationData = {
        user_id: userId,
        type,
        title,
        message,
        action_url: actionUrl,
        read: false,
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert([notificationData])
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No se pudo crear la notificación');

      return data.id;
    } catch (error: any) {
      console.error('Error creando notificación:', error);
      throw new Error('No se pudo crear la notificación');
    }
  }

  // Obtener notificaciones de un usuario
  async getUserNotifications(userId: string, maxResults: number = 50): Promise<Notification[]> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(maxResults);

      if (error) throw error;
      if (!data) return [];

      return data.map((notification) => ({
        id: notification.id,
        userId: notification.user_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: notification.read,
        actionUrl: notification.action_url,
        createdAt: new Date(notification.created_at),
      }));
    } catch (error: any) {
      console.error('Error obteniendo notificaciones:', error);
      return [];
    }
  }

  // Contar notificaciones no leídas
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return count || 0;
    } catch (error: any) {
      console.error('Error contando notificaciones:', error);
      return 0;
    }
  }

  // Marcar notificación como leída
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error marcando notificación como leída:', error);
      throw new Error('No se pudo actualizar la notificación');
    }
  }

  // Marcar todas como leídas
  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error marcando todas como leídas:', error);
      throw new Error('No se pudieron actualizar las notificaciones');
    }
  }

  // Crear notificación automática de aporte
  async notifySavingConfirmed(userId: string, amount: number): Promise<void> {
    await this.createNotification(
      userId,
      'saving_confirmed',
      '✅ Aporte Confirmado',
      `Tu aporte de ${this.formatCurrency(amount)} ha sido registrado exitosamente.`
    );
  }

  // Helper para formatear moneda
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  // Crear notificación de préstamo aprobado
  async notifyLoanApproved(userId: string, amount: number): Promise<void> {
    await this.createNotification(
      userId,
      'loan_approved',
      '🎉 Préstamo Aprobado',
      `Tu solicitud de préstamo por $${amount.toLocaleString('es-CO')} ha sido aprobada.`,
      '/loans'
    );
  }

  // Crear notificación de préstamo rechazado
  async notifyLoanRejected(userId: string): Promise<void> {
    await this.createNotification(
      userId,
      'loan_rejected',
      '❌ Préstamo Rechazado',
      'Lamentablemente tu solicitud de préstamo no fue aprobada. Contacta al administrador para más información.',
      '/loans'
    );
  }

  // Crear recordatorio de pago
  async notifyPaymentReminder(userId: string, amount: number, dueDate: Date): Promise<void> {
    await this.createNotification(
      userId,
      'payment_reminder',
      '💰 Recordatorio de Pago',
      `Tienes un pago pendiente de $${amount.toLocaleString('es-CO')} con vencimiento el ${dueDate.toLocaleDateString('es-CO')}.`,
      '/loans'
    );
  }
}

export const notificationsService = new NotificationsService();