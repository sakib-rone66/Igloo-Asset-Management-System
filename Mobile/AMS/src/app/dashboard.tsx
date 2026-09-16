// src/app/dashboard.tsx

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
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

import { useAuth } from "../context/AuthContext";
import { dashboardApi, getApiBaseUrl, testConnection } from "../services/api";
import ServerConfigModal from "../components/ServerConfigModal";

export default function DashboardScreen() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalAssets: 0,
    inStockAssets: 0,
    assignedAssets: 0,
    disposedAssets: 0,
    latestCheckIn: null as any,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [activeUrl, setActiveUrl] = useState("");

  const firstName = user?.name?.trim().split(" ")[0] || "User";

  const checkConnectivity = useCallback(async () => {
    try {
      const currentUrl = await getApiBaseUrl();
      setActiveUrl(currentUrl);
      const ping = await testConnection(currentUrl);
      setIsConnected(ping.ok);
    } catch {
      setIsConnected(false);
    }
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      await checkConnectivity();
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [checkConnectivity]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardData();
  }, [loadDashboardData]);

  const quickActions = [
    {
      title: "Scan Asset",
      subtitle: "Scan QR code",
      icon: "qr-code-outline" as const,
      route: "/scan",
      color: Colors.light.primary,
      bg: Colors.light.primaryLight,
    },
    {
      title: "Check-in",
      subtitle: "Record GPS visit",
      icon: "location-outline" as const,
      route: "/check-in",
      color: Colors.light.info,
      bg: "#EAF3FF",
    },
    {
      title: "Operations",
      subtitle: "Assign & transfer",
      icon: "swap-horizontal-outline" as const,
      route: "/(tabs)/operations",
      color: Colors.light.warning,
      bg: "#FFF5DE",
    },
    {
      title: "Verification",
      subtitle: "Verify mapping",
      icon: "shield-checkmark-outline" as const,
      route: "/verification",
      color: "#6B46C1",
      bg: "#F3E8FF",
    },
  ];

  const statCards = [
    {
      title: "Total Assets",
      value: stats.totalAssets,
      icon: "cube-outline" as const,
      color: Colors.light.primary,
      bg: Colors.light.primaryLight,
      filter: undefined,
    },
    {
      title: "In Stock",
      value: stats.inStockAssets,
      icon: "checkmark-circle-outline" as const,
      color: Colors.light.info,
      bg: "#EAF3FF",
      filter: "IN_STOCK",
    },
    {
      title: "Assigned",
      value: stats.assignedAssets,
      icon: "arrow-forward-circle-outline" as const,
      color: "#805AD5",
      bg: "#F3E8FF",
      filter: "ASSIGNED",
    },
    {
      title: "Disposed",
      value: stats.disposedAssets,
      icon: "trash-outline" as const,
      color: Colors.light.danger,
      bg: "#FDECEC",
      filter: "DISPOSED",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* CONNECTION STATUS BANNER (SUBTLE, NON-BLOCKING) */}
      {!isConnected && (
        <TouchableOpacity
          style={styles.offlineBanner}
          onPress={() => setShowConfigModal(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="cloud-offline-outline" size={16} color="#B45309" />
          <Text style={styles.offlineBannerText}>
            Server unreachable ({activeUrl || "connecting..."}) • Tap to
            configure IP
          </Text>
          <Ionicons name="chevron-forward" size={14} color="#B45309" />
        </TouchableOpacity>
      )}

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.light.primary]}
          />
        }
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.logoContainer}>
              <LinearGradient
                colors={[Colors.light.primary, Colors.light.primaryDark]}
                style={styles.logoGradient}
              >
                <Text style={styles.logoText}>I</Text>
              </LinearGradient>
            </View>

            <View>
              <Text style={styles.greeting}>Good day,</Text>
              <Text style={styles.userName} numberOfLines={1}>
                {firstName}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.8}
              onPress={() => setShowConfigModal(true)}
              hitSlop={8}
            >
              <Ionicons
                name="server-outline"
                size={19}
                color={
                  isConnected ? Colors.light.primary : Colors.light.warning
                }
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.8}
              onPress={() => router.push("/(tabs)/profile" as any)}
              hitSlop={8}
            >
              <Ionicons
                name="person-outline"
                size={19}
                color={Colors.light.text}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* HERO CARD */}
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroCard}
        >
          <View style={styles.heroContent}>
            <View style={styles.heroTextContainer}>
              <Text style={styles.heroEyebrow}>IGLOO ASSET MANAGEMENT</Text>
              <Text style={styles.heroTitle}>
                Field Operations,{"\n"}Simplified.
              </Text>
              <View style={styles.rolePill}>
                <View style={styles.roleDot} />
                <Text style={styles.roleText}>
                  {user?.role || "Field Officer"}
                </Text>
              </View>
            </View>

            <View style={styles.heroIcon}>
              <Ionicons
                name="cube-outline"
                size={38}
                color="rgba(255,255,255,0.9)"
              />
            </View>
          </View>
        </LinearGradient>

        {/* LATEST CHECK-IN STATUS BADGE */}
        <TouchableOpacity
          style={styles.checkInStatusCard}
          activeOpacity={0.8}
          onPress={() => router.push("/check-in" as any)}
        >
          <View style={styles.checkInStatusIcon}>
            <Ionicons
              name={
                stats.latestCheckIn
                  ? "checkmark-done-circle"
                  : "location-outline"
              }
              size={24}
              color={
                stats.latestCheckIn
                  ? Colors.light.success
                  : Colors.light.warning
              }
            />
          </View>
          <View style={styles.checkInStatusContent}>
            <Text style={styles.checkInStatusTitle}>
              {stats.latestCheckIn
                ? `Checked in: ${stats.latestCheckIn.checkInType === "OUTLET" ? stats.latestCheckIn.outlet?.name || "Outlet" : "Office"}`
                : "No check-in recorded today"}
            </Text>
            <Text style={styles.checkInStatusSubtitle}>
              {stats.latestCheckIn
                ? new Date(stats.latestCheckIn.checkInTime).toLocaleTimeString(
                    [],
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )
                : "Tap to record your field attendance & location"}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={Colors.light.textMuted}
          />
        </TouchableOpacity>

        {/* QUICK ACTIONS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
          <Text style={styles.sectionSubtitle}>Tap to launch task</Text>
        </View>

        <View style={styles.actionsGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.title}
              style={styles.actionCard}
              activeOpacity={0.82}
              onPress={() => router.push(action.route as any)}
            >
              <View style={[styles.actionIcon, { backgroundColor: action.bg }]}>
                <Ionicons name={action.icon} size={22} color={action.color} />
              </View>

              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ASSET OVERVIEW STATS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Asset Overview</Text>
          <TouchableOpacity
            onPress={() => router.push("/asset-search" as any)}
            hitSlop={10}
          >
            <Text style={styles.viewAllText}>View all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          {statCards.map((stat) => (
            <TouchableOpacity
              key={stat.title}
              style={styles.statCard}
              activeOpacity={0.8}
              onPress={() =>
                router.push({
                  pathname: "/asset-search" as any,
                  params: stat.filter ? { status: stat.filter } : undefined,
                })
              }
            >
              <View
                style={[styles.statIconWrapper, { backgroundColor: stat.bg }]}
              >
                <Ionicons name={stat.icon} size={19} color={stat.color} />
              </View>
              <View style={styles.statContent}>
                <Text style={styles.statValue}>
                  {isLoading ? "..." : stat.value}
                </Text>
                <Text style={styles.statLabel}>{stat.title}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* FIELD TIP */}
        <View style={styles.tipCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={Colors.light.primary}
          />
          <Text style={styles.tipText}>
            Use the Scan Asset button to immediately look up freezer specs,
            maintenance history, and assigned outlet info.
          </Text>
        </View>
      </ScrollView>

      {/* Backend IP Server Configuration Modal */}
      <ServerConfigModal
        visible={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onSaved={() => loadDashboardData()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  offlineBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: Spacing.xl,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#FDE68A",
  },
  offlineBannerText: {
    flex: 1,
    fontSize: 11,
    fontWeight: "700",
    color: "#B45309",
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl + 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  logoContainer: {
    ...Shadows.card,
  },
  logoGradient: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    color: Colors.light.white,
    fontSize: 24,
    fontWeight: "800",
  },
  greeting: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: Typography.size.lg,
    fontWeight: "700",
    color: Colors.light.text,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surface,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.card,
  },
  heroCard: {
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
    ...Shadows.floating,
  },
  heroContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  heroTextContainer: {
    flex: 1,
  },
  heroEyebrow: {
    color: "rgba(255,255,255,0.75)",
    fontSize: Typography.size.xs,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroTitle: {
    color: Colors.light.white,
    fontSize: Typography.size.xl,
    fontWeight: "800",
    lineHeight: 26,
    marginBottom: 8,
  },
  rolePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
    gap: 5,
  },
  roleDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#A7F3D0",
  },
  roleText: {
    fontSize: 10,
    fontWeight: "800",
    color: Colors.light.white,
    letterSpacing: 0.5,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: Spacing.md,
  },
  checkInStatusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.card,
  },
  checkInStatusIcon: {
    marginRight: Spacing.md,
  },
  checkInStatusContent: {
    flex: 1,
  },
  checkInStatusTitle: {
    fontSize: Typography.size.sm,
    fontWeight: "700",
    color: Colors.light.text,
  },
  checkInStatusSubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: "700",
    color: Colors.light.text,
  },
  sectionSubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
  },
  viewAllText: {
    fontSize: Typography.size.sm,
    color: Colors.light.primary,
    fontWeight: "600",
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionCard: {
    width: "47.5%",
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.card,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  actionTitle: {
    fontSize: Typography.size.sm,
    fontWeight: "700",
    color: Colors.light.text,
  },
  actionSubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: "47.5%",
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.card,
  },
  statIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: Typography.size.xl,
    fontWeight: "800",
    color: Colors.light.text,
  },
  statLabel: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    fontWeight: "600",
    marginTop: 2,
  },
  tipCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primaryLight,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: Typography.size.xs,
    color: Colors.light.primaryDark,
    lineHeight: 18,
  },
});
