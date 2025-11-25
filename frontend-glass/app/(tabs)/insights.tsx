import { ScrollView, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { AlertCard } from '@/components/financial/alert-card';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { SuspiciousCharge, Subscription } from '@/types/financial';

export default function InsightsScreen() {
  const [activeTab, setActiveTab] = useState<'suspicious' | 'subscriptions' | 'insights'>('suspicious');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const tint = useThemeColor({}, 'tint');
  const dangerColor = useThemeColor({}, 'danger');
  const warningColor = useThemeColor({}, 'warning');

  // Mock data
  const suspiciousCharges: SuspiciousCharge[] = [
    {
      id: '1',
      transactionId: '123',
      type: 'phantom',
      amount: 299,
      merchant: 'SUBSCR*UNKNOWN',
      date: new Date(Date.now() - 1000 * 60 * 60 * 24),
      reason: 'Cargo recurrente no reconocido que aparece mensualmente sin autorización',
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
      reason: 'Monto significativamente mayor al promedio de compras en este comercio',
      confidence: 65,
      status: 'pending',
      accountId: '1',
    },
  ];

  const subscriptions: Subscription[] = [
    {
      id: '1',
      name: 'Netflix Premium',
      amount: 299,
      frequency: 'monthly',
      nextBillingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      category: 'entertainment',
      merchant: 'Netflix',
      accountId: '1',
      status: 'active',
      lastCharged: new Date(Date.now() - 1000 * 60 * 60 * 24 * 25),
      averageMonthlyAmount: 299,
      canCancel: true,
    },
    {
      id: '2',
      name: 'Spotify Premium',
      amount: 115,
      frequency: 'monthly',
      nextBillingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12),
      category: 'entertainment',
      merchant: 'Spotify',
      accountId: '1',
      status: 'active',
      lastCharged: new Date(Date.now() - 1000 * 60 * 60 * 24 * 18),
      averageMonthlyAmount: 115,
      canCancel: true,
    },
    {
      id: '3',
      name: 'Amazon Prime',
      amount: 99,
      frequency: 'monthly',
      nextBillingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 20),
      category: 'shopping',
      merchant: 'Amazon',
      accountId: '1',
      status: 'active',
      lastCharged: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      averageMonthlyAmount: 99,
      canCancel: true,
    },
    {
      id: '4',
      name: 'Gym Membership',
      amount: 850,
      frequency: 'monthly',
      nextBillingDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
      category: 'health',
      merchant: 'Smart Fit',
      accountId: '1',
      status: 'active',
      lastCharged: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
      averageMonthlyAmount: 850,
      canCancel: true,
    },
  ];

  const totalSubscriptionCost = subscriptions.reduce((sum, sub) => sum + sub.averageMonthlyAmount, 0);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="title" style={styles.title}>
              Análisis Inteligente
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: textSecondary }]}>
              Tu asistente financiero personal
            </ThemedText>
          </View>
        </View>

        {/* Summary Stats */}
        <View style={styles.statsContainer}>
          <Card style={styles.statCard}>
            <IconSymbol
              name="exclamationmark.triangle.fill"
              size={28}
              color={dangerColor}
            />
            <ThemedText type="title" style={styles.statValue}>
              {suspiciousCharges.length}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: textSecondary }]}>
              Cargos Sospechosos
            </ThemedText>
          </Card>

          <Card style={styles.statCard}>
            <IconSymbol name="arrow.up.circle.fill" size={28} color={warningColor} />
            <ThemedText type="title" style={styles.statValue}>
              {subscriptions.length}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: textSecondary }]}>
              Suscripciones
            </ThemedText>
          </Card>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'suspicious' && {
                backgroundColor: `${dangerColor}15`,
                borderColor: dangerColor,
              },
            ]}
            onPress={() => setActiveTab('suspicious')}
          >
            <ThemedText
              style={[
                styles.tabText,
                { color: activeTab === 'suspicious' ? dangerColor : textSecondary },
              ]}
            >
              Cargos Sospechosos
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'subscriptions' && {
                backgroundColor: `${tint}15`,
                borderColor: tint,
              },
            ]}
            onPress={() => setActiveTab('subscriptions')}
          >
            <ThemedText
              style={[
                styles.tabText,
                { color: activeTab === 'subscriptions' ? tint : textSecondary },
              ]}
            >
              Suscripciones
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'insights' && {
                backgroundColor: `${tint}15`,
                borderColor: tint,
              },
            ]}
            onPress={() => setActiveTab('insights')}
          >
            <ThemedText
              style={[
                styles.tabText,
                { color: activeTab === 'insights' ? tint : textSecondary },
              ]}
            >
              Insights
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Content */}
        {activeTab === 'suspicious' && (
          <View style={styles.section}>
            <ThemedText style={[styles.sectionInfo, { color: textSecondary }]}>
              Hemos detectado {suspiciousCharges.length} cargos que requieren tu atención.
              Revisa cada uno y toma acción si es necesario.
            </ThemedText>

            <View style={styles.list}>
              {suspiciousCharges.map((charge) => (
                <AlertCard
                  key={charge.id}
                  suspiciousCharge={charge}
                  onPress={() => console.log('Charge pressed', charge.id)}
                  onAction={() => console.log('Action pressed', charge.id)}
                />
              ))}
            </View>
          </View>
        )}

        {activeTab === 'subscriptions' && (
          <View style={styles.section}>
            <Card style={styles.subscriptionSummary}>
              <View style={styles.subscriptionSummaryHeader}>
                <View>
                  <ThemedText style={[styles.summaryLabel, { color: textSecondary }]}>
                    Gasto Mensual Total
                  </ThemedText>
                  <ThemedText type="title" style={styles.summaryValue}>
                    {formatCurrency(totalSubscriptionCost)}
                  </ThemedText>
                </View>
                <TouchableOpacity
                  style={[styles.optimizeButton, { backgroundColor: tint }]}
                >
                  <ThemedText style={styles.optimizeButtonText}>
                    Optimizar
                  </ThemedText>
                </TouchableOpacity>
              </View>
              <ThemedText style={[styles.summarySubtext, { color: textSecondary }]}>
                Podrías ahorrar hasta $500/mes cancelando suscripciones no utilizadas
              </ThemedText>
            </Card>

            <View style={styles.list}>
              {subscriptions.map((subscription) => (
                <SubscriptionCard
                  key={subscription.id}
                  subscription={subscription}
                  onPress={() => console.log('Subscription pressed', subscription.id)}
                />
              ))}
            </View>
          </View>
        )}

        {activeTab === 'insights' && (
          <View style={styles.section}>
            <Card style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <IconSymbol name="chart.bar.fill" size={24} color={tint} />
                <ThemedText type="subtitle">Patrones de Gasto</ThemedText>
              </View>
              <ThemedText style={[styles.insightText, { color: textSecondary }]}>
                Gastas 40% más en restaurantes los fines de semana. Considera preparar comidas en casa para ahorrar ~$2,000/mes.
              </ThemedText>
            </Card>

            <Card style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <IconSymbol name="exclamationmark.triangle.fill" size={24} color={warningColor} />
                <ThemedText type="subtitle">Alerta de Presupuesto</ThemedText>
              </View>
              <ThemedText style={[styles.insightText, { color: textSecondary }]}>
                Has gastado el 85% de tu presupuesto mensual de entretenimiento y aún faltan 12 días del mes.
              </ThemedText>
            </Card>

            <Card style={styles.insightCard}>
              <View style={styles.insightHeader}>
                <IconSymbol name="checkmark.circle.fill" size={24} color={useThemeColor({}, 'success')} />
                <ThemedText type="subtitle">Logro Desbloqueado</ThemedText>
              </View>
              <ThemedText style={[styles.insightText, { color: textSecondary }]}>
                ¡Felicidades! Este mes has ahorrado 15% más que el mes anterior. Sigue así.
              </ThemedText>
            </Card>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

function SubscriptionCard({
  subscription,
  onPress,
}: {
  subscription: Subscription;
  onPress: () => void;
}) {
  const textSecondary = useThemeColor({}, 'textSecondary');
  const tint = useThemeColor({}, 'tint');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'short',
    }).format(new Date(date));
  };

  return (
    <TouchableOpacity onPress={onPress}>
      <Card style={styles.subscriptionCard}>
        <View style={styles.subscriptionHeader}>
          <View style={styles.subscriptionInfo}>
            <ThemedText style={styles.subscriptionName}>
              {subscription.name}
            </ThemedText>
            <ThemedText style={[styles.subscriptionMerchant, { color: textSecondary }]}>
              {subscription.merchant} • {subscription.frequency === 'monthly' ? 'Mensual' : 'Anual'}
            </ThemedText>
          </View>
          <ThemedText style={styles.subscriptionAmount}>
            {formatCurrency(subscription.amount)}
          </ThemedText>
        </View>

        <View style={styles.subscriptionFooter}>
          <ThemedText style={[styles.nextBilling, { color: textSecondary }]}>
            Próximo cobro: {formatDate(subscription.nextBillingDate)}
          </ThemedText>
          {subscription.canCancel && (
            <TouchableOpacity>
              <ThemedText style={[styles.cancelButton, { color: tint }]}>
                Cancelar
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    </TouchableOpacity>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 13,
    textAlign: 'center',
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    gap: 16,
  },
  sectionInfo: {
    fontSize: 14,
    lineHeight: 20,
  },
  list: {
    gap: 12,
  },
  subscriptionSummary: {
    padding: 20,
  },
  subscriptionSummaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  summarySubtext: {
    fontSize: 14,
    lineHeight: 20,
  },
  optimizeButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  optimizeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  subscriptionCard: {
    padding: 16,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  subscriptionMerchant: {
    fontSize: 14,
  },
  subscriptionAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  subscriptionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nextBilling: {
    fontSize: 13,
  },
  cancelButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  insightCard: {
    padding: 20,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  insightText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
