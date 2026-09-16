// src/app/add-existing-asset.tsx

import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  findNodeHandle,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
} from "../constants/theme";
import { api, outletApi } from "../services/api";
import { Manufacturer, OutletRef } from "../services/apiTypes";

const formatOutletLabel = (outlet: OutletRef) =>
  `${outlet.name}${outlet.outletCode || outlet.code ? ` (${outlet.outletCode || outlet.code})` : ""}`;

export default function AddExistingAssetScreen() {
  const params = useLocalSearchParams<{ outletId?: string }>();

  const [capacity, setCapacity] = useState("");
  const [manufacturingMonth, setManufacturingMonth] = useState("");
  const [manufacturingYear, setManufacturingYear] = useState("");

  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [selectedManufacturer, setSelectedManufacturer] =
    useState<Manufacturer | null>(null);

  const [outlets, setOutlets] = useState<OutletRef[]>([]);
  const [selectedOutlet, setSelectedOutlet] = useState<OutletRef | null>(null);
  const [showOutletPicker, setShowOutletPicker] = useState(false);
  const [outletSearch, setOutletSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const outletInputRef = useRef<TextInput>(null);
  const [showAddOutlet, setShowAddOutlet] = useState(false);
  const [districts, setDistricts] = useState<any[]>([]);
  const [newOutletName, setNewOutletName] = useState("");
  const [newOutletCode, setNewOutletCode] = useState("");
  const [newOutletType, setNewOutletType] = useState("");
  const [newOutletAddress, setNewOutletAddress] = useState("");
  const [newOutletPhone, setNewOutletPhone] = useState("");
  const [newOutletContact, setNewOutletContact] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState<any | null>(null);
  const [creatingOutlet, setCreatingOutlet] = useState(false);

  useEffect(() => {
    Promise.all([
      outletApi.getManufacturers(),
      outletApi.getOutlets({ status: "ACTIVE" }),
    ])
      .then(([mRes, oRes]: [any, any]) => {
        const mList = mRes.manufacturers || mRes || [];
        const oList = oRes.outlets || [];
        setManufacturers(mList);
        if (mList.length > 0) setSelectedManufacturer(mList[0]);

        setOutlets(oList);
        const outletId = Array.isArray(params.outletId)
          ? params.outletId[0]
          : params.outletId;
        if (outletId) {
          const match = oList.find((o: OutletRef) => o._id === outletId);
          if (match) {
            setSelectedOutlet(match);
            setOutletSearch(formatOutletLabel(match));
          } else {
            outletApi
              .getOutletById(outletId)
              .then((response) => {
                setSelectedOutlet(response.outlet);
                setOutlets((previous) => [response.outlet, ...previous]);
                setOutletSearch(formatOutletLabel(response.outlet));
              })
              .catch((err) =>
                console.error("Failed to load selected outlet:", err),
              );
          }
        }
      })
      .catch((err) =>
        console.error("Failed to load existing asset dependencies:", err),
      )
      .finally(() => setLoading(false));
  }, [params.outletId]);

  const handleSubmit = async () => {
    if (!selectedManufacturer) {
      Alert.alert("Manufacturer Required", "Please choose a manufacturer.");
      return;
    }
    if (!selectedOutlet) {
      Alert.alert(
        "Outlet Required",
        "Please choose the outlet where this freezer is deployed.",
      );
      return;
    }
    const capNum = parseInt(capacity, 10);
    const monthNum = parseInt(manufacturingMonth, 10);
    const yearNum = parseInt(manufacturingYear, 10);

    if (!capNum || capNum <= 0) {
      Alert.alert(
        "Invalid Capacity",
        "Please enter a valid capacity in liters.",
      );
      return;
    }

    if (!monthNum || monthNum < 1 || monthNum > 12) {
      Alert.alert(
        "Invalid Month",
        "Please enter a manufacturing month between 1 and 12.",
      );
      return;
    }

    const currentYear = new Date().getFullYear();
    if (!yearNum || yearNum < 2000 || yearNum > currentYear) {
      Alert.alert(
        "Invalid Year",
        `Please enter a manufacturing year between 2000 and ${currentYear}.`,
      );
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/authorizations/existing", {
        assetType: "EXISTING",
        capacity: capNum,
        manufacturingMonth: monthNum,
        manufacturingYear: yearNum,
        manufacturer: selectedManufacturer._id,
        currentOutlet: selectedOutlet._id,
      });

      Alert.alert(
        "Submitted for Authorization",
        `Existing freezer deployed at ${selectedOutlet.name} submitted for supervisor approval and tag generation.`,
        [{ text: "Done", onPress: () => router.back() }],
      );
    } catch (err: any) {
      Alert.alert(
        "Submission Error",
        err?.message || "Failed to register existing asset.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOutlets = outlets.filter((o) => {
    const search = outletSearch.trim().toLowerCase();
    if (!search) return true;

    return [o.name, o.outletCode, o.code, o.phone].some((value) =>
      value?.toLowerCase().includes(search),
    );
  });

  const handleOutletSearchChange = (value: string) => {
    setOutletSearch(value);
    setSelectedOutlet(null);
    setShowOutletPicker(true);
  };

  const openAddOutlet = async () => {
    setShowOutletPicker(false);
    const response = await outletApi.getDistricts();
    const list = response.districts || [];
    setDistricts(
      list.filter((district: any) => district.status !== "INACTIVE"),
    );
    setShowAddOutlet(true);
  };

  const handleCreateOutlet = async () => {
    if (
      !newOutletName.trim() ||
      !newOutletCode.trim() ||
      !newOutletType.trim() ||
      !newOutletAddress.trim() ||
      !newOutletPhone.trim() ||
      !selectedDistrict
    ) {
      Alert.alert(
        "Missing outlet details",
        "Complete the outlet name, code, type, address, phone, and district.",
      );
      return;
    }

    try {
      setCreatingOutlet(true);
      const response = await outletApi.createOutlet({
        name: newOutletName.trim(),
        code: newOutletCode.trim().toUpperCase(),
        type: newOutletType.trim(),
        address: newOutletAddress.trim(),
        district: selectedDistrict._id,
        phone: newOutletPhone.trim(),
        contactPerson: newOutletContact.trim() || undefined,
        status: "ACTIVE",
      });
      const createdOutlet = response.outlet;
      setOutlets((previous) => [createdOutlet, ...previous]);
      setSelectedOutlet(createdOutlet);
      setOutletSearch(
        `${createdOutlet.name}${createdOutlet.outletCode || createdOutlet.code ? ` (${createdOutlet.outletCode || createdOutlet.code})` : ""}`,
      );
      setShowAddOutlet(false);
      setNewOutletName("");
      setNewOutletCode("");
      setNewOutletType("");
      setNewOutletAddress("");
      setNewOutletPhone("");
      setNewOutletContact("");
      setSelectedDistrict(null);
      Alert.alert("Outlet added", "The new outlet is selected for this asset.");
    } catch (error: any) {
      Alert.alert(
        "Unable to add outlet",
        error?.data?.message || error?.message || "Please try again.",
      );
    } finally {
      setCreatingOutlet(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Deployed Asset</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          onScrollBeginDrag={() => setShowOutletPicker(false)}
          onStartShouldSetResponderCapture={(event) => {
            if (
              Number(event.nativeEvent.target) !==
              findNodeHandle(outletInputRef.current)
            ) {
              setShowOutletPicker(false);
            }
            return false;
          }}
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Field Asset Registration</Text>
            <Text style={styles.sectionSubtitle}>
              Register an un-tagged freezer found deployed at an outlet
            </Text>

            {/* OUTLET SELECTOR */}
            <Text style={styles.inputLabel}>DEPLOYED OUTLET LOCATION *</Text>
            <View style={styles.selectBtn}>
              <Ionicons
                name="search-outline"
                size={20}
                color={Colors.light.textMuted}
              />
              <TextInput
                ref={outletInputRef}
                style={styles.outletSearchInput}
                placeholder="Search outlet name or phone"
                placeholderTextColor={Colors.light.textMuted}
                value={outletSearch}
                onChangeText={handleOutletSearchChange}
                onFocus={() => {
                  if (selectedOutlet) {
                    setOutletSearch("");
                    setSelectedOutlet(null);
                  }
                  setShowOutletPicker(true);
                }}
                onBlur={() => {
                  setTimeout(() => setShowOutletPicker(false), 180);
                }}
                onEndEditing={() => setShowOutletPicker(false)}
                autoCapitalize="words"
                autoCorrect={false}
                keyboardType="default"
                returnKeyType="search"
                onSubmitEditing={() => setShowOutletPicker(false)}
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

            {showOutletPicker && (
              <View style={styles.dropdown}>
                <ScrollView
                  style={styles.dropdownList}
                  nestedScrollEnabled
                  keyboardShouldPersistTaps="handled"
                >
                  {filteredOutlets.slice(0, 20).map((o) => (
                    <TouchableOpacity
                      key={o._id}
                      style={styles.dropItem}
                      onPress={() => {
                        setSelectedOutlet(o);
                        setOutletSearch(
                          `${o.name}${o.outletCode || o.code ? ` (${o.outletCode || o.code})` : ""}`,
                        );
                        setShowOutletPicker(false);
                      }}
                    >
                      <Text style={styles.dropItemTitle}>{o.name}</Text>
                      {(o.outletCode || o.code || o.phone) && (
                        <Text style={styles.dropItemSub}>
                          {o.outletCode || o.code || ""}
                          {o.phone ? ` • ${o.phone}` : ""}
                        </Text>
                      )}
                    </TouchableOpacity>
                  ))}
                  {filteredOutlets.length === 0 && (
                    <View style={styles.noOutletResult}>
                      <Text style={styles.dropdownEmptyText}>
                        No matching outlet found.
                      </Text>
                      <TouchableOpacity
                        style={styles.addOutletButton}
                        onPress={openAddOutlet}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="add-circle-outline"
                          size={18}
                          color={Colors.light.white}
                        />
                        <Text style={styles.addOutletButtonText}>
                          Add Outlet
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </ScrollView>
              </View>
            )}

            {/* MANUFACTURER SELECTION */}
            <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>
              MANUFACTURER *
            </Text>
            {loading ? (
              <ActivityIndicator size="small" color={Colors.light.primary} />
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.chipRow}
              >
                {manufacturers.map((m) => {
                  const isSelected = selectedManufacturer?._id === m._id;
                  return (
                    <TouchableOpacity
                      key={m._id}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setSelectedManufacturer(m)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          isSelected && styles.chipTextActive,
                        ]}
                      >
                        {m.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* CAPACITY */}
            <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>
              CAPACITY (LITERS) *
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 200, 300, 500"
              placeholderTextColor={Colors.light.textMuted}
              value={capacity}
              onChangeText={setCapacity}
              keyboardType="numeric"
            />

            {/* MANUFACTURE MONTH & YEAR */}
            <View style={styles.dateRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>MONTH (1-12)</Text>
                <TextInput
                  style={styles.input}
                  value={manufacturingMonth}
                  onChangeText={setManufacturingMonth}
                  keyboardType="numeric"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>YEAR</Text>
                <TextInput
                  style={styles.input}
                  value={manufacturingYear}
                  onChangeText={setManufacturingYear}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.light.white} />
              ) : (
                <>
                  <Ionicons
                    name="layers-outline"
                    size={20}
                    color={Colors.light.white}
                  />
                  <Text style={styles.submitBtnText}>
                    Submit For Authorization
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={showAddOutlet}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddOutlet(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.addOutletModal}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add Outlet</Text>
                <Text style={styles.modalSubtitle}>
                  Register the new deployment location
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowAddOutlet(false)}
                hitSlop={10}
              >
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
              {[
                ["Outlet name", newOutletName, setNewOutletName],
                ["Outlet code", newOutletCode, setNewOutletCode],
                ["Outlet type", newOutletType, setNewOutletType],
                ["Address", newOutletAddress, setNewOutletAddress],
                ["Phone number", newOutletPhone, setNewOutletPhone],
                [
                  "Contact person (optional)",
                  newOutletContact,
                  setNewOutletContact,
                ],
              ].map(([label, value, setter]) => (
                <View key={label as string}>
                  <Text style={styles.modalLabel}>{label as string}</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={value as string}
                    onChangeText={setter as (value: string) => void}
                    placeholder={label as string}
                    placeholderTextColor={Colors.light.textMuted}
                    autoCapitalize={
                      label === "Outlet code" ? "characters" : "words"
                    }
                    keyboardType={
                      label === "Phone number" ? "phone-pad" : "default"
                    }
                  />
                </View>
              ))}

              <Text style={styles.modalLabel}>District</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {districts.map((district) => (
                  <TouchableOpacity
                    key={district._id}
                    style={[
                      styles.districtChip,
                      selectedDistrict?._id === district._id &&
                        styles.districtChipActive,
                    ]}
                    onPress={() => setSelectedDistrict(district)}
                  >
                    <Text
                      style={[
                        styles.districtChipText,
                        selectedDistrict?._id === district._id &&
                          styles.districtChipTextActive,
                      ]}
                    >
                      {district.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <TouchableOpacity
                style={[
                  styles.createOutletButton,
                  creatingOutlet && styles.btnDisabled,
                ]}
                onPress={handleCreateOutlet}
                disabled={creatingOutlet}
              >
                {creatingOutlet ? (
                  <ActivityIndicator color={Colors.light.white} />
                ) : (
                  <Text style={styles.createOutletButtonText}>
                    Register Outlet
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  outletSearchInput: {
    flex: 1,
    minHeight: 46,
    color: Colors.light.text,
    fontSize: Typography.size.sm,
  },
  placeholderText: {
    color: Colors.light.textMuted,
    fontWeight: "normal",
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
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  dropdownEmptyText: {
    padding: Spacing.md,
    color: Colors.light.textMuted,
    fontSize: Typography.size.xs,
    textAlign: "center",
  },
  noOutletResult: {
    alignItems: "center",
    paddingBottom: Spacing.md,
  },
  addOutletButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  addOutletButtonText: {
    color: Colors.light.white,
    fontSize: Typography.size.xs,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(12, 24, 18, 0.45)",
  },
  addOutletModal: {
    maxHeight: "90%",
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  modalTitle: {
    color: Colors.light.text,
    fontSize: Typography.size.xl,
    fontWeight: "800",
  },
  modalSubtitle: {
    color: Colors.light.textSecondary,
    fontSize: Typography.size.xs,
    marginTop: 3,
  },
  modalLabel: {
    color: Colors.light.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
    marginTop: Spacing.sm,
    marginBottom: 5,
  },
  modalInput: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surfaceSecondary,
    color: Colors.light.text,
    fontSize: Typography.size.sm,
    paddingHorizontal: Spacing.md,
  },
  districtChip: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    backgroundColor: Colors.light.surfaceSecondary,
  },
  districtChipActive: {
    backgroundColor: Colors.light.primaryLight,
    borderColor: Colors.light.primary,
  },
  districtChipText: {
    color: Colors.light.textSecondary,
    fontSize: Typography.size.xs,
    fontWeight: "600",
  },
  districtChipTextActive: {
    color: Colors.light.primaryDark,
    fontWeight: "800",
  },
  createOutletButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  createOutletButtonText: {
    color: Colors.light.white,
    fontSize: Typography.size.sm,
    fontWeight: "800",
  },
  input: {
    backgroundColor: Colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    fontSize: Typography.size.sm,
    color: Colors.light.text,
    fontWeight: "600",
  },
  chipRow: {
    flexDirection: "row",
    marginBottom: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: Radius.md,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  chipActive: {
    backgroundColor: Colors.light.primaryLight,
    borderColor: Colors.light.primary,
  },
  chipText: {
    fontSize: Typography.size.xs,
    fontWeight: "600",
    color: Colors.light.textSecondary,
  },
  chipTextActive: {
    color: Colors.light.primaryDark,
    fontWeight: "700",
  },
  dateRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  submitBtn: {
    backgroundColor: Colors.light.primary,
    height: 50,
    borderRadius: Radius.lg,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.xl,
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
