import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Dimensions,
  Platform,
  Alert as RNAlert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Download,
  Share2,
  TrendingUp,
  DollarSign,
  CreditCard,
  Calendar,
  BarChart3,
} from 'lucide-react-native';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { theme } from '../../config/theme';
import { formatCurrency } from '../../utils/formatters';
import { useAuth } from '../../hooks/useAuth';
import { savingsService } from '../../services/firestore/savingsService';
import { loansService } from '../../services/firestore/loansService';
import { reportsService } from '../../services/reports/reportsService';

const { width } = Dimensions.get('window');
const CHART_MAX_HEIGHT = 150; // Altura máxima fija para la gráfica

export const ReportsScreen = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const [reportData, setReportData] = useState({
    summary: {
      totalSavings: 0,
      totalLoans: 0,
      totalInterests: 0,
      transactions: 0,
    },
    monthlyData: [] as Array<{ month: string; amount: number; fullMonth: string }>,
    distribution: [] as Array<{ category: string; amount: number; color: string }>,
  });

  // Cargar datos del reporte - VERSIÓN MEJORADA
  const loadReportData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const [totalSavings, interests, savings, loans] = await Promise.all([
        savingsService.getTotalBalance(user.id),
        savingsService.calculateInterests(user.id),
        savingsService.getUserSavings(user.id),
        loansService.getUserLoans(user.id),
      ]);

      // Calcular préstamos activos
      const activeLoans = loans.filter(l => l.status === 'activo' || l.status === 'aprobado');
      const totalLoansBalance = activeLoans.reduce((sum, loan) => sum + (loan.balance || loan.amount || 0), 0);

      // MEJORADO: Agrupar ahorros por mes correctamente
      const monthlyMap = new Map<string, number>();
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      
      savings.forEach(saving => {
        if (saving.status === 'confirmado') {
          try {
            const date = saving.date && typeof saving.date === 'object' && 'toDate' in saving.date 
  ? (saving.date as any).toDate() 
  : new Date(saving.date as any);
            if (!isNaN(date.getTime())) {
              const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
              monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + (saving.amount || 0));
            }
          } catch (error) {
            console.warn('Error procesando fecha del ahorro:', saving.date);
          }
        }
      });

      // MEJORADO: Obtener últimos 6 meses con datos reales y consistentes
      const now = new Date();
      const monthlyData = [];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = `${monthNames[date.getMonth()]} ${date.getFullYear().toString().slice(2)}`;
        const fullMonthKey = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        
        monthlyData.push({
          month: monthNames[date.getMonth()],
          amount: monthlyMap.get(fullMonthKey) || 0,
          fullMonth: monthKey
        });
      }

      // Distribución con colores más vibrantes
      const distribution = [
        { 
          category: 'Ahorros', 
          amount: totalSavings, 
          color: '#10B981' // Verde vibrante
        },
        { 
          category: 'Préstamos', 
          amount: totalLoansBalance, 
          color: '#EF4444' // Rojo vibrante
        },
        { 
          category: 'Intereses', 
          amount: interests, 
          color: '#F59E0B' // Amber vibrante
        },
      ].filter(item => item.amount > 0); // Solo mostrar categorías con valor

      setReportData({
        summary: {
          totalSavings,
          totalLoans: totalLoansBalance,
          totalInterests: interests,
          transactions: savings.length + loans.length,
        },
        monthlyData,
        distribution,
      });
    } catch (error) {
      console.error('Error cargando datos del reporte:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [user]);

  // MEJORADO: Cálculo de altura de barras CORREGIDO
  const calculateBarHeight = (amount: number) => {
    if (amount === 0) return 0;
    
    const amounts = reportData.monthlyData.map(d => d.amount);
    const maxAmount = Math.max(...amounts, 100000); // Mínimo 100,000 para buena visualización
    
    // Calcular porcentaje del máximo
    const percentage = (amount / maxAmount) * 100;
    
    // Aplicar altura mínima solo si el valor es mayor que 0
    const minHeightPercentage = 10; // 10% de altura mínima para valores no cero
    const calculatedHeight = Math.max(percentage, minHeightPercentage);
    
    // Convertir a píxeles basado en la altura máxima del chart
    return (calculatedHeight / 100) * CHART_MAX_HEIGHT;
  };

  // Exportar PDF
  const handleExportPDF = async () => {
    if (!user) return;

    try {
      setIsExporting(true);

      const total = reportData.distribution.reduce((sum, item) => sum + item.amount, 0);
      
      await reportsService.exportToPDF({
        userName: user.name || 'Usuario',
        userEmail: user.email || '',
        totalSavings: reportData.summary.totalSavings,
        totalLoans: reportData.summary.totalLoans,
        totalInterests: reportData.summary.totalInterests,
        transactions: reportData.summary.transactions,
        generatedDate: new Date(),
        monthlyData: reportData.monthlyData,
        distribution: reportData.distribution.map(item => ({
          category: item.category,
          amount: item.amount,
          percentage: total > 0 ? (item.amount / total) * 100 : 0,
        })),
      });

      if (Platform.OS === 'web') {
        alert('✅ PDF generado exitosamente');
      } else {
        RNAlert.alert('Éxito', 'PDF generado y compartido exitosamente');
      }
    } catch (error) {
      console.error('Error exportando PDF:', error);
      if (Platform.OS === 'web') {
        alert('❌ Error al generar el PDF. Intenta de nuevo.');
      } else {
        RNAlert.alert('Error', 'No se pudo generar el PDF. Intenta de nuevo.');
      }
    } finally {
      setIsExporting(false);
    }
  };

  // Compartir reporte
  const handleShare = async () => {
    if (!user) return;

    try {
      setIsSharing(true);

      const total = reportData.distribution.reduce((sum, item) => sum + item.amount, 0);

      await reportsService.shareAsText({
        userName: user.name || 'Usuario',
        userEmail: user.email || '',
        totalSavings: reportData.summary.totalSavings,
        totalLoans: reportData.summary.totalLoans,
        totalInterests: reportData.summary.totalInterests,
        transactions: reportData.summary.transactions,
        generatedDate: new Date(),
        monthlyData: reportData.monthlyData,
        distribution: reportData.distribution.map(item => ({
          category: item.category,
          amount: item.amount,
          percentage: total > 0 ? (item.amount / total) * 100 : 0,
        })),
      });
    } catch (error) {
      console.error('Error compartiendo reporte:', error);
      if (Platform.OS === 'web') {
        alert('❌ Error al compartir. Intenta de nuevo.');
      } else {
        RNAlert.alert('Error', 'No se pudo compartir el reporte. Intenta de nuevo.');
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Mejorado */}
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <BarChart3 size={32} color={theme.colors.white} />
          <Text style={styles.headerTitle}>Reportes Financieros</Text>
          <Text style={styles.headerSubtitle}>
            Análisis detallado de tu progreso
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {isLoading ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator 
              size="large" 
              color={theme.colors.primary[600]} 
            />
            <Text style={styles.loaderText}>Cargando tus reportes...</Text>
          </View>
        ) : (
          <>
            {/* Summary Cards Mejoradas */}
            <View style={styles.summaryGrid}>
              <Card style={{...styles.summaryCard, ...styles.savingsCard}}>
                <View style={[styles.summaryIcon, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                  <DollarSign size={24} color="#10B981" />
                </View>
                <Text style={styles.summaryValue}>
                  {formatCurrency(reportData.summary.totalSavings)}
                </Text>
                <Text style={styles.summaryLabel}>Total Ahorrado</Text>
                <View style={[styles.trendIndicator, { backgroundColor: '#10B981' }]} />
              </Card>

              <Card style={{...styles.summaryCard, ...styles.loansCard}}>
                <View style={[styles.summaryIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                  <CreditCard size={24} color="#EF4444" />
                </View>
                <Text style={styles.summaryValue}>
                  {formatCurrency(reportData.summary.totalLoans)}
                </Text>
                <Text style={styles.summaryLabel}>Préstamos Activos</Text>
                <View style={[styles.trendIndicator, { backgroundColor: '#EF4444' }]} />
              </Card>

              <Card style={{...styles.summaryCard, ...styles.interestCard}}>
                <View style={[styles.summaryIcon, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                  <TrendingUp size={24} color="#F59E0B" />
                </View>
                <Text style={styles.summaryValue}>
                  {formatCurrency(reportData.summary.totalInterests)}
                </Text>
                <Text style={styles.summaryLabel}>Intereses Generados</Text>
                <View style={[styles.trendIndicator, { backgroundColor: '#F59E0B' }]} />
              </Card>

              <Card style={{...styles.summaryCard, ...styles.transactionsCard}}>
                <View style={[styles.summaryIcon, { backgroundColor: 'rgba(99, 102, 241, 0.1)' }]}>
                  <Calendar size={24} color="#6366F1" />
                </View>
                <Text style={styles.summaryValue}>
                  {reportData.summary.transactions}
                </Text>
                <Text style={styles.summaryLabel}>Total Transacciones</Text>
                <View style={[styles.trendIndicator, { backgroundColor: '#6366F1' }]} />
              </Card>
            </View>

            {/* Gráfica de Barras CORREGIDA */}
            <Card style={styles.chartCard}>
              <View style={styles.chartHeader}>
                <Text style={styles.chartTitle}>Evolución de Ahorros Mensuales</Text>
                <Text style={styles.chartSubtitle}>Últimos 6 meses</Text>
              </View>
              
              <View style={styles.chartContainer}>
                <View style={styles.chart}>
                  {reportData.monthlyData.map((item, index) => {
                    const barHeight = calculateBarHeight(item.amount);
                    const isZero = item.amount === 0;
                    
                    return (
                      <View key={index} style={styles.barColumn}>
                        <View style={styles.barWrapper}>
                          {/* Línea de guía */}
                          <View style={styles.guideLine} />
                          
                          {/* Barra principal */}
                          <View
                            style={[
                              styles.barFill,
                              {
                                height: barHeight,
                                backgroundColor: isZero ? '#E5E7EB' : '#3B82F6',
                                opacity: isZero ? 0.5 : 1,
                              },
                            ]}
                          >
                            {!isZero && barHeight > 25 && (
                              <Text style={styles.barValue}>
                                {item.amount >= 1000000 
                                  ? `$${(item.amount / 1000000).toFixed(1)}M`
                                  : item.amount >= 1000
                                  ? `$${(item.amount / 1000).toFixed(0)}K`
                                  : `$${item.amount}`
                                }
                              </Text>
                            )}
                          </View>
                        </View>
                        
                        {/* Etiqueta del mes */}
                        <View style={styles.monthLabel}>
                          <Text style={[
                            styles.barLabel,
                            isZero && styles.zeroLabel
                          ]}>
                            {item.month}
                          </Text>
                          <Text style={styles.barAmount}>
                            {formatCurrency(item.amount)}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
                
                {/* Eje Y personalizado */}
                <View style={styles.yAxis}>
                  <Text style={styles.yAxisLabel}>$2M</Text>
                  <Text style={styles.yAxisLabel}>$1.5M</Text>
                  <Text style={styles.yAxisLabel}>$1M</Text>
                  <Text style={styles.yAxisLabel}>$500K</Text>
                  <Text style={styles.yAxisLabel}>$0</Text>
                </View>
              </View>
            </Card>

            {/* Distribución Financiera Mejorada */}
            <Card style={styles.distributionCard}>
              <Text style={styles.chartTitle}>Distribución Financiera</Text>
              
              <View style={styles.pieContainer}>
                {reportData.distribution.map((item, index) => {
                  const total = reportData.distribution.reduce((sum, i) => sum + i.amount, 0);
                  const percentage = total > 0 ? (item.amount / total) * 100 : 0;
                  
                  return (
                    <View key={index} style={styles.pieItem}>
                      <View style={styles.pieItemHeader}>
                        <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                        <View style={styles.pieItemInfo}>
                          <Text style={styles.pieItemLabel}>{item.category}</Text>
                          <Text style={styles.pieItemValue}>
                            {formatCurrency(item.amount)}
                          </Text>
                        </View>
                        <Text style={styles.pieItemPercentage}>
                          {percentage.toFixed(1)}%
                        </Text>
                      </View>
                      <View style={styles.pieItemBar}>
                        <View
                          style={[
                            styles.pieItemFill,
                            { 
                              width: `${percentage}%`, 
                              backgroundColor: item.color,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>

            {/* Acciones de Exportación Mejoradas */}
            <View style={styles.actions}>
              <Button
                title={isExporting ? "Generando PDF..." : "📄 Exportar PDF"}
                onPress={handleExportPDF}
                variant="primary"
                style={{...styles.actionButton, ...styles.exportButton}}
                loading={isExporting}
                disabled={isExporting}
              />

              <Button
                title={isSharing ? "Compartiendo..." : "📤 Compartir Reporte"}
                onPress={handleShare}
                variant="outline"
                style={{...styles.actionButton, ...styles.shareButton}}
                loading={isSharing}
                disabled={isSharing}
              />
            </View>

            {/* Análisis Automático Mejorado */}
            <Card style={styles.infoCard}>
              <View style={styles.infoHeader}>
                <Text style={styles.infoIcon}>📊</Text>
                <Text style={styles.infoTitle}>Análisis Automático</Text>
              </View>
              
              <View style={styles.analysisContent}>
                <View style={styles.analysisItem}>
                  <Text style={styles.analysisEmoji}>
                    {reportData.summary.totalSavings > reportData.summary.totalLoans ? '✅' : '⚠️'}
                  </Text>
                  <View style={styles.analysisText}>
                    <Text style={styles.analysisTitle}>Salud Financiera</Text>
                    <Text style={styles.analysisDescription}>
                      {reportData.summary.totalSavings > reportData.summary.totalLoans
                        ? 'Excelente! Tus ahorros superan tus préstamos. Mantén este buen ritmo.'
                        : 'Atención: Tus préstamos superan tus ahorros. Considera aumentar tus aportes mensuales.'}
                    </Text>
                  </View>
                </View>

                <View style={styles.analysisItem}>
                  <Text style={styles.analysisEmoji}>💰</Text>
                  <View style={styles.analysisText}>
                    <Text style={styles.analysisTitle}>Rendimiento</Text>
                    <Text style={styles.analysisDescription}>
                      Has generado {formatCurrency(reportData.summary.totalInterests)} en intereses.
                      {reportData.summary.totalSavings > 0 && (
                        ` Esto representa un ${((reportData.summary.totalInterests / reportData.summary.totalSavings) * 100).toFixed(2)}% de rendimiento.`
                      )}
                    </Text>
                  </View>
                </View>

                <View style={styles.analysisItem}>
                  <Text style={styles.analysisEmoji}>📈</Text>
                  <View style={styles.analysisText}>
                    <Text style={styles.analysisTitle}>Proyección</Text>
                    <Text style={styles.analysisDescription}>
                      Basado en tu historial, podrías alcanzar {formatCurrency(reportData.summary.totalSavings * 1.2)} en los próximos 6 meses.
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          </>
        )}
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#F8FAFC' 
  },
  header: { 
    paddingTop: 60, 
    paddingBottom: 40, 
    paddingHorizontal: theme.spacing.lg, 
    borderBottomLeftRadius: 30, 
    borderBottomRightRadius: 30 
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    color: theme.colors.white, 
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center'
  },
  headerSubtitle: { 
    fontSize: 16, 
    color: theme.colors.white, 
    opacity: 0.9,
    textAlign: 'center'
  },
  content: { 
    padding: theme.spacing.lg,
    marginTop: -20 
  },
  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60
  },
  loaderText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.gray[600]
  },
  summaryGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12, 
    marginBottom: 24 
  },
  summaryCard: { 
    width: (width - 48) / 2 - 6, 
    padding: 16,
    borderRadius: 16,
    position: 'relative'
  },
  savingsCard: {
    backgroundColor: '#F0FDF9',
    borderColor: '#10B981',
  },
  loansCard: {
    backgroundColor: '#FEF2F2',
    borderColor: '#EF4444',
  },
  interestCard: {
    backgroundColor: '#FFFBEB',
    borderColor: '#F59E0B',
  },
  transactionsCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  summaryIcon: { 
    width: 48, 
    height: 48, 
    borderRadius: 24, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 12 
  },
  summaryValue: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: theme.colors.gray[900], 
    marginBottom: 4 
  },
  summaryLabel: { 
    fontSize: 12, 
    color: theme.colors.gray[600], 
    textAlign: 'center' 
  },
  trendIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  chartCard: { 
    padding: 20, 
    marginBottom: 20,
    borderRadius: 16
  },
  chartHeader: {
    marginBottom: 20
  },
  chartTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    color: theme.colors.gray[900], 
    marginBottom: 4
  },
  chartSubtitle: {
    fontSize: 14,
    color: theme.colors.gray[500]
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  chart: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: CHART_MAX_HEIGHT + 60, // Altura extra para las etiquetas
    marginRight: 8
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%'
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: '100%',
    position: 'relative'
  },
  guideLine: {
    position: 'absolute',
    top: 0,
    left: '50%',
    right: '50%',
    height: '100%',
    borderLeftWidth: 1,
    borderLeftColor: '#E5E7EB',
    zIndex: 0
  },
  barFill: {
    width: '70%',
    minWidth: 24,
    borderRadius: 6,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingVertical: 4,
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  barValue: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
  },
  monthLabel: {
    marginTop: 8,
    alignItems: 'center'
  },
  barLabel: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: theme.colors.gray[700] 
  },
  zeroLabel: {
    color: theme.colors.gray[400]
  },
  barAmount: {
    fontSize: 10,
    color: theme.colors.gray[500],
    marginTop: 2,
    textAlign: 'center'
  },
  yAxis: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: CHART_MAX_HEIGHT,
    marginBottom: 60,
    paddingVertical: 8
  },
  yAxisLabel: {
    fontSize: 10,
    color: theme.colors.gray[500],
    fontWeight: '500'
  },
  distributionCard: { 
    padding: 20, 
    marginBottom: 20,
    borderRadius: 16
  },
  pieContainer: { 
    gap: 16 
  },
  pieItem: { 
    gap: 8 
  },
  pieItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  colorDot: { 
    width: 16, 
    height: 16, 
    borderRadius: 8 
  },
  pieItemInfo: {
    flex: 1,
    marginLeft: 12
  },
  pieItemLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: theme.colors.gray[800] 
  },
  pieItemValue: {
    fontSize: 12,
    color: theme.colors.gray[600],
    marginTop: 2
  },
  pieItemPercentage: { 
    fontSize: 14, 
    fontWeight: 'bold', 
    color: theme.colors.gray[700] 
  },
  pieItemBar: { 
    height: 8, 
    backgroundColor: theme.colors.gray[200], 
    borderRadius: 4, 
    overflow: 'hidden' 
  },
  pieItemFill: { 
    height: '100%',
    borderRadius: 4
  },
  actions: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 20 
  },
  actionButton: { 
    flex: 1,
    borderRadius: 12
  },
  exportButton: {
    backgroundColor: '#10B981'
  },
  shareButton: {
    borderColor: '#3B82F6'
  },
  infoCard: { 
    padding: 20,
    borderRadius: 16
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12
  },
  infoTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: theme.colors.gray[900] 
  },
  analysisContent: {
    gap: 16
  },
  analysisItem: {
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  analysisEmoji: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2
  },
  analysisText: {
    flex: 1
  },
  analysisTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.gray[800],
    marginBottom: 4
  },
  analysisDescription: {
    fontSize: 14,
    color: theme.colors.gray[600],
    lineHeight: 20
  },
  bottomSpacing: { 
    height: 40 
  },
});