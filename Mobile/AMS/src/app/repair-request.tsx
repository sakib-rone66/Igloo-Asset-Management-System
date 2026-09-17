import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  findNodeHandle,
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
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { requestApi } from "../services/api";
import { Asset } from "../services/apiTypes";
import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";

export default function RepairRequestScreen() {
  const params = useLocalSearchParams<{ ain?: string }>();
  const formScrollRef = useRef<ScrollView>(null);
  const remarksInputRef = useRef<TextInput>(null);
  const repairCostInputRef = useRef<TextInput>(null);
  const [ain, setAin] = useState(params.ain || "");
  const [asset, setAsset] = useState<Asset | null>(null);
  const [problem, setProblem] = useState("");
  const [serviceProvider, setServiceProvider] = useState("");
  const [remarks, setRemarks] = useState("");
  const [repairCost, setRepairCost] = useState("");
  const [searching, setSearching] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const scrollFieldIntoView = (inputRef: React.RefObject<TextInput | null>) => {
    setTimeout(() => {
      const inputHandle = findNodeHandle(inputRef.current);
      if (inputHandle) {
        formScrollRef.current?.scrollResponderScrollNativeHandleToKeyboard(
          inputHandle,
          72,
          true,
        );
      }
    }, 160);
  };

  const searchAsset = useCallback(async () => {
    if (!ain.trim()) {
      Alert.alert("AIN Required", "Enter an asset AIN to continue.");
      return;
    }

    try {
      setSearching(true);
      setAsset(null);
      const response = await requestApi.getRepairAssetByAIN(ain.trim());
      setAsset(response.asset);
      if (response.asset.status !== "ASSIGNED") {
        Alert.alert(
          "Asset Cannot Be Repaired",
          `This asset is currently ${response.asset.status}. Only assigned assets can receive repair requests.`,
        );
      }
    } catch (error: any) {
      Alert.alert(
        "Asset Not Found",
        error?.message || "Could not find this asset.",
      );
    } finally {
      setSearching(false);
    }
  }, [ain]);

  useEffect(() => {
    if (params.ain) {
      searchAsset();
    }
  }, [params.ain, searchAsset]);

  const submitRequest = async () => {
    if (!asset) {
      Alert.alert("Select Asset", "Search and select a valid asset first.");
      return;
    }
    if (asset.status !== "ASSIGNED") {
      Alert.alert(
        "Invalid Asset",
        "Repair requests are allowed only for assigned assets.",
      );
      return;
    }
    if (!problem.trim() || !remarks.trim()) {
      Alert.alert("Required Information", "Problem and remarks are required.");
      return;
    }
    if (repairCost.trim() && Number(repairCost) < 0) {
      Alert.alert("Invalid Repair Cost", "Repair cost cannot be negative.");
      return;
    }

    try {
      setSubmitting(true);
      await requestApi.createRepairRequest({
        assetId: asset._id,
        problem: problem.trim(),
        serviceProvider: serviceProvider.trim() || undefined,
        remarks: remarks.trim(),
        repairCost: repairCost.trim() ? Number(repairCost) : 0,
      });
      Alert.alert(
        "Request Submitted",
        "Your repair request has been sent successfully.",
        [{ text: "Done", onPress: () => router.back() }],
      );
    } catch (error: any) {
      Alert.alert(
        "Submission Failed",
        error?.message || "Could not send repair request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Repair Request</Text>
        <TouchableOpacity
          style={styles.historyButton}
          onPress={() => router.push("/repair-request-history" as never)}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Open repair request history"
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={Colors.light.primary}
          />
          <Text style={styles.historyButtonText}>History</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 58 : 0}
      >
        <ScrollView
          ref={formScrollRef}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.heroIcon}>
              <Ionicons
                name="build-outline"
                size={25}
                color={Colors.light.primary}
              />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.eyebrow}>ASSET OPERATIONS</Text>
              <Text style={styles.title}>Send Repair Request</Text>
              <Text style={styles.subtitle}>
                Report a problem with an assigned asset for review.
              </Text>
            </View>
          </View>

          <Text style={styles.label}>ASSET IDENTIFICATION NUMBER *</Text>
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Enter asset AIN"
              placeholderTextColor={Colors.light.textMuted}
              value={ain}
              onChangeText={(value) => {
                setAin(value);
                setAsset(null);
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              onSubmitEditing={searchAsset}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={searchAsset}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator color={Colors.light.white} />
              ) : (
                <Ionicons name="search" size={19} color={Colors.light.white} />
              )}
            </TouchableOpacity>
          </View>

          {asset ? (
            <View style={styles.assetCard}>
              <View style={styles.assetCardIcon}>
                <Ionicons
                  name="cube-outline"
                  size={22}
                  color={Colors.light.primary}
                />
              </View>
              <View style={styles.assetCardCopy}>
                <Text style={styles.assetAin}>{asset.ain}</Text>
                <Text style={styles.assetMeta}>
                  {asset.manufacturer?.name || "Igloo"} •{" "}
                  {asset.capacity || "—"}L • {asset.status}
                </Text>
              </View>
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={Colors.light.primary}
              />
            </View>
          ) : null}

          <Text style={styles.label}>PROBLEM *</Text>
          <TextInput
            style={styles.input}
            placeholder="Describe the issue with this asset"
            placeholderTextColor={Colors.light.textMuted}
            value={problem}
            onChangeText={setProblem}
            multiline
          />

          <Text style={styles.label}>SERVICE PROVIDER</Text>
          <TextInput
            style={styles.input}
            placeholder="Optional service provider"
            placeholderTextColor={Colors.light.textMuted}
            value={serviceProvider}
            onChangeText={setServiceProvider}
          />

          <Text style={styles.label}>REMARKS *</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            placeholder="Add details or instructions"
            placeholderTextColor={Colors.light.textMuted}
            value={remarks}
            onChangeText={setRemarks}
            multiline
            ref={remarksInputRef}
            onFocus={() => scrollFieldIntoView(remarksInputRef)}
          />

          <Text style={styles.label}>REPAIR COST</Text>
          <TextInput
            style={styles.input}
            placeholder="Optional cost"
            placeholderTextColor={Colors.light.textMuted}
            value={repairCost}
            onChangeText={setRepairCost}
            keyboardType="decimal-pad"
            ref={repairCostInputRef}
            onFocus={() => scrollFieldIntoView(repairCostInputRef)}
          />

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.disabledButton]}
            onPress={submitRequest}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.light.white} />
            ) : (
              <>
                <Ionicons
                  name="send-outline"
                  size={19}
                  color={Colors.light.white}
                />
                <Text style={styles.submitText}>Submit Repair Request</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
  flex: { flex: 1 },
  header: {
    height: 58,
    paddingHorizontal: Spacing.xl,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: Typography.size.md,
    fontWeight: "800",
    color: Colors.light.text,
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 7,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  historyButtonText: {
    fontSize: Typography.size.xs,
    fontWeight: "800",
    color: Colors.light.primaryDark,
  },
  content: { padding: Spacing.xl, paddingBottom: Spacing.xxl },
  hero: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.primaryLight,
  },
  heroIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: Colors.light.white,
  },
  heroCopy: { flex: 1 },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: Colors.light.primary,
  },
  title: {
    marginTop: 3,
    fontSize: Typography.size.lg,
    fontWeight: "800",
    color: Colors.light.text,
  },
  subtitle: {
    marginTop: 3,
    fontSize: Typography.size.xs,
    lineHeight: 17,
    color: Colors.light.textSecondary,
  },
  label: {
    marginTop: Spacing.md,
    marginBottom: 6,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: Colors.light.textMuted,
  },
  searchRow: { flexDirection: "row", gap: Spacing.sm },
  searchInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surface,
    color: Colors.light.text,
    fontSize: Typography.size.sm,
  },
  searchButton: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
  },
  assetCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primaryLight,
  },
  assetCardIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.sm,
    backgroundColor: Colors.light.white,
  },
  assetCardCopy: { flex: 1 },
  assetAin: {
    fontSize: Typography.size.sm,
    fontWeight: "800",
    color: Colors.light.text,
  },
  assetMeta: {
    marginTop: 3,
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
  },
  input: {
    minHeight: 50,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surface,
    color: Colors.light.text,
    fontSize: Typography.size.sm,
  },
  multilineInput: { minHeight: 90, textAlignVertical: "top" },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    minHeight: 52,
    marginTop: Spacing.xl,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
    ...Shadows.floating,
  },
  submitText: {
    color: Colors.light.white,
    fontSize: Typography.size.sm,
    fontWeight: "800",
  },
  disabledButton: { opacity: 0.6 },
});
