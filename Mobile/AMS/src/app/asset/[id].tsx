// src/app/asset/[id].tsx

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
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

export default function AssetDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAssetDetails = useCallback(async () => {
    if (!id) return;
    try {
      setError(null);
      let foundAsset: Asset | null = null;

      // Try fetching by MongoDB ObjectId if it looks like a 24-char hex, else try AIN
      const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
      if (isObjectId) {
        try {
          const res = await assetApi.getAssetById(id);
          foundAsset = res.asset;
        } catch {
          // If fail, fallback to AIN
          const res = await assetApi.getAssetByAIN(id);
          foundAsset = res.asset;
        }
      } else {
        const res = await assetApi.getAssetByAIN(id);
        foundAsset = res.asset;
      }

      setAsset(foundAsset);
    } catch (err: any) {
      console.error("Fetch Asset Detail Error:", err);
      setError(
        err?.message || "Asset not found or unable to connect to server.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAssetDetails();
  }, [fetchAssetDetails]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAssetDetails();
  }, [fetchAssetDetails]);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "IN_STOCK":
        return {
          text: "#006B32",
          bg: Colors.light.primaryLight,
          label: "IN STOCK",
        };
      case "ASSIGNED":
        return { text: "#2778C8", bg: "#EAF3FF", label: "ASSIGNED" };
      case "UNDER_REPAIR":
        return { text: "#E59B17", bg: "#FFF5DE", label: "UNDER REPAIR" };
      case "DISPOSED":
        return { text: "#D64545", bg: "#FDECEC", label: "DISPOSED" };
      default:
        return {
          text: Colors.light.textSecondary,
          bg: Colors.light.surfaceSecondary,
          label: status || "UNKNOWN",
        };
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading freezer details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !asset) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
            <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Asset Not Found</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.centerContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={56}
            color={Colors.light.danger}
          />
          <Text style={styles.errorTitle}>Could not load asset</Text>
          <Text style={styles.errorSubtitle}>
            {error || "No asset was found matching this identifier."}
          </Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchAssetDetails}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = getStatusColor(asset.status);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{asset.ain}</Text>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/scan",
            })
          }
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
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.primary]}
          />
        }
      >
        {/* HERO SPEC CARD */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.ainLabel}>ASSET IDENTIFICATION NUMBER</Text>
              <Text style={styles.ainValue}>{asset.ain}</Text>
            </View>
            <View
              style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}
            >
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {statusStyle.label}
              </Text>
            </View>
          </View>

          <View style={styles.specsGrid}>
            <View style={styles.specItem}>
              <Text style={styles.specLabel}>SERIAL NUMBER</Text>
              <Text style={styles.specValue}>{asset.serialNumber || "—"}</Text>
            </View>

            <View style={styles.specItem}>
              <Text style={styles.specLabel}>CAPACITY</Text>
              <Text style={styles.specValue}>
                {asset.capacity ? `${asset.capacity} Liters` : "—"}
              </Text>
            </View>

            <View style={styles.specItem}>
              <Text style={styles.specLabel}>MANUFACTURER</Text>
              <Text style={styles.specValue}>
                {asset.manufacturer?.name || "Igloo"}
              </Text>
            </View>

            <View style={styles.specItem}>
              <Text style={styles.specLabel}>MANUFACTURE DATE</Text>
              <Text style={styles.specValue}>
                {asset.manufacturingMonth && asset.manufacturingYear
                  ? `${String(asset.manufacturingMonth).padStart(2, "0")}/${asset.manufacturingYear}`
                  : "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* QUICK ACTIONS TOOLBAR */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Field Operations</Text>
        </View>

        <View style={styles.actionRow}>
          {asset.status === "IN_STOCK" && (
            <TouchableOpacity
              style={[
                styles.actionBtn,
                { backgroundColor: Colors.light.primaryLight },
              ]}
              onPress={() =>
                router.push({
                  pathname: "/operations/assignment" as any,
                  params: { assetId: asset._id, ain: asset.ain },
                })
              }
            >
              <Ionicons
                name="person-add-outline"
                size={20}
                color={Colors.light.primary}
              />
              <Text
                style={[
                  styles.actionBtnText,
                  { color: Colors.light.primaryDark },
                ]}
              >
                Assign
              </Text>
            </TouchableOpacity>
          )}

          {asset.status === "ASSIGNED" && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#EAF3FF" }]}
              onPress={() =>
                router.push({
                  pathname: "/operations/transfer" as any,
                  params: { assetId: asset._id, ain: asset.ain },
                })
              }
            >
              <Ionicons
                name="swap-horizontal-outline"
                size={20}
                color={Colors.light.info}
              />
              <Text
                style={[styles.actionBtnText, { color: Colors.light.info }]}
              >
                Transfer
              </Text>
            </TouchableOpacity>
          )}

          {asset.status === "ASSIGNED" && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#FFF5DE" }]}
              onPress={() =>
                router.push({
                  pathname: "/operations/return" as any,
                  params: { assetId: asset._id, ain: asset.ain },
                })
              }
            >
              <Ionicons
                name="return-down-back-outline"
                size={20}
                color={Colors.light.warning}
              />
              <Text
                style={[styles.actionBtnText, { color: Colors.light.warning }]}
              >
                Return
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: "#F3E8FF" }]}
            onPress={() =>
              router.push({
                pathname: "/verification" as any,
                params: { ain: asset.ain, outletId: asset.currentOutlet?._id },
              })
            }
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={20}
              color="#6B46C1"
            />
            <Text style={[styles.actionBtnText, { color: "#6B46C1" }]}>
              Verify
            </Text>
          </TouchableOpacity>

          {asset.status === "ASSIGNED" && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#EAF3FF" }]}
              onPress={() =>
                router.push({
                  pathname: "/repair-request" as any,
                  params: { assetId: asset._id, ain: asset.ain },
                })
              }
            >
              <Ionicons
                name="build-outline"
                size={20}
                color={Colors.light.info}
              />
              <Text
                style={[styles.actionBtnText, { color: Colors.light.info }]}
              >
                Repair
              </Text>
            </TouchableOpacity>
          )}

          {asset.status !== "DISPOSED" && (
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: "#FDECEC" }]}
              onPress={() =>
                router.push({
                  pathname: "/operations/disposal" as any,
                  params: { assetId: asset._id, ain: asset.ain },
                })
              }
            >
              <Ionicons
                name="trash-outline"
                size={20}
                color={Colors.light.danger}
              />
              <Text
                style={[styles.actionBtnText, { color: Colors.light.danger }]}
              >
                Dispose
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ASSIGNED OUTLET CARD */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Location</Text>
        </View>

        {asset.currentOutlet ? (
          <View style={styles.outletCard}>
            <View style={styles.outletIconBox}>
              <Ionicons
                name="storefront-outline"
                size={24}
                color={Colors.light.primary}
              />
            </View>
            <View style={styles.outletInfo}>
              <Text style={styles.outletName}>{asset.currentOutlet.name}</Text>
              {asset.currentOutlet.outletCode && (
                <Text style={styles.outletCode}>
                  Code: {asset.currentOutlet.outletCode}
                </Text>
              )}
              {asset.currentOutlet.address && (
                <Text style={styles.outletAddress}>
                  {asset.currentOutlet.address}
                </Text>
              )}
              {asset.currentOutlet.contactPerson && (
                <Text style={styles.outletContact}>
                  Contact: {asset.currentOutlet.contactPerson}{" "}
                  {asset.currentOutlet.phone
                    ? `(${asset.currentOutlet.phone})`
                    : ""}
                </Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.emptyOutletCard}>
            <Ionicons
              name="cube-outline"
              size={24}
              color={Colors.light.textMuted}
            />
            <Text style={styles.emptyOutletText}>
              In Central Warehouse (Not assigned to any outlet)
            </Text>
          </View>
        )}

        {/* ASSET STATUS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Asset Status</Text>
        </View>

        <View style={styles.statusGrid}>
          <View style={styles.assetStatusCard}>
            <View
              style={[styles.assetStatusIcon, { backgroundColor: "#F3E8FF" }]}
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={22}
                color="#6B46C1"
              />
            </View>
            <Text style={styles.assetStatusLabel}>Verification</Text>
            <Text
              style={[
                styles.assetStatusValue,
                {
                  color:
                    asset.verificationStatus === "VERIFIED"
                      ? Colors.light.primaryDark
                      : Colors.light.warning,
                },
              ]}
            >
              {asset.verificationStatus === "VERIFIED"
                ? "VERIFIED"
                : asset.verificationStatus || "NOT VERIFIED"}
            </Text>
          </View>

          <View style={styles.assetStatusCard}>
            <View
              style={[
                styles.assetStatusIcon,
                { backgroundColor: Colors.light.primaryLight },
              ]}
            >
              <Ionicons
                name={
                  asset.isActivated
                    ? "checkmark-circle-outline"
                    : "pause-circle-outline"
                }
                size={22}
                color={
                  asset.isActivated
                    ? Colors.light.primary
                    : Colors.light.textMuted
                }
              />
            </View>
            <Text style={styles.assetStatusLabel}>Activation</Text>
            <Text
              style={[
                styles.assetStatusValue,
                {
                  color: asset.isActivated
                    ? Colors.light.primaryDark
                    : Colors.light.textMuted,
                },
              ]}
            >
              {asset.isActivated ? "ACTIVATED" : "NOT ACTIVATED"}
            </Text>
          </View>
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: Typography.size.sm,
    color: Colors.light.textSecondary,
  },
  errorTitle: {
    fontSize: Typography.size.lg,
    fontWeight: "700",
    color: Colors.light.text,
    marginTop: Spacing.md,
  },
  errorSubtitle: {
    fontSize: Typography.size.sm,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  retryBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.md,
  },
  retryText: {
    color: Colors.light.white,
    fontWeight: "700",
  },
  heroCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  ainLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.light.textSecondary,
    letterSpacing: 0.8,
  },
  ainValue: {
    fontSize: Typography.size.xxl,
    fontWeight: "800",
    color: Colors.light.text,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.pill,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  specsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  specItem: {
    width: "47%",
  },
  specLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.light.textMuted,
    letterSpacing: 0.5,
  },
  specValue: {
    fontSize: Typography.size.sm,
    fontWeight: "700",
    color: Colors.light.text,
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.xs,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: "700",
    color: Colors.light.text,
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  actionBtn: {
    width: "31%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
  },
  actionBtnText: {
    fontSize: Typography.size.xs,
    fontWeight: "700",
  },
  outletCard: {
    flexDirection: "row",
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  outletIconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  outletInfo: {
    flex: 1,
  },
  outletName: {
    fontSize: Typography.size.md,
    fontWeight: "700",
    color: Colors.light.text,
  },
  outletCode: {
    fontSize: Typography.size.xs,
    fontWeight: "600",
    color: Colors.light.primary,
    marginTop: 2,
  },
  outletAddress: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  outletContact: {
    fontSize: Typography.size.xs,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  emptyOutletCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    backgroundColor: Colors.light.surfaceSecondary,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
  },
  emptyOutletText: {
    fontSize: Typography.size.sm,
    color: Colors.light.textSecondary,
    fontWeight: "600",
  },
  statusGrid: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  assetStatusCard: {
    flex: 1,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    padding: Spacing.md,
    ...Shadows.card,
  },
  assetStatusIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  assetStatusLabel: {
    color: Colors.light.textSecondary,
    fontSize: Typography.size.xs,
    fontWeight: "600",
  },
  assetStatusValue: {
    fontSize: Typography.size.sm,
    fontWeight: "800",
    marginTop: 4,
  },
  timeline: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.surfaceSecondary,
    paddingBottom: Spacing.sm,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.light.primary,
    marginTop: 5,
    marginRight: Spacing.md,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timelineAction: {
    fontSize: Typography.size.sm,
    fontWeight: "700",
    color: Colors.light.text,
  },
  timelineDate: {
    fontSize: Typography.size.xs,
    color: Colors.light.textMuted,
  },
  timelineDetail: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  timelineRemarks: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    fontStyle: "italic",
    marginTop: 2,
  },
  timelineUser: {
    fontSize: 10,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  emptyHistory: {
    padding: Spacing.lg,
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
  },
  emptyHistoryText: {
    fontSize: Typography.size.sm,
    color: Colors.light.textMuted,
  },
});
