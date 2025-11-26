import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import authService from "@/services/auth";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [biometricLoading, setBiometricLoading] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [hasSavedSession, setHasSavedSession] = useState(false);
  const [biometricType, setBiometricType] = useState<string>("biometric");

  const textSecondary = useThemeColor({}, "textSecondary");
  const tint = useThemeColor({}, "tint");
  const divider = useThemeColor({}, "divider");
  const cardBg = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      // Check if device has biometric hardware
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        setIsBiometricAvailable(false);
        return;
      }

      // Check if biometrics are enrolled
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) {
        setIsBiometricAvailable(false);
        return;
      }

      // Check if user has a saved session
      const hasSaved = await authService.hasSavedSession();
      setHasSavedSession(hasSaved);

      // Get biometric types available
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        setBiometricType("faceid");
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        setBiometricType("touchid");
      } else {
        setBiometricType("biometric");
      }

      setIsBiometricAvailable(hasSaved && enrolled);
    } catch (error) {
      console.error("Error checking biometric availability:", error);
      setIsBiometricAvailable(false);
    }
  };

  const handleBiometricLogin = async () => {
    setBiometricLoading(true);

    try {
      // Authenticate with biometrics
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Autentícate para iniciar sesión",
        fallbackLabel: "Usar contraseña",
        cancelLabel: "Cancelar",
      });

      if (result.success) {
        // If biometric auth successful, refresh tokens
        await authService.refreshAccessToken();
        router.replace("/(tabs)");
      } else {
        // User cancelled or failed biometric auth
        if (result.error === "user_cancel" || result.error === "system_cancel") {
          // Don't show error for cancellation
          return;
        }
        Alert.alert(
          "Autenticación fallida",
          "No se pudo verificar tu identidad. Por favor intenta de nuevo."
        );
      }
    } catch (error: any) {
      console.error("Biometric login error:", error);
      Alert.alert(
        "Error",
        error.message || "No se pudo iniciar sesión con biometría. Por favor usa tu contraseña."
      );
    } finally {
      setBiometricLoading(false);
    }
  };

  const handleLogin = async () => {
    // Validate inputs
    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Por favor ingresa un correo válido");
      return;
    }

    setLoading(true);

    try {
      await authService.login({
        email: email.trim(),
        password,
      });

      // After successful login, navigate to main app
      router.replace("/(tabs)");
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert(
        "Error al iniciar sesión",
        error.message || "Credenciales incorrectas. Por favor intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <Image
              source={require("@/assets/images/glass_sin_fondo2.png")}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={[styles.appName, { color: tint }]}>
              Glass Finance
            </ThemedText>
            <ThemedText style={[styles.tagline, { color: textSecondary }]}>
              Tu secretaria financiera personal
            </ThemedText>
          </View>

          {/* Form Section */}
          <View style={styles.formSection}>
            <ThemedText type="title" style={styles.welcomeText}>
              Bienvenido de nuevo
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: textSecondary }]}>
              Inicia sesión para continuar
            </ThemedText>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={[styles.label, { color: textSecondary }]}>
                Correo electrónico
              </ThemedText>
              <View style={[styles.inputWrapper, { borderColor: divider, backgroundColor: cardBg }]}>
                <IconSymbol
                  name="envelope.fill"
                  size={20}
                  color={textSecondary}
                />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="tu@email.com"
                  placeholderTextColor={textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={[styles.label, { color: textSecondary }]}>
                Contraseña
              </ThemedText>
              <View style={[styles.inputWrapper, { borderColor: divider, backgroundColor: cardBg }]}>
                <IconSymbol name="lock.fill" size={20} color={textSecondary} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="••••••••"
                  placeholderTextColor={textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <IconSymbol
                    name={showPassword ? "eye.slash.fill" : "eye.fill"}
                    size={20}
                    color={textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPassword}>
              <ThemedText style={[styles.forgotPasswordText, { color: tint }]}>
                ¿Olvidaste tu contraseña?
              </ThemedText>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: tint, opacity: loading ? 0.7 : 1 }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.loginButtonText}>
                  Iniciar Sesión
                </ThemedText>
              )}
            </TouchableOpacity>

            {/* Biometric Login Button - Only show if available and user has saved session */}
            {isBiometricAvailable && hasSavedSession && (
              <TouchableOpacity
                style={[
                  styles.biometricButton,
                  {
                    borderColor: divider,
                    backgroundColor: cardBg,
                    opacity: biometricLoading ? 0.7 : 1,
                  },
                ]}
                onPress={handleBiometricLogin}
                disabled={biometricLoading}
              >
                {biometricLoading ? (
                  <ActivityIndicator color={tint} />
                ) : (
                  <>
                    <IconSymbol
                      name={
                        biometricType === "faceid"
                          ? "faceid"
                          : biometricType === "touchid"
                          ? "touchid"
                          : "lock.shield.fill"
                      }
                      size={22}
                      color={tint}
                    />
                    <ThemedText style={[styles.biometricButtonText, { color: tint }]}>
                      {biometricType === "faceid"
                        ? "Iniciar con Face ID"
                        : biometricType === "touchid"
                        ? "Iniciar con Touch ID"
                        : "Iniciar con Biometría"}
                    </ThemedText>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View
                style={[styles.dividerLine, { backgroundColor: divider }]}
              />
              <ThemedText
                style={[styles.dividerText, { color: textSecondary }]}
              >
                o
              </ThemedText>
              <View
                style={[styles.dividerLine, { backgroundColor: divider }]}
              />
            </View>

            {/* Social Login Buttons */}
            <TouchableOpacity
              style={[styles.socialButton, { borderColor: divider, backgroundColor: cardBg }]}
            >
              <IconSymbol name="apple.logo" size={20} color={textColor} />
              <ThemedText style={styles.socialButtonText}>
                Continuar con Apple
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.socialButton, { borderColor: divider, backgroundColor: cardBg }]}
            >
              <IconSymbol name="g.circle.fill" size={20} color={tint} />
              <ThemedText style={styles.socialButtonText}>
                Continuar con Google
              </ThemedText>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View style={styles.signUpContainer}>
              <ThemedText style={[styles.signUpText, { color: textSecondary }]}>
                ¿No tienes una cuenta?{" "}
              </ThemedText>
              <TouchableOpacity onPress={() => router.push("./register")}>
                <ThemedText style={[styles.signUpLink, { color: tint }]}>
                  Regístrate
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 40,
    marginTop: 20,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 15,
    textAlign: "center",
  },
  formSection: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#005792",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 24,
    gap: 12,
  },
  biometricButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 14,
  },
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 12,
    gap: 12,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  signUpText: {
    fontSize: 15,
  },
  signUpLink: {
    fontSize: 15,
    fontWeight: "700",
  },
});
