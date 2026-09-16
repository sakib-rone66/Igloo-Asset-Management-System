// src/app/asset-history.tsx

import React, { useState } from "react";
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
import { router } from "expo-router";
import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";
import { assetApi } from "../services/api";
import { Asset, AssetHistoryRecord } from "../services/apiTypes";

export default function AssetHistoryScreen() {
  const [ain, setAin] = useState("");
  const [loading, setLoading] = useState(false);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [history, setHistory] = useState<AssetHistoryRecord[]>([]);

  const handleSearch = async () => {
    if (!ain.trim()) {
      Alert.alert(
        "Enter AIN",
        "Please enter an Asset Identification Number to search its history.",
      );
      return;
    }

    try {
      setLoading(true);
      const assetRes = await assetApi.getAssetByAIN(ain.trim());
      setAsset(assetRes.asset);

      const histRes = await assetApi.getAssetHistory(assetRes.asset._id);
      setHistory(histRes.history || []);
    } catch (err: any) {
      Alert.alert("History Lookup Failed", err?.message || "Asset not found.");
      setAsset(null);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Asset History</Text>
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
          <Text style={styles.cardTitle}>Search Asset Timeline</Text>
          <Text style={styles.cardSubtitle}>
            Track all lifecycle movements, assignments, transfers, and returns
          </Text>

          <View style={styles.searchRow}>
            <TextInput
              style={styles.input}
              placeholder="e.g. AIN-10023"
              placeholderTextColor={Colors.light.textMuted}
              value={ain}
              onChangeText={setAin}
              autoCapitalize="characters"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity
              style={styles.searchBtn}
              onPress={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color={Colors.light.white} />
              ) : (
                <Text style={styles.searchBtnText}>Search</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {asset && (
          <View style={styles.assetHeaderCard}>
            <View style={styles.ainRow}>
              <Ionicons
                name="cube-outline"
                size={22}
                color={Colors.light.primary}
              />
              <Text style={styles.ainText}>{asset.ain}</Text>
            </View>
            <Text style={styles.assetSub}>
              SN: {asset.serialNumber} • Status: {asset.status} • Location:{" "}
              {asset.currentOutlet?.name || "Warehouse"}
            </Text>
          </View>
        )}

        {asset && (
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Movement Timeline</Text>
            {history.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={styles.emptyText}>
                  No activity records logged for this asset.
                </Text>
              </View>
            ) : (
              <View style={styles.timeline}>
                {history.map((record, index) => (
                  <View key={record._id || index} style={styles.timelineItem}>
                    <View style={styles.timelineDot} />
                    <View style={styles.timelineContent}>
                      <View style={styles.timelineTop}>
                        <Text style={styles.actionText}>{record.action}</Text>
                        <Text style={styles.dateText}>
                          {new Date(record.createdAt).toLocaleString([], {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>

                      {record.toOutlet && (
                        <Text style={styles.detailText}>
                          Assigned To: {record.toOutlet.name}
                        </Text>
                      )}
                      {record.fromOutlet && (
                        <Text style={styles.detailText}>
                          Transferred From: {record.fromOutlet.name}
                        </Text>
                      )}
                      {record.remarks ? (
                        <Text style={styles.remarksText}>
                          "{record.remarks}"
                        </Text>
                      ) : null}
                      {record.performedBy?.name ? (
                        <Text style={styles.userText}>
                          Recorded By: {record.performedBy.name}
                        </Text>
                      ) : null}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
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
    marginBottom: Spacing.lg,
    ...Shadows.card,
  },
  cardTitle: {
    fontSize: Typography.size.md,
    fontWeight: "800",
    color: Colors.light.text,
  },
  cardSubtitle: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.md,
    marginTop: 2,
  },
  searchRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.size.sm,
    color: Colors.light.text,
    fontWeight: "600",
  },
  searchBtn: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.xl,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  searchBtnText: {
    color: Colors.light.white,
    fontWeight: "700",
    fontSize: Typography.size.sm,
  },
  assetHeaderCard: {
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.lg,
  },
  ainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  ainText: {
    fontSize: Typography.size.lg,
    fontWeight: "800",
    color: Colors.light.text,
  },
  assetSub: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  historySection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: "700",
    color: Colors.light.text,
    marginBottom: Spacing.sm,
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
  timelineTop: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionText: {
    fontSize: Typography.size.sm,
    fontWeight: "700",
    color: Colors.light.text,
  },
  dateText: {
    fontSize: Typography.size.xs,
    color: Colors.light.textMuted,
  },
  detailText: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  remarksText: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    fontStyle: "italic",
    marginTop: 2,
  },
  userText: {
    fontSize: 10,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  emptyBox: {
    padding: Spacing.lg,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    alignItems: "center",
  },
  emptyText: {
    fontSize: Typography.size.xs,
    color: Colors.light.textMuted,
  },
});
