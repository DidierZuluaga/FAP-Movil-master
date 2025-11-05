import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Bell,
  CheckCheck,
  Clock,
  CreditCard,
  DollarSign,
  Calendar,
  AlertCircle,
  X,
} from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { theme } from '../../config/theme';
import { formatDate } from '../../utils/formatters';
import { notificationsService, Notification } from '../../services/firestore/notificationsService';

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'loan_approved':
    case 'loan_rejected':
      return <CreditCard size={20} color={theme.colors.primary[600]} />;
    case 'payment_reminder':
      return <DollarSign size={20} color={theme.colors.warning[600]} />;
    case 'meeting_reminder':
      return <Calendar size={20} color={theme.colors.secondary[600]} />;
    case 'saving_confirmed':
      return <CheckCheck size={20} color={theme.colors.success[600]} />;
    default:
      return <Bell size={20} color={theme.colors.gray[600]} />;
  }
};

export const NotificationsScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const [notifs, count] = await Promise.all([
        notificationsService.getUserNotifications(user.id),
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

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsService.markAsRead(notificationId);
      
      // Actualizar localmente
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marcando como leída:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      await notificationsService.markAllAsRead(user.id);
      
      // Actualizar localmente
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marcando todas como leídas:', error);
    }
  };

  const handleNotificationPress = (notification: Notification) => {
    // Marcar como leída
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Navegar si hay URL de acción
    if (notification.actionUrl) {
      navigation.navigate(notification.actionUrl);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={[theme.colors.primary[600], theme.colors.secondary[600]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <X size={24} color={theme.colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Notificaciones</Text>
          <View style={styles.placeholder} />
        </View>

        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>
              {unreadCount} sin leer
            </Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.primary[600]}
          />
        }
      >
        {unreadCount > 0 && (
          <Button
            title="Marcar todas como leídas"
            onPress={handleMarkAllAsRead}
            variant="outline"
            size="sm"
            fullWidth
            style={styles.markAllButton}
          />
        )}

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary[600]} />
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Bell size={64} color={theme.colors.gray[300]} />
            <Text style={styles.emptyTitle}>No tienes notificaciones</Text>
            <Text style={styles.emptyText}>
              Aquí aparecerán tus notificaciones importantes
            </Text>
          </View>
        ) : (
          <>
            {/* Notificaciones no leídas */}
            {notifications.filter(n => !n.read).length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Nuevas</Text>
                {notifications
                  .filter(n => !n.read)
                  .map(notification => (
                    <TouchableOpacity
                      key={notification.id}
                      onPress={() => handleNotificationPress(notification)}
                    >
                      <Card style={styles.notificationCard} variant="elevated">
                        <View style={styles.notificationContent}>
                          <View style={[
                            styles.iconContainer,
                            !notification.read && styles.iconContainerUnread
                          ]}>
                            {getNotificationIcon(notification.type)}
                          </View>

                          <View style={styles.notificationText}>
                            <Text style={[
                              styles.notificationTitle,
                              !notification.read && styles.notificationTitleUnread
                            ]}>
                              {notification.title}
                            </Text>
                            <Text style={styles.notificationMessage}>
                              {notification.message}
                            </Text>
                            <View style={styles.notificationMeta}>
                              <Clock size={12} color={theme.colors.gray[500]} />
                              <Text style={styles.notificationTime}>
                                {formatDate(notification.createdAt, 'dd MMM, HH:mm')}
                              </Text>
                            </View>
                          </View>

                          {!notification.read && (
                            <View style={styles.unreadDot} />
                          )}
                        </View>
                      </Card>
                    </TouchableOpacity>
                  ))}
              </>
            )}

            {/* Notificaciones leídas */}
            {notifications.filter(n => n.read).length > 0 && (
              <>
                <Text style={styles.sectionTitle}>Anteriores</Text>
                {notifications
                  .filter(n => n.read)
                  .map(notification => (
                    <TouchableOpacity
                      key={notification.id}
                      onPress={() => handleNotificationPress(notification)}
                    >
                      <Card style={styles.notificationCard} variant="outlined">
                        <View style={styles.notificationContent}>
                          <View style={styles.iconContainer}>
                            {getNotificationIcon(notification.type)}
                          </View>

                          <View style={styles.notificationText}>
                            <Text style={styles.notificationTitle}>
                              {notification.title}
                            </Text>
                            <Text style={styles.notificationMessage}>
                              {notification.message}
                            </Text>
                            <View style={styles.notificationMeta}>
                              <Clock size={12} color={theme.colors.gray[500]} />
                              <Text style={styles.notificationTime}>
                                {formatDate(notification.createdAt, 'dd MMM, HH:mm')}
                              </Text>
                            </View>
                          </View>
                        </View>
                      </Card>
                    </TouchableOpacity>
                  ))}
              </>
            )}
          </>
        )}

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.gray[50],
  },
  header: {
    paddingTop: 60,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.white,
  },
  placeholder: {
    width: 24,
  },
  unreadBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
    marginTop: theme.spacing.sm,
  },
  unreadText: {
    color: theme.colors.white,
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  markAllButton: {
    marginBottom: theme.spacing.md,
  },
  loadingContainer: {
    paddingVertical: theme.spacing.xl * 2,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: theme.spacing.xl * 2,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.gray[900],
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: theme.fontSize.sm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.gray[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  notificationCard: {
    marginBottom: theme.spacing.sm,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerUnread: {
    backgroundColor: theme.colors.primary[100],
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.gray[700],
    marginBottom: 4,
  },
  notificationTitleUnread: {
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.gray[900],
  },
  notificationMessage: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.gray[600],
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  notificationMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notificationTime: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.gray[500],
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary[600],
  },
  bottomSpacing: {
    height: 40,
  },
});