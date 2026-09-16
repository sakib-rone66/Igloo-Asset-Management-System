// src/app/verification.tsx

import React, { useCallback, useEffect, useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";
import { outletApi, verificationApi } from "../services/api";
import { Asset, OutletRef } from "../services/apiTypes";

export default function VerificationScreen() {
  const params = useLocalSearchParams<{ ain?: string; outletId?: string }>();

  const [ain, setAin] = useState(params.ain || "");
  const [searching, setSearching] = useState(false);
  const [asset, setAsset] = useState<Asset | null>(null);

  const [outlets, setOutlets] = useState<OutletRef[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<OutletRef | null>(null);
  const [showOutletPicker, setShowOutletPicker] = useState(false);
  const [outletSearch, setOutletSearch] = useState("");

  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    outletApi
      .getOutlets({ status: "ACTIVE" })
      .then((res) => {
        const list = res.outlets || [];
        setOutlets(list);
        if (params.outletId) {
          const match = list.find((o) => o._id === params.outletId);
          if (match) setSelectedOutlet(match);
        }
      })
      .catch((err) => console.error("Failed to fetch outlets:", err));
  }, [params.outletId]);

  const handleLookup = useCallback(
    async (targetAin = ain) => {
      if (!targetAin.trim()) {
        Alert.alert("Enter AIN", "Please enter the freezer AIN to verify.");
        return;
      }
      try {
        setSearching(true);
        const res = await verificationApi.getAssetForVerification(
          targetAin.trim(),
        );
        setAsset(res.asset);
        if (res.asset.currentOutlet) {
          setSelectedOutlet(res.asset.currentOutlet as any);
        }
      } catch (err: any) {
        Alert.alert(
          "Lookup Failed",
          err?.message || "Asset not found or not assigned.",
        );
        setAsset(null);
      } finally {
        setSearching(false);
      }
    },
    [ain],
  );

  useEffect(() => {
    if (params.ain) {
      handleLookup(params.ain);
    }
  }, [handleLookup, params.ain]);

  const handleSubmit = async () => {
    if (!asset) {
      Alert.alert("Asset Required", "Please lookup and verify an asset first.");
      return;
    }
    const outletId = selectedOutlet?._id || (asset.currentOutlet as any)?._id;
    if (!outletId) {
      Alert.alert(
        "Outlet Required",
        "Please select the outlet where this freezer is located.",
      );
      return;
    }

    try {
      setSubmitting(true);
      await verificationApi.createVerificationMapping({
        ain: asset.ain,
        outletId,
        remarks: remarks.trim() || undefined,
      });

      Alert.alert(
        "Verification Submitted",
        `Verification mapping for freezer ${asset.ain} was submitted successfully.`,
        [{ text: "Done", onPress: () => router.back() }],
      );
    } catch (err: any) {
      Alert.alert(
        "Verification Error",
        err?.message || "Unable to submit verification.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOutlets = outlets.filter((o) => {
    if (!outletSearch.trim()) return true;
    const s = outletSearch.toLowerCase();
    return (
      o.name?.toLowerCase().includes(s) ||
      o.outletCode?.toLowerCase().includes(s)
    );
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Asset Verification</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* LOOKUP CARD */}
        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>IDENTIFY FREEZER</Text>
          <Text style={styles.cardTitle}>Enter AIN or Scan QR</Text>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.ainInput}
              placeholder="e.g. AIN-10045"
              placeholderTextColor={Colors.light.textMuted}
              value={ain}
              onChangeText={setAin}
              autoCapitalize="characters"
              returnKeyType="search"
              onSubmitEditing={() => handleLookup()}
            />
            <TouchableOpacity
              style={styles.lookupBtn}
              onPress={() => handleLookup()}
              disabled={searching}
            >
              {searching ? (
                <ActivityIndicator size="small" color={Colors.light.white} />
              ) : (
                <Text style={styles.lookupBtnText}>Find</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* ASSET PREVIEW */}
        {asset && (
          <View style={styles.assetCard}>
            <View style={styles.assetHeader}>
              <View style={styles.ainBox}>
                <Ionicons
                  name="cube-outline"
                  size={22}
                  color={Colors.light.primary}
                />
                <Text style={styles.ainText}>{asset.ain}</Text>
              </View>
              <View style={styles.badgeVerified}>
                <Text style={styles.badgeVerifiedText}>
                  {asset.verificationStatus || "PENDING"}
                </Text>
              </View>
            </View>

            <View style={styles.specsRow}>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>SERIAL</Text>
                <Text style={styles.specValue}>{asset.serialNumber}</Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>CAPACITY</Text>
                <Text style={styles.specValue}>
                  {asset.capacity ? `${asset.capacity}L` : "—"}
                </Text>
              </View>
              <View style={styles.specBox}>
                <Text style={styles.specLabel}>STATUS</Text>
                <Text style={styles.specValue}>{asset.status}</Text>
              </View>
            </View>

            {/* CONFIRM OUTLET */}
            <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>
              CONFIRM CURRENT OUTLET LOCATION *
            </Text>
            <TouchableOpacity
              style={styles.outletSelectBtn}
              onPress={() => setShowOutletPicker((prev) => !prev)}
            >
              <Ionicons
                name="storefront-outline"
                size={20}
                color={Colors.light.primary}
              />
              <Text style={styles.outletSelectText} numberOfLines={1}>
                {selectedOutlet
                  ? `${selectedOutlet.name}${selectedOutlet.outletCode ? ` (${selectedOutlet.outletCode})` : ""}`
                  : "Choose outlet..."}
              </Text>
              <Ionicons
                name={showOutletPicker ? "chevron-up" : "chevron-down"}
                size={18}
                color={Colors.light.textMuted}
              />
            </TouchableOpacity>

            {showOutletPicker && (
              <View style={styles.dropdown}>
                <TextInput
                  style={styles.dropdownSearch}
                  placeholder="Filter outlet..."
                  placeholderTextColor={Colors.light.textMuted}
                  value={outletSearch}
                  onChangeText={setOutletSearch}
                />
                <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                  {filteredOutlets.slice(0, 15).map((outlet) => (
                    <TouchableOpacity
                      key={outlet._id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedOutlet(outlet);
                        setShowOutletPicker(false);
                      }}
                    >
                      <Text style={styles.dropdownItemName}>{outlet.name}</Text>
                      {outlet.outletCode && (
                        <Text style={styles.dropdownItemCode}>
                          {outlet.outletCode}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* REMARKS */}
            <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>
              VERIFICATION NOTES / OBSERVATIONS
            </Text>
            <TextInput
              style={styles.remarksInput}
              placeholder="e.g. Temperature OK, freezer in good physical condition..."
              placeholderTextColor={Colors.light.textMuted}
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.verifyBtn, submitting && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.light.white} />
              ) : (
                <>
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color={Colors.light.white}
                  />
                  <Text style={styles.verifyBtnText}>
                    Confirm & Submit Verification
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingScanButton}
        onPress={() => router.push("/scan" as any)}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Scan asset QR code"
      >
        <Ionicons name="qr-code-outline" size={24} color={Colors.light.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: Typography.size.md,
    fontWeight: "700",
    color: Colors.light.text,
  },
  headerSpacer: {
    width: 24,
  },
  floatingScanButton: {
    position: "absolute",
    right: Spacing.xl,
    bottom: "5%",
    width: 56,
    height: 56,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    ...Shadows.floating,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl + 40,
  },
  card: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  cardEyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.light.textMuted,
    letterSpacing: 0.8,
  },
  cardTitle: {
    fontSize: Typography.size.md,
    fontWeight: "700",
    color: Colors.light.text,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  ainInput: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.size.sm,
    fontWeight: "700",
    color: Colors.light.text,
  },
  lookupBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  lookupBtnText: {
    color: Colors.light.white,
    fontWeight: "700",
    fontSize: Typography.size.sm,
  },
  assetCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.card,
  },
  assetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  ainBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  ainText: {
    fontSize: Typography.size.lg,
    fontWeight: "800",
    color: Colors.light.text,
  },
  badgeVerified: {
    backgroundColor: "#F3E8FF",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  badgeVerifiedText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#6B46C1",
  },
  specsRow: {
    flexDirection: "row",
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  specBox: {
    flex: 1,
  },
  specLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.light.textMuted,
  },
  specValue: {
    fontSize: Typography.size.xs,
    fontWeight: "700",
    color: Colors.light.text,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.light.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  outletSelectBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    gap: Spacing.sm,
  },
  outletSelectText: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontWeight: "600",
    color: Colors.light.text,
  },
  dropdown: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    maxHeight: 200,
    overflow: "hidden",
  },
  dropdownSearch: {
    height: 40,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    fontSize: Typography.size.xs,
    color: Colors.light.text,
  },
  dropdownList: {
    maxHeight: 160,
  },
  dropdownItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.surfaceSecondary,
  },
  dropdownItemName: {
    fontSize: Typography.size.sm,
    fontWeight: "600",
    color: Colors.light.text,
  },
  dropdownItemCode: {
    fontSize: Typography.size.xs,
    color: Colors.light.textMuted,
  },
  remarksInput: {
    backgroundColor: Colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: Typography.size.sm,
    color: Colors.light.text,
    minHeight: 70,
    textAlignVertical: "top",
    marginBottom: Spacing.lg,
  },
  verifyBtn: {
    backgroundColor: Colors.light.primary,
    height: 50,
    borderRadius: Radius.lg,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  verifyBtnText: {
    color: Colors.light.white,
    fontSize: Typography.size.md,
    fontWeight: "700",
  },
});
