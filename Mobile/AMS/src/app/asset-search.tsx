// src/app/asset-search.tsx

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
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
import { assetApi } from "../services/api";
import { Asset } from "../services/apiTypes";

const FILTER_TABS = [
  { key: "ALL", label: "All" },
  { key: "IN_STOCK", label: "In Stock" },
  { key: "ASSIGNED", label: "Assigned" },
  { key: "UNDER_REPAIR", label: "Repair" },
  { key: "DISPOSED", label: "Disposed" },
];

export default function AssetSearchScreen() {
  const params = useLocalSearchParams<{ status?: string }>();

  const [selectedFilter, setSelectedFilter] = useState(params.status || "ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchAssets = useCallback(
    async (targetPage = 1, isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else if (targetPage === 1) setLoading(true);

        const filterStatus =
          selectedFilter === "ALL" ? undefined : selectedFilter;
        const res = await assetApi.getAssets({
          status: filterStatus,
          ain: searchQuery.trim() || undefined,
          page: targetPage,
          limit: 20,
        });

        const newAssets = res.assets || [];
        if (targetPage === 1) {
          setAssets(newAssets);
        } else {
          setAssets((prev) => [...prev, ...newAssets]);
        }

        setHasMore(targetPage < (res.totalPages || 1));
        setPage(targetPage);
      } catch (err) {
        console.error("Failed to load assets:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedFilter, searchQuery],
  );

  useEffect(() => {
    fetchAssets(1);
  }, [fetchAssets]);

  const onRefresh = () => {
    fetchAssets(1, true);
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      fetchAssets(page + 1);
    }
  };

  const getStatusBadge = (status: string) => {
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
        return { text: "#E59B17", bg: "#FFF5DE", label: "REPAIR" };
      case "DISPOSED":
        return { text: "#D64545", bg: "#FDECEC", label: "DISPOSED" };
      default:
        return {
          text: Colors.light.textSecondary,
          bg: Colors.light.surfaceSecondary,
          label: status,
        };
    }
  };

  const renderAssetCard = ({ item }: { item: Asset }) => {
    const badge = getStatusBadge(item.status);
    return (
      <TouchableOpacity
        style={styles.assetCard}
        activeOpacity={0.8}
        onPress={() =>
          router.push({
            pathname: "/asset/[id]",
            params: { id: item._id },
          } as any)
        }
      >
        <View style={styles.cardTop}>
          <View style={styles.ainRow}>
            <Ionicons
              name="cube-outline"
              size={18}
              color={Colors.light.primary}
            />
            <Text style={styles.ainText}>{item.ain}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: badge.bg }]}>
            <Text style={[styles.badgeText, { color: badge.text }]}>
              {badge.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Serial:</Text>
            <Text style={styles.detailValue}>{item.serialNumber || "—"}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Capacity:</Text>
            <Text style={styles.detailValue}>
              {item.capacity ? `${item.capacity}L` : "—"}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location:</Text>
            <Text
              style={[
                styles.detailValue,
                item.currentOutlet ? styles.outletHighlight : undefined,
              ]}
              numberOfLines={1}
            >
              {item.currentOutlet?.name || "Warehouse"}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.manufacturerText}>
            {item.manufacturer?.name || "Igloo"}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors.light.textMuted}
          />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assets Directory</Text>
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

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.light.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by AIN or Serial..."
            placeholderTextColor={Colors.light.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="characters"
            returnKeyType="search"
            onSubmitEditing={() => fetchAssets(1)}
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery("")} hitSlop={8}>
              <Ionicons
                name="close-circle"
                size={18}
                color={Colors.light.textMuted}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* FILTER TABS */}
      <View style={styles.tabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          data={FILTER_TABS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={styles.tabsContent}
          renderItem={({ item }) => {
            const isSelected = selectedFilter === item.key;
            return (
              <TouchableOpacity
                style={[styles.tabChip, isSelected && styles.tabChipActive]}
                onPress={() => setSelectedFilter(item.key)}
              >
                <Text
                  style={[
                    styles.tabChipText,
                    isSelected && styles.tabChipTextActive,
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* ASSET LIST */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Fetching assets...</Text>
        </View>
      ) : (
        <FlatList
          data={assets}
          keyExtractor={(item) => item._id}
          renderItem={renderAssetCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.light.primary]}
            />
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="cube-outline"
                size={48}
                color={Colors.light.textMuted}
              />
              <Text style={styles.emptyTitle}>No assets found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search query or filter tab.
              </Text>
            </View>
          }
        />
      )}
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
  searchContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
    backgroundColor: Colors.light.surface,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: Colors.light.text,
    fontWeight: "600",
  },
  tabsContainer: {
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tabsContent: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  tabChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tabChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  tabChipText: {
    fontSize: Typography.size.xs,
    fontWeight: "600",
    color: Colors.light.textSecondary,
  },
  tabChipTextActive: {
    color: Colors.light.white,
    fontWeight: "700",
  },
  listContent: {
    padding: Spacing.xl,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl + 40,
  },
  assetCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.card,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  ainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  ainText: {
    fontSize: Typography.size.md,
    fontWeight: "800",
    color: Colors.light.text,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  cardDetails: {
    backgroundColor: Colors.light.surfaceSecondary,
    padding: Spacing.sm,
    borderRadius: Radius.md,
    gap: 4,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailLabel: {
    width: 70,
    fontSize: Typography.size.xs,
    color: Colors.light.textMuted,
    fontWeight: "600",
  },
  detailValue: {
    flex: 1,
    fontSize: Typography.size.xs,
    color: Colors.light.text,
    fontWeight: "700",
  },
  outletHighlight: {
    color: Colors.light.primaryDark,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
  },
  manufacturerText: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    fontWeight: "600",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.size.sm,
    color: Colors.light.textSecondary,
  },
  emptyContainer: {
    paddingVertical: Spacing.xxl,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: Typography.size.md,
    fontWeight: "700",
    color: Colors.light.text,
    marginTop: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    textAlign: "center",
    marginTop: 4,
  },
});
