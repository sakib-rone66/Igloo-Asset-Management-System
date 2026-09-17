import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAuth } from "../../context/AuthContext";

const GREEN = "#00843D";
const GREEN_DARK = "#006B32";
const GREEN_LIGHT = "#E5F4EB";
const BG = "#F5F7F6";
const WHITE = "#FFFFFF";
const TEXT = "#17211B";
const TEXT_SECONDARY = "#66736B";
const BORDER = "#E2E8E4";

export default function AssetsScreen() {
  const { user, hasPermission } = useAuth();

  const canViewAssets =
    hasPermission("assets", "view") ||
    user?.role === "TSO" ||
    user?.role === "ASO" ||
    user?.role === "TSM" ||
    user?.role === "TECHNICIAN";

  const canAddAsset = hasPermission("assets", "add") || user?.role === "TSM";

  const canViewVerification =
    hasPermission("verificationMapping", "view") ||
    user?.role === "TSM" ||
    user?.role === "TSO" ||
    user?.role === "ASO";

  const canSendRepairRequest =
    hasPermission("repairs", "create") ||
    ["ASO", "TSO", "TSM", "TECHNICIAN"].includes(user?.role || "");

  if (!canViewAssets) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.noAccessContainer}>
          <View style={styles.noAccessIcon}>
            <Ionicons name="lock-closed-outline" size={30} color={GREEN} />
          </View>

          <Text style={styles.noAccessTitle}>Access restricted</Text>

          <Text style={styles.noAccessText}>
            You don't have permission to access asset management.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>ASSET MANAGEMENT</Text>

            <Text style={styles.title}>Assets</Text>

            <Text style={styles.subtitle}>
              Manage Igloo freezer assets in the field.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Ionicons name="cube-outline" size={25} color={GREEN} />
          </View>
        </View>

        {/* SCAN HERO */}
        <Pressable
          style={({ pressed }) => [styles.scanCard, pressed && styles.pressed]}
          onPress={() => router.push("/scan" as never)}
        >
          <View style={styles.scanIcon}>
            <Ionicons name="qr-code-outline" size={30} color={WHITE} />
          </View>

          <View style={styles.scanContent}>
            <Text style={styles.scanTitle}>Scan an Asset</Text>

            <Text style={styles.scanText}>
              Scan QR code to quickly identify an Igloo freezer.
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={22} color={WHITE} />
        </Pressable>

        {/* SEARCH */}
        <Pressable
          style={({ pressed }) => [
            styles.searchCard,
            pressed && styles.pressed,
          ]}
          onPress={() => router.push("/asset-search" as never)}
        >
          <View style={styles.searchIcon}>
            <Ionicons name="search-outline" size={21} color={GREEN} />
          </View>

          <View style={styles.searchContent}>
            <Text style={styles.searchTitle}>Search assets</Text>

            <Text style={styles.searchText}>
              Find by AIN, serial number or outlet.
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color={TEXT_SECONDARY} />
        </Pressable>

        {/* QUICK ACTIONS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick actions</Text>
        </View>

        <View style={styles.actionGrid}>
          <ActionCard
            icon="add-circle-outline"
            title="Add Asset"
            subtitle="Register a new asset"
            enabled={canAddAsset}
            onPress={() => router.push("/add-asset" as never)}
          />

          <ActionCard
            icon="layers-outline"
            title="Existing Asset"
            subtitle="Add deployed asset"
            enabled={canAddAsset}
            onPress={() => router.push("/add-existing-asset" as never)}
          />

          <ActionCard
            icon="document-text-outline"
            title="New Asset Request"
            subtitle="Request assets for an outlet"
            enabled={true}
            onPress={() => router.push("/new-asset-request" as never)}
          />

          <ActionCard
            icon="build-outline"
            title="Send Repair Request"
            subtitle="Report an issue with an asset"
            enabled={canSendRepairRequest}
            onPress={() => router.push("/repair-request" as never)}
          />

          <ActionCard
            icon="scan-outline"
            title="Verification"
            subtitle="Verify asset mapping"
            enabled={canViewVerification}
            onPress={() => router.push("/verification" as never)}
          />
        </View>

        {/* FIELD TIP */}
        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color={GREEN}
            />
          </View>

          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>Field tip</Text>

            <Text style={styles.tipText}>
              Scan the QR code whenever possible to avoid manually entering an
              AIN.
            </Text>
          </View>
        </View>

        {/* FOOTER */}
        <Text style={styles.footer}>Logged in as {user?.role || "USER"}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionCard({
  icon,
  title,
  subtitle,
  enabled,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  enabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      disabled={!enabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.actionCard,
        !enabled && styles.disabledCard,
        pressed && enabled && styles.pressed,
      ]}
    >
      <View style={styles.actionIcon}>
        <Ionicons
          name={enabled ? icon : "lock-closed-outline"}
          size={23}
          color={enabled ? GREEN : "#96A19A"}
        />
      </View>

      <Text style={[styles.actionTitle, !enabled && styles.disabledText]}>
        {title}
      </Text>

      <Text style={[styles.actionSubtitle, !enabled && styles.disabledText]}>
        {subtitle}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: BG,
  },

  container: {
    padding: 20,
    paddingBottom: 110,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    color: GREEN,
    marginBottom: 5,
  },

  title: {
    fontSize: 30,
    fontWeight: "800",
    color: TEXT,
  },

  subtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    marginTop: 4,
  },

  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },

  scanCard: {
    backgroundColor: GREEN,
    borderRadius: 22,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.12,
    shadowRadius: 10,
  },

  scanIcon: {
    width: 54,
    height: 54,
    borderRadius: 17,
    backgroundColor: GREEN_DARK,
    alignItems: "center",
    justifyContent: "center",
  },

  scanContent: {
    flex: 1,
    marginHorizontal: 14,
  },

  scanTitle: {
    color: WHITE,
    fontSize: 17,
    fontWeight: "800",
  },

  scanText: {
    color: "#DDF3E6",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },

  searchCard: {
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 26,
  },

  searchIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
  },

  searchContent: {
    flex: 1,
    marginHorizontal: 12,
  },

  searchTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT,
  },

  searchText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 3,
  },

  sectionHeader: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: TEXT,
  },

  actionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },

  actionCard: {
    width: "48%",
    minHeight: 145,
    backgroundColor: WHITE,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: BORDER,
  },

  disabledCard: {
    opacity: 0.55,
  },

  actionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 13,
  },

  actionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: TEXT,
  },

  actionSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: TEXT_SECONDARY,
    marginTop: 4,
  },

  disabledText: {
    color: "#96A19A",
  },

  tipCard: {
    flexDirection: "row",
    backgroundColor: "#F0F7F2",
    borderRadius: 17,
    padding: 15,
    marginTop: 22,
    borderWidth: 1,
    borderColor: "#D8EBDD",
  },

  tipIcon: {
    marginRight: 11,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: TEXT,
  },

  tipText: {
    fontSize: 12,
    lineHeight: 18,
    color: TEXT_SECONDARY,
    marginTop: 3,
  },

  footer: {
    textAlign: "center",
    fontSize: 11,
    color: "#96A19A",
    marginTop: 24,
  },

  noAccessContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  noAccessIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },

  noAccessTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT,
  },

  noAccessText: {
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: TEXT_SECONDARY,
    marginTop: 8,
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
});
