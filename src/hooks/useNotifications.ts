import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { notificationsService, Notification } from '../services/firestore/notificationsService';

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      const [notifs, count] = await Promise.all([
        notificationsService.getUserNotifications(user.id, 10),
        notificationsService.getUnreadCount(user.id),
      ]);

      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error cargando notificaciones:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId);
      
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      await notificationsService.markAllAsRead(user.id);
      
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // Refrescar cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [user]);

  return {
    notifications,
    unreadCount,
    isLoading,
    refresh: loadNotifications,
    markAsRead,
    markAllAsRead,
  };
};