import { useDashboard } from '../../hooks/useDashboard';
import { useNotifications } from '../../hooks/useNotifications';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Calendar,
  Bell,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  User,
  BarChart3,
  Target,
  Zap,
} from 'lucide-react-native';
import { useAuth } from '../../hooks/useAuth';
import { Card } from '../../components/common/Card';
import { theme } from '../../config/theme';
import { formatCurrency, formatDate } from '../../utils/formatters';

const { width } = Dimensions.get('window');

export const DashboardScreen = ({ navigation }: any) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [animatedValues] = useState({
    balance: new Animated.Value(0),
    cards: new Animated.Value(0),
    notifications: new Animated.Value(0),
  });

  const { data: dashboardData, isLoading: loadingData, refresh } = useDashboard();
  const { unreadCount } = useNotifications();
  
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('🔄 Dashboard: Recargando datos...');
      refresh();
    });

    return unsubscribe;
  }, [navigation, refresh]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(animatedValues.balance, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(animatedValues.cards, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
      Animated.spring(animatedValues.notifications, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }),
    ]).start();
  }, []);
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.colors.primary[600]}
        />
      }
    >
      {/* Header Mejorado */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.userInfo}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'Usuario'}</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('Notifications')}
            >
              <Bell size={24} color={theme.colors.white} />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.iconButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <User size={24} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Principal Mejorado */}
        <Animated.View
          style={[
            styles.balanceContainer,
            {
              opacity: animatedValues.balance,
              transform: [
                {
                  translateY: animatedValues.balance.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Saldo Total</Text>
            <View style={styles.growthBadge}>
              <TrendingUp size={14} color="#10B981" />
              <Text style={styles.growthText}>+{dashboardData.savingsGrowth || 8.5}%</Text>
            </View>
          </View>
          <Text style={styles.balanceAmount}>
            {formatCurrency(dashboardData.balance || 0)}
          </Text>
          <View style={styles.interestsContainer}>
            <Text style={styles.interestsText}>
              Intereses: {formatCurrency(dashboardData.interests || 0)}
            </Text>
          </View>
        </Animated.View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Acciones Rápidas Mejoradas */}
        <Card style={styles.quickActionsCard}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('Savings')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                <Plus size={24} color="#10B981" />
              </View>
              <Text style={styles.actionText}>Aportar</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('Loans')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <CreditCard size={24} color="#EF4444" />
              </View>
              <Text style={styles.actionText}>Préstamo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('Reports')}
            >
              <View style={[styles.actionIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                <BarChart3 size={24} color="#6366F1" />
              </View>
              <Text style={styles.actionText}>Reportes</Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Métricas Principales Mejoradas */}
        <Animated.View
          style={[
            {
              opacity: animatedValues.cards,
              transform: [
                {
                  translateY: animatedValues.cards.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.metricsGrid}>
            <TouchableOpacity 
              onPress={() => navigation.navigate('MonthlyContributionConfig')}
            >
              <Card style={{...styles.metricCard, ...styles.savingsCard}}>
                <View style={[styles.metricIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <DollarSign size={24} color="#10B981" />
                </View>
                <Text style={styles.metricValue}>
                  {formatCurrency(dashboardData.monthlyContribution || 0)}
                </Text>
                <Text style={styles.metricLabel}>Aporte Mensual</Text>
                <Text style={styles.configHint}>Toca para configurar</Text>
                <View style={[styles.trendIndicator, { backgroundColor: '#10B981' }]} />
              </Card>
            </TouchableOpacity>

            <Card style={{...styles.metricCard, ...styles.loansCard}}>
              <View style={[styles.metricIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                <CreditCard size={24} color="#EF4444" />
              </View>
              <Text style={styles.metricValue}>{dashboardData.activeLoans || 0}</Text>
              <Text style={styles.metricLabel}>Préstamos Activos</Text>
              <View style={[styles.trendIndicator, { backgroundColor: '#EF4444' }]} />
            </Card>

            <Card style={{...styles.metricCard, ...styles.growthCard}}>
              <View style={[styles.metricIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                <TrendingUp size={24} color="#F59E0B" />
              </View>
              <Text style={styles.metricValue}>+{dashboardData.savingsGrowth || 8.5}%</Text>
              <Text style={styles.metricLabel}>Crecimiento</Text>
              <View style={[styles.trendIndicator, { backgroundColor: '#F59E0B' }]} />
            </Card>

            <Card style={{...styles.metricCard, ...styles.targetCard}}>
              <View style={[styles.metricIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                <Target size={24} color="#6366F1" />
              </View>
              <Text style={styles.metricValue}>
                {formatCurrency((dashboardData.balance || 0) * 1.2)}
              </Text>
              <Text style={styles.metricLabel}>Meta 6 Meses</Text>
              <View style={[styles.trendIndicator, { backgroundColor: '#6366F1' }]} />
            </Card>
          </View>
        </Animated.View>

        {/* Movimientos Recientes Mejorados */}
        <Animated.View
          style={[
            {
              opacity: animatedValues.notifications,
              transform: [
                {
                  translateY: animatedValues.notifications.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Card style={styles.transactionsCard}>
            <View style={styles.transactionsHeader}>
              <Text style={styles.sectionTitle}>Movimientos Recientes</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Savings')}>
                <Text style={styles.seeAllLink}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            {dashboardData.recentTransactions && dashboardData.recentTransactions.length > 0 ? (
              dashboardData.recentTransactions.slice(0, 3).map((transaction) => (
                <View key={transaction.id} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <View style={[
                      styles.transactionIcon,
                      { 
                        backgroundColor: transaction.amount > 0 
                          ? 'rgba(16, 185, 129, 0.1)' 
                          : 'rgba(239, 68, 68, 0.1)' 
                      }
                    ]}>
                      {transaction.amount > 0 ? (
                        <ArrowDownRight size={16} color="#10B981" />
                      ) : (
                        <ArrowUpRight size={16} color="#EF4444" />
                      )}
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionDescription}>
                        {transaction.description}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(transaction.date, 'dd MMM yyyy')}
                      </Text>
                    </View>
                  </View>
                  <Text style={[
                    styles.transactionAmount,
                    { color: transaction.amount > 0 ? '#10B981' : '#EF4444' }
                  ]}>
                    {transaction.amount > 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Zap size={48} color={theme.colors.gray[400]} />
                <Text style={styles.emptyStateText}>No hay movimientos recientes</Text>
                <Text style={styles.emptyStateSubtext}>
                  Realiza tu primer aporte para comenzar
                </Text>
              </View>
            )}
          </Card>
        </Animated.View>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: 40,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  userInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 16,
    color: theme.colors.white,
    opacity: 0.9,
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.white,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  balanceContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
},
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  balanceLabel: {
    fontSize: 16,
    color: theme.colors.white,
    opacity: 0.9,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  growthText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: 'bold',
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.white,
    marginBottom: 8,
  },
  interestsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  interestsText: {
    fontSize: 14,
    color: theme.colors.white,
    opacity: 0.9,
  },
  content: {
    padding: theme.spacing.lg,
    marginTop: -20,
  },
  quickActionsCard: {
    padding: 20,
    marginBottom: 20,
    borderRadius: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.gray[900],
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionItem: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.gray[700],
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  metricCard: {
    width: (width - 48) / 2 - 6,
    padding: 16,
    borderRadius: 16,
    position: 'relative',
  },
  savingsCard: {
    backgroundColor: '#F0FDF9',
    borderColor: '#10B981',
  },
  loansCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  growthCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  targetCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.gray[900],
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: theme.colors.gray[600],
    textAlign: 'center',
  },
  trendIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  configHint: {
    fontSize: 10,
    color: '#10B981',
    marginTop: 4,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  transactionsCard: {
    padding: 20,
    borderRadius: 16,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllLink: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  transactionInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray[800],
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: theme.colors.gray[500],
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: theme.colors.gray[600],
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: theme.colors.gray[500],  
},
  bottomSpacing: {
    height: 40,
  },
});