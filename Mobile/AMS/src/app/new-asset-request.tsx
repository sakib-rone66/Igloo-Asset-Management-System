import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
import { outletApi, requestApi } from "../services/api";
import { OutletRef } from "../services/apiTypes";

export default function NewAssetRequestScreen() {
  const [outlets, setOutlets] = useState<OutletRef[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<OutletRef | null>(null);
  const [outletSearch, setOutletSearch] = useState("");
  const [showOutletPicker, setShowOutletPicker] = useState(false);
  const outletInputRef = useRef<TextInput>(null);
  const [quantity, setQuantity] = useState("1");
  const [reason, setReason] = useState("");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    outletApi
      .getOutlets({ status: "ACTIVE" })
      .then((response) => setOutlets(response.outlets || []))
      .catch(() =>
        Alert.alert("Unable to Load Outlets", "Please try again later."),
      );
  }, []);

  const filteredOutlets = outlets.filter((outlet) => {
    const search = outletSearch.trim().toLowerCase();
    if (!search) return true;

    return [outlet.name, outlet.outletCode, outlet.code, outlet.phone].some(
      (value) => value?.toLowerCase().includes(search),
    );
  });

  const handleSubmit = async () => {
    if (!selectedOutlet) {
      Alert.alert("Select Outlet", "Please select an outlet for this request.");
      return;
    }

    const quantityNumber = Number(quantity);
    if (!Number.isInteger(quantityNumber) || quantityNumber < 1) {
      Alert.alert(
        "Invalid Quantity",
        "Quantity must be a positive whole number.",
      );
      return;
    }

    if (!reason.trim()) {
      Alert.alert(
        "Reason Required",
        "Please provide a reason for this request.",
      );
      return;
    }

    try {
      setSubmitting(true);
      await requestApi.createAssetRequest({
        outletId: selectedOutlet._id,
        quantity: quantityNumber,
        reason: reason.trim(),
        remarks: remarks.trim() || undefined,
      });

      Alert.alert("Request Submitted", "Your asset request has been created.", [
        { text: "Done", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert(
        "Submission Failed",
        error?.message || "Could not submit the asset request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="close" size={30} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Asset Request</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => setShowOutletPicker(false)}
        >
          <Text style={styles.inputLabel}>SELECT OUTLET *</Text>
          <View style={styles.outletSearchBox}>
            <Ionicons
              name="search-outline"
              size={22}
              color={Colors.light.textMuted}
            />
            <TextInput
              ref={outletInputRef}
              style={styles.outletSearchInput}
              placeholder="Search outlet name or phone"
              placeholderTextColor={Colors.light.textMuted}
              value={outletSearch}
              onChangeText={(value) => {
                setOutletSearch(value);
                setSelectedOutlet(null);
                setShowOutletPicker(true);
              }}
              onFocus={() => setShowOutletPicker(true)}
              autoCapitalize="words"
              autoCorrect={false}
            />
            {outletSearch ? (
              <TouchableOpacity
                onPress={() => {
                  setOutletSearch("");
                  setSelectedOutlet(null);
                  setShowOutletPicker(true);
                }}
                hitSlop={8}
              >
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={Colors.light.textMuted}
                />
              </TouchableOpacity>
            ) : null}
          </View>

          {showOutletPicker ? (
            <View style={styles.outletDropdown}>
              <ScrollView
                style={styles.outletDropdownList}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
              >
                {filteredOutlets.slice(0, 20).map((outlet) => (
                  <TouchableOpacity
                    key={outlet._id}
                    style={styles.outletResult}
                    onPress={() => {
                      setSelectedOutlet(outlet);
                      setOutletSearch(
                        `${outlet.name}${outlet.outletCode || outlet.code ? ` (${outlet.outletCode || outlet.code})` : ""}`,
                      );
                      setShowOutletPicker(false);
                    }}
                  >
                    <Text style={styles.outletResultName}>{outlet.name}</Text>
                    {(outlet.outletCode || outlet.code || outlet.phone) && (
                      <Text style={styles.outletResultMeta}>
                        {outlet.outletCode || outlet.code || ""}
                        {outlet.phone ? ` • ${outlet.phone}` : ""}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
                {filteredOutlets.length === 0 ? (
                  <Text style={styles.outletEmptyText}>
                    No matching outlet found.
                  </Text>
                ) : null}
              </ScrollView>
            </View>
          ) : null}

          <Text style={[styles.inputLabel, styles.spacedLabel]}>
            QUANTITY OF FREEZERS *
          </Text>
          <TextInput
            style={styles.input}
            value={quantity}
            onChangeText={setQuantity}
            keyboardType="number-pad"
            placeholder="e.g. 1, 2"
            placeholderTextColor={Colors.light.textMuted}
          />

          <Text style={[styles.inputLabel, styles.spacedLabel]}>
            REASON FOR REQUEST *
          </Text>
          <TextInput
            style={styles.input}
            value={reason}
            onChangeText={setReason}
            placeholder="e.g. High ice cream demand during summer festival..."
            placeholderTextColor={Colors.light.textMuted}
          />

          <Text style={[styles.inputLabel, styles.spacedLabel]}>
            ADDITIONAL REMARKS
          </Text>
          <TextInput
            style={[styles.input, styles.remarksInput]}
            value={remarks}
            onChangeText={setRemarks}
            multiline
            numberOfLines={3}
            placeholder="Any special storage dimensions or notes..."
            placeholderTextColor={Colors.light.textMuted}
          />

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.light.white} />
            ) : (
              <Text style={styles.submitButtonText}>Submit Request</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerTitle: {
    fontSize: Typography.size.lg,
    fontWeight: "700",
    color: Colors.light.text,
  },
  headerSpacer: {
    width: 30,
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.light.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  spacedLabel: {
    marginTop: Spacing.md,
  },
  outletSearchBox: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surface,
  },
  outletSearchInput: {
    flex: 1,
    minHeight: 46,
    color: Colors.light.text,
    fontSize: Typography.size.sm,
  },
  outletDropdown: {
    marginTop: Spacing.xs,
    maxHeight: 200,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surface,
    ...Shadows.floating,
  },
  outletDropdownList: {
    maxHeight: 198,
  },
  outletResult: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.surfaceSecondary,
  },
  outletResultName: {
    color: Colors.light.text,
    fontSize: Typography.size.sm,
    fontWeight: "700",
  },
  outletResultMeta: {
    color: Colors.light.textMuted,
    fontSize: Typography.size.xs,
    marginTop: 2,
  },
  outletEmptyText: {
    padding: Spacing.md,
    color: Colors.light.textMuted,
    fontSize: Typography.size.xs,
    textAlign: "center",
  },
  input: {
    backgroundColor: Colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: Typography.size.sm,
    color: Colors.light.text,
  },
  remarksInput: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  submitButton: {
    backgroundColor: Colors.light.primary,
    height: 50,
    borderRadius: Radius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: Colors.light.white,
    fontSize: Typography.size.md,
    fontWeight: "700",
  },
});
