import { ScrollView, StyleSheet, View, TouchableOpacity, Switch, Modal, TextInput } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';

interface AutomationRule {
  id: string;
  name: string;
  type: 'payment';
  enabled: boolean;
  cardId: string;
  cardName: string;
  amount: number;
  nextRun?: Date;
}

export default function AutomationScreen() {
  const router = useRouter();
  const textSecondary = useThemeColor({}, 'textSecondary');
  const tint = useThemeColor({}, 'tint');
  const successColor = useThemeColor({}, 'success');
  const divider = useThemeColor({}, 'divider');
  const cardBg = useThemeColor({}, 'card');

  const [showCreatePaymentModal, setShowCreatePaymentModal] = useState(false);
  const [globalAutoPayEnabled, setGlobalAutoPayEnabled] = useState(true);
  const [paymentName, setPaymentName] = useState('');
  const [selectedCard, setSelectedCard] = useState('');

  // Mock credit cards
  const creditCards = [
    { id: '1', name: 'BBVA Azul', balance: 12500, last4: '4532' },
    { id: '2', name: 'Santander Free', balance: 8200, last4: '8901' },
  ];

  // Mock automation rules
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: '1',
      name: 'Pago TC BBVA Azul',
      type: 'payment',
      enabled: true,
      cardId: '1',
      cardName: 'BBVA Azul',
      amount: 12500,
      nextRun: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10),
    },
    {
      id: '2',
      name: 'Pago TC Santander',
      type: 'payment',
      enabled: true,
      cardId: '2',
      cardName: 'Santander Free',
      amount: 8200,
      nextRun: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
    },
  ]);

  const toggleRule = (id: string) => {
    setAutomationRules((prev) =>
      prev.map((rule) =>
        rule.id === id ? { ...rule, enabled: !rule.enabled } : rule
      )
    );
  };

  const handleCreatePayment = () => {
    if (!paymentName || !selectedCard) {
      alert('Por favor completa todos los campos');
      return;
    }

    const card = creditCards.find(c => c.id === selectedCard);
    if (!card) return;

    const newPayment: AutomationRule = {
      id: Date.now().toString(),
      name: paymentName,
      type: 'payment',
      enabled: true,
      cardId: card.id,
      cardName: card.name,
      amount: card.balance,
      nextRun: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    };

    setAutomationRules([...automationRules, newPayment]);
    setPaymentName('');
    setSelectedCard('');
    setShowCreatePaymentModal(false);
  };

  const activeRulesCount = automationRules.filter((r) => r.enabled).length;
  const totalAutomatedAmount = automationRules
    .filter(r => r.enabled)
    .reduce((sum, r) => sum + r.amount, 0);

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <ThemedText type="title" style={styles.title}>
              Automatización
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: textSecondary }]}>
              Tu secretaria financiera
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.settingsButton, { backgroundColor: `${tint}15` }]}
            onPress={() => router.push('/settings')}
          >
            <IconSymbol name="gearshape.fill" size={24} color={tint} />
          </TouchableOpacity>
        </View>

        {/* Status Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIcon, { backgroundColor: `${successColor}20` }]}>
              <IconSymbol name="bolt.fill" size={32} color={successColor} />
            </View>
            <View style={styles.statusInfo}>
              <ThemedText type="subtitle">Todo en Orden</ThemedText>
              <ThemedText style={[styles.statusText, { color: textSecondary }]}>
                {activeRulesCount} pagos automáticos activos
              </ThemedText>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: divider }]} />

          <View style={styles.stats}>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>12</ThemedText>
              <ThemedText style={[styles.statLabel, { color: textSecondary }]}>
                Pagos Este Mes
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>
                {formatCurrency(totalAutomatedAmount)}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: textSecondary }]}>
                Monto Automatizado
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={styles.statNumber}>100%</ThemedText>
              <ThemedText style={[styles.statLabel, { color: textSecondary }]}>
                Éxito
              </ThemedText>
            </View>
          </View>
        </Card>

        {/* Quick Actions */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Acciones Rápidas
          </ThemedText>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity style={styles.quickActionCard}>
              <Card style={[styles.quickActionContent, { backgroundColor: `${tint}10` }]}>
                <IconSymbol name="creditcard.fill" size={28} color={tint} />
                <ThemedText style={styles.quickActionText}>
                  Pagar Tarjetas
                </ThemedText>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <Card style={[styles.quickActionContent, { backgroundColor: `${tint}10` }]}>
                <IconSymbol name="arrow.up.circle.fill" size={28} color={successColor} />
                <ThemedText style={styles.quickActionText}>
                  Revisar Pagos
                </ThemedText>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity style={styles.quickActionCard}>
              <Card style={[styles.quickActionContent, { backgroundColor: `${tint}10` }]}>
                <IconSymbol name="chart.bar.fill" size={28} color={useThemeColor({}, 'info')} />
                <ThemedText style={styles.quickActionText}>
                  Ver Reportes
                </ThemedText>
              </Card>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/settings')}
            >
              <Card style={[styles.quickActionContent, { backgroundColor: `${tint}10` }]}>
                <IconSymbol name="gearshape.fill" size={28} color={textSecondary} />
                <ThemedText style={styles.quickActionText}>
                  Configuración
                </ThemedText>
              </Card>
            </TouchableOpacity>
          </View>
        </View>

        {/* Automation Rules */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Pagos Automáticos de Tarjetas
          </ThemedText>

          <View style={styles.globalToggleContainer}>
            <ThemedText style={[styles.globalToggleText, { color: textSecondary }]}>
              Control Global
            </ThemedText>
            <Switch
              value={globalAutoPayEnabled}
              onValueChange={setGlobalAutoPayEnabled}
            />
          </View>

          <View style={styles.rulesList}>
            {automationRules.map((rule) => (
              <Card key={rule.id} style={styles.ruleCard}>
                <View style={styles.ruleHeader}>
                  <View style={styles.ruleInfo}>
                    <View
                      style={[
                        styles.ruleIcon,
                        { backgroundColor: `${useThemeColor({}, 'info')}20` },
                      ]}
                    >
                      <IconSymbol
                        name="creditcard.fill"
                        size={20}
                        color={useThemeColor({}, 'info')}
                      />
                    </View>
                    <View style={styles.ruleDetails}>
                      <ThemedText style={styles.ruleName}>{rule.name}</ThemedText>
                      <ThemedText style={[styles.ruleCondition, { color: textSecondary }]}>
                        {rule.cardName} •••• {creditCards.find(c => c.id === rule.cardId)?.last4}
                      </ThemedText>
                      <ThemedText style={[styles.ruleAmount, { color: tint }]}>
                        {formatCurrency(rule.amount)}
                      </ThemedText>
                    </View>
                  </View>
                  <Switch
                    value={rule.enabled && globalAutoPayEnabled}
                    onValueChange={() => toggleRule(rule.id)}
                    disabled={!globalAutoPayEnabled}
                  />
                </View>

                {rule.nextRun && rule.enabled && globalAutoPayEnabled && (
                  <View style={styles.ruleFooter}>
                    <ThemedText style={[styles.nextRun, { color: textSecondary }]}>
                      Próximo pago: {formatDate(rule.nextRun)}
                    </ThemedText>
                  </View>
                )}
              </Card>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.createPaymentButton, { backgroundColor: tint }]}
            onPress={() => setShowCreatePaymentModal(true)}
          >
            <IconSymbol name="plus.circle.fill" size={20} color="#FFFFFF" />
            <ThemedText style={styles.createPaymentButtonText}>
              Crear Pago Automático
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Suggestions */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Sugerencias de Automatización
          </ThemedText>

          <Card style={styles.suggestionCard}>
            <IconSymbol name="bolt.fill" size={24} color={tint} />
            <View style={styles.suggestionContent}>
              <ThemedText style={styles.suggestionTitle}>
                Optimiza tus Inversiones
              </ThemedText>
              <ThemedText style={[styles.suggestionText, { color: textSecondary }]}>
                Configura transferencias automáticas a tu cuenta de inversión cuando tu balance exceda $50,000.
              </ThemedText>
            </View>
            <TouchableOpacity style={[styles.enableButton, { backgroundColor: tint }]}>
              <ThemedText style={styles.enableButtonText}>Activar</ThemedText>
            </TouchableOpacity>
          </Card>

          <Card style={styles.suggestionCard}>
            <IconSymbol
              name="exclamationmark.triangle.fill"
              size={24}
              color={useThemeColor({}, 'warning')}
            />
            <View style={styles.suggestionContent}>
              <ThemedText style={styles.suggestionTitle}>
                Protección contra Sobregiros
              </ThemedText>
              <ThemedText style={[styles.suggestionText, { color: textSecondary }]}>
                Recibe alertas cuando tu cuenta principal tenga menos de $5,000 y transfiere automáticamente desde ahorros.
              </ThemedText>
            </View>
            <TouchableOpacity style={[styles.enableButton, { backgroundColor: tint }]}>
              <ThemedText style={styles.enableButtonText}>Activar</ThemedText>
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>

      {/* Create Payment Modal */}
      <Modal
        visible={showCreatePaymentModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCreatePaymentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Crear Pago Automático</ThemedText>
              <TouchableOpacity onPress={() => setShowCreatePaymentModal(false)}>
                <ThemedText style={{ color: tint, fontSize: 16, fontWeight: '600' }}>
                  Cancelar
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: textSecondary }]}>
                  Nombre del Pago
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      borderColor: useThemeColor({}, 'divider'),
                      color: useThemeColor({}, 'text'),
                    },
                  ]}
                  placeholder="Ej: Pago TC Mensual"
                  placeholderTextColor={textSecondary}
                  value={paymentName}
                  onChangeText={setPaymentName}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: textSecondary }]}>
                  Seleccionar Tarjeta
                </ThemedText>
                <View style={styles.cardOptions}>
                  {creditCards.map((card) => (
                    <TouchableOpacity
                      key={card.id}
                      style={[
                        styles.cardOption,
                        {
                          borderColor: selectedCard === card.id ? tint : useThemeColor({}, 'divider'),
                          backgroundColor: selectedCard === card.id ? `${tint}10` : 'transparent',
                        },
                      ]}
                      onPress={() => setSelectedCard(card.id)}
                    >
                      <View style={styles.cardOptionContent}>
                        <View>
                          <ThemedText style={styles.cardOptionName}>{card.name}</ThemedText>
                          <ThemedText style={[styles.cardOptionNumber, { color: textSecondary }]}>
                            •••• {card.last4}
                          </ThemedText>
                        </View>
                        <View style={styles.cardOptionRight}>
                          <ThemedText style={[styles.cardOptionLabel, { color: textSecondary }]}>
                            Deuda
                          </ThemedText>
                          <ThemedText style={[styles.cardOptionAmount, { color: useThemeColor({}, 'danger') }]}>
                            {formatCurrency(card.balance)}
                          </ThemedText>
                        </View>
                      </View>
                      {selectedCard === card.id && (
                        <View style={styles.cardOptionCheck}>
                          <IconSymbol name="checkmark.circle.fill" size={24} color={tint} />
                        </View>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {selectedCard && (
                <Card style={[styles.paymentInfo, { backgroundColor: `${successColor}10` }]}>
                  <IconSymbol name="bolt.fill" size={20} color={successColor} />
                  <View style={styles.paymentInfoText}>
                    <ThemedText style={styles.paymentInfoTitle}>
                      Pago Automático
                    </ThemedText>
                    <ThemedText style={[styles.paymentInfoDescription, { color: textSecondary }]}>
                      Se pagará el monto total de la deuda automáticamente el día de vencimiento
                    </ThemedText>
                  </View>
                </Card>
              )}

              <TouchableOpacity
                style={[
                  styles.createButton,
                  {
                    backgroundColor: paymentName && selectedCard ? tint : useThemeColor({}, 'divider'),
                  },
                ]}
                onPress={handleCreatePayment}
                disabled={!paymentName || !selectedCard}
              >
                <ThemedText style={styles.createButtonText}>
                  Crear Pago Automático
                </ThemedText>
              </TouchableOpacity>
            </View>
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
  }).format(new Date(date));
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  settingsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusCard: {
    padding: 20,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  statusIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusInfo: {
    flex: 1,
  },
  statusText: {
    fontSize: 14,
    marginTop: 4,
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  globalToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0, 87, 146, 0.05)',
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 16,
  },
  globalToggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  quickActionCard: {
    width: '48%',
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
  rulesList: {
    gap: 12,
    marginBottom: 16,
  },
  ruleCard: {
    padding: 16,
  },
  ruleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ruleInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  ruleIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleDetails: {
    flex: 1,
  },
  ruleName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ruleCondition: {
    fontSize: 13,
    marginBottom: 4,
  },
  ruleAmount: {
    fontSize: 15,
    fontWeight: '700',
  },
  ruleFooter: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  nextRun: {
    fontSize: 13,
  },
  createPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  createPaymentButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionCard: {
    padding: 20,
    marginBottom: 12,
  },
  suggestionContent: {
    marginVertical: 12,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },
  suggestionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  enableButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  enableButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
  },
  modalBody: {
    padding: 24,
    paddingTop: 8,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  cardOptions: {
    gap: 12,
  },
  cardOption: {
    borderWidth: 2,
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  cardOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardOptionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardOptionNumber: {
    fontSize: 14,
  },
  cardOptionRight: {
    alignItems: 'flex-end',
  },
  cardOptionLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  cardOptionAmount: {
    fontSize: 18,
    fontWeight: '700',
  },
  cardOptionCheck: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    marginBottom: 24,
  },
  paymentInfoText: {
    flex: 1,
  },
  paymentInfoTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentInfoDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  createButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
