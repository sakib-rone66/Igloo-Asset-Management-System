// src/app/operations/return.tsx

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
import { assetApi } from "../../services/api";
import { Asset } from "../../services/apiTypes";

export default function ReturnScreen() {
  const params = useLocalSearchParams<{ assetId?: string; ain?: string }>();

  const [assignedAssets, setAssignedAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [assetSearch, setAssetSearch] = useState("");

  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    assetApi
      .getAssets({ status: "ASSIGNED", limit: 100 })
      .then((res) => {
        const aList = res.assets || [];
        setAssignedAssets(aList);
        if (params.assetId) {
          const match = aList.find((a) => a._id === params.assetId);
          if (match) setSelectedAsset(match);
        }
      })
      .catch((err) => console.error("Return Load Error:", err))
      .finally(() => setLoading(false));
  }, [params.assetId]);

  const handleReturn = async () => {
    if (!selectedAsset) {
      Alert.alert(
        "Asset Required",
        "Please select an assigned freezer to return.",
      );
      return;
    }

    Alert.alert(
      "Confirm Return to Warehouse",
      `Are you sure you want to return freezer ${selectedAsset.ain} from ${selectedAsset.currentOutlet?.name || "outlet"} back to central stock?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm Return",
          style: "destructive",
          onPress: async () => {
            try {
              setSubmitting(true);
              await assetApi.returnAsset(
                selectedAsset._id,
                remarks.trim() || undefined,
              );

              Alert.alert(
                "Return Complete",
                `Freezer ${selectedAsset.ain} is now in stock at Central Warehouse.`,
                [{ text: "Done", onPress: () => router.back() }],
              );
            } catch (err: any) {
              Alert.alert(
                "Return Failed",
                err?.message || "Could not complete return.",
              );
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
    );
  };

  const filteredAssets = assignedAssets.filter((a) => {
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
        <Text style={styles.headerTitle}>Return Asset to Warehouse</Text>
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
          <Text style={styles.sectionTitle}>Asset Return</Text>
          <Text style={styles.sectionSubtitle}>
            Return a deployed freezer from an outlet back to central warehouse
          </Text>

          {/* ASSET SELECTOR */}
          <Text style={styles.inputLabel}>SELECT DEPLOYED FREEZER *</Text>
          <TouchableOpacity
            style={styles.selectBtn}
            onPress={() => setShowAssetPicker((prev) => !prev)}
          >
            <Ionicons
              name="cube-outline"
              size={20}
              color={Colors.light.warning}
            />
            <Text
              style={[
                styles.selectText,
                !selectedAsset && styles.placeholderText,
              ]}
              numberOfLines={1}
            >
              {selectedAsset
                ? `${selectedAsset.ain} (At: ${selectedAsset.currentOutlet?.name || "Outlet"})`
                : "Choose deployed freezer to return..."}
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
                  <Text style={styles.emptyDrop}>
                    No assigned freezers found
                  </Text>
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
                        Current: {a.currentOutlet?.name || "Unknown"}
                      </Text>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          )}

          {/* CURRENT OUTLET DISPLAY */}
          {selectedAsset?.currentOutlet && (
            <View style={styles.fromBox}>
              <Text style={styles.fromLabel}>RETURNING FROM:</Text>
              <Text style={styles.fromValue}>
                {selectedAsset.currentOutlet.name}
              </Text>
            </View>
          )}

          {/* RETURN REMARKS */}
          <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>
            RETURN REASON / PHYSICAL CONDITION REMARKS
          </Text>
          <TextInput
            style={styles.remarksInput}
            placeholder="e.g. Outlet closed, freezer needs servicing, store renovation..."
            placeholderTextColor={Colors.light.textMuted}
            value={remarks}
            onChangeText={setRemarks}
            multiline
            numberOfLines={3}
          />

          {/* SUBMIT BUTTON */}
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.btnDisabled]}
            onPress={handleReturn}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.light.white} />
            ) : (
              <>
                <Ionicons
                  name="return-down-back-outline"
                  size={20}
                  color={Colors.light.white}
                />
                <Text style={styles.submitBtnText}>
                  Confirm Return to Warehouse
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
  fromBox: {
    backgroundColor: "#FFF5DE",
    padding: Spacing.sm,
    borderRadius: Radius.md,
    marginTop: Spacing.sm,
  },
  fromLabel: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.light.warning,
  },
  fromValue: {
    fontSize: Typography.size.xs,
    fontWeight: "700",
    color: Colors.light.text,
    marginTop: 2,
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
    backgroundColor: Colors.light.warning,
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
