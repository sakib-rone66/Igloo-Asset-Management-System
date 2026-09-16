// src/app/operations/disposal.tsx

import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
} from "../../constants/theme";
import { assetApi, requestApi } from "../../services/api";
import { Asset } from "../../services/apiTypes";

const DISPOSAL_REASONS = [
  "Beyond Economical Repair",
  "Severe Physical Damage",
  "Compressor Breakdown (Obsolete)",
  "Condemned / Safety Hazard",
  "Asset Lost / Stolen",
  "Other",
];

export default function DisposalScreen() {
  const params = useLocalSearchParams<{ assetId?: string; ain?: string }>();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [assetSearch, setAssetSearch] = useState("");

  const [selectedReason, setSelectedReason] = useState(DISPOSAL_REASONS[0]);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    assetApi
      .getAssets({ limit: 100 })
      .then((res) => {
        const aList = res.assets || [];
        setAssets(aList);
        if (params.assetId) {
          const match = aList.find((a) => a._id === params.assetId);
          if (match) setSelectedAsset(match);
        }
      })
      .catch((err) => console.error("Disposal Load Error:", err))
      .finally(() => setLoading(false));
  }, [params.assetId]);

  const handleDisposal = async () => {
    if (!selectedAsset) {
      Alert.alert("Asset Required", "Please select an asset for disposal.");
      return;
    }

    Alert.alert(
      "Confirm Disposal Request",
      `Submit disposal request for freezer ${selectedAsset.ain} due to "${selectedReason}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Submit Request",
          style: "destructive",
          onPress: async () => {
            try {
              setSubmitting(true);
              await requestApi.createDisposal({
                assetId: selectedAsset._id,
                reason: selectedReason,
                remarks: remarks.trim() || undefined,
              });

              Alert.alert(
                "Disposal Request Submitted",
                `Disposal request for freezer ${selectedAsset.ain} has been logged for supervisor review.`,
                [{ text: "Done", onPress: () => router.back() }],
              );
            } catch (err: any) {
              Alert.alert(
                "Submission Error",
                err?.message || "Failed to submit disposal request.",
              );
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

  const filteredAssets = assets.filter((a) => {
    if (!assetSearch.trim()) return true;
    const s = assetSearch.toLowerCase();
    return (
      a.ain.toLowerCase().includes(s) ||
      a.serialNumber?.toLowerCase().includes(s)
    );
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Asset Disposal Request</Text>
        <TouchableOpacity
          onPress={() => router.push("/scan" as any)}
          hitSlop={10}
        >
          <Ionicons
            name="qr-code-outline"
            size={22}
            color={Colors.light.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Asset Disposal</Text>
          <Text style={styles.sectionSubtitle}>
            Initiate formal decommissioning of condemned or unrepairable
            freezers
          </Text>

          {/* ASSET SELECTOR */}
          <Text style={styles.inputLabel}>SELECT FREEZER FOR DISPOSAL *</Text>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => setShowAssetPicker((prev) => !prev)}
          >
            <Ionicons
              name="trash-outline"
              size={20}
              color={Colors.light.danger}
            />
            <Text
              style={[
                styles.selectText,
                !selectedAsset && styles.placeholderText,
              ]}
              numberOfLines={1}
            >
              {selectedAsset
                ? `${selectedAsset.ain} (${selectedAsset.status})`
                : "Choose freezer to decommission..."}
            </Text>
            <Ionicons
              name={showAssetPicker ? "chevron-up" : "chevron-down"}
              size={18}
              color={Colors.light.textMuted}
            />
          </TouchableOpacity>

          {showAssetPicker && (
            <View style={styles.dropdown}>
              <TextInput
                style={styles.dropdownSearch}
                placeholder="Search AIN or Serial..."
                placeholderTextColor={Colors.light.textMuted}
                value={assetSearch}
                onChangeText={setAssetSearch}
              />
              <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                {filteredAssets.length === 0 ? (
                  <Text style={styles.emptyDrop}>No matching assets found</Text>
                ) : (
                  filteredAssets.slice(0, 20).map((a) => (
                    <TouchableOpacity
                      key={a._id}
                      style={styles.dropItem}
                      onPress={() => {
                        setSelectedAsset(a);
                        setShowAssetPicker(false);
                      }}
                    >
                      <Text style={styles.dropItemTitle}>{a.ain}</Text>
                      <Text style={styles.dropItemSub}>
                        Status: {a.status} • SN: {a.serialNumber}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          )}

          {/* REASON PILLS */}
          <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>
            DISPOSAL REASON *
          </Text>
          <View style={styles.reasonsList}>
            {DISPOSAL_REASONS.map((reason) => {
              const isSelected = selectedReason === reason;
              return (
                <TouchableOpacity
                  key={reason}
                  style={[
                    styles.reasonChip,
                    isSelected && styles.reasonChipActive,
                  ]}
                  onPress={() => setSelectedReason(reason)}
                >
                  <Text
                    style={[
                      styles.reasonChipText,
                      isSelected && styles.reasonChipTextActive,
                    ]}
                  >
                    {reason}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* REMARKS */}
          <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>
            DETAILED TECHNICAL JUSTIFICATION / REMARKS
          </Text>
          <TextInput
            style={styles.remarksInput}
            placeholder="Describe faults, damage inspection findings, scrap value..."
            placeholderTextColor={Colors.light.textMuted}
            value={remarks}
            onChangeText={setRemarks}
            multiline
            numberOfLines={3}
          />

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.btnDisabled]}
            onPress={handleDisposal}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.light.white} />
            ) : (
              <>
                <Ionicons
                  name="trash-outline"
                  size={20}
                  color={Colors.light.white}
                />
                <Text style={styles.submitBtnText}>
                  Submit Disposal Request
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    ...Shadows.card,
  },
  sectionTitle: {
    fontSize: Typography.size.lg,
    fontWeight: "800",
    color: Colors.light.text,
  },
  sectionSubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.lg,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.light.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  selectBtn: {
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
  selectText: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontWeight: "600",
    color: Colors.light.text,
  },
  placeholderText: {
    color: Colors.light.textMuted,
    fontWeight: "normal",
  },
  dropdown: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    maxHeight: 200,
    overflow: "hidden",
    ...Shadows.floating,
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
  dropItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.surfaceSecondary,
  },
  dropItemTitle: {
    fontSize: Typography.size.sm,
    fontWeight: "700",
    color: Colors.light.text,
  },
  dropItemSub: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  emptyDrop: {
    padding: Spacing.md,
    color: Colors.light.textMuted,
    fontSize: Typography.size.xs,
    textAlign: "center",
  },
  reasonsList: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  reasonChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  reasonChipActive: {
    backgroundColor: "#FDECEC",
    borderColor: Colors.light.danger,
  },
  reasonChipText: {
    fontSize: Typography.size.xs,
    fontWeight: "600",
    color: Colors.light.text,
  },
  reasonChipTextActive: {
    color: Colors.light.danger,
    fontWeight: "700",
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
  submitBtn: {
    backgroundColor: Colors.light.danger,
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
  submitBtnText: {
    color: Colors.light.white,
    fontSize: Typography.size.md,
    fontWeight: "700",
  },
});
