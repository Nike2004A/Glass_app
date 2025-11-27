import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";
import { CustomAlert } from "@/components/ui/custom-alert";
import authService from "@/services/auth";

export default function RegisterScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Alert states
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    title: "",
    message: "",
    icon: "checkmark.circle.fill",
    iconColor: "",
    isSuccess: false,
  });

  const textSecondary = useThemeColor({}, "textSecondary");
  const tint = useThemeColor({}, "tint");
  const divider = useThemeColor({}, "divider");
  const cardBg = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");
  const danger = useThemeColor({}, "danger");
  const success = useThemeColor({}, "success");

  const showAlert = (
    title: string,
    message: string,
    icon = "exclamationmark.triangle.fill",
    iconColor = danger,
    isSuccess = false
  ) => {
    setAlertConfig({ title, message, icon, iconColor, isSuccess });
    setAlertVisible(true);
  };

  const handleRegister = async () => {
    // Validate inputs
    if (
      !fullName.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmPassword.trim()
    ) {
      showAlert(
        "Error",
        "Por favor completa todos los campos",
        "exclamationmark.circle.fill",
        danger
      );
      return;
    }

    // Validate full name (at least 2 words)
    if (fullName.trim().split(" ").length < 2) {
      showAlert(
        "Error",
        "Por favor ingresa tu nombre completo",
        "person.fill.badge.plus",
        danger
      );
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showAlert(
        "Error",
        "Por favor ingresa un correo válido",
        "envelope.badge.fill",
        danger
      );
      return;
    }

    // Password validation
    if (password.length < 8) {
      showAlert(
        "Error",
        "La contraseña debe tener al menos 8 caracteres",
        "lock.fill",
        danger
      );
      return;
    }

    if (password !== confirmPassword) {
      showAlert(
        "Error",
        "Las contraseñas no coinciden",
        "xmark.circle.fill",
        danger
      );
      return;
    }

    if (!acceptedTerms) {
      showAlert(
        "Error",
        "Debes aceptar los términos y condiciones",
        "doc.text.fill",
        danger
      );
      return;
    }

    setLoading(true);

    try {
      // Register user
      await authService.register({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
      });

      // After successful registration, login automatically
      await authService.login({
        email: email.trim(),
        password,
      });

      // Navigate to main app - Show success alert
      showAlert(
        "¡Bienvenido!",
        "Tu cuenta ha sido creada exitosamente",
        "checkmark.circle.fill",
        success,
        true
      );
    } catch (error: any) {
      console.error("Registration error:", error);
      showAlert(
        "Error al registrarse",
        error.message ||
          "Hubo un problema al crear tu cuenta. Por favor intenta de nuevo.",
        "xmark.circle.fill",
        danger
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
          showsVerticalScrollIndicator={false}
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
              Crea tu cuenta
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: textSecondary }]}>
              Comienza a gestionar tus finanzas de manera inteligente
            </ThemedText>

            {/* Full Name Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={[styles.label, { color: textSecondary }]}>
                Nombre completo
              </ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  { borderColor: divider, backgroundColor: cardBg },
                ]}
              >
                <IconSymbol
                  name="person.fill"
                  size={20}
                  color={textSecondary}
                />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Juan Pérez"
                  placeholderTextColor={textSecondary}
                  value={fullName}
                  onChangeText={setFullName}
                  autoCapitalize="words"
                  autoComplete="name"
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={[styles.label, { color: textSecondary }]}>
                Correo electrónico
              </ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  { borderColor: divider, backgroundColor: cardBg },
                ]}
              >
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
              <View
                style={[
                  styles.inputWrapper,
                  { borderColor: divider, backgroundColor: cardBg },
                ]}
              >
                <IconSymbol name="lock.fill" size={20} color={textSecondary} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Mínimo 8 caracteres"
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

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <ThemedText style={[styles.label, { color: textSecondary }]}>
                Confirmar contraseña
              </ThemedText>
              <View
                style={[
                  styles.inputWrapper,
                  { borderColor: divider, backgroundColor: cardBg },
                ]}
              >
                <IconSymbol name="lock.fill" size={20} color={textSecondary} />
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor={textSecondary}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <IconSymbol
                    name={showConfirmPassword ? "eye.slash.fill" : "eye.fill"}
                    size={20}
                    color={textSecondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Terms and Conditions */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: divider,
                    backgroundColor: acceptedTerms ? tint : cardBg,
                  },
                ]}
              >
                {acceptedTerms && (
                  <IconSymbol name="checkmark" size={16} color="#fff" />
                )}
              </View>
              <ThemedText style={[styles.termsText, { color: textSecondary }]}>
                Acepto los{" "}
                <ThemedText style={{ color: tint, fontWeight: "600" }}>
                  Términos y Condiciones
                </ThemedText>{" "}
                y la{" "}
                <ThemedText style={{ color: tint, fontWeight: "600" }}>
                  Política de Privacidad
                </ThemedText>
              </ThemedText>
            </TouchableOpacity>

            {/* Register Button */}
            <TouchableOpacity
              style={[
                styles.registerButton,
                {
                  backgroundColor: tint,
                  opacity: !acceptedTerms || loading ? 0.7 : 1,
                },
              ]}
              onPress={handleRegister}
              disabled={!acceptedTerms || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.registerButtonText}>
                  Crear Cuenta
                </ThemedText>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
              <View
                style={[styles.dividerLine, { backgroundColor: divider }]}
              />
              <ThemedText
                style={[styles.dividerText, { color: textSecondary }]}
              >
                o regístrate con
              </ThemedText>
              <View
                style={[styles.dividerLine, { backgroundColor: divider }]}
              />
            </View>

            {/* Social Login Buttons */}
            <TouchableOpacity
              style={[
                styles.socialButton,
                { borderColor: divider, backgroundColor: cardBg },
              ]}
            >
              <IconSymbol name="apple.logo" size={20} color={textColor} />
              <ThemedText style={styles.socialButtonText}>
                Continuar con Apple
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.socialButton,
                { borderColor: divider, backgroundColor: cardBg },
              ]}
            >
              <IconSymbol name="g.circle.fill" size={20} color={tint} />
              <ThemedText style={styles.socialButtonText}>
                Continuar con Google
              </ThemedText>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <ThemedText style={[styles.loginText, { color: textSecondary }]}>
                ¿Ya tienes una cuenta?{" "}
              </ThemedText>
              <TouchableOpacity onPress={() => router.push("./login")}>
                <ThemedText style={[styles.loginLink, { color: tint }]}>
                  Inicia sesión
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        icon={alertConfig.icon}
        iconColor={alertConfig.iconColor}
        buttons={[
          {
            text: alertConfig.isSuccess ? "Continuar" : "OK",
            style: "default",
            onPress: () => {
              setAlertVisible(false);
              if (alertConfig.isSuccess) {
                router.replace("./login");
              }
            },
          },
        ]}
        onDismiss={() => setAlertVisible(false)}
      />
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
    marginBottom: 32,
    marginTop: 10,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
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
    marginBottom: 28,
  },
  inputContainer: {
    marginBottom: 18,
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
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 24,
    gap: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  registerButton: {
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
  registerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    paddingHorizontal: 16,
    fontSize: 13,
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
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },
  loginText: {
    fontSize: 15,
  },
  loginLink: {
    fontSize: 15,
    fontWeight: "700",
  },
});
