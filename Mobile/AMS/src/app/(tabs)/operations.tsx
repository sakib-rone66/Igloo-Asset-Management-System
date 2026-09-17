// src/app/(tabs)/operations.tsx

import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  Colors,
  Layout,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../../constants/theme";

export default function OperationsScreen() {
  const operations = [
    {
      title: "Assignment",
      description: "Assign an in-stock freezer to an outlet",
      icon: "person-add-outline" as const,
      color: Colors.light.primary,
      background: Colors.light.primaryLight,
      route: "/operations/assignment",
    },
    {
      title: "Disposal",
      description: "Manage condemned freezer disposal requests",
      icon: "trash-outline" as const,
      color: Colors.light.danger,
      background: "#FDECEC",
      route: "/operations/disposal",
    },
    {
      title: "Return",
      description: "Record freezer return to warehouse",
      icon: "return-down-back-outline" as const,
      color: Colors.light.warning,
      background: "#FFF5DE",
      route: "/operations/return",
    },
    {
      title: "Transfer",
      description: "Transfer a freezer between active outlets",
      icon: "swap-horizontal-outline" as const,
      color: Colors.light.info,
      background: "#EAF3FF",
      route: "/operations/transfer",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.eyebrow}>FIELD OPERATIONS</Text>
          <Text style={styles.title}>Operations</Text>
          <Text style={styles.subtitle}>
            Manage asset lifecycle and movements directly from the field
          </Text>
        </View>

        {/* HERO */}
        <LinearGradient
          colors={[Colors.light.primary, Colors.light.primaryDark]}
          style={styles.hero}
        >
          <View style={styles.heroIcon}>
            <Ionicons
              name="swap-horizontal"
              size={30}
              color={Colors.light.white}
            />
          </View>

          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Freezer Movements</Text>
            <Text style={styles.heroText}>
              Complete assignment, transfer, return, and disposal activities
              with real-time backend verification.
            </Text>
          </View>
        </LinearGradient>

        {/* OPERATIONS LIST */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Available Operations</Text>
          <Text style={styles.sectionSubtitle}>
            Choose an action to continue
          </Text>
        </View>

        <View style={styles.operationList}>
          {operations.map((operation) => (
            <TouchableOpacity
              key={operation.title}
              style={styles.operationCard}
              activeOpacity={0.8}
              onPress={() => router.push(operation.route as any)}
            >
              <View
                style={[
                  styles.operationIcon,
                  { backgroundColor: operation.background },
                ]}
              >
                <Ionicons
                  name={operation.icon}
                  size={24}
                  color={operation.color}
                />
              </View>

              <View style={styles.operationContent}>
                <Text style={styles.operationTitle}>{operation.title}</Text>
                <Text style={styles.operationDescription}>
                  {operation.description}
                </Text>
              </View>

              <Ionicons
                name="chevron-forward"
                size={20}
                color={Colors.light.textMuted}
                style={styles.operationArrow}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* INFO */}
        <View style={styles.infoCard}>
          <View style={styles.infoIcon}>
            <Ionicons
              name="information-circle-outline"
              size={22}
              color={Colors.light.info}
            />
          </View>

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Audit Trail Enabled</Text>
            <Text style={styles.infoText}>
              Every operation updates the central MongoDB ledger, preserving
              timestamps, personnel identifiers, and outlet locations.
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
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xxl + 40,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.light.primary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: "800",
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: Typography.size.sm,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  hero: {
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
    ...Shadows.floating,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: Typography.size.md,
    fontWeight: "800",
    color: Colors.light.white,
  },
  heroText: {
    fontSize: Typography.size.xs,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
    lineHeight: 18,
  },
  sectionHeader: {
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
  operationList: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  operationCard: {
    width: "47.5%",
    minHeight: 154,
    alignItems: "flex-start",
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadows.card,
  },
  operationIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  operationContent: {
    flex: 1,
    width: "100%",
    marginTop: Spacing.md,
  },
  operationTitle: {
    fontSize: Typography.size.sm,
    fontWeight: "700",
    color: Colors.light.text,
  },
  operationDescription: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  operationArrow: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
  },
  infoCard: {
    flexDirection: "row",
    backgroundColor: "#EAF3FF",
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
  },
  infoIcon: {
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: Typography.size.xs,
    fontWeight: "700",
    color: Colors.light.info,
  },
  infoText: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
});
