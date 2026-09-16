import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState } from "react";

import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";
import { authApi } from "../services/api";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendResetLink = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      Alert.alert(
        "Invalid email",
        "Please enter the email linked to your account.",
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await authApi.forgotPassword(normalizedEmail);
      Alert.alert(
        "Reset link sent",
        "Check your email for password reset instructions. The link expires in 15 minutes.",
        [{ text: "Back to sign in", onPress: () => router.replace("/login") }],
      );
    } catch (error: any) {
      Alert.alert(
        "Unable to send reset link",
        error?.data?.message || error?.message || "Please try again later.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => router.back()}
              style={styles.backButton}
            >
              <Text style={styles.backArrow}>‹</Text>
            </TouchableOpacity>

            <View style={styles.headerBrand}>
              <View style={styles.miniLogo}>
                <Text style={styles.miniLogoText}>I</Text>
              </View>

              <Text style={styles.headerBrandText}>IGLOO</Text>
            </View>

            <View style={styles.headerSpacer} />
          </View>

          {/* Main content */}
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={[Colors.light.primary, Colors.light.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}
              >
                <Text style={styles.iconText}>?</Text>
              </LinearGradient>
            </View>

            <Text style={styles.title}>Forgot your password?</Text>

            <Text style={styles.subtitle}>
              No worries. Enter the email address associated with your account
              and we'll help you reset your password.
            </Text>

            {/* Form */}
            <View style={styles.card}>
              <Text style={styles.label}>Email address</Text>

              <View style={styles.inputWrapper}>
                <View style={styles.inputIcon}>
                  <Text style={styles.atIcon}>@</Text>
                </View>

                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.light.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSendResetLink}
                style={styles.buttonWrapper}
                disabled={isSubmitting}
              >
                <LinearGradient
                  colors={[Colors.light.primary, Colors.light.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.button}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color={Colors.light.white} />
                  ) : (
                    <Text style={styles.buttonText}>Send reset link</Text>
                  )}

                  <View style={styles.arrowCircle}>
                    <Text style={styles.arrow}>→</Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Back to login */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => router.replace("/login")}
              style={styles.backToLogin}
            >
              <Text style={styles.backToLoginArrow}>←</Text>

              <Text style={styles.backToLoginText}>Back to sign in</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <View style={styles.securityRow}>
              <View style={styles.securityDot} />

              <Text style={styles.securityText}>
                Your account information remains secure
              </Text>
            </View>

            <Text style={styles.footerText}>Igloo Asset Management System</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.xxxl,
  },

  header: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "center",
    justifyContent: "center",
  },

  backArrow: {
    color: Colors.light.text,
    fontSize: 31,
    fontWeight: "300",
    marginTop: -3,
  },

  headerBrand: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  miniLogo: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
  },

  miniLogoText: {
    color: Colors.light.white,
    fontSize: 18,
    fontWeight: "800",
  },

  headerBrandText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 2,
  },

  headerSpacer: {
    width: 42,
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingTop: Spacing.xxxl,
  },

  iconContainer: {
    alignSelf: "center",
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },

  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  iconText: {
    color: Colors.light.white,
    fontSize: 32,
    fontWeight: "700",
  },

  title: {
    textAlign: "center",
    color: Colors.light.text,
    fontSize: Typography.size.xxxl,
    lineHeight: 37,
    fontWeight: "800",
    letterSpacing: -0.7,
  },

  subtitle: {
    textAlign: "center",
    color: Colors.light.textSecondary,
    fontSize: Typography.size.md,
    lineHeight: 22,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },

  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    marginTop: Spacing.xxl,
    ...Shadows.card,
  },

  label: {
    color: Colors.light.text,
    fontSize: Typography.size.sm,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },

  inputWrapper: {
    height: 56,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
  },

  inputIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.light.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },

  atIcon: {
    color: Colors.light.primary,
    fontSize: 16,
    fontWeight: "800",
  },

  input: {
    flex: 1,
    height: "100%",
    color: Colors.light.text,
    fontSize: Typography.size.md,
  },

  buttonWrapper: {
    marginTop: Spacing.xl,
    ...Shadows.floating,
  },

  button: {
    height: 58,
    borderRadius: Radius.md,
    paddingLeft: Spacing.xl,
    paddingRight: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  buttonText: {
    color: Colors.light.white,
    fontSize: Typography.size.md,
    fontWeight: "800",
  },

  arrowCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },

  arrow: {
    color: Colors.light.white,
    fontSize: 22,
  },

  backToLogin: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xl,
    padding: Spacing.sm,
  },

  backToLoginArrow: {
    color: Colors.light.primary,
    fontSize: 18,
    marginRight: 7,
  },

  backToLoginText: {
    color: Colors.light.primary,
    fontSize: Typography.size.sm,
    fontWeight: "700",
  },

  footer: {
    alignItems: "center",
    paddingTop: Spacing.xxxl,
  },

  securityRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },

  securityDot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: Colors.light.success,
    marginRight: 7,
  },

  securityText: {
    color: Colors.light.textMuted,
    fontSize: Typography.size.xs,
  },

  footerText: {
    color: Colors.light.textMuted,
    fontSize: 10,
  },
});
