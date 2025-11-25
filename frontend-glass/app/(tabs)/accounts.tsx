import { ScrollView, StyleSheet, View, TouchableOpacity, Modal, Alert } from 'react-native';
import { useState } from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { AccountCard } from '@/components/financial/account-card';
import { CreditCardView } from '@/components/financial/credit-card-view';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { BankAccount, CreditCard } from '@/types/financial';

export default function AccountsScreen() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'cards'>('accounts');
  const [showAddModal, setShowAddModal] = useState(false);
  const [mainAccountId, setMainAccountId] = useState('1');
  const textSecondary = useThemeColor({}, 'textSecondary');
  const tint = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({}, 'card');

  // Mock data
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([
    {
      id: '1',
      name: 'Cuenta Principal',
      bank: 'BBVA',
      type: 'checking',
      balance: 78430.50,
      currency: 'MXN',
      lastSync: new Date(Date.now() - 1000 * 60 * 15),
      accountNumber: '1234567890',
      status: 'active',
    },
    {
      id: '2',
      name: 'Cuenta de Ahorros',
      bank: 'Santander',
      type: 'savings',
      balance: 45000,
      currency: 'MXN',
      lastSync: new Date(Date.now() - 1000 * 60 * 30),
      accountNumber: '9876543210',
      status: 'active',
    },
    {
      id: '3',
      name: 'Inversión GBM',
      bank: 'GBM+',
      type: 'investment',
      balance: 120500,
      currency: 'MXN',
      lastSync: new Date(Date.now() - 1000 * 60 * 60 * 2),
      accountNumber: '5555666677',
      status: 'active',
    },
  ]);

  const creditCards: CreditCard[] = [
    {
      id: '1',
      name: 'BBVA Azul',
      bank: 'BBVA',
      last4: '4532',
      balance: 12500,
      limit: 50000,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15),
      minPayment: 625,
      currency: 'MXN',
      interestRate: 42,
      autoPayEnabled: true,
      status: 'active',
    },
    {
      id: '2',
      name: 'Santander Free',
      bank: 'Santander',
      last4: '8901',
      balance: 8200,
      limit: 30000,
      dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8),
      minPayment: 410,
      currency: 'MXN',
      interestRate: 38,
      autoPayEnabled: false,
      status: 'active',
    },
  ];

  const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalCreditUsed = creditCards.reduce((sum, card) => sum + card.balance, 0);
  const totalCreditLimit = creditCards.reduce((sum, card) => sum + card.limit, 0);

  const handleSetMainAccount = (accountId: string) => {
    const account = bankAccounts.find(acc => acc.id === accountId);
    if (account) {
      Alert.alert(
        'Fijar Cuenta Principal',
        `¿Deseas fijar "${account.name}" como tu cuenta principal?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Fijar',
            onPress: () => {
              setMainAccountId(accountId);
              console.log('Main account set to:', accountId);
            },
          },
        ]
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Mis Cuentas
          </ThemedText>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: tint }]}
            onPress={() => setShowAddModal(true)}
          >
            <IconSymbol name="plus.circle.fill" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <Card style={styles.summaryCard}>
            <ThemedText style={[styles.summaryLabel, { color: textSecondary }]}>
              Balance Total en Cuentas
            </ThemedText>
            <ThemedText type="title" style={styles.summaryValue}>
              {formatCurrency(totalBalance)}
            </ThemedText>
            <ThemedText style={[styles.summarySubtext, { color: textSecondary }]}>
              {bankAccounts.length} cuentas activas
            </ThemedText>
          </Card>

          <Card style={styles.summaryCard}>
            <ThemedText style={[styles.summaryLabel, { color: textSecondary }]}>
              Crédito Utilizado
            </ThemedText>
            <ThemedText type="title" style={styles.summaryValue}>
              {formatCurrency(totalCreditUsed)}
            </ThemedText>
            <ThemedText style={[styles.summarySubtext, { color: textSecondary }]}>
              de {formatCurrency(totalCreditLimit)} disponibles
            </ThemedText>
          </Card>
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'accounts' && { borderBottomColor: tint, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab('accounts')}
          >
            <ThemedText
              style={[
                styles.tabText,
                { color: activeTab === 'accounts' ? tint : textSecondary },
              ]}
            >
              Cuentas Bancarias
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === 'cards' && { borderBottomColor: tint, borderBottomWidth: 2 },
            ]}
            onPress={() => setActiveTab('cards')}
          >
            <ThemedText
              style={[
                styles.tabText,
                { color: activeTab === 'cards' ? tint : textSecondary },
              ]}
            >
              Tarjetas de Crédito
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.listContainer}>
          {activeTab === 'accounts' ? (
            <>
              {bankAccounts.map((account) => (
                <View key={account.id} style={styles.accountContainer}>
                  <AccountCard
                    account={account}
                    onPress={() => console.log('Account pressed', account.id)}
                  />
                  <View style={styles.accountActions}>
                    {mainAccountId === account.id ? (
                      <View style={[styles.mainBadge, { backgroundColor: `${tint}15` }]}>
                        <IconSymbol name="checkmark.circle.fill" size={16} color={tint} />
                        <ThemedText style={[styles.mainBadgeText, { color: tint }]}>
                          Cuenta Principal
                        </ThemedText>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={[styles.setPrimaryButton, { borderColor: tint }]}
                        onPress={() => handleSetMainAccount(account.id)}
                      >
                        <IconSymbol name="checkmark.circle.fill" size={18} color={tint} />
                        <ThemedText style={[styles.setPrimaryText, { color: tint }]}>
                          Fijar como principal
                        </ThemedText>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))}
            </>
          ) : (
            <>
              {creditCards.map((card) => (
                <CreditCardView
                  key={card.id}
                  card={card}
                  onPress={() => console.log('Card pressed', card.id)}
                />
              ))}
            </>
          )}
        </View>
      </ScrollView>

      {/* Add Account Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: cardBg }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Agregar Cuenta</ThemedText>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <ThemedText style={{ color: tint, fontSize: 16, fontWeight: '600' }}>
                  Cancelar
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.bankOptions}>
              {['BBVA', 'Santander', 'Banorte', 'HSBC', 'Citibanamex'].map((bank) => (
                <TouchableOpacity
                  key={bank}
                  style={[styles.bankOption, { borderColor: useThemeColor({}, 'divider') }]}
                  onPress={() => {
                    console.log('Selected bank:', bank);
                    setShowAddModal(false);
                  }}
                >
                  <ThemedText style={styles.bankName}>{bank}</ThemedText>
                  <IconSymbol name="chevron.right" size={20} color={textSecondary} />
                </TouchableOpacity>
              ))}
            </View>

            <ThemedText style={[styles.modalInfo, { color: textSecondary }]}>
              Selecciona tu banco para conectar tu cuenta de forma segura usando Open Banking.
            </ThemedText>
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
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  summarySection: {
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    padding: 20,
  },
  summaryLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    gap: 16,
  },
  accountContainer: {
    marginBottom: 8,
  },
  accountActions: {
    marginTop: -8,
    paddingHorizontal: 4,
  },
  mainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  mainBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  setPrimaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1.5,
    alignSelf: 'flex-start',
  },
  setPrimaryText: {
    fontSize: 13,
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
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  bankOptions: {
    gap: 12,
    marginBottom: 24,
  },
  bankOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
  },
  modalInfo: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
