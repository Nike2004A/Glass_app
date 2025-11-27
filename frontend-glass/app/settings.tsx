import { ScrollView, StyleSheet, View, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { CustomAlert } from '@/components/ui/custom-alert';
import authService from '@/services/auth';

export default function SettingsScreen() {
  const router = useRouter();
  const textSecondary = useThemeColor({}, 'textSecondary');
  const tint = useThemeColor({}, 'tint');
  const divider = useThemeColor({}, 'divider');

  const [highSpendingAlerts, setHighSpendingAlerts] = useState(true);
  const [subscriptionReview, setSubscriptionReview] = useState(true);
  const [lowBalanceAlerts, setLowBalanceAlerts] = useState(true);
  const [monthlyReports, setMonthlyReports] = useState(false);
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const handleLogout = () => {
    setShowLogoutAlert(true);
  };

  const confirmLogout = async () => {
    try {
      await authService.logout();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
      router.replace('/login');
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: tint }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Configuración</ThemedText>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Notificaciones
          </ThemedText>
          <ThemedText style={[styles.sectionDescription, { color: textSecondary }]}>
            Configura las alertas que deseas recibir
          </ThemedText>

          <Card style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={[styles.settingIcon, { backgroundColor: `${useThemeColor({}, 'warning')}20` }]}>
                  <IconSymbol
                    name="exclamationmark.triangle.fill"
                    size={20}
                    color={useThemeColor({}, 'warning')}
                  />
                </View>
                <View style={styles.settingDetails}>
                  <ThemedText style={styles.settingTitle}>
                    Alertas de Gastos Altos
                  </ThemedText>
                  <ThemedText style={[styles.settingDescription, { color: textSecondary }]}>
                    Recibe notificaciones cuando realices un gasto mayor a $5,000
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={highSpendingAlerts}
                onValueChange={setHighSpendingAlerts}
              />
            </View>

            <View style={[styles.dividerLine, { backgroundColor: divider }]} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={[styles.settingIcon, { backgroundColor: `${tint}20` }]}>
                  <IconSymbol
                    name="arrow.up.circle.fill"
                    size={20}
                    color={tint}
                  />
                </View>
                <View style={styles.settingDetails}>
                  <ThemedText style={styles.settingTitle}>
                    Revisión de Suscripciones
                  </ThemedText>
                  <ThemedText style={[styles.settingDescription, { color: textSecondary }]}>
                    Te avisaremos si detectamos suscripciones sin uso
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={subscriptionReview}
                onValueChange={setSubscriptionReview}
              />
            </View>

            <View style={[styles.dividerLine, { backgroundColor: divider }]} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={[styles.settingIcon, { backgroundColor: `${useThemeColor({}, 'danger')}20` }]}>
                  <IconSymbol
                    name="exclamationmark.triangle.fill"
                    size={20}
                    color={useThemeColor({}, 'danger')}
                  />
                </View>
                <View style={styles.settingDetails}>
                  <ThemedText style={styles.settingTitle}>
                    Balance Bajo
                  </ThemedText>
                  <ThemedText style={[styles.settingDescription, { color: textSecondary }]}>
                    Alerta cuando tu cuenta principal tenga menos de $5,000
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={lowBalanceAlerts}
                onValueChange={setLowBalanceAlerts}
              />
            </View>

            <View style={[styles.dividerLine, { backgroundColor: divider }]} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={[styles.settingIcon, { backgroundColor: `${useThemeColor({}, 'info')}20` }]}>
                  <IconSymbol
                    name="chart.bar.fill"
                    size={20}
                    color={useThemeColor({}, 'info')}
                  />
                </View>
                <View style={styles.settingDetails}>
                  <ThemedText style={styles.settingTitle}>
                    Alertas de Presupuesto
                  </ThemedText>
                  <ThemedText style={[styles.settingDescription, { color: textSecondary }]}>
                    Notificación cuando excedas tu presupuesto diario
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={budgetAlerts}
                onValueChange={setBudgetAlerts}
              />
            </View>

            <View style={[styles.dividerLine, { backgroundColor: divider }]} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <View style={[styles.settingIcon, { backgroundColor: `${useThemeColor({}, 'success')}20` }]}>
                  <IconSymbol
                    name="bell.fill"
                    size={20}
                    color={useThemeColor({}, 'success')}
                  />
                </View>
                <View style={styles.settingDetails}>
                  <ThemedText style={styles.settingTitle}>
                    Reportes Mensuales
                  </ThemedText>
                  <ThemedText style={[styles.settingDescription, { color: textSecondary }]}>
                    Recibe un resumen financiero al final de cada mes
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={monthlyReports}
                onValueChange={setMonthlyReports}
              />
            </View>
          </Card>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Cuenta
          </ThemedText>

          <Card style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <IconSymbol name="gearshape.fill" size={22} color={textSecondary} />
                <ThemedText style={styles.menuText}>Preferencias</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color={textSecondary} />
            </TouchableOpacity>

            <View style={[styles.dividerLine, { backgroundColor: divider }]} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <IconSymbol name="banknote.fill" size={22} color={textSecondary} />
                <ThemedText style={styles.menuText}>Cuentas Conectadas</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color={textSecondary} />
            </TouchableOpacity>

            <View style={[styles.dividerLine, { backgroundColor: divider }]} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <IconSymbol name="checkmark.circle.fill" size={22} color={textSecondary} />
                <ThemedText style={styles.menuText}>Seguridad</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color={textSecondary} />
            </TouchableOpacity>
          </Card>
        </View>

        {/* About */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Acerca de
          </ThemedText>

          <Card style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <ThemedText style={styles.menuText}>Términos y Condiciones</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color={textSecondary} />
            </TouchableOpacity>

            <View style={[styles.dividerLine, { backgroundColor: divider }]} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <ThemedText style={styles.menuText}>Política de Privacidad</ThemedText>
              </View>
              <IconSymbol name="chevron.right" size={20} color={textSecondary} />
            </TouchableOpacity>

            <View style={[styles.dividerLine, { backgroundColor: divider }]} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuLeft}>
                <ThemedText style={styles.menuText}>Versión</ThemedText>
              </View>
              <ThemedText style={[styles.versionText, { color: textSecondary }]}>
                1.0.0
              </ThemedText>
            </TouchableOpacity>
          </Card>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.dangerButton, { borderColor: useThemeColor({}, 'danger') }]}
            onPress={handleLogout}
          >
            <ThemedText style={[styles.dangerButtonText, { color: useThemeColor({}, 'danger') }]}>
              Cerrar Sesión
            </ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Logout Confirmation Alert */}
      <CustomAlert
        visible={showLogoutAlert}
        title="Cerrar Sesión"
        message="¿Estás seguro que deseas cerrar sesión?"
        icon="arrow.right.square.fill"
        iconColor={useThemeColor({}, 'danger')}
        buttons={[
          {
            text: 'Cancelar',
            style: 'cancel',
            onPress: () => setShowLogoutAlert(false),
          },
          {
            text: 'Cerrar Sesión',
            style: 'destructive',
            onPress: confirmLogout,
          },
        ]}
        onDismiss={() => setShowLogoutAlert(false)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  settingsCard: {
    padding: 0,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginRight: 12,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingDetails: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  dividerLine: {
    height: 1,
    marginHorizontal: 16,
  },
  menuCard: {
    padding: 0,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    fontSize: 16,
  },
  versionText: {
    fontSize: 16,
  },
  dangerButton: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
