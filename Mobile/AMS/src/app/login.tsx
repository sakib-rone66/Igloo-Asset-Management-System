// src/app/login.tsx

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, {
  useState,
} from "react";

import {
  ActivityIndicator,
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

import { useAuth } from "../context/AuthContext";

import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";

export default function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const [emailError, setEmailError] =
    useState<string | null>(null);

  const [passwordError, setPasswordError] =
    useState<string | null>(null);

  const [authError, setAuthError] =
    useState<string | null>(null);

  // ========================================
  // LOGIN
  // ========================================

  const handleLogin = async () => {
    setEmailError(null);
    setPasswordError(null);
    setAuthError(null);

    let hasError = false;

    if (!email.trim()) {
      setEmailError(
        "Please enter your email address",
      );

      hasError = true;
    } else if (!email.includes("@")) {
      setEmailError(
        "Please enter a valid email address",
      );

      hasError = true;
    }

    if (!password) {
      setPasswordError(
        "Please enter your password",
      );

      hasError = true;
    }

    if (hasError) {
      return;
    }

    try {
      setIsLoading(true);

      await login(
        email.trim().toLowerCase(),
        password,
      );

      router.replace(
        "/(tabs)",
      );
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.message ||
        "Unable to sign in. Please verify your credentials or internet connection.";

      setAuthError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView
      style={styles.safeArea}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        <ScrollView
          contentContainerStyle={
            styles.scrollContent
          }
          showsVerticalScrollIndicator={
            false
          }
          keyboardShouldPersistTaps="handled"
        >
          {/* BRAND LOGO & TITLE */}
          <View
            style={
              styles.brandSection
            }
          >
            <LinearGradient
              colors={[
                Colors.light.primary,
                Colors.light.primaryDark,
              ]}
              style={
                styles.logoBadge
              }
            >
              <Text
                style={
                  styles.logoText
                }
              >
                I
              </Text>
            </LinearGradient>

            <Text
              style={
                styles.brandName
              }
            >
              IGLOO
            </Text>

            <Text
              style={
                styles.brandSubtitle
              }
            >
              Asset Management System
            </Text>
          </View>

          {/* LOGIN CARD */}
          <View
            style={styles.card}
          >
            <Text
              style={
                styles.cardTitle
              }
            >
              Welcome Back
            </Text>

            <Text
              style={
                styles.cardSubtitle
              }
            >
              Sign in to manage field
              assets and operations
            </Text>

            {/* ERROR BANNER */}
            {authError && (
              <View
                style={
                  styles.errorBanner
                }
              >
                <Ionicons
                  name="alert-circle"
                  size={18}
                  color={
                    Colors.light
                      .danger
                  }
                />

                <Text
                  style={
                    styles.errorBannerText
                  }
                >
                  {authError}
                </Text>
              </View>
            )}

            {/* EMAIL INPUT */}
            <View
              style={
                styles.inputGroup
              }
            >
              <Text
                style={
                  styles.inputLabel
                }
              >
                EMAIL ADDRESS
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  emailError
                    ? styles.inputErrorBorder
                    : undefined,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={
                    emailError
                      ? Colors.light
                          .danger
                      : Colors.light
                          .textMuted
                  }
                />

                <TextInput
                  style={
                    styles.input
                  }
                  placeholder="name@igloobd.com"
                  placeholderTextColor={
                    Colors.light
                      .textMuted
                  }
                  value={email}
                  onChangeText={(
                    val,
                  ) => {
                    setEmail(val);

                    if (
                      emailError
                    ) {
                      setEmailError(
                        null,
                      );
                    }
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  editable={!isLoading}
                />
              </View>

              {emailError && (
                <Text
                  style={
                    styles.fieldErrorText
                  }
                >
                  {emailError}
                </Text>
              )}
            </View>

            {/* PASSWORD INPUT */}
            <View
              style={
                styles.inputGroup
              }
            >
              <Text
                style={
                  styles.inputLabel
                }
              >
                PASSWORD
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  passwordError
                    ? styles.inputErrorBorder
                    : undefined,
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={
                    passwordError
                      ? Colors.light
                          .danger
                      : Colors.light
                          .textMuted
                  }
                />

                <TextInput
                  style={
                    styles.input
                  }
                  placeholder="Enter your password"
                  placeholderTextColor={
                    Colors.light
                      .textMuted
                  }
                  value={password}
                  onChangeText={(
                    val,
                  ) => {
                    setPassword(
                      val,
                    );

                    if (
                      passwordError
                    ) {
                      setPasswordError(
                        null,
                      );
                    }
                  }}
                  secureTextEntry={
                    !showPassword
                  }
                  returnKeyType="done"
                  onSubmitEditing={
                    handleLogin
                  }
                  editable={!isLoading}
                />

                <TouchableOpacity
                  onPress={() =>
                    setShowPassword(
                      (prev) =>
                        !prev,
                    )
                  }
                  hitSlop={8}
                  disabled={isLoading}
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={20}
                    color={
                      Colors.light
                        .textMuted
                    }
                  />
                </TouchableOpacity>
              </View>

              {passwordError && (
                <Text
                  style={
                    styles.fieldErrorText
                  }
                >
                  {passwordError}
                </Text>
              )}
            </View>

            {/* FORGOT PASSWORD */}
            <TouchableOpacity
              style={
                styles.forgotButton
              }
              onPress={() =>
                router.push(
                  "/forgot-password",
                )
              }
              activeOpacity={0.7}
              disabled={isLoading}
            >
              <Text
                style={
                  styles.forgotButtonText
                }
              >
                Forgot password?
              </Text>
            </TouchableOpacity>

            {/* SIGN IN BUTTON */}
            <TouchableOpacity
              style={[
                styles.loginBtn,
                isLoading &&
                  styles.btnDisabled,
              ]}
              onPress={
                handleLogin
              }
              activeOpacity={0.85}
              disabled={isLoading}
            >
              <LinearGradient
                colors={[
                  Colors.light.primary,
                  Colors.light.primaryDark,
                ]}
                start={{
                  x: 0,
                  y: 0,
                }}
                end={{
                  x: 1,
                  y: 0,
                }}
                style={
                  styles.gradientBtn
                }
              >
                {isLoading ? (
                  <ActivityIndicator
                    color={
                      Colors.light
                        .white
                    }
                    size="small"
                  />
                ) : (
                  <>
                    <Text
                      style={
                        styles.loginBtnText
                      }
                    >
                      Sign In
                    </Text>

                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color={
                        Colors.light
                          .white
                      }
                    />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* ONLINE CONNECTION NOTE */}
          <View
            style={
              styles.onlineStatus
            }
          >
            <View
              style={
                styles.onlineDot
              }
            />

            <Text
              style={
                styles.onlineText
              }
            >
              Secure online connection
            </Text>
          </View>

          {/* FOOTER */}
          <Text
            style={
              styles.footerNote
            }
          >
            Igloo Asset Management Field
            Portal • v1.0.0
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor:
      Colors.light.background,
  },

  keyboardView: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal:
      Spacing.xl,
    paddingBottom:
      Spacing.xl,
    paddingTop:
      Spacing.md,
  },

  brandSection: {
    alignItems: "center",
    marginBottom:
      Spacing.xl,
    marginTop:
      Spacing.lg,
  },

  logoBadge: {
    width: 54,
    height: 54,
    borderRadius:
      Radius.lg,
    justifyContent:
      "center",
    alignItems: "center",
    marginBottom:
      Spacing.sm,
    ...Shadows.floating,
  },

  logoText: {
    color:
      Colors.light.white,
    fontSize: 30,
    fontWeight: "800",
  },

  brandName: {
    fontSize:
      Typography.size.xl,
    fontWeight: "800",
    color:
      Colors.light.text,
    letterSpacing: 2,
  },

  brandSubtitle: {
    fontSize:
      Typography.size.xs,
    color:
      Colors.light
        .textSecondary,
    marginTop: 2,
  },

  card: {
    backgroundColor:
      Colors.light.surface,
    borderRadius:
      Radius.xl,
    padding:
      Spacing.xl,
    borderWidth: 1,
    borderColor:
      Colors.light.border,
    ...Shadows.floating,
  },

  cardTitle: {
    fontSize:
      Typography.size.xl,
    fontWeight: "800",
    color:
      Colors.light.text,
  },

  cardSubtitle: {
    fontSize:
      Typography.size.xs,
    color:
      Colors.light
        .textSecondary,
    marginTop: 2,
    marginBottom:
      Spacing.lg,
  },

  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      "#FDECEC",
    padding:
      Spacing.md,
    borderRadius:
      Radius.md,
    gap: Spacing.xs,
    marginBottom:
      Spacing.md,
  },

  errorBannerText: {
    flex: 1,
    fontSize:
      Typography.size.xs,
    color:
      Colors.light.danger,
    fontWeight: "600",
    lineHeight: 16,
  },

  inputGroup: {
    marginBottom:
      Spacing.md,
  },

  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    color:
      Colors.light.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor:
      Colors.light
        .surfaceSecondary,
    borderWidth: 1,
    borderColor:
      Colors.light.border,
    borderRadius:
      Radius.md,
    paddingHorizontal:
      Spacing.md,
    height: 48,
    gap: Spacing.sm,
  },

  inputErrorBorder: {
    borderColor:
      Colors.light.danger,
    backgroundColor:
      "#FFF9F9",
  },

  input: {
    flex: 1,
    fontSize:
      Typography.size.sm,
    color:
      Colors.light.text,
    fontWeight: "600",
  },

  fieldErrorText: {
    fontSize: 11,
    color:
      Colors.light.danger,
    fontWeight: "600",
    marginTop: 4,
    marginLeft: 2,
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop:
      -Spacing.xs,
    marginBottom:
      Spacing.lg,
    paddingVertical:
      Spacing.xs,
  },

  forgotButtonText: {
    color:
      Colors.light
        .primaryDark,
    fontSize:
      Typography.size.sm,
    fontWeight: "700",
  },

  loginBtn: {
    borderRadius:
      Radius.lg,
    overflow: "hidden",
    marginTop:
      Spacing.sm,
    ...Shadows.card,
  },

  btnDisabled: {
    opacity: 0.6,
  },

  gradientBtn: {
    height: 50,
    flexDirection: "row",
    justifyContent:
      "center",
    alignItems: "center",
    gap: Spacing.sm,
  },

  loginBtnText: {
    color:
      Colors.light.white,
    fontSize:
      Typography.size.md,
    fontWeight: "700",
  },

  onlineStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
    gap: 6,
  },

  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor:
      Colors.light.success,
  },

  onlineText: {
    fontSize: 11,
    color:
      Colors.light.textMuted,
    fontWeight: "600",
  },

  footerNote: {
    textAlign: "center",
    fontSize: 11,
    color:
      Colors.light.textMuted,
    marginTop:
      Spacing.md,
  },
});