import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ReportData {
  userName: string;
  userEmail: string;
  totalSavings: number;
  totalLoans: number;
  totalInterests: number;
  transactions: number;
  generatedDate: Date;
  monthlyData: Array<{ month: string; amount: number }>;
  distribution: Array<{ category: string; amount: number; percentage: number }>;
}

class ReportsService {
  // Generar HTML del reporte
  private generateReportHTML(data: ReportData): string {
    const totalAmount = data.totalSavings + data.totalInterests;
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reporte Financiero - FAP Móvil</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Helvetica', 'Arial', sans-serif;
      color: #1f2937;
      padding: 40px;
      background: #f9fafb;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #7c3aed 0%, #6366f1 100%);
      color: white;
      padding: 40px;
      text-align: center;
    }
    
    .logo {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .tagline {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .content {
      padding: 40px;
    }
    
    .user-info {
      margin-bottom: 32px;
      padding-bottom: 24px;
      border-bottom: 2px solid #e5e7eb;
    }
    
    .user-name {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    
    .user-email {
      color: #6b7280;
      font-size: 14px;
    }
    
    .report-date {
      color: #9ca3af;
      font-size: 12px;
      margin-top: 4px;
    }
    
    .section {
      margin-bottom: 32px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 16px;
      color: #7c3aed;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    
    .stat-card {
      background: #f3f4f6;
      padding: 20px;
      border-radius: 12px;
    }
    
    .stat-label {
      font-size: 12px;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #1f2937;
    }
    
    .stat-value.success {
      color: #16a34a;
    }
    
    .stat-value.error {
      color: #dc2626;
    }
    
    .stat-value.primary {
      color: #7c3aed;
    }
    
    .distribution-list {
      list-style: none;
    }
    
    .distribution-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    
    .distribution-item:last-child {
      border-bottom: none;
    }
    
    .distribution-label {
      font-weight: 500;
    }
    
    .distribution-amount {
      font-weight: bold;
      color: #7c3aed;
    }
    
    .distribution-bar {
      height: 8px;
      background: #e5e7eb;
      border-radius: 4px;
      overflow: hidden;
      margin-top: 8px;
    }
    
    .distribution-fill {
      height: 100%;
      background: #7c3aed;
      transition: width 0.3s ease;
    }
    
    .footer {
      background: #f9fafb;
      padding: 24px 40px;
      text-align: center;
      border-top: 1px solid #e5e7eb;
    }
    
    .footer-text {
      color: #6b7280;
      font-size: 12px;
      line-height: 1.6;
    }
    
    .monthly-chart {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      height: 200px;
      gap: 8px;
      margin-top: 16px;
    }
    
    .chart-bar {
      flex: 1;
      background: linear-gradient(180deg, #7c3aed 0%, #6366f1 100%);
      border-radius: 4px 4px 0 0;
      position: relative;
      min-height: 20px;
    }
    
    .chart-label {
      text-align: center;
      font-size: 11px;
      color: #6b7280;
      margin-top: 8px;
    }
    
    @media print {
      body {
        padding: 0;
        background: white;
      }
      
      .container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">FAP Móvil</div>
      <div class="tagline">Reporte Financiero Detallado</div>
    </div>
    
    <div class="content">
      <div class="user-info">
        <div class="user-name">${data.userName}</div>
        <div class="user-email">${data.userEmail}</div>
        <div class="report-date">
          Generado el ${formatDate(data.generatedDate, 'dd/MM/yyyy HH:mm')}
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">📊 Resumen Financiero</div>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-label">Total Ahorrado</div>
            <div class="stat-value success">${formatCurrency(data.totalSavings)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Préstamos Activos</div>
            <div class="stat-value error">${formatCurrency(data.totalLoans)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Intereses Generados</div>
            <div class="stat-value primary">${formatCurrency(data.totalInterests)}</div>
          </div>
          <div class="stat-card">
            <div class="stat-label">Total Transacciones</div>
            <div class="stat-value">${data.transactions}</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">📈 Evolución Mensual</div>
        <div class="monthly-chart">
          ${data.monthlyData.map(item => {
            const maxAmount = Math.max(...data.monthlyData.map(d => d.amount));
            const height = (item.amount / maxAmount) * 100;
            return `
              <div style="flex: 1; display: flex; flex-direction: column; align-items: center;">
                <div class="chart-bar" style="height: ${height}%;"></div>
                <div class="chart-label">${item.month}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">💰 Distribución Financiera</div>
        <ul class="distribution-list">
          ${data.distribution.map(item => `
            <li class="distribution-item">
              <div style="flex: 1;">
                <div class="distribution-label">${item.category}</div>
                <div class="distribution-bar">
                  <div class="distribution-fill" style="width: ${item.percentage}%;"></div>
                </div>
              </div>
              <div class="distribution-amount">${formatCurrency(item.amount)}</div>
            </li>
          `).join('')}
        </ul>
      </div>
      
      <div class="section">
        <div class="section-title">💡 Análisis Automático</div>
        <div style="background: #f0f9ff; padding: 20px; border-radius: 12px; border-left: 4px solid #7c3aed;">
          <p style="color: #1e40af; line-height: 1.6; margin-bottom: 12px;">
            <strong>Estado Financiero:</strong> 
            ${data.totalSavings > data.totalLoans 
              ? 'Excelente. Tus ahorros superan tus préstamos.' 
              : 'Considera incrementar tus aportes mensuales.'}
          </p>
          <p style="color: #1e40af; line-height: 1.6;">
            <strong>Rendimiento:</strong> 
            Has generado ${formatCurrency(data.totalInterests)} en intereses, 
            lo que representa un ${((data.totalInterests / data.totalSavings) * 100).toFixed(2)}% 
            de tus ahorros totales.
          </p>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <div class="footer-text">
        Este reporte fue generado automáticamente por FAP Móvil.<br>
        Para más información, contacta con tu administrador.<br>
        © ${new Date().getFullYear()} FAP Móvil - Todos los derechos reservados
      </div>
    </div>
  </div>
</body>
</html>
    `;
  }

  // Exportar como PDF
  async exportToPDF(data: ReportData): Promise<void> {
    try {
      const html = this.generateReportHTML(data);

      const { uri } = await Print.printToFileAsync({
        html,
        base64: false,
      });

      console.log('✅ PDF generado:', uri);

      // Compartir el PDF
      if (Platform.OS !== 'web') {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Compartir Reporte Financiero',
            UTI: 'com.adobe.pdf',
          });
        }
      } else {
        // En web, descargar directamente
        const link = document.createElement('a');
        link.href = uri;
        link.download = `reporte-financiero-${formatDate(new Date(), 'yyyy-MM-dd')}.pdf`;
        link.click();
      }
    } catch (error) {
      console.error('❌ Error exportando PDF:', error);
      throw new Error('No se pudo generar el PDF. Intenta de nuevo.');
    }
  }

  // Compartir reporte como texto
  async shareAsText(data: ReportData): Promise<void> {
    try {
      const text = `
📊 REPORTE FINANCIERO - FAP MÓVIL

Usuario: ${data.userName}
Fecha: ${formatDate(data.generatedDate, 'dd/MM/yyyy HH:mm')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💰 RESUMEN FINANCIERO

Total Ahorrado: ${formatCurrency(data.totalSavings)}
Préstamos Activos: ${formatCurrency(data.totalLoans)}
Intereses Generados: ${formatCurrency(data.totalInterests)}
Total Transacciones: ${data.transactions}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📈 DISTRIBUCIÓN

${data.distribution.map(item => 
  `${item.category}: ${formatCurrency(item.amount)} (${item.percentage.toFixed(1)}%)`
).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Generado por FAP Móvil
      `.trim();

      if (Platform.OS !== 'web') {
        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          // En móvil, crear archivo temporal de texto
          await Sharing.shareAsync(`data:text/plain;base64,${btoa(text)}`);
        }
      } else {
        // En web, copiar al portapapeles
        navigator.clipboard.writeText(text);
        alert('✅ Reporte copiado al portapapeles');
      }
    } catch (error) {
      console.error('❌ Error compartiendo reporte:', error);
      throw new Error('No se pudo compartir el reporte. Intenta de nuevo.');
    }
  }
}

export const reportsService = new ReportsService();