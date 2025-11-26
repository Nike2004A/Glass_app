import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const textSecondary = useThemeColor({}, "textSecondary");
  const tint = useThemeColor({}, "tint");
  const divider = useThemeColor({}, "divider");
  const cardBg = useThemeColor({}, "card");
  const textColor = useThemeColor({}, "text");

  const handleLogin = () => {
    // TODO: Implement login logic
    console.log("Login:", { email, password });
    // After successful login, navigate to main app
    router.push("/(tabs)");
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
              style={[styles.loginButton, { backgroundColor: tint }]}
              onPress={handleLogin}
            >
              <ThemedText style={styles.loginButtonText}>
                Iniciar Sesión
              </ThemedText>
            </TouchableOpacity>

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
