// src/app/scan.tsx

import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Colors, Radius, Spacing, Typography } from "../constants/theme";

const { width } = Dimensions.get("window");
const SCANNER_SIZE = Math.min(width * 0.72, 280);

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [manualAin, setManualAin] = useState("");

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned || !data) return;
    setScanned(true);

    let resolved = data.trim();
    if (resolved.includes("/scan/asset/")) {
      resolved = resolved.split("/scan/asset/")[1].split("?")[0].split("/")[0];
    } else if (resolved.includes("/asset/")) {
      resolved = resolved.split("/asset/")[1].split("?")[0].split("/")[0];
    }

    if (resolved) {
      router.push({
        pathname: "/asset/[id]",
        params: { id: resolved },
      } as any);
    } else {
      Alert.alert(
        "Invalid QR Code",
        "No valid asset identifier found in QR code.",
        [{ text: "Scan Again", onPress: () => setScanned(false) }],
      );
    }
  };

  const handleManualSearch = () => {
    if (!manualAin.trim()) {
      Alert.alert(
        "Enter AIN",
        "Please enter an Asset Identification Number (AIN) or Serial Number.",
      );
      return;
    }
    router.push({
      pathname: "/asset/[id]",
      params: { id: manualAin.trim() },
    } as any);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => router.back()}
            hitSlop={10}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Scan Asset QR</Text>
          <TouchableOpacity
            style={styles.torchBtn}
            onPress={() => setTorch((prev) => !prev)}
            hitSlop={10}
          >
            <Ionicons
              name={torch ? "flash" : "flash-outline"}
              size={22}
              color={torch ? Colors.light.warning : Colors.light.text}
            />
          </TouchableOpacity>
        </View>

        {/* CAMERA PREVIEW */}
        <View style={styles.cameraContainer}>
          {!permission ? (
            <View style={styles.permissionBox}>
              <ActivityIndicator size="large" color={Colors.light.primary} />
            </View>
          ) : !permission.granted ? (
            <View style={styles.permissionBox}>
              <Ionicons
                name="camera-outline"
                size={54}
                color={Colors.light.textSecondary}
              />
              <Text style={styles.permissionTitle}>
                Camera Permission Required
              </Text>
              <Text style={styles.permissionText}>
                We need access to your camera to scan freezer QR code tags.
              </Text>
              <TouchableOpacity
                style={styles.grantBtn}
                onPress={requestPermission}
              >
                <Text style={styles.grantBtnText}>Grant Permission</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.cameraLayer}>
              <CameraView
                style={styles.camera}
                facing="back"
                enableTorch={torch}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              />
              <View pointerEvents="none" style={styles.overlay}>
                <View style={styles.scanTarget}>
                  <View style={[styles.corner, styles.tl]} />
                  <View style={[styles.corner, styles.tr]} />
                  <View style={[styles.corner, styles.bl]} />
                  <View style={[styles.corner, styles.br]} />
                  {scanned && (
                    <View style={styles.scannedIndicator}>
                      <ActivityIndicator
                        size="small"
                        color={Colors.light.white}
                      />
                      <Text style={styles.scannedText}>Loading asset...</Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
        </View>

        {/* INSTRUCTIONS & MANUAL SEARCH */}
        <View style={styles.bottomSection}>
          <Text style={styles.instructionText}>
            Align the freezer QR code inside the box to scan automatically.
          </Text>

          {scanned && (
            <TouchableOpacity
              style={styles.rescanBtn}
              onPress={() => setScanned(false)}
            >
              <Ionicons name="refresh" size={18} color={Colors.light.primary} />
              <Text style={styles.rescanText}>Scan Another Code</Text>
            </TouchableOpacity>
          )}

          {/* MANUAL ENTRY */}
          <View style={styles.manualCard}>
            <Text style={styles.manualLabel}>
              OR ENTER AIN / SERIAL MANUALLY
            </Text>
            <View style={styles.manualInputRow}>
              <TextInput
                style={styles.manualInput}
                placeholder="e.g. AIN-10023 or Serial #"
                placeholderTextColor={Colors.light.textMuted}
                value={manualAin}
                onChangeText={setManualAin}
                autoCapitalize="characters"
                returnKeyType="search"
                onSubmitEditing={handleManualSearch}
              />
              <TouchableOpacity
                style={styles.searchSubmitBtn}
                onPress={handleManualSearch}
              >
                <Ionicons name="search" size={20} color={Colors.light.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: Typography.size.lg,
    fontWeight: "700",
    color: Colors.light.text,
  },
  torchBtn: {
    width: 36,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: "#000",
    overflow: "hidden",
    position: "relative",
  },
  cameraLayer: {
    flex: 1,
    position: "relative",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanTarget: {
    width: SCANNER_SIZE,
    height: SCANNER_SIZE,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: Radius.lg,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: Colors.light.primary,
  },
  tl: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 10,
  },
  tr: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 10,
  },
  bl: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 10,
  },
  br: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 10,
  },
  scannedIndicator: {
    backgroundColor: "rgba(0,0,0,0.75)",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  scannedText: {
    color: Colors.light.white,
    fontSize: Typography.size.sm,
    fontWeight: "600",
  },
  permissionBox: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    backgroundColor: Colors.light.surface,
  },
  permissionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: "700",
    color: Colors.light.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.xs,
  },
  permissionText: {
    fontSize: Typography.size.sm,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  grantBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  grantBtnText: {
    color: Colors.light.white,
    fontSize: Typography.size.md,
    fontWeight: "700",
  },
  bottomSection: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.xl,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  instructionText: {
    fontSize: Typography.size.sm,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  rescanBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
  },
  rescanText: {
    color: Colors.light.primary,
    fontSize: Typography.size.sm,
    fontWeight: "700",
  },
  manualCard: {
    backgroundColor: Colors.light.surfaceSecondary,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  manualLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.light.textSecondary,
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  manualInputRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  manualInput: {
    flex: 1,
    height: 44,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.size.sm,
    color: Colors.light.text,
    fontWeight: "600",
  },
  searchSubmitBtn: {
    width: 44,
    height: 44,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
});
