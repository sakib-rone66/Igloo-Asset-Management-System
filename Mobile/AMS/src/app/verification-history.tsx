import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
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

import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";
import { verificationApi } from "../services/api";

export default function VerificationHistoryScreen() {
  const [mappings, setMappings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      const response = await verificationApi.getMyVerificationRequests();
      setMappings(response.mappings || []);
    } catch (err: any) {
      setError(err?.message || "Unable to load verification history.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const getStatusStyle = (status?: string) => {
    switch (status) {
      case "APPROVED":
        return {
          color: Colors.light.primaryDark,
          backgroundColor: Colors.light.primaryLight,
        };
      case "REJECTED":
        return { color: "#D64545", backgroundColor: "#FDECEC" };
      default:
        return { color: "#A66B00", backgroundColor: "#FFF5DE" };
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification History</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.stateText}>Loading verification history...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerState}>
          <Ionicons
            name="cloud-offline-outline"
            size={44}
            color={Colors.light.textMuted}
          />
          <Text style={styles.stateTitle}>Unable to load history</Text>
          <Text style={styles.stateText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadHistory()}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadHistory(true)}
              colors={[Colors.light.primary]}
            />
          }
        >
          <View style={styles.intro}>
            <Text style={styles.eyebrow}>YOUR REQUESTS</Text>
            <Text style={styles.title}>Verification History</Text>
            <Text style={styles.subtitle}>
              Track the status and review details of your submitted requests.
            </Text>
          </View>

          {mappings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={Colors.light.textMuted}
              />
              <Text style={styles.stateTitle}>No verification requests</Text>
              <Text style={styles.stateText}>
                Your submitted verification requests will appear here.
              </Text>
            </View>
          ) : (
            mappings.map((mapping) => {
              const statusStyle = getStatusStyle(mapping.status);
              return (
                <View key={mapping._id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.assetTitleRow}>
                      <Ionicons
                        name="cube-outline"
                        size={20}
                        color={Colors.light.primary}
                      />
                      <Text style={styles.assetTitle}>
                        {mapping.asset?.ain || "Asset pending"}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusStyle.backgroundColor },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: statusStyle.color },
                        ]}
                      >
                        {mapping.status || "PENDING"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Outlet</Text>
                    <Text style={styles.detailValue}>
                      {mapping.outlet?.name || "N/A"}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Submitted</Text>
                    <Text style={styles.detailValue}>
                      {mapping.createdAt
                        ? new Date(mapping.createdAt).toLocaleDateString()
                        : "N/A"}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reviewed by</Text>
                    <Text style={styles.detailValue}>
                      {mapping.reviewedBy?.name || "Pending review"}
                    </Text>
                  </View>
                  {mapping.remarks ? (
                    <View style={styles.remarksBox}>
                      <Text style={styles.detailLabel}>Remarks</Text>
                      <Text style={styles.remarksText}>{mapping.remarks}</Text>
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </ScrollView>
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
  headerSpacer: {
    width: 24,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  intro: {
    marginBottom: Spacing.lg,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.light.primary,
    letterSpacing: 1,
  },
  title: {
    marginTop: 4,
    fontSize: Typography.size.xxl,
    fontWeight: "800",
    color: Colors.light.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: Typography.size.sm,
    lineHeight: 20,
    color: Colors.light.textSecondary,
  },
  card: {
    marginBottom: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
    ...Shadows.card,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  assetTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  assetTitle: {
    fontSize: Typography.size.md,
    fontWeight: "800",
    color: Colors.light.text,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
    paddingVertical: 5,
  },
  detailLabel: {
    fontSize: Typography.size.xs,
    color: Colors.light.textMuted,
  },
  detailValue: {
    flex: 1,
    fontSize: Typography.size.xs,
    fontWeight: "600",
    color: Colors.light.text,
    textAlign: "right",
  },
  remarksBox: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  remarksText: {
    marginTop: 4,
    fontSize: Typography.size.xs,
    lineHeight: 18,
    color: Colors.light.textSecondary,
  },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  stateTitle: {
    marginTop: Spacing.sm,
    fontSize: Typography.size.md,
    fontWeight: "700",
    color: Colors.light.text,
    textAlign: "center",
  },
  stateText: {
    marginTop: 5,
    fontSize: Typography.size.sm,
    color: Colors.light.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
  },
  retryButtonText: {
    color: Colors.light.white,
    fontSize: Typography.size.sm,
    fontWeight: "700",
  },
});
