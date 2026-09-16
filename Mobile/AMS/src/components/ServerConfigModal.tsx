// src/components/ServerConfigModal.tsx

import React, { useEffect, useState } from "react";
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
import { Colors, Radius, Spacing, Typography } from "../constants/theme";
import { getApiBaseUrl, getCustomApiUrl, setCustomApiUrl, testConnection } from "../services/api";

interface ServerConfigModalProps {
  visible: boolean;
  onClose: () => void;
  onSaved?: (newUrl: string) => void;
}

export default function ServerConfigModal({
  visible,
  onClose,
  onSaved,
}: ServerConfigModalProps) {
  const [currentUrl, setCurrentUrl] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);

  useEffect(() => {
    if (visible) {
      setTestResult(null);
      getApiBaseUrl().then((url) => {
        setCurrentUrl(url);
        getCustomApiUrl().then((custom) => {
          setInputUrl(custom || url);
        });
      });
    }
  }, [visible]);

  const handleTest = async () => {
    const target = inputUrl.trim() || currentUrl;
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testConnection(target);
      setTestResult(result);
    } catch {
      setTestResult({ ok: false, message: "Connection test failed." });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!inputUrl.trim()) {
        await setCustomApiUrl(null);
      } else {
        await setCustomApiUrl(inputUrl.trim());
      }
      const updated = await getApiBaseUrl();
      if (onSaved) onSaved(updated);
      onClose();
    } catch {
      Alert.alert("Error", "Failed to save server URL");
    }
  };

  const handleReset = async () => {
    await setCustomApiUrl(null);
    const def = await getApiBaseUrl();
    setInputUrl(def);
    setTestResult(null);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <Ionicons name="server-outline" size={22} color={Colors.light.primary} />
              <Text style={styles.title}>Backend Connection</Text>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.description}>
            Configure the local Wi-Fi IP address or host used to reach your Express backend.
          </Text>

          <View style={styles.currentBox}>
            <Text style={styles.currentLabel}>ACTIVE ENDPOINT:</Text>
            <Text style={styles.currentValue} numberOfLines={1}>
              {currentUrl || "Detecting..."}
            </Text>
          </View>

          <Text style={styles.inputLabel}>SERVER API URL:</Text>
          <TextInput
            style={styles.input}
            value={inputUrl}
            onChangeText={(text) => {
              setInputUrl(text);
              setTestResult(null);
            }}
            placeholder="http://192.168.1.100:3000/api"
            placeholderTextColor={Colors.light.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <View style={styles.quickRow}>
            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => {
                setInputUrl("http://10.0.2.2:3000/api");
                setTestResult(null);
              }}
            >
              <Text style={styles.quickText}>Android Emu (10.0.2.2)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickBtn}
              onPress={() => {
                setInputUrl("http://localhost:3000/api");
                setTestResult(null);
              }}
            >
              <Text style={styles.quickText}>Localhost</Text>
            </TouchableOpacity>
          </View>

          {/* TEST CONNECTION BUTTON & RESULT */}
          <TouchableOpacity
            style={[styles.testBtn, testing && styles.btnDisabled]}
            onPress={handleTest}
            disabled={testing}
          >
            {testing ? (
              <ActivityIndicator size="small" color={Colors.light.primary} />
            ) : (
              <>
                <Ionicons name="wifi-outline" size={18} color={Colors.light.primary} />
                <Text style={styles.testBtnText}>Test Connection</Text>
              </>
            )}
          </TouchableOpacity>

          {testResult && (
            <View
              style={[
                styles.resultBox,
                testResult.ok ? styles.resultSuccess : styles.resultError,
              ]}
            >
              <Ionicons
                name={testResult.ok ? "checkmark-circle" : "alert-circle"}
                size={18}
                color={testResult.ok ? Colors.light.success : Colors.light.danger}
              />
              <Text
                style={[
                  styles.resultText,
                  { color: testResult.ok ? Colors.light.success : Colors.light.danger },
                ]}
              >
                {testResult.message}
              </Text>
            </View>
          )}

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetText}>Reset Default</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveText}>Save & Apply</Text>
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
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  container: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.size.lg,
    fontWeight: "700",
    color: Colors.light.text,
  },
  description: {
    fontSize: Typography.size.sm,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
  },
  currentBox: {
    backgroundColor: Colors.light.primaryLight,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  currentLabel: {
    fontSize: 9,
    color: Colors.light.primaryDark,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  currentValue: {
    fontSize: Typography.size.sm,
    color: Colors.light.primaryDark,
    fontWeight: "700",
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
    letterSpacing: 0.5,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.size.sm,
    color: Colors.light.text,
    backgroundColor: Colors.light.surfaceSecondary,
    fontWeight: "600",
  },
  quickRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  quickBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    backgroundColor: Colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  quickText: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    fontWeight: "600",
  },
  testBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primaryLight,
    marginBottom: Spacing.md,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  testBtnText: {
    fontSize: Typography.size.xs,
    fontWeight: "700",
    color: Colors.light.primaryDark,
  },
  resultBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  resultSuccess: {
    backgroundColor: Colors.light.primaryLight,
  },
  resultError: {
    backgroundColor: "#FDECEC",
  },
  resultText: {
    fontSize: Typography.size.xs,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  resetButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    justifyContent: "center",
  },
  resetText: {
    fontSize: Typography.size.sm,
    color: Colors.light.textSecondary,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    justifyContent: "center",
  },
  saveText: {
    fontSize: Typography.size.sm,
    color: Colors.light.white,
    fontWeight: "700",
  },
});
