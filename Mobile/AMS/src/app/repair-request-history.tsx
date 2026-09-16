import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { incomingRequestApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";

export default function RepairRequestHistoryScreen() {
  const { user, hasPermission } = useAuth();
  const canCompleteRepairs =
    user?.role === "TECHNICIAN" || hasPermission("repairs", "update");
  const [repairs, setRepairs] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRepairs = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const response = await incomingRequestApi.getMyRepairs();
      setRepairs(response.repairs || []);
    } catch (error) {
      console.error("Failed to load repair request history:", error);
      setRepairs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRepairs();
    }, [loadRepairs]),
  );

  const statusStyle = (status: string) => {
    switch (status) {
      case "UNDER_REPAIR":
        return { text: "#2778C8", bg: "#EAF3FF" };
      case "REJECTED":
        return { text: Colors.light.danger, bg: "#FDECEC" };
      case "COMPLETED":
        return { text: "#006B32", bg: Colors.light.primaryLight };
      default:
        return { text: "#E59B17", bg: "#FFF5DE" };
    }
  };

  const handleCompleteRepair = (repairId: string) => {
    Alert.alert("Complete Repair", "Mark this repair request as completed?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Complete",
        onPress: async () => {
          try {
            await incomingRequestApi.updateRepairStatus(repairId, "COMPLETED");
            await loadRepairs(true);
          } catch (error: any) {
            Alert.alert(
              "Update Failed",
              error?.message || "Could not complete this repair.",
            );
          }
        },
      },
    ]);
  };

  const filteredRepairs =
    statusFilter === "ALL"
      ? repairs
      : repairs.filter((repair) => repair.status === statusFilter);

  const filters = [
    { key: "ALL", label: "All" },
    { key: "PENDING", label: "Pending" },
    { key: "UNDER_REPAIR", label: "Under Repair" },
    { key: "COMPLETED", label: "Completed" },
    { key: "REJECTED", label: "Rejected" },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Repair Request History</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Loading repair history...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRepairs}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadRepairs(true)}
              colors={[Colors.light.primary]}
            />
          }
          ListHeaderComponent={
            <>
              <View style={styles.intro}>
                <View style={styles.introIcon}>
                  <Ionicons
                    name="time-outline"
                    size={23}
                    color={Colors.light.primary}
                  />
                </View>
                <View style={styles.introCopy}>
                  <Text style={styles.eyebrow}>ASSET OPERATIONS</Text>
                  <Text style={styles.introTitle}>My Repair Requests</Text>
                  <Text style={styles.introText}>
                    Track requests you have submitted and their current status.
                  </Text>
                </View>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                {filters.map((filter) => (
                  <TouchableOpacity
                    key={filter.key}
                    style={[
                      styles.filterChip,
                      statusFilter === filter.key && styles.filterChipActive,
                    ]}
                    onPress={() => setStatusFilter(filter.key)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        statusFilter === filter.key &&
                          styles.filterChipTextActive,
                      ]}
                    >
                      {filter.label}
                    </Text>
                    <Text
                      style={[
                        styles.filterCount,
                        statusFilter === filter.key && styles.filterCountActive,
                      ]}
                    >
                      {filter.key === "ALL"
                        ? repairs.length
                        : repairs.filter(
                            (repair) => repair.status === filter.key,
                          ).length}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          }
          renderItem={({ item }) => {
            const badge = statusStyle(item.status);
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.ain}>
                    AIN: {item.asset?.ain || "Asset"}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.text }]}>
                      {item.status || "PENDING"}
                    </Text>
                  </View>
                </View>
                <Text style={styles.problem}>
                  {item.problem || "Repair request"}
                </Text>
                <Text style={styles.meta}>
                  {item.asset?.currentOutlet?.name || "Assigned outlet"}
                  {item.createdAt
                    ? ` • ${new Date(item.createdAt).toLocaleDateString()}`
                    : ""}
                </Text>
                {item.remarks ? (
                  <Text style={styles.remarks}>Remarks: {item.remarks}</Text>
                ) : null}
                {canCompleteRepairs && item.status === "UNDER_REPAIR" ? (
                  <TouchableOpacity
                    style={styles.completeButton}
                    onPress={() => handleCompleteRepair(item._id)}
                    activeOpacity={0.85}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={18}
                      color={Colors.light.white}
                    />
                    <Text style={styles.completeButtonText}>
                      Complete Repair
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={Colors.light.textMuted}
              />
              <Text style={styles.emptyTitle}>
                {statusFilter === "ALL"
                  ? "No repair requests yet"
                  : `No ${statusFilter.toLowerCase().replace("_", " ")} requests`}
              </Text>
              <Text style={styles.emptyText}>
                Submitted repair requests will appear here.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.light.background },
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
  list: { padding: Spacing.xl, paddingBottom: Spacing.xxl, gap: Spacing.md },
  intro: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.primaryLight,
  },
  introIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: Colors.light.white,
  },
  introCopy: { flex: 1 },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
    color: Colors.light.primary,
  },
  introTitle: {
    marginTop: 3,
    fontSize: Typography.size.lg,
    fontWeight: "800",
    color: Colors.light.text,
  },
  introText: {
    marginTop: 3,
    fontSize: Typography.size.xs,
    lineHeight: 17,
    color: Colors.light.textSecondary,
  },
  filterRow: {
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
  },
  filterChipActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  filterChipText: {
    fontSize: Typography.size.xs,
    fontWeight: "700",
    color: Colors.light.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.light.primaryDark,
  },
  filterCount: {
    minWidth: 18,
    textAlign: "center",
    fontSize: 10,
    fontWeight: "800",
    color: Colors.light.textMuted,
  },
  filterCountActive: {
    color: Colors.light.primary,
  },
  card: {
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
    ...Shadows.card,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  ain: {
    flex: 1,
    fontSize: Typography.size.md,
    fontWeight: "800",
    color: Colors.light.text,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  badgeText: { fontSize: 10, fontWeight: "800", letterSpacing: 0.4 },
  problem: {
    marginTop: Spacing.sm,
    fontSize: Typography.size.sm,
    color: Colors.light.text,
  },
  meta: {
    marginTop: 5,
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
  },
  remarks: {
    marginTop: 5,
    fontSize: Typography.size.xs,
    fontStyle: "italic",
    color: Colors.light.textMuted,
  },
  completeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    marginTop: Spacing.md,
    minHeight: 42,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
  },
  completeButtonText: {
    color: Colors.light.white,
    fontSize: Typography.size.sm,
    fontWeight: "800",
  },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: Typography.size.sm,
    color: Colors.light.textSecondary,
  },
  empty: { alignItems: "center", paddingVertical: Spacing.xxl },
  emptyTitle: {
    marginTop: Spacing.sm,
    fontSize: Typography.size.md,
    fontWeight: "800",
    color: Colors.light.text,
  },
  emptyText: {
    marginTop: 4,
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
  },
});
