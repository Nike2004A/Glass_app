import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from 'react-native';
import { useState } from 'react';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useThemeColor } from '@/hooks/use-theme-color';
import { GlassLoader } from '@/components/ui/glass-loader';
import belvoService from '@/services/belvo';

interface BelvoConnectModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function BelvoConnectModal({
  visible,
  onClose,
  onSuccess,
}: BelvoConnectModalProps) {
  const [step, setStep] = useState<'select' | 'credentials' | 'loading'>('select');
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const textSecondary = useThemeColor({}, 'textSecondary');
  const tint = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({}, 'card');
  const divider = useThemeColor({}, 'divider');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const warningColor = useThemeColor({}, 'warning');

  // Lista de bancos compatibles con Belvo en México
  const banks = [
    // Bancos de prueba (Sandbox)
    { id: 'erebor_mx_retail', name: 'Erebor (Prueba)', logo: require('@/assets/images/glass_sin_fondo2.png'), isTest: true },
    { id: 'gringotts_mx_retail', name: 'Gringotts (Prueba)', logo: require('@/assets/images/glass_sin_fondo2.png'), isTest: true },
    // Bancos reales
    { id: 'banorte_mx_retail', name: 'Banorte', logo: require('@/assets/images/banorte_logo.png') },
    { id: 'bbva_mx_retail', name: 'BBVA', logo: require('@/assets/images/bbva_logo.png') },
    { id: 'santander_mx_retail', name: 'Santander', logo: require('@/assets/images/santander_logo.jpeg') },
    { id: 'hsbc_mx_retail', name: 'HSBC', logo: require('@/assets/images/hsbc_logo.png') },
    { id: 'banamex_mx_retail', name: 'Citibanamex', logo: require('@/assets/images/banamex_logo.png') },
    { id: 'scotiabank_mx_retail', name: 'Scotiabank', logo: require('@/assets/images/scotiabank_logo.png') },
  ];

  const handleBankSelect = (bankId: string, bankName: string) => {
    setSelectedBank(bankId);
    setStep('credentials');
  };

  const handleConnect = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setLoading(true);

    try {
      // Crear el link con Belvo
      await belvoService.createLink({
        institution: selectedBank,
        username: username,
        password: password,
      });

      // Sincronizar cuentas y transacciones
      await belvoService.syncAll();

      Alert.alert(
        'Éxito',
        'Tu cuenta ha sido conectada exitosamente',
        [
          {
            text: 'OK',
            onPress: () => {
              handleClose();
              if (onSuccess) {
                onSuccess();
              }
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error connecting to Belvo:', error);
      Alert.alert(
        'Error',
        error.message || 'No se pudo conectar con tu banco. Verifica tus credenciales.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('select');
    setSelectedBank('');
    setUsername('');
    setPassword('');
    setLoading(false);
    onClose();
  };

  const handleBack = () => {
    if (step === 'credentials') {
      setStep('select');
      setUsername('');
      setPassword('');
    } else {
      handleClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.overlay}>
          <View style={[styles.container, { backgroundColor: cardBg }]}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity onPress={handleBack}>
                <IconSymbol
                  name={step === 'select' ? 'xmark' : 'chevron.left'}
                  size={24}
                  color={tint}
                />
              </TouchableOpacity>
              <ThemedText type="subtitle">
                {step === 'select' ? 'Conectar Banco' : 'Credenciales'}
              </ThemedText>
              <View style={{ width: 24 }} />
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <GlassLoader message="Conectando con tu banco..." />
              </View>
            ) : step === 'select' ? (
              <ScrollView style={styles.content}>
                <ThemedText style={[styles.description, { color: textSecondary }]}>
                  Selecciona tu banco para conectar tu cuenta de forma segura
                </ThemedText>

                <View style={styles.bankList}>
                  {banks.map((bank) => (
                    <TouchableOpacity
                      key={bank.id}
                      style={[styles.bankItem, { borderColor: divider }]}
                      onPress={() => handleBankSelect(bank.id, bank.name)}
                    >
                      <View style={styles.bankInfo}>
                        <View style={styles.bankLogoContainer}>
                          <Image
                            source={bank.logo}
                            style={styles.bankLogo}
                            resizeMode="contain"
                          />
                        </View>
                        <View style={styles.bankTextContainer}>
                          <ThemedText style={styles.bankName}>{bank.name}</ThemedText>
                          {bank.isTest && (
                            <ThemedText style={[styles.testBadge, { color: tint }]}>
                              Sandbox
                            </ThemedText>
                          )}
                        </View>
                      </View>
                      <IconSymbol name="chevron.right" size={20} color={textSecondary} />
                    </TouchableOpacity>
                  ))}
                </View>

                <Card style={[styles.infoCard, { backgroundColor }]}>
                  <IconSymbol name="lock.shield.fill" size={32} color={tint} />
                  <ThemedText style={styles.infoTitle}>Conexión Segura</ThemedText>
                  <ThemedText style={[styles.infoText, { color: textSecondary }]}>
                    Utilizamos Belvo, una plataforma de Open Banking regulada, para
                    conectarnos de forma segura con tu banco. Tus credenciales están
                    protegidas con encriptación de nivel bancario.
                  </ThemedText>
                </Card>
              </ScrollView>
            ) : (
              <ScrollView style={styles.content}>
                <ThemedText style={[styles.description, { color: textSecondary }]}>
                  Ingresa tus credenciales bancarias para {banks.find(b => b.id === selectedBank)?.name}
                </ThemedText>

                <View style={styles.form}>
                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Usuario</ThemedText>
                    <View style={[styles.inputContainer, { borderColor: divider, backgroundColor }]}>
                      <IconSymbol name="person.fill" size={20} color={textSecondary} />
                      <TextInput
                        style={[styles.input, { color: textColor }]}
                        placeholder="Tu usuario del banco"
                        placeholderTextColor={textSecondary}
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Contraseña</ThemedText>
                    <View style={[styles.inputContainer, { borderColor: divider, backgroundColor }]}>
                      <IconSymbol name="lock.fill" size={20} color={textSecondary} />
                      <TextInput
                        style={[styles.input, { color: textColor }]}
                        placeholder="Tu contraseña del banco"
                        placeholderTextColor={textSecondary}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                        autoCorrect={false}
                      />
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.connectButton, { backgroundColor: tint }]}
                    onPress={handleConnect}
                  >
                    <ThemedText style={styles.connectButtonText}>
                      Conectar Cuenta
                    </ThemedText>
                  </TouchableOpacity>
                </View>

                <Card style={[styles.warningCard, { backgroundColor: `${warningColor}10` }]}>
                  <IconSymbol
                    name="exclamationmark.triangle.fill"
                    size={24}
                    color={warningColor}
                  />
                  <ThemedText style={[styles.warningText, { color: textSecondary }]}>
                    Nunca compartas tus credenciales bancarias fuera de esta aplicación.
                    Glass Finance no almacena tus contraseñas.
                  </ThemedText>
                </Card>
              </ScrollView>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  bankList: {
    gap: 12,
    marginBottom: 24,
  },
  bankItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  bankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  bankLogoContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  bankLogo: {
    width: 40,
    height: 40,
  },
  bankTextContainer: {
    flex: 1,
    gap: 4,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
  },
  testBadge: {
    fontSize: 11,
    fontWeight: '600',
  },
  infoCard: {
    padding: 20,
    alignItems: 'center',
    gap: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  form: {
    gap: 20,
    marginBottom: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  connectButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  connectButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  warningCard: {
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
});
