import { ScrollView, StyleSheet, View, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useState } from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { AccountCard } from '@/components/financial/account-card';
import { CreditCardView } from '@/components/financial/credit-card-view';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GlassLoader } from '@/components/ui/glass-loader';
import { BelvoConnectModal } from '@/components/belvo/belvo-connect-modal';
import { useAccountsData } from '@/hooks/use-accounts-data';
import { CreditCard } from '@/types/financial';

export default function AccountsScreen() {
  const [activeTab, setActiveTab] = useState<'accounts' | 'cards'>('accounts');
  const [showConnectModal, setShowConnectModal] = useState(false);
  const { accounts, loading, error, refreshing, refresh, setPrimaryAccount } = useAccountsData();

  const textSecondary = useThemeColor({}, 'textSecondary');
  const tint = useThemeColor({}, 'tint');
  const dangerColor = useThemeColor({}, 'danger');

  // Calculate totals
  const bankAccounts = accounts;
  const creditCards: CreditCard[] = []; // TODO: Implement credit cards from backend

  const totalBalance = bankAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalCreditUsed = creditCards.reduce((sum, card) => sum + card.balance, 0);
  const totalCreditLimit = creditCards.reduce((sum, card) => sum + card.limit, 0);

  // Find primary account (first one for now)
  const mainAccountId = bankAccounts.find(acc => acc.status === 'active')?.id || bankAccounts[0]?.id || '';

  const handleSetMainAccount = async (accountId: string) => {
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
            onPress: async () => {
              try {
                await setPrimaryAccount(accountId);
                Alert.alert('Éxito', 'Cuenta principal actualizada');
              } catch (error: any) {
                Alert.alert('Error', error.message || 'No se pudo actualizar la cuenta principal');
              }
            },
          },
        ]
      );
    }
  };

  // Show loading state
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <GlassLoader message="Cargando cuentas..." />
        </View>
      </ThemedView>
    );
  }

  // Show error state
  if (error && bankAccounts.length === 0) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol name="exclamationmark.triangle.fill" size={48} color={dangerColor} />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: tint }]}
            onPress={refresh}
          >
            <ThemedText style={styles.retryButtonText}>Reintentar</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            Mis Cuentas
          </ThemedText>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: tint }]}
            onPress={() => setShowConnectModal(true)}
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
              {bankAccounts.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <IconSymbol name="banknote.fill" size={48} color={textSecondary} />
                  <ThemedText style={styles.emptyTitle}>No hay cuentas conectadas</ThemedText>
                  <ThemedText style={[styles.emptyText, { color: textSecondary }]}>
                    Conecta tu banco para ver tus cuentas
                  </ThemedText>
                  <TouchableOpacity
                    style={[styles.emptyButton, { backgroundColor: tint }]}
                    onPress={() => setShowConnectModal(true)}
                  >
                    <ThemedText style={styles.emptyButtonText}>Conectar Banco</ThemedText>
                  </TouchableOpacity>
                </Card>
              ) : (
                bankAccounts.map((account) => (
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
                ))
              )}
            </>
          ) : (
            <>
              {creditCards.length === 0 ? (
                <Card style={styles.emptyCard}>
                  <IconSymbol name="creditcard.fill" size={48} color={textSecondary} />
                  <ThemedText style={styles.emptyTitle}>No hay tarjetas conectadas</ThemedText>
                  <ThemedText style={[styles.emptyText, { color: textSecondary }]}>
                    Las tarjetas de crédito se sincronizarán automáticamente cuando conectes tu banco
                  </ThemedText>
                </Card>
              ) : (
                creditCards.map((card) => (
                  <CreditCardView
                    key={card.id}
                    card={card}
                    onPress={() => console.log('Card pressed', card.id)}
                  />
                ))
              )}
            </>
          )}
        </View>
      </ScrollView>

      {/* Belvo Connect Modal */}
      <BelvoConnectModal
        visible={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        onSuccess={refresh}
      />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  emptyCard: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
