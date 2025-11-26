import { ScrollView, StyleSheet, View, RefreshControl, TouchableOpacity, Modal, Image } from 'react-native';
import { useState } from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { StatCard } from '@/components/ui/stat-card';
import { AccountCard } from '@/components/financial/account-card';
import { TransactionItem } from '@/components/financial/transaction-item';
import { AlertCard } from '@/components/financial/alert-card';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BankAccount, Transaction, SuspiciousCharge } from '@/types/financial';

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const textSecondary = useThemeColor({}, 'textSecondary');
  const tint = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({}, 'card');
  const dangerColor = useThemeColor({}, 'danger');
  const backgroundColor = useThemeColor({}, 'background');

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 2000);
  };

  // Mock data
  const summary = {
    totalBalance: 125430.50,
    monthlyIncome: 45000,
    monthlyExpenses: 32450,
    pendingAlerts: 3,
    dailyBudget: 850,
    spentToday: 420,
  };

  const mainAccount: BankAccount = {
    id: '1',
    name: 'Cuenta Principal',
    bank: 'BBVA',
    type: 'checking',
    balance: 78430.50,
    currency: 'MXN',
    lastSync: new Date(Date.now() - 1000 * 60 * 15),
    accountNumber: '1234567890',
    status: 'active',
  };

  const recentTransactions: Transaction[] = [
    {
      id: '1',
      accountId: '1',
      date: new Date(),
      description: 'Compra en Walmart',
      amount: 1250.50,
      category: 'shopping',
      merchant: 'Walmart',
      type: 'expense',
      status: 'completed',
    },
    {
      id: '2',
      accountId: '1',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24),
      description: 'Uber',
      amount: 180,
      category: 'transport',
      merchant: 'Uber',
      type: 'expense',
      status: 'completed',
    },
    {
      id: '3',
      accountId: '1',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      description: 'Depósito Nómina',
      amount: 45000,
      category: 'salary',
      merchant: 'Empresa XYZ',
      type: 'income',
      status: 'completed',
    },
  ];

  const suspiciousCharges: SuspiciousCharge[] = [
    {
      id: '1',
      transactionId: '123',
      type: 'phantom',
      amount: 299,
      merchant: 'SUBSCR*UNKNOWN',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24),
      reason: 'Cargo no reconocido que aparece mensualmente sin autorización aparente',
      confidence: 87,
      status: 'pending',
      accountId: '1',
    },
    {
      id: '2',
      transactionId: '124',
      type: 'duplicate',
      amount: 1850,
      merchant: 'Amazon',
      date: new Date(Date.now() - 1000 * 60 * 60 * 48),
      reason: 'Dos cargos idénticos realizados con 5 minutos de diferencia',
      confidence: 92,
      status: 'pending',
      accountId: '1',
    },
    {
      id: '3',
      transactionId: '125',
      type: 'unusual',
      amount: 8500,
      merchant: 'Liverpool',
      date: new Date(Date.now() - 1000 * 60 * 60 * 72),
      reason: 'Monto significativamente mayor al promedio de compras',
      confidence: 65,
      status: 'pending',
      accountId: '1',
    },
  ];

  const automaticPayments = [
    {
      id: '1',
      name: 'Pago TC BBVA',
      amount: 2500,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      status: 'completed',
    },
    {
      id: '2',
      name: 'Pago TC Santander',
      amount: 1800,
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      status: 'completed',
    },
  ];

  const budgetPercentage = (summary.spentToday / summary.dailyBudget) * 100;
  const remainingBudget = summary.dailyBudget - summary.spentToday;

  return (
    <ThemedView style={styles.container}>
      {/* Header with Logo */}
      <View style={[styles.headerContainer, { backgroundColor }]}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require('@/assets/images/glass_sin_fondo2.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <ThemedText style={[styles.logoText, { color: tint }]}>Glass Finance</ThemedText>
              <ThemedText style={[styles.logoSubtext, { color: textSecondary }]}>Tu secretaria financiera</ThemedText>
            </View>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => setShowAlertsModal(true)}
          >
            <IconSymbol name="bell.fill" size={24} color={tint} />
            {summary.pendingAlerts > 0 && (
              <View style={[styles.badge, { backgroundColor: dangerColor }]}>
                <ThemedText style={styles.badgeText}>
                  {summary.pendingAlerts}
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Financial Summary */}
        <View style={styles.section}>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <StatCard
                title="Balance Total"
                value={formatCurrency(summary.totalBalance)}
                icon="banknote.fill"
                iconColor={tint}
                trend="up"
                trendValue="+8.5%"
              />
            </View>
            <View style={styles.summaryItem}>
              <StatCard
                title="Ingresos del Mes"
                value={formatCurrency(summary.monthlyIncome)}
                icon="arrow.up.circle.fill"
                iconColor={useThemeColor({}, 'success')}
              />
            </View>
          </View>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <StatCard
                title="Gastos del Mes"
                value={formatCurrency(summary.monthlyExpenses)}
                icon="arrow.down.circle.fill"
                iconColor={useThemeColor({}, 'danger')}
              />
            </View>
            <View style={styles.summaryItem}>
              <StatCard
                title="Por Ahorrar"
                value={formatCurrency(summary.monthlyIncome - summary.monthlyExpenses)}
                icon="chart.bar.fill"
                iconColor={useThemeColor({}, 'info')}
                subtitle="Este mes"
              />
            </View>
          </View>
        </View>

        {/* Daily Budget */}
        <View style={styles.section}>
          <Card style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
              <View>
                <ThemedText type="subtitle" style={styles.budgetTitle}>
                  Presupuesto Diario
                </ThemedText>
                <ThemedText style={[styles.budgetSubtitle, { color: textSecondary }]}>
                  Basado en tus ingresos y patrones de gasto
                </ThemedText>
              </View>
              <IconSymbol name="chart.bar.fill" size={32} color={tint} />
            </View>

            <View style={styles.budgetAmounts}>
              <View style={styles.budgetItem}>
                <ThemedText style={[styles.budgetLabel, { color: textSecondary }]}>
                  Gastado hoy
                </ThemedText>
                <ThemedText type="title" style={styles.budgetValue}>
                  {formatCurrency(summary.spentToday)}
                </ThemedText>
              </View>
              <View style={styles.budgetItem}>
                <ThemedText style={[styles.budgetLabel, { color: textSecondary }]}>
                  Disponible
                </ThemedText>
                <ThemedText
                  type="title"
                  style={[
                    styles.budgetValue,
                    { color: remainingBudget > 0 ? useThemeColor({}, 'success') : dangerColor },
                  ]}
                >
                  {formatCurrency(remainingBudget)}
                </ThemedText>
              </View>
            </View>

            <View style={styles.budgetProgressContainer}>
              <View style={styles.budgetProgressBar}>
                <View
                  style={[
                    styles.budgetProgressFill,
                    {
                      width: `${Math.min(budgetPercentage, 100)}%`,
                      backgroundColor: budgetPercentage > 90 ? dangerColor : tint,
                    },
                  ]}
                />
              </View>
              <ThemedText style={[styles.budgetPercentage, { color: textSecondary }]}>
                {budgetPercentage.toFixed(0)}% utilizado
              </ThemedText>
            </View>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Acciones Rápidas
          </ThemedText>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCardSmall}>
              <Card style={[styles.quickActionContent, { backgroundColor: `${tint}10` }]}>
                <IconSymbol name="plus.circle.fill" size={28} color={tint} />
                <ThemedText style={styles.quickActionText}>Agregar Cuenta</ThemedText>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCardSmall}>
              <Card style={[styles.quickActionContent, { backgroundColor: `${tint}10` }]}>
                <IconSymbol name="bolt.fill" size={28} color={tint} />
                <ThemedText style={styles.quickActionText}>Automatizar</ThemedText>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCardLarge}>
              <Card style={[styles.quickActionContent, { backgroundColor: `${tint}10` }]}>
                <IconSymbol name="chart.bar.fill" size={28} color={tint} />
                <ThemedText style={styles.quickActionText}>Ver Análisis</ThemedText>
              </Card>
            </TouchableOpacity>
          </View>
        </View>

        {/* Automatic Payments */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Pagos Automáticos Realizados
            </ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.seeAll, { color: tint }]}>Ver todos</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.paymentsContainer}>
            {automaticPayments.map((payment) => (
              <Card key={payment.id} style={styles.paymentCard}>
                <View style={styles.paymentContent}>
                  <View style={[styles.paymentIcon, { backgroundColor: `${useThemeColor({}, 'success')}20` }]}>
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={24}
                      color={useThemeColor({}, 'success')}
                    />
                  </View>
                  <View style={styles.paymentDetails}>
                    <ThemedText style={styles.paymentName}>{payment.name}</ThemedText>
                    <ThemedText style={[styles.paymentDate, { color: textSecondary }]}>
                      {formatDate(payment.date)}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.paymentAmount, { color: useThemeColor({}, 'success') }]}>
                    {formatCurrency(payment.amount)}
                  </ThemedText>
                </View>
              </Card>
            ))}
          </View>
        </View>

        {/* Main Account */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Cuenta Principal
            </ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.seeAll, { color: tint }]}>Ver todas</ThemedText>
            </TouchableOpacity>
          </View>
          <AccountCard account={mainAccount} />
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Transacciones Recientes
            </ThemedText>
            <TouchableOpacity>
              <ThemedText style={[styles.seeAll, { color: tint }]}>Ver todas</ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.transactionsList}>
            {recentTransactions.map((transaction) => (
              <TransactionItem
                key={transaction.id}
                transaction={transaction}
                onPress={() => console.log('Transaction pressed', transaction.id)}
              />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Alerts Modal */}
      <Modal
        visible={showAlertsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAlertsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <IconSymbol name="exclamationmark.triangle.fill" size={24} color={dangerColor} />
                <ThemedText type="subtitle">Alertas Importantes</ThemedText>
              </View>
              <TouchableOpacity onPress={() => setShowAlertsModal(false)}>
                <ThemedText style={{ color: tint, fontSize: 16, fontWeight: '600' }}>
                  Cerrar
                </ThemedText>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} contentContainerStyle={styles.modalScrollContent}>
              <ThemedText style={[styles.modalDescription, { color: textSecondary }]}>
                Hemos detectado {suspiciousCharges.length} cargos que requieren tu atención inmediata.
              </ThemedText>

              <View style={styles.alertsList}>
                {suspiciousCharges.map((charge) => (
                  <AlertCard
                    key={charge.id}
                    suspiciousCharge={charge}
                    onPress={() => console.log('Alert pressed', charge.id)}
                    onAction={() => {
                      console.log('Action pressed', charge.id);
                      setShowAlertsModal(false);
                    }}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e1e8ed',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logo: {
    width: 50,
    height: 50,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
  },
  logoSubtext: {
    fontSize: 12,
  },
  notificationButton: {
    position: 'relative',
    padding: 8,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
  },
  budgetCard: {
    padding: 20,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  budgetSubtitle: {
    fontSize: 13,
  },
  budgetAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  budgetItem: {
    flex: 1,
  },
  budgetLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  budgetValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  budgetProgressContainer: {
    gap: 8,
  },
  budgetProgressBar: {
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 6,
    overflow: 'hidden',
  },
  budgetProgressFill: {
    height: '100%',
    borderRadius: 6,
  },
  budgetPercentage: {
    fontSize: 13,
    textAlign: 'right',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  quickActionCardSmall: {
    width: '48%',
  },
  quickActionCardLarge: {
    width: '100%',
  },
  quickActionContent: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  paymentsContainer: {
    gap: 12,
  },
  paymentCard: {
    padding: 16,
  },
  paymentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentDetails: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 13,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  transactionsList: {
    backgroundColor: 'transparent',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalScroll: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 24,
    paddingTop: 0,
  },
  modalDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  alertsList: {
    gap: 12,
  },
});
