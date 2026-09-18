// src/components/ServerConfigModal.tsx

import React, {
  useEffect,
  useState,
} from "react";

import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";

import {
  Colors,
  Radius,
  Spacing,
  Typography,
} from "../constants/theme";

import {
  getApiBaseUrl,
  getCustomApiUrl,
  setCustomApiUrl,
  testConnection,
} from "../services/api";

interface ServerConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: (newUrl: string) => void;
}

const PRODUCTION_API_URL =
  "https://igloo-asset-management-system.onrender.com/api";

const ANDROID_EMULATOR_URL =
  "http://10.0.2.2:3000/api";

const LOCALHOST_URL =
  "http://localhost:3000/api";

export default function ServerConfigModal({
  visible,
  onClose,
  onSaved,
}: ServerConfigModalProps) {
  const [currentUrl, setCurrentUrl] =
    useState("");

  const [inputUrl, setInputUrl] =
    useState("");

  const [testing, setTesting] =
    useState(false);

  const [testResult, setTestResult] =
    useState<{
      ok: boolean;
      message: string;
    } | null>(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    setTestResult(null);

    const loadServer = async () => {
      try {
        const url =
          await getApiBaseUrl();

        setCurrentUrl(url);

        const custom =
          await getCustomApiUrl();

        setInputUrl(
          custom || url,
        );
      } catch {
        setCurrentUrl(
          PRODUCTION_API_URL,
        );

        setInputUrl(
          PRODUCTION_API_URL,
        );
      }
    };

    loadServer();
  }, [visible]);

  // ======================================
  // TEST CONNECTION
  // ======================================

  const handleTest = async () => {
    const target =
      inputUrl.trim() ||
      currentUrl ||
      PRODUCTION_API_URL;

    setTesting(true);
    setTestResult(null);

    try {
      const result =
        await testConnection(target);

      setTestResult({
        ok: result.ok,
        message: result.message,
      });
    } catch {
      setTestResult({
        ok: false,
        message:
          "Connection test failed.",
      });
    } finally {
      setTesting(false);
    }
  };

  // ======================================
  // SAVE
  // ======================================

  const handleSave = async () => {
    try {
      const url =
        inputUrl.trim();

      if (!url) {
        await setCustomApiUrl(
          null,
        );
      } else {
        await setCustomApiUrl(
          url,
        );
      }

      const updated =
        await getApiBaseUrl();

      setCurrentUrl(updated);

      if (onSaved) {
        onSaved(updated);
      }

      onClose();
    } catch {
      Alert.alert(
        "Error",
        "Failed to save server URL.",
      );
    }
  };

  // ======================================
  // RESET
  // ======================================

  const handleReset = async () => {
    try {
      await setCustomApiUrl(
        null,
      );

      const defaultUrl =
        await getApiBaseUrl();

      setCurrentUrl(
        defaultUrl,
      );

      setInputUrl(
        defaultUrl,
      );

      setTestResult(null);
    } catch {
      Alert.alert(
        "Error",
        "Failed to reset server configuration.",
      );
    }
  };

  // ======================================
  // SELECT SERVER
  // ======================================

  const selectServer = (
    url: string,
  ) => {
    setInputUrl(url);
    setTestResult(null);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* HEADER */}
          <View style={styles.header}>
            <View
              style={
                styles.headerTitleRow
              }
            >
              <View
                style={
                  styles.headerIcon
                }
              >
                <Ionicons
                  name="server-outline"
                  size={20}
                  color={
                    Colors.light
                      .primary
                  }
                />
              </View>

              <View>
                <Text
                  style={styles.title}
                >
                  Backend Connection
                </Text>

                <Text
                  style={
                    styles.subtitle
                  }
                >
                  Developer settings
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={onClose}
              hitSlop={10}
            >
              <Ionicons
                name="close"
                size={24}
                color={
                  Colors.light
                    .textSecondary
                }
              />
            </TouchableOpacity>
          </View>

          {/* DESCRIPTION */}
          <Text
            style={
              styles.description
            }
          >
            The mobile application uses
            the online Render backend by
            default. Local servers are only
            available for development.
          </Text>

          {/* ACTIVE ENDPOINT */}
          <View
            style={styles.currentBox}
          >
            <View
              style={
                styles.currentHeader
              }
            >
              <View
                style={
                  styles.statusDot
                }
              />

              <Text
                style={
                  styles.currentLabel
                }
              >
                ACTIVE ENDPOINT
              </Text>
            </View>

            <Text
              style={
                styles.currentValue
              }
              numberOfLines={2}
            >
              {currentUrl ||
                "Detecting..."}
            </Text>
          </View>

          {/* SERVER URL */}
          <Text
            style={styles.inputLabel}
          >
            SERVER API URL
          </Text>

          <View
            style={styles.inputWrapper}
          >
            <Ionicons
              name="globe-outline"
              size={18}
              color={
                Colors.light
                  .textMuted
              }
            />

            <TextInput
              style={styles.input}
              value={inputUrl}
              onChangeText={(text) => {
                setInputUrl(text);
                setTestResult(null);
              }}
              placeholder={
                PRODUCTION_API_URL
              }
              placeholderTextColor={
                Colors.light.textMuted
              }
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="url"
            />
          </View>

          {/* QUICK SERVERS */}
          <Text
            style={styles.quickLabel}
          >
            QUICK SERVERS
          </Text>

          <View
            style={styles.quickRow}
          >
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() =>
                selectServer(
                  PRODUCTION_API_URL,
                )
              }
            >
              <Ionicons
                name="cloud-outline"
                size={16}
                color={
                  Colors.light
                    .primary
                }
              />

              <Text
                style={
                  styles.quickText
                }
              >
                Production
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() =>
                selectServer(
                  ANDROID_EMULATOR_URL,
                )
              }
            >
              <Ionicons
                name="phone-portrait-outline"
                size={16}
                color={
                  Colors.light
                    .primary
                }
              />

              <Text
                style={
                  styles.quickText
                }
              >
                Android Emulator
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() =>
                selectServer(
                  LOCALHOST_URL,
                )
              }
            >
              <Ionicons
                name="laptop-outline"
                size={16}
                color={
                  Colors.light
                    .primary
                }
              />

              <Text
                style={
                  styles.quickText
                }
              >
                Localhost
              </Text>
            </TouchableOpacity>
          </View>

          {/* TEST CONNECTION */}
          <TouchableOpacity
            style={[
              styles.testBtn,
              testing &&
                styles.btnDisabled,
            ]}
            onPress={handleTest}
            disabled={testing}
          >
            {testing ? (
              <ActivityIndicator
                size="small"
                color={
                  Colors.light
                    .primary
                }
              />
            ) : (
              <Ionicons
                name="wifi-outline"
                size={18}
                color={
                  Colors.light
                    .primary
                }
              />
            )}

            <Text
              style={
                styles.testBtnText
              }
            >
              {testing
                ? "Testing..."
                : "Test Connection"}
            </Text>
          </TouchableOpacity>

          {/* TEST RESULT */}
          {testResult && (
            <View
              style={[
                styles.resultBox,
                testResult.ok
                  ? styles.resultSuccess
                  : styles.resultError,
              ]}
            >
              <Ionicons
                name={
                  testResult.ok
                    ? "checkmark-circle"
                    : "alert-circle"
                }
                size={18}
                color={
                  testResult.ok
                    ? Colors.light
                        .success
                    : Colors.light
                        .danger
                }
              />

              <Text
                style={[
                  styles.resultText,
                  {
                    color:
                      testResult.ok
                        ? Colors
                            .light
                            .success
                        : Colors
                            .light
                            .danger,
                  },
                ]}
              >
                {testResult.message}
              </Text>
            </View>
          )}

          {/* FOOTER */}
          <View
            style={styles.footer}
          >
            <TouchableOpacity
              style={
                styles.resetButton
              }
              onPress={handleReset}
            >
              <Ionicons
                name="refresh-outline"
                size={17}
                color={
                  Colors.light
                    .textSecondary
                }
              />

              <Text
                style={
                  styles.resetText
                }
              >
                Reset Default
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                styles.saveButton
              }
              onPress={handleSave}
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={18}
                color={
                  Colors.light.white
                }
              />

              <Text
                style={styles.saveText}
              >
                Save & Apply
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },

  container: {
    width: "100%",
    maxWidth: 440,
    backgroundColor:
      Colors.light.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },

  header: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    alignItems: "center",
    marginBottom:
      Spacing.sm,
  },

  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },

  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor:
      Colors.light
        .primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    fontSize:
      Typography.size.lg,
    fontWeight: "700",
    color:
      Colors.light.text,
  },

  subtitle: {
    fontSize:
      Typography.size.xs,
    color:
      Colors.light
        .textSecondary,
    marginTop: 2,
  },

  description: {
    fontSize:
      Typography.size.sm,
    color:
      Colors.light
        .textSecondary,
    marginBottom:
      Spacing.md,
    lineHeight: 19,
  },

  currentBox: {
    backgroundColor:
      Colors.light
        .primaryLight,
    padding: Spacing.md,
    borderRadius:
      Radius.md,
    marginBottom:
      Spacing.md,
  },

  currentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor:
      Colors.light.primary,
    marginRight: 7,
  },

  currentLabel: {
    fontSize: 9,
    color:
      Colors.light
        .primaryDark,
    fontWeight: "700",
    letterSpacing: 0.7,
  },

  currentValue: {
    fontSize:
      Typography.size.sm,
    color:
      Colors.light
        .primaryDark,
    fontWeight: "700",
    lineHeight: 18,
  },

  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    color:
      Colors.light
        .textSecondary,
    marginBottom:
      Spacing.xs,
    letterSpacing: 0.5,
  },

  inputWrapper: {
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor:
      Colors.light.border,
    borderRadius:
      Radius.md,
    paddingHorizontal:
      Spacing.md,
    backgroundColor:
      Colors.light
        .surfaceSecondary,
  },

  input: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize:
      Typography.size.sm,
    color:
      Colors.light.text,
    fontWeight: "600",
  },

  quickLabel: {
    fontSize: 10,
    fontWeight: "700",
    color:
      Colors.light
        .textMuted,
    letterSpacing: 0.6,
    marginTop: Spacing.md,
    marginBottom:
      Spacing.xs,
  },

  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom:
      Spacing.md,
  },

  quickBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal:
      Spacing.sm,
    paddingVertical: 7,
    borderRadius:
      Radius.sm,
    backgroundColor:
      Colors.light
        .surfaceSecondary,
    borderWidth: 1,
    borderColor:
      Colors.light.border,
  },

  quickText: {
    fontSize:
      Typography.size.xs,
    color:
      Colors.light
        .textSecondary,
    fontWeight: "600",
  },

  testBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent:
      "center",
    gap: Spacing.xs,
    paddingVertical:
      Spacing.sm,
    borderRadius:
      Radius.md,
    backgroundColor:
      Colors.light
        .primaryLight,
    marginBottom:
      Spacing.md,
  },

  btnDisabled: {
    opacity: 0.6,
  },

  testBtnText: {
    fontSize:
      Typography.size.xs,
    fontWeight: "700",
    color:
      Colors.light
        .primaryDark,
  },

  resultBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius:
      Radius.md,
    marginBottom:
      Spacing.md,
  },

  resultSuccess: {
    backgroundColor:
      Colors.light
        .primaryLight,
  },

  resultError: {
    backgroundColor:
      "#FDECEC",
  },

  resultText: {
    flex: 1,
    fontSize:
      Typography.size.xs,
    fontWeight: "600",
  },

  footer: {
    flexDirection: "row",
    justifyContent:
      "flex-end",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },

  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical:
      Spacing.sm,
    paddingHorizontal:
      Spacing.md,
    borderRadius:
      Radius.md,
    justifyContent:
      "center",
  },

  resetText: {
    fontSize:
      Typography.size.sm,
    color:
      Colors.light
        .textSecondary,
    fontWeight: "600",
  },

  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor:
      Colors.light.primary,
    paddingVertical:
      Spacing.sm,
    paddingHorizontal:
      Spacing.xl,
    borderRadius:
      Radius.md,
    justifyContent:
      "center",
  },

  saveText: {
    fontSize:
      Typography.size.sm,
    color:
      Colors.light.white,
    fontWeight: "700",
  },
});