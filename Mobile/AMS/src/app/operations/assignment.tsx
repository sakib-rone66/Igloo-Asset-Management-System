// src/app/operations/assignment.tsx

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
import { assetApi, outletApi } from "../../services/api";
import { Asset, OutletRef } from "../../services/apiTypes";

export default function AssignmentScreen() {
  const params = useLocalSearchParams<{ assetId?: string; ain?: string }>();

  const [inStockAssets, setInStockAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [assetSearch, setAssetSearch] = useState("");

  const [outlets, setOutlets] = useState<OutletRef[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<OutletRef | null>(null);
  const [showOutletPicker, setShowOutletPicker] = useState(false);
  const [outletSearch, setOutletSearch] = useState("");

  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([
      assetApi.getAssets({ status: "IN_STOCK", limit: 100 }),
      outletApi.getOutlets({ status: "ACTIVE" }),
    ])
      .then(([assetsRes, outletsRes]) => {
        const aList = assetsRes.assets || [];
        setInStockAssets(aList);
        setOutlets(outletsRes.outlets || []);

        if (params.assetId) {
          const match = aList.find((a) => a._id === params.assetId);
          if (match) setSelectedAsset(match);
        }
      })
      .catch((err) => console.error("Assignment Load Error:", err))
      .finally(() => setLoading(false));
  }, [params.assetId]);

  const handleAssign = async () => {
    if (!selectedAsset) {
      Alert.alert(
        "Asset Required",
        "Please select an in-stock freezer to assign.",
      );
      return;
    }
    if (!selectedOutlet) {
      Alert.alert("Outlet Required", "Please select the destination outlet.");
      return;
    }

    try {
      setSubmitting(true);
      await assetApi.assignAsset(
        selectedAsset._id,
        selectedOutlet._id,
        remarks.trim() || undefined,
      );

      Alert.alert(
        "Assignment Complete",
        `Freezer ${selectedAsset.ain} assigned to ${selectedOutlet.name}.`,
        [{ text: "Done", onPress: () => router.back() }],
      );
    } catch (err: any) {
      Alert.alert(
        "Assignment Error",
        err?.message || "Failed to assign asset.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredAssets = inStockAssets.filter((a) => {
    if (!assetSearch.trim()) return true;
    const s = assetSearch.toLowerCase();
    return (
      a.ain.toLowerCase().includes(s) ||
      a.serialNumber?.toLowerCase().includes(s)
    );
  });

  const filteredOutlets = outlets.filter((o) => {
    if (!outletSearch.trim()) return true;
    const s = outletSearch.toLowerCase();
    return (
      o.name.toLowerCase().includes(s) ||
      o.outletCode?.toLowerCase().includes(s)
    );
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assign Asset to Outlet</Text>
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
          <Text style={styles.sectionTitle}>Asset Assignment</Text>
          <Text style={styles.sectionSubtitle}>
            Deploy an in-stock freezer from warehouse to an outlet
          </Text>

          {/* ASSET SELECTOR */}
          <Text style={styles.inputLabel}>SELECT IN-STOCK FREEZER *</Text>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => setShowAssetPicker((prev) => !prev)}
          >
            <Ionicons
              name="cube-outline"
              size={20}
              color={Colors.light.primary}
            />
            <Text
              style={[
                styles.selectText,
                !selectedAsset && styles.placeholderText,
              ]}
              numberOfLines={1}
            >
              {selectedAsset
                ? `${selectedAsset.ain} (${selectedAsset.capacity ? `${selectedAsset.capacity}L` : ""})`
                : "Choose available asset..."}
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
                  <Text style={styles.emptyDrop}>No in-stock assets found</Text>
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
                        SN: {a.serialNumber} •{" "}
                        {a.capacity ? `${a.capacity}L` : "Igloo"}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          )}

          {/* OUTLET SELECTOR */}
          <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>
            SELECT DESTINATION OUTLET *
          </Text>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => setShowOutletPicker((prev) => !prev)}
          >
            <Ionicons
              name="storefront-outline"
              size={20}
              color={Colors.light.info}
            />
            <Text
              style={[
                styles.selectText,
                !selectedOutlet && styles.placeholderText,
              ]}
              numberOfLines={1}
            >
              {selectedOutlet
                ? `${selectedOutlet.name}${selectedOutlet.outletCode ? ` (${selectedOutlet.outletCode})` : ""}`
                : "Choose target outlet..."}
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
                placeholder="Filter outlet name..."
                placeholderTextColor={Colors.light.textMuted}
                value={outletSearch}
                onChangeText={setOutletSearch}
              />
              <ScrollView style={styles.dropdownList} nestedScrollEnabled>
                {filteredOutlets.slice(0, 20).map((o) => (
                  <TouchableOpacity
                    key={o._id}
                    style={styles.dropItem}
                    onPress={() => {
                      setSelectedOutlet(o);
                      setShowOutletPicker(false);
                    }}
                  >
                    <Text style={styles.dropItemTitle}>{o.name}</Text>
                    {o.outletCode && (
                      <Text style={styles.dropItemSub}>{o.outletCode}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* REMARKS */}
          <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>
            HANDOVER REMARKS / NOTES (OPTIONAL)
          </Text>
          <TextInput
            style={styles.remarksInput}
            placeholder="Delivery note, vehicle number, receiver name..."
            placeholderTextColor={Colors.light.textMuted}
            value={remarks}
            onChangeText={setRemarks}
            multiline
            numberOfLines={3}
          />

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.btnDisabled]}
            onPress={handleAssign}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.light.white} />
            ) : (
              <>
                <Ionicons
                  name="person-add-outline"
                  size={20}
                  color={Colors.light.white}
                />
                <Text style={styles.submitBtnText}>Confirm Assignment</Text>
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
  submitBtnText: {
    color: Colors.light.white,
    fontSize: Typography.size.md,
    fontWeight: "700",
  },
});
