import {
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Image,
} from "react-native";
import { useState } from "react";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { StatCard } from "@/components/ui/stat-card";
import { AccountCard } from "@/components/financial/account-card";
import { TransactionItem } from "@/components/financial/transaction-item";
import { AlertCard } from "@/components/financial/alert-card";
import { Card } from "@/components/ui/card";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { useDashboardData } from "@/hooks/use-dashboard-data";
import { GlassLoader } from "@/components/ui/glass-loader";
import { BelvoConnectModal } from "@/components/belvo/belvo-connect-modal";
import { BankAccount, Transaction, SuspiciousCharge } from "@/types/financial";

export default function DashboardScreen() {
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const { data, loading, error, refreshing, refresh } = useDashboardData();

  // All hooks must be called before any conditional returns
  const textSecondary = useThemeColor({}, "textSecondary");
  const tint = useThemeColor({}, "tint");
  const cardBg = useThemeColor({}, "card");
  const dangerColor = useThemeColor({}, "danger");
  const backgroundColor = useThemeColor({}, "background");
  const successColor = useThemeColor({}, "success");
  const infoColor = useThemeColor({}, "info");

  // Get data from backend or use defaults
  const summary = data?.summary || {
    totalBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    pendingAlerts: 0,
    dailyBudget: 0,
    spentToday: 0,
  };

  const mainAccount = data?.mainAccount || null;
  const recentTransactions = data?.recentTransactions || [];
  const suspiciousCharges = data?.suspiciousCharges || [];
  const automaticPayments = data?.automaticPayments || [];

  const budgetPercentage =
    summary.dailyBudget > 0
      ? (summary.spentToday / summary.dailyBudget) * 100
      : 0;
  const remainingBudget = summary.dailyBudget - summary.spentToday;

  // Show loading state
  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <GlassLoader message="Cargando datos..." />
        </View>
      </ThemedView>
    );
  }

  // Show error state
  if (error && !data) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.errorContainer}>
          <IconSymbol
            name="exclamationmark.triangle.fill"
            size={48}
            color={dangerColor}
          />
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
      {/* Header with Logo */}
      <View style={[styles.headerContainer, { backgroundColor }]}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/glass_sin_fondo2.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <View>
              <ThemedText style={[styles.logoText, { color: tint }]}>
                Glass Finance
              </ThemedText>
              <ThemedText
                style={[styles.logoSubtext, { color: textSecondary }]}
              >
                Tu secretaria financiera
              </ThemedText>
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
          <RefreshControl refreshing={refreshing} onRefresh={refresh} />
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
                iconColor={successColor}
              />
            </View>
          </View>
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <StatCard
                title="Gastos del Mes"
                value={formatCurrency(summary.monthlyExpenses)}
                icon="arrow.down.circle.fill"
                iconColor={dangerColor}
              />
            </View>
            <View style={styles.summaryItem}>
              <StatCard
                title="Por Ahorrar"
                value={formatCurrency(
                  summary.monthlyIncome - summary.monthlyExpenses
                )}
                icon="chart.bar.fill"
                iconColor={infoColor}
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
                <ThemedText
                  style={[styles.budgetSubtitle, { color: textSecondary }]}
                >
                  Basado en tus ingresos y patrones de gasto
                </ThemedText>
              </View>
              <IconSymbol name="chart.bar.fill" size={32} color={tint} />
            </View>

            <View style={styles.budgetAmounts}>
              <View style={styles.budgetItem}>
                <ThemedText
                  style={[styles.budgetLabel, { color: textSecondary }]}
                >
                  Gastado hoy
                </ThemedText>
                <ThemedText type="title" style={styles.budgetValue}>
                  {formatCurrency(summary.spentToday)}
                </ThemedText>
              </View>
              <View style={styles.budgetItem}>
                <ThemedText
                  style={[styles.budgetLabel, { color: textSecondary }]}
                >
                  Disponible
                </ThemedText>
                <ThemedText
                  type="title"
                  style={[
                    styles.budgetValue,
                    { color: remainingBudget > 0 ? successColor : dangerColor },
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
                      backgroundColor:
                        budgetPercentage > 90 ? dangerColor : tint,
                    },
                  ]}
                />
              </View>
              <ThemedText
                style={[styles.budgetPercentage, { color: textSecondary }]}
              >
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
            <TouchableOpacity
              style={styles.quickActionCardSmall}
              onPress={() => setShowConnectModal(true)}
            >
              <Card
                style={[
                  styles.quickActionContent,
                  { backgroundColor: `${tint}10` },
                ]}
              >
                <IconSymbol name="plus.circle.fill" size={28} color={tint} />
                <ThemedText style={styles.quickActionText}>
                  Agregar Cuenta
                </ThemedText>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCardSmall}>
              <Card
                style={[
                  styles.quickActionContent,
                  { backgroundColor: `${tint}10` },
                ]}
              >
                <IconSymbol name="bolt.fill" size={28} color={tint} />
                <ThemedText style={styles.quickActionText}>
                  Automatizar
                </ThemedText>
              </Card>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCardLarge}>
              <Card
                style={[
                  styles.quickActionContent,
                  { backgroundColor: `${tint}10` },
                ]}
              >
                <IconSymbol name="chart.bar.fill" size={28} color={tint} />
                <ThemedText style={styles.quickActionText}>
                  Ver Análisis
                </ThemedText>
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
              <ThemedText style={[styles.seeAll, { color: tint }]}>
                Ver todos
              </ThemedText>
            </TouchableOpacity>
          </View>
          <View style={styles.paymentsContainer}>
            {automaticPayments.map((payment) => (
              <Card key={payment.id} style={styles.paymentCard}>
                <View style={styles.paymentContent}>
                  <View
                    style={[
                      styles.paymentIcon,
                      { backgroundColor: `${successColor}20` },
                    ]}
                  >
                    <IconSymbol
                      name="checkmark.circle.fill"
                      size={24}
                      color={successColor}
                    />
                  </View>
                  <View style={styles.paymentDetails}>
                    <ThemedText style={styles.paymentName}>
                      {payment.name}
                    </ThemedText>
                    <ThemedText
                      style={[styles.paymentDate, { color: textSecondary }]}
                    >
                      {formatDate(payment.date)}
                    </ThemedText>
                  </View>
                  <ThemedText
                    style={[styles.paymentAmount, { color: successColor }]}
                  >
                    {formatCurrency(payment.amount)}
                  </ThemedText>
                </View>
              </Card>
            ))}
          </View>
        </View>

        {/* Main Account */}
        {mainAccount && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Cuenta Principal
              </ThemedText>
              <TouchableOpacity>
                <ThemedText style={[styles.seeAll, { color: tint }]}>
                  Ver todas
                </ThemedText>
              </TouchableOpacity>
            </View>
            <AccountCard account={mainAccount} />
          </View>
        )}

        {/* Recent Transactions */}
        {recentTransactions.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Transacciones Recientes
              </ThemedText>
              <TouchableOpacity>
                <ThemedText style={[styles.seeAll, { color: tint }]}>
                  Ver todas
                </ThemedText>
              </TouchableOpacity>
            </View>
            <View style={styles.transactionsList}>
              {recentTransactions.map((transaction) => (
                <TransactionItem
                  key={transaction.id}
                  transaction={transaction}
                  onPress={() =>
                    console.log("Transaction pressed", transaction.id)
                  }
                />
              ))}
            </View>
          </View>
        )}

        {/* Empty state when no data */}
        {!mainAccount && recentTransactions.length === 0 && (
          <View style={styles.section}>
            <Card style={styles.emptyStateCard}>
              <IconSymbol
                name="banknote.fill"
                size={64}
                color={textSecondary}
              />
              <ThemedText
                type="subtitle"
                style={[styles.emptyStateTitle, { marginTop: 16 }]}
              >
                Conecta tu banco
              </ThemedText>
              <ThemedText
                style={[
                  styles.emptyStateText,
                  { color: textSecondary, marginTop: 8 },
                ]}
              >
                Sincroniza tus cuentas bancarias para ver tus transacciones y
                análisis financieros
              </ThemedText>
              <TouchableOpacity
                style={[
                  styles.connectButton,
                  { backgroundColor: tint, marginTop: 20 },
                ]}
                onPress={() => setShowConnectModal(true)}
              >
                <ThemedText style={styles.connectButtonText}>
                  Conectar banco
                </ThemedText>
              </TouchableOpacity>
            </Card>
          </View>
        )}
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
                <IconSymbol
                  name="exclamationmark.triangle.fill"
                  size={24}
                  color={dangerColor}
                />
                <ThemedText type="subtitle">Alertas Importantes</ThemedText>
              </View>
              <TouchableOpacity onPress={() => setShowAlertsModal(false)}>
                <ThemedText
                  style={{ color: tint, fontSize: 16, fontWeight: "600" }}
                >
                  Cerrar
                </ThemedText>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              contentContainerStyle={styles.modalScrollContent}
            >
              <ThemedText
                style={[styles.modalDescription, { color: textSecondary }]}
              >
                Hemos detectado {suspiciousCharges.length} cargos que requieren
                tu atención inmediata.
              </ThemedText>

              <View style={styles.alertsList}>
                {suspiciousCharges.map((charge) => (
                  <AlertCard
                    key={charge.id}
                    suspiciousCharge={charge}
                    onPress={() => console.log("Alert pressed", charge.id)}
                    onAction={() => {
                      console.log("Action pressed", charge.id);
                      setShowAlertsModal(false);
                    }}
                  />
                ))}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

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
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
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
    borderBottomColor: "#e1e8ed",
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 50,
    height: 50,
  },
  logoText: {
    fontSize: 18,
    fontWeight: "700",
  },
  logoSubtext: {
    fontSize: 12,
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  badge: {
    position: "absolute",
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
  },
  summaryGrid: {
    flexDirection: "row",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  budgetTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  budgetSubtitle: {
    fontSize: 13,
  },
  budgetAmounts: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    fontWeight: "700",
  },
  budgetProgressContainer: {
    gap: 8,
  },
  budgetProgressBar: {
    height: 12,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
    borderRadius: 6,
    overflow: "hidden",
  },
  budgetProgressFill: {
    height: "100%",
    borderRadius: 6,
  },
  budgetPercentage: {
    fontSize: 13,
    textAlign: "right",
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 12,
  },
  quickActionCardSmall: {
    width: "48%",
  },
  quickActionCardLarge: {
    width: "100%",
  },
  quickActionContent: {
    padding: 20,
    alignItems: "center",
    gap: 12,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  paymentsContainer: {
    gap: 12,
  },
  paymentCard: {
    padding: 16,
  },
  paymentContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentDetails: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  paymentDate: {
    fontSize: 13,
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: "700",
  },
  transactionsList: {
    backgroundColor: "transparent",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    paddingBottom: 16,
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyStateCard: {
    padding: 40,
    alignItems: "center",
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  connectButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  connectButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
