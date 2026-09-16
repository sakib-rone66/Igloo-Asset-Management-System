// src/app/check-in.tsx

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import * as Location from "expo-location";
import { router, useLocalSearchParams } from "expo-router";
import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";
import { checkInApi, outletApi } from "../services/api";
import { CheckInRecord, CheckInType, OutletRef } from "../services/apiTypes";

export default function CheckInScreen() {
  const params = useLocalSearchParams<{ outletId?: string }>();

  const [checkInType, setCheckInType] = useState<CheckInType>(
    params.outletId ? "OUTLET" : "OFFICE",
  );
  const [selectedOutlet, setSelectedOutlet] = useState<OutletRef | null>(null);
  const [outletSearch, setOutletSearch] = useState("");
  const [outlets, setOutlets] = useState<OutletRef[]>([]);
  const [showOutletPicker, setShowOutletPicker] = useState(false);
  const [remarks, setRemarks] = useState("");

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState<CheckInRecord[]>([]);
  const [historyDate, setHistoryDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateInputError, setDateInputError] = useState<string | null>(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Fetch Outlets & auto-select if outletId in params
  useEffect(() => {
    outletApi
      .getOutlets({ status: "ACTIVE" })
      .then((res) => {
        const list = res.outlets || [];
        setOutlets(list);
        if (params.outletId) {
          const match = list.find((o) => o._id === params.outletId);
          if (match) {
            setSelectedOutlet(match);
            setCheckInType("OUTLET");
          }
        }
      })
      .catch((err) => console.error("Failed to load outlets:", err));
  }, [params.outletId]);

  // Fetch My Check-In History
  const loadHistory = useCallback(async () => {
    try {
      const res = await checkInApi.getMyHistory(
        historyDate
          ? {
              date: historyDate,
              // The API expects the device's offset from UTC.
              timezoneOffset: -new Date().getTimezoneOffset(),
            }
          : undefined,
      );
      setHistory(res.history || []);
    } catch (err) {
      console.error("Failed to load check-in history:", err);
    } finally {
      setLoadingHistory(false);
      setRefreshing(false);
    }
  }, [historyDate]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Request GPS coordinates quietly without blocking modal alerts
  const requestGpsLocation = async () => {
    try {
      setGettingLocation(true);
      setLocationError(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError(
          "Location permission not granted. GPS needed for field attendance.",
        );
        setGettingLocation(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch {
      setLocationError(
        "Could not determine GPS coordinates. Ensure device GPS is on.",
      );
    } finally {
      setGettingLocation(false);
    }
  };

  useEffect(() => {
    requestGpsLocation();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadHistory();
    requestGpsLocation();
  };

  const handleHistoryDateFilter = () => {
    if (!historyDate) {
      setDateInputError(null);
      loadHistory();
      return;
    }

    const isValidDate = /^\d{4}-\d{2}-\d{2}$/.test(historyDate);
    const parsedDate = isValidDate ? new Date(`${historyDate}T00:00:00`) : null;
    if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
      setDateInputError("Use the format YYYY-MM-DD.");
      return;
    }

    setDateInputError(null);
    loadHistory();
  };

  const clearHistoryDateFilter = () => {
    setHistoryDate("");
    setDateInputError(null);
  };

  const openHistoryDatePicker = () => {
    setDateInputError(null);
    setShowDatePicker(true);
  };

  const handleHistoryDateChange = (
    _event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    setShowDatePicker(false);
    if (!selectedDate) return;

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const day = String(selectedDate.getDate()).padStart(2, "0");
    setHistoryDate(`${year}-${month}-${day}`);
    setDateInputError(null);
  };

  const handleSubmit = async () => {
    setFormError(null);
    setSuccessBanner(null);

    if (!location) {
      setFormError(
        "GPS location required. Tap 'Refresh GPS' above to acquire coordinates.",
      );
      return;
    }

    if (checkInType === "OUTLET" && !selectedOutlet) {
      setFormError("Please choose the outlet you are visiting.");
      return;
    }

    try {
      setSubmitting(true);
      await checkInApi.createCheckIn({
        checkInType,
        outletId: checkInType === "OUTLET" ? selectedOutlet?._id : undefined,
        latitude: location.latitude,
        longitude: location.longitude,
        remarks: remarks.trim() || undefined,
      });

      const locationLabel =
        checkInType === "OUTLET" ? selectedOutlet?.name : "Office";
      setSuccessBanner(`${locationLabel} check-in recorded successfully!`);

      setRemarks("");
      if (checkInType === "OUTLET" && !params.outletId) {
        setSelectedOutlet(null);
      }
      loadHistory();
    } catch (err: any) {
      setFormError(
        err?.message || "Check-in failed. Please verify server connection.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOutlets = outlets.filter((o) => {
    const search = outletSearch.trim().toLowerCase();
    if (!search) return true;

    return [o.name, o.outletCode, o.code].some((value) =>
      value?.toLowerCase().includes(search),
    );
  });

  const handleOutletSearchChange = (value: string) => {
    setOutletSearch(value);
    setSelectedOutlet(null);
    setShowOutletPicker(true);
    setFormError(null);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={10}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Field Attendance & Visit</Text>
        <TouchableOpacity onPress={requestGpsLocation} hitSlop={10}>
          <Ionicons name="locate" size={22} color={Colors.light.primary} />
        </TouchableOpacity>
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
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.light.primary]}
            />
          }
        >
          {/* SUCCESS BANNER */}
          {successBanner && (
            <View style={styles.successBanner}>
              <Ionicons
                name="checkmark-circle"
                size={20}
                color={Colors.light.primary}
              />
              <Text style={styles.successBannerText}>{successBanner}</Text>
            </View>
          )}

          {/* FORM ERROR BANNER */}
          {formError && (
            <View style={styles.errorBanner}>
              <Ionicons
                name="alert-circle"
                size={20}
                color={Colors.light.danger}
              />
              <Text style={styles.errorBannerText}>{formError}</Text>
            </View>
          )}

          {/* CHECK-IN FORM CARD */}
          <View style={styles.formCard}>
            <Text style={styles.sectionLabel}>CHECK-IN TYPE</Text>
            <View style={styles.typeSelector}>
              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  checkInType === "OFFICE" && styles.typeBtnActive,
                ]}
                onPress={() => {
                  setCheckInType("OFFICE");
                  setSelectedOutlet(null);
                  setFormError(null);
                }}
              >
                <Ionicons
                  name="business-outline"
                  size={18}
                  color={
                    checkInType === "OFFICE"
                      ? Colors.light.white
                      : Colors.light.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    checkInType === "OFFICE" && styles.typeBtnTextActive,
                  ]}
                >
                  Office
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.typeBtn,
                  checkInType === "OUTLET" && styles.typeBtnActive,
                ]}
                onPress={() => {
                  setCheckInType("OUTLET");
                  setFormError(null);
                  setShowOutletPicker(false);
                }}
              >
                <Ionicons
                  name="storefront-outline"
                  size={18}
                  color={
                    checkInType === "OUTLET"
                      ? Colors.light.white
                      : Colors.light.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.typeBtnText,
                    checkInType === "OUTLET" && styles.typeBtnTextActive,
                  ]}
                >
                  Outlet Visit
                </Text>
              </TouchableOpacity>
            </View>

            {/* OUTLET SELECTOR (IF OUTLET VISIT) */}
            {checkInType === "OUTLET" && (
              <View style={styles.outletSection}>
                <Text style={styles.inputLabel}>VISITING STORE / OUTLET *</Text>
                <View style={styles.outletSearchBox}>
                  <Ionicons
                    name="search-outline"
                    size={20}
                    color={Colors.light.textMuted}
                  />
                  <TextInput
                    style={styles.outletSearchInput}
                    placeholder="Search outlet name or code"
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
                      // Allow a suggestion tap to finish before closing the list.
                      setTimeout(() => setShowOutletPicker(false), 180);
                    }}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="search"
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
                  <View style={styles.outletDropdown}>
                    <ScrollView
                      style={styles.dropdownList}
                      nestedScrollEnabled
                      keyboardShouldPersistTaps="handled"
                    >
                      {filteredOutlets.slice(0, 20).map((outlet) => (
                        <TouchableOpacity
                          key={outlet._id}
                          style={styles.dropdownItem}
                          onPress={() => {
                            setSelectedOutlet(outlet);
                            setOutletSearch(
                              `${outlet.name}${outlet.outletCode || outlet.code ? ` (${outlet.outletCode || outlet.code})` : ""}`,
                            );
                            setShowOutletPicker(false);
                            setFormError(null);
                          }}
                        >
                          <Text style={styles.dropdownItemName}>
                            {outlet.name}
                          </Text>
                          {(outlet.outletCode || outlet.code) && (
                            <Text style={styles.dropdownItemCode}>
                              {outlet.outletCode || outlet.code}
                            </Text>
                          )}
                        </TouchableOpacity>
                      ))}
                      {filteredOutlets.length === 0 && (
                        <Text style={styles.dropdownEmptyText}>
                          No matching outlet found.
                        </Text>
                      )}
                    </ScrollView>
                  </View>
                )}
              </View>
            )}

            {/* GPS LOCATION STATUS */}
            <View style={styles.gpsBox}>
              <View style={styles.gpsHeader}>
                <View style={styles.gpsTitleRow}>
                  <Ionicons
                    name={location ? "location" : "location-outline"}
                    size={18}
                    color={
                      location ? Colors.light.success : Colors.light.warning
                    }
                  />
                  <Text style={styles.gpsTitle}>GPS Location Status</Text>
                </View>
                {gettingLocation ? (
                  <ActivityIndicator
                    size="small"
                    color={Colors.light.primary}
                  />
                ) : (
                  <TouchableOpacity onPress={requestGpsLocation}>
                    <Text style={styles.refreshGps}>Refresh GPS</Text>
                  </TouchableOpacity>
                )}
              </View>

              {location ? (
                <Text style={styles.gpsCoords}>
                  Locked: Lat {location.latitude.toFixed(5)}, Lon{" "}
                  {location.longitude.toFixed(5)}
                </Text>
              ) : locationError ? (
                <Text style={styles.gpsError}>{locationError}</Text>
              ) : (
                <Text style={styles.gpsWaiting}>
                  Acquiring satellite coordinates...
                </Text>
              )}
            </View>

            {/* REMARKS */}
            <Text style={styles.inputLabel}>
              VISIT REMARKS / NOTES (OPTIONAL)
            </Text>
            <TextInput
              style={styles.remarksInput}
              placeholder="Stock inspection, customer visit, freezer maintenance..."
              placeholderTextColor={Colors.light.textMuted}
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={3}
            />

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.light.white} />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={20}
                    color={Colors.light.white}
                  />
                  <Text style={styles.submitBtnText}>
                    Submit Attendance Check-In
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* RECENT CHECK-IN HISTORY */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Recent Attendance</Text>
              <Text style={styles.sectionSubtitle}>
                {historyDate
                  ? `Showing ${historyDate}`
                  : "Your latest check-ins"}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.filterIconButton}
              onPress={historyDate ? clearHistoryDateFilter : undefined}
              accessibilityLabel={
                historyDate ? "Clear date filter" : "Date filter"
              }
            >
              <Ionicons
                name={historyDate ? "close" : "calendar-outline"}
                size={18}
                color={Colors.light.primary}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.dateFilterCard}>
            <TouchableOpacity
              style={styles.dateInputWrapper}
              onPress={openHistoryDatePicker}
              activeOpacity={0.75}
            >
              <Ionicons
                name="calendar-outline"
                size={18}
                color={Colors.light.textMuted}
              />
              <Text
                style={[
                  styles.dateInput,
                  !historyDate && styles.datePlaceholder,
                ]}
              >
                {historyDate || "Select a date"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={
                historyDate ? handleHistoryDateFilter : openHistoryDatePicker
              }
            >
              <Ionicons
                name="filter-outline"
                size={16}
                color={Colors.light.white}
              />
              <Text style={styles.filterButtonText}>Filter</Text>
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={
                historyDate ? new Date(`${historyDate}T12:00:00`) : new Date()
              }
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              maximumDate={new Date()}
              onChange={handleHistoryDateChange}
            />
          )}
          {dateInputError && (
            <Text style={styles.dateInputError}>{dateInputError}</Text>
          )}

          {loadingHistory ? (
            <ActivityIndicator
              color={Colors.light.primary}
              style={{ marginTop: Spacing.md }}
            />
          ) : history.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No check-ins recorded yet.</Text>
            </View>
          ) : (
            <View style={styles.historyList}>
              {history.slice(0, 10).map((record) => (
                <View key={record._id} style={styles.historyItem}>
                  <View
                    style={[
                      styles.historyIcon,
                      {
                        backgroundColor:
                          record.checkInType === "OUTLET"
                            ? "#EAF3FF"
                            : Colors.light.primaryLight,
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        record.checkInType === "OUTLET"
                          ? "storefront-outline"
                          : "business-outline"
                      }
                      size={20}
                      color={
                        record.checkInType === "OUTLET"
                          ? Colors.light.info
                          : Colors.light.primary
                      }
                    />
                  </View>

                  <View style={styles.historyInfo}>
                    <Text style={styles.historyName}>
                      {record.checkInType === "OUTLET"
                        ? record.outlet?.name || "Outlet Visit"
                        : "Office Attendance"}
                    </Text>
                    <Text style={styles.historyTime}>
                      {new Date(record.checkInTime).toLocaleString([], {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                    {record.remarks ? (
                      <Text style={styles.historyRemarks}>
                        "{record.remarks}"
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.badgeSuccess}>
                    <Text style={styles.badgeSuccessText}>LOGGED</Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primaryLight,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  successBannerText: {
    flex: 1,
    fontSize: Typography.size.xs,
    color: Colors.light.primaryDark,
    fontWeight: "700",
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDECEC",
    padding: Spacing.md,
    borderRadius: Radius.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  errorBannerText: {
    flex: 1,
    fontSize: Typography.size.xs,
    color: Colors.light.danger,
    fontWeight: "700",
  },
  formCard: {
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: Spacing.xl,
    ...Shadows.card,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.light.textMuted,
    letterSpacing: 0.8,
    marginBottom: Spacing.xs,
  },
  typeSelector: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  typeBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  typeBtnActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  typeBtnText: {
    fontSize: Typography.size.sm,
    fontWeight: "700",
    color: Colors.light.textSecondary,
  },
  typeBtnTextActive: {
    color: Colors.light.white,
  },
  outletSection: {
    marginBottom: Spacing.md,
    position: "relative",
    zIndex: 2,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.light.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  outletPickerBtn: {
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
    color: Colors.light.text,
    fontSize: Typography.size.sm,
  },
  outletPickerText: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontWeight: "600",
    color: Colors.light.text,
  },
  placeholderText: {
    color: Colors.light.textMuted,
    fontWeight: "normal",
  },
  outletDropdown: {
    marginTop: Spacing.xs,
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    maxHeight: 220,
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
    maxHeight: 180,
  },
  dropdownItem: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.surfaceSecondary,
  },
  dropdownItemName: {
    fontSize: Typography.size.sm,
    fontWeight: "600",
    color: Colors.light.text,
  },
  dropdownItemCode: {
    fontSize: Typography.size.xs,
    color: Colors.light.textMuted,
  },
  dropdownEmptyText: {
    padding: Spacing.md,
    color: Colors.light.textMuted,
    fontSize: Typography.size.xs,
    textAlign: "center",
  },
  gpsBox: {
    backgroundColor: Colors.light.surfaceSecondary,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  gpsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  gpsTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  gpsTitle: {
    fontSize: Typography.size.xs,
    fontWeight: "700",
    color: Colors.light.text,
  },
  refreshGps: {
    fontSize: Typography.size.xs,
    color: Colors.light.primary,
    fontWeight: "700",
  },
  gpsCoords: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  gpsError: {
    fontSize: Typography.size.xs,
    color: Colors.light.danger,
  },
  gpsWaiting: {
    fontSize: Typography.size.xs,
    color: Colors.light.textMuted,
    fontStyle: "italic",
  },
  remarksInput: {
    backgroundColor: Colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: Typography.size.sm,
    color: Colors.light.text,
    minHeight: 70,
    textAlignVertical: "top",
    marginBottom: Spacing.lg,
  },
  submitBtn: {
    backgroundColor: Colors.light.primary,
    height: 50,
    borderRadius: Radius.lg,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.sm,
    ...Shadows.card,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: Colors.light.white,
    fontSize: Typography.size.md,
    fontWeight: "700",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.size.md,
    fontWeight: "700",
    color: Colors.light.text,
  },
  sectionSubtitle: {
    color: Colors.light.textMuted,
    fontSize: Typography.size.xs,
    marginTop: 2,
  },
  filterIconButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primaryLight,
  },
  dateFilterCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  dateInputWrapper: {
    flex: 1,
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surface,
  },
  dateInput: {
    flex: 1,
    color: Colors.light.text,
    fontSize: Typography.size.sm,
  },
  datePlaceholder: {
    color: Colors.light.textMuted,
  },
  filterButton: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
  },
  filterButtonText: {
    color: Colors.light.white,
    fontSize: Typography.size.sm,
    fontWeight: "700",
  },
  dateInputError: {
    color: Colors.light.danger,
    fontSize: Typography.size.xs,
    marginTop: -Spacing.xs,
    marginBottom: Spacing.sm,
  },
  emptyCard: {
    padding: Spacing.xl,
    backgroundColor: Colors.light.surface,
    borderRadius: Radius.lg,
    alignItems: "center",
  },
  emptyText: {
    fontSize: Typography.size.sm,
    color: Colors.light.textMuted,
  },
  historyList: {
    gap: Spacing.sm,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: Spacing.md,
    ...Shadows.card,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  historyInfo: {
    flex: 1,
  },
  historyName: {
    fontSize: Typography.size.sm,
    fontWeight: "700",
    color: Colors.light.text,
  },
  historyTime: {
    fontSize: Typography.size.xs,
    color: Colors.light.textMuted,
    marginTop: 2,
  },
  historyRemarks: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    fontStyle: "italic",
    marginTop: 2,
  },
  badgeSuccess: {
    backgroundColor: Colors.light.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  badgeSuccessText: {
    fontSize: 9,
    fontWeight: "800",
    color: Colors.light.primaryDark,
  },
});
