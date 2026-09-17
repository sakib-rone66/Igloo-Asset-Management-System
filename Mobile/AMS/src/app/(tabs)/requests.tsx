// src/app/(tabs)/requests.tsx

import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  BackHandler,
  findNodeHandle,
  FlatList,
  Modal,
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
import { useLocalSearchParams } from "expo-router";
import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../../constants/theme";
import { useAuth } from "../../context/AuthContext";
import {
  incomingRequestApi,
  outletApi,
  requestApi,
  verificationApi,
} from "../../services/api";
import { AssetRequestItem, OutletRef } from "../../services/apiTypes";

export default function RequestsScreen() {
  const params = useLocalSearchParams<{ view?: string }>();
  const ownAssetRequestsView = params.view === "MY_ASSET_REQUESTS";
  const newAssetRequestView = params.view === "NEW_ASSET_REQUEST";
  const { user } = useAuth();
  const canManageRequests = ["SYSTEM_ADMIN", "TSM", "TSO"].includes(
    user?.role || "",
  );
  const [assetRequests, setAssetRequests] = useState<AssetRequestItem[]>([]);
  const [activeRequestTab, setActiveRequestTab] = useState<
    "AUTHORIZATION" | "ASSET" | "VERIFICATION" | "REPAIR"
  >("ASSET");
  const [showRequestDashboard, setShowRequestDashboard] = useState(
    !ownAssetRequestsView && !newAssetRequestView,
  );
  const [authorizations, setAuthorizations] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [repairs, setRepairs] = useState<any[]>([]);
  const [requestCounts, setRequestCounts] = useState({
    authorization: 0,
    asset: 0,
    verification: 0,
    repair: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // New Request Modal State
  const [showModal, setShowModal] = useState(newAssetRequestView);
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
    if (showRequestDashboard || showModal) return;

    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        setShowRequestDashboard(true);
        return true;
      },
    );

    return () => subscription.remove();
  }, [showModal, showRequestDashboard]);

  useEffect(() => {
    outletApi
      .getOutlets({ status: "ACTIVE" })
      .then((res) => setOutlets(res.outlets || []))
      .catch((err) => console.error("Error loading outlets:", err));
  }, []);

  const loadRequests = useCallback(async () => {
    try {
      const res =
        ownAssetRequestsView || newAssetRequestView
          ? await requestApi.getAssetRequests()
          : canManageRequests
            ? await requestApi.getAllAssetRequests()
            : await requestApi.getAssetRequests();
      setAssetRequests(res.requests || []);
    } catch (err) {
      console.error("Failed to load requests:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [canManageRequests, newAssetRequestView, ownAssetRequestsView]);

  const loadIncomingRequests = useCallback(async () => {
    if (ownAssetRequestsView || newAssetRequestView) return;

    if (!canManageRequests) {
      const [
        authorizationResult,
        assetResult,
        verificationResult,
        repairResult,
      ] = await Promise.all([
        incomingRequestApi.getMyAuthorizations(),
        requestApi.getAssetRequests(),
        verificationApi.getMyVerificationRequests(),
        incomingRequestApi.getMyRepairs(),
      ]);
      const ownAuthorizations = authorizationResult.authorizations || [];
      const ownVerifications = verificationResult.mappings || [];
      const ownRepairs = repairResult.repairs || [];
      setAuthorizations(ownAuthorizations);
      setVerifications(ownVerifications);
      setRepairs(ownRepairs);
      setRequestCounts((current) => ({
        authorization: ownAuthorizations.filter(
          (item: any) => item.status === "PENDING",
        ).length,
        asset: assetResult.requests.filter((item) => item.status === "PENDING")
          .length,
        verification: ownVerifications.filter(
          (item: any) => item.status === "PENDING",
        ).length,
        repair: ownRepairs.filter((item: any) => item.status === "PENDING")
          .length,
      }));
      return;
    }

    const [authorizationResult, verificationResult, repairResult, assetResult] =
      await Promise.allSettled([
        incomingRequestApi.getAuthorizations(),
        incomingRequestApi.getPendingVerifications(),
        incomingRequestApi.getPendingRepairs(),
        requestApi.getAllAssetRequests({ status: "PENDING" }),
      ]);

    const authorizationItems =
      authorizationResult.status === "fulfilled"
        ? authorizationResult.value.authorizations || []
        : [];
    const verificationItems =
      verificationResult.status === "fulfilled"
        ? verificationResult.value.mappings || []
        : [];
    const repairItems =
      repairResult.status === "fulfilled"
        ? repairResult.value.repairs || []
        : [];
    const assetItems =
      assetResult.status === "fulfilled"
        ? assetResult.value.requests || []
        : [];

    setAuthorizations(
      authorizationItems.filter((item: any) => item.status === "PENDING"),
    );
    setVerifications(verificationItems);
    setRepairs(repairItems.filter((item: any) => item.status === "PENDING"));
    setRequestCounts({
      authorization: authorizationItems.filter(
        (item: any) => item.status === "PENDING",
      ).length,
      asset: assetItems.length,
      verification: verificationItems.length,
      repair: repairItems.filter((item: any) => item.status === "PENDING")
        .length,
    });
  }, [canManageRequests, newAssetRequestView, ownAssetRequestsView]);

  useEffect(() => {
    setLoading(true);
    loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    loadIncomingRequests();
    const interval = setInterval(loadIncomingRequests, 15000);
    return () => clearInterval(interval);
  }, [loadIncomingRequests]);

  const onRefresh = () => {
    setRefreshing(true);
    loadRequests();
  };

  const filteredOutlets = outlets.filter((outlet) => {
    const search = outletSearch.trim().toLowerCase();
    if (!search) return true;

    return [outlet.name, outlet.outletCode, outlet.code, outlet.phone].some(
      (value) => value?.toLowerCase().includes(search),
    );
  });

  const handleOutletSearchChange = (value: string) => {
    setOutletSearch(value);
    setSelectedOutlet(null);
    setShowOutletPicker(true);
  };

  const handleCreateAssetRequest = async () => {
    if (!selectedOutlet) {
      Alert.alert(
        "Select Outlet",
        "Please select an outlet for this asset request.",
      );
      return;
    }
    const qNum = parseInt(quantity, 10);
    if (!qNum || qNum < 1) {
      Alert.alert(
        "Invalid Quantity",
        "Please enter a valid positive number of freezers.",
      );
      return;
    }
    if (!reason.trim()) {
      Alert.alert(
        "Reason Required",
        "Please provide a reason for requesting additional freezers.",
      );
      return;
    }

    try {
      setSubmitting(true);
      await requestApi.createAssetRequest({
        outletId: selectedOutlet._id,
        quantity: qNum,
        reason: reason.trim(),
        remarks: remarks.trim() || undefined,
      });

      Alert.alert(
        "Request Submitted",
        "Your asset allocation request has been created.",
      );
      setShowModal(false);
      setReason("");
      setRemarks("");
      setSelectedOutlet(null);
      setOutletSearch("");
      setShowOutletPicker(false);
      setQuantity("1");
      loadRequests();
    } catch (err: any) {
      Alert.alert(
        "Submission Failed",
        err?.message || "Could not submit request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewAssetRequest = (
    requestId: string,
    status: "APPROVED" | "REJECTED",
  ) => {
    const action = status === "APPROVED" ? "approve" : "reject";
    Alert.alert(
      `${status === "APPROVED" ? "Approve" : "Reject"} Request`,
      `Are you sure you want to ${action} this asset request?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: status === "APPROVED" ? "Approve" : "Reject",
          style: status === "REJECTED" ? "destructive" : "default",
          onPress: async () => {
            try {
              await requestApi.updateAssetRequestStatus(
                requestId,
                status,
                status === "REJECTED"
                  ? "Rejected by administrator."
                  : undefined,
              );
              await loadRequests();
              await loadIncomingRequests();
            } catch (err: any) {
              Alert.alert(
                "Update Failed",
                err?.message || "Could not update this asset request.",
              );
            }
          },
        },
      ],
    );
  };

  const handleReviewIncomingRequest = (
    type: "AUTHORIZATION" | "VERIFICATION" | "REPAIR",
    requestId: string,
    decision: "APPROVED" | "REJECTED",
  ) => {
    const action = decision === "APPROVED" ? "approve" : "reject";
    Alert.alert(
      `${decision === "APPROVED" ? "Approve" : "Reject"} Request`,
      `Are you sure you want to ${action} this request?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: decision === "APPROVED" ? "Approve" : "Reject",
          style: decision === "REJECTED" ? "destructive" : "default",
          onPress: async () => {
            try {
              if (type === "AUTHORIZATION") {
                await incomingRequestApi.reviewAuthorization(
                  requestId,
                  decision,
                );
              } else if (type === "VERIFICATION") {
                await incomingRequestApi.reviewVerification(
                  requestId,
                  decision,
                );
              } else if (decision === "APPROVED") {
                await incomingRequestApi.approveRepair(requestId);
              } else {
                await incomingRequestApi.rejectRepair(requestId);
              }
              await loadIncomingRequests();
            } catch (err: any) {
              Alert.alert(
                "Update Failed",
                err?.message || "Could not update this request.",
              );
            }
          },
        },
      ],
    );
  };

  const requestTabs = [
    {
      key: "AUTHORIZATION" as const,
      label: "Asset Authorization",
      icon: "shield-checkmark-outline" as const,
      count: requestCounts.authorization,
    },
    {
      key: "ASSET" as const,
      label: "Asset Request",
      icon: "cube-outline" as const,
      count: requestCounts.asset,
    },
    {
      key: "VERIFICATION" as const,
      label: "Verification",
      icon: "checkmark-done-outline" as const,
      count: requestCounts.verification,
    },
    {
      key: "REPAIR" as const,
      label: "Repair Request",
      icon: "build-outline" as const,
      count: requestCounts.repair,
    },
  ];

  const openRequestCategory = (
    category: "AUTHORIZATION" | "ASSET" | "VERIFICATION" | "REPAIR",
  ) => {
    setActiveRequestTab(category);
    setShowRequestDashboard(false);
    if (category === "ASSET") {
      setLoading(true);
      loadRequests();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "COMPLETED":
        return { text: "#006B32", bg: Colors.light.primaryLight };
      case "REJECTED":
      case "CANCELLED":
        return { text: "#D64545", bg: "#FDECEC" };
      case "IN_PROGRESS":
        return { text: "#2778C8", bg: "#EAF3FF" };
      default:
        return { text: "#E59B17", bg: "#FFF5DE" };
    }
  };

  const incomingItems =
    activeRequestTab === "AUTHORIZATION"
      ? authorizations
      : activeRequestTab === "VERIFICATION"
        ? verifications
        : repairs;

  const renderIncomingItem = ({ item }: { item: any }) => {
    const isAuthorization = activeRequestTab === "AUTHORIZATION";
    const isVerification = activeRequestTab === "VERIFICATION";
    const title = isAuthorization
      ? `${item.assetType || "Asset"} Authorization`
      : isVerification
        ? `AIN: ${item.asset?.ain || "Asset"}`
        : `AIN: ${item.asset?.ain || "Asset"}`;
    const detail = isAuthorization
      ? `${item.capacity || "-"}L freezer • ${item.manufacturer?.name || "Manufacturer pending"}`
      : isVerification
        ? `Outlet: ${item.outlet?.name || "Outlet"}`
        : item.problem || item.remarks || "Repair request";
    const requester = isAuthorization
      ? item.requestedBy?.name
      : isVerification
        ? item.submittedBy?.name
        : item.reportedBy?.name;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <Text style={styles.outletTitle}>{title}</Text>
          <View style={[styles.badge, { backgroundColor: "#FFF5DE" }]}>
            <Text style={[styles.badgeText, { color: "#E59B17" }]}>
              PENDING
            </Text>
          </View>
        </View>
        <Text style={styles.reasonText}>{detail}</Text>
        {requester ? (
          <Text style={styles.remarksText}>Submitted by: {requester}</Text>
        ) : null}
        <Text style={styles.dateText}>
          {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}
        </Text>
        {canManageRequests ? (
          <View style={styles.reviewActions}>
            <TouchableOpacity
              style={[styles.reviewButton, styles.rejectButton]}
              onPress={() =>
                handleReviewIncomingRequest(
                  activeRequestTab as
                    | "AUTHORIZATION"
                    | "VERIFICATION"
                    | "REPAIR",
                  item._id,
                  "REJECTED",
                )
              }
            >
              <Text style={styles.rejectButtonText}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reviewButton, styles.approveButton]}
              onPress={() =>
                handleReviewIncomingRequest(
                  activeRequestTab as
                    | "AUTHORIZATION"
                    | "VERIFICATION"
                    | "REPAIR",
                  item._id,
                  "APPROVED",
                )
              }
            >
              <Text style={styles.approveButtonText}>Approve</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>WORKFLOW CENTER</Text>
          <Text style={styles.title}>
            {showRequestDashboard
              ? "Incoming Requests"
              : requestTabs.find((tab) => tab.key === activeRequestTab)?.label}
          </Text>
        </View>
        {showRequestDashboard ? (
          <View style={styles.headerMark}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={Colors.light.primary}
            />
          </View>
        ) : (
          <View style={styles.headerActions}>
            {activeRequestTab === "ASSET" ? (
              <TouchableOpacity
                style={styles.headerAddButton}
                onPress={() => setShowModal(true)}
                activeOpacity={0.85}
                accessibilityRole="button"
                accessibilityLabel="Create new asset request"
              >
                <Ionicons name="add" size={24} color={Colors.light.white} />
              </TouchableOpacity>
            ) : null}
          </View>
        )}
      </View>

      {showRequestDashboard ? (
        <ScrollView
          contentContainerStyle={styles.dashboardContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.dashboardIntroTitle}>Request center</Text>
          <Text style={styles.dashboardIntroText}>
            Review activity across asset operations and field workflows.
          </Text>
          <View style={styles.requestGrid}>
            {requestTabs.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={styles.requestTile}
                onPress={() => openRequestCategory(tab.key)}
                activeOpacity={0.86}
              >
                <View style={styles.requestTileTop}>
                  <View style={styles.requestTileIcon}>
                    <Ionicons
                      name={tab.icon}
                      size={22}
                      color={Colors.light.primary}
                    />
                  </View>
                  <View
                    style={[
                      styles.requestCount,
                      tab.count === 0 && styles.requestCountEmpty,
                    ]}
                  >
                    <Text style={styles.requestCountText}>{tab.count}</Text>
                  </View>
                </View>
                <Text style={styles.requestTileTitle}>{tab.label}</Text>
                <Text style={styles.requestTileCaption}>
                  {tab.count === 0 ? "No pending requests" : "Pending review"}
                </Text>
                <Ionicons
                  name="arrow-forward-outline"
                  size={18}
                  color={Colors.light.textMuted}
                  style={styles.requestTileArrow}
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : null}

      {/* REQUEST LIST */}
      {!showRequestDashboard && loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Fetching requests...</Text>
        </View>
      ) : !showRequestDashboard && activeRequestTab === "ASSET" ? (
        <FlatList
          data={assetRequests}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.light.primary]}
            />
          }
          renderItem={({ item }) => {
            const badge = getStatusBadge(item.status);
            return (
              <View style={styles.card}>
                <View style={styles.cardTop}>
                  <Text style={styles.outletTitle}>
                    {item.outlet?.name || "Outlet"}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: badge.bg }]}>
                    <Text style={[styles.badgeText, { color: badge.text }]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Text style={styles.qtyBadge}>
                    {item.quantity} Freezers Requested
                  </Text>
                  <Text style={styles.dateText}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </Text>
                </View>

                <Text style={styles.reasonText}>Reason: {item.reason}</Text>
                {item.remarks ? (
                  <Text style={styles.remarksText}>Notes: {item.remarks}</Text>
                ) : null}
                {canManageRequests && item.status === "PENDING" ? (
                  <View style={styles.reviewActions}>
                    <TouchableOpacity
                      style={[styles.reviewButton, styles.rejectButton]}
                      onPress={() =>
                        handleReviewAssetRequest(item._id, "REJECTED")
                      }
                    >
                      <Text style={styles.rejectButtonText}>Reject</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.reviewButton, styles.approveButton]}
                      onPress={() =>
                        handleReviewAssetRequest(item._id, "APPROVED")
                      }
                    >
                      <Text style={styles.approveButtonText}>Approve</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="document-text-outline"
                size={48}
                color={Colors.light.textMuted}
              />
              <Text style={styles.emptyTitle}>No asset requests found</Text>
              <Text style={styles.emptySubtitle}>
                Tap the "+ New" button above to submit an asset request for an
                outlet.
              </Text>
            </View>
          }
        />
      ) : !showRequestDashboard ? (
        <FlatList
          data={incomingItems}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadIncomingRequests().finally(() => setRefreshing(false));
              }}
              colors={[Colors.light.primary]}
            />
          }
          renderItem={renderIncomingItem}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name={
                  requestTabs.find((tab) => tab.key === activeRequestTab)
                    ?.icon || "document-text-outline"
                }
                size={48}
                color={Colors.light.textMuted}
              />
              <Text style={styles.emptyTitle}>No pending requests</Text>
              <Text style={styles.emptySubtitle}>
                New incoming requests will appear here automatically.
              </Text>
            </View>
          }
        />
      ) : null}

      {/* NEW ASSET REQUEST MODAL */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={styles.modalArea}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)} hitSlop={10}>
              <Ionicons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Asset Request</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            style={styles.modalBody}
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
            <Text style={styles.inputLabel}>SELECT OUTLET *</Text>
            <View style={styles.outletSearchBox}>
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
                  {filteredOutlets.length === 0 && (
                    <Text style={styles.outletEmptyText}>
                      No matching outlet found.
                    </Text>
                  )}
                </ScrollView>
              </View>
            )}

            <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>
              QUANTITY OF FREEZERS *
            </Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="number-pad"
              placeholder="e.g. 1, 2"
            />

            <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>
              REASON FOR REQUEST *
            </Text>
            <TextInput
              style={styles.input}
              value={reason}
              onChangeText={setReason}
              placeholder="e.g. High ice cream demand during summer festival..."
            />

            <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>
              ADDITIONAL REMARKS
            </Text>
            <TextInput
              style={[
                styles.input,
                { minHeight: 70, textAlignVertical: "top" },
              ]}
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={3}
              placeholder="Any special storage dimensions or notes..."
            />

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.btnDisabled]}
              onPress={handleCreateAssetRequest}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.light.white} />
              ) : (
                <Text style={styles.submitBtnText}>Submit Request</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.light.primary,
    letterSpacing: 1,
  },
  title: {
    fontSize: Typography.size.xxl,
    fontWeight: "800",
    color: Colors.light.text,
  },
  headerAddButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.pill,
    ...Shadows.floating,
  },
  headerMark: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primaryLight,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  dashboardContent: {
    padding: Spacing.xl,
    paddingBottom: Spacing.xxl,
  },
  dashboardIntroTitle: {
    fontSize: Typography.size.lg,
    fontWeight: "800",
    color: Colors.light.text,
  },
  dashboardIntroText: {
    marginTop: 4,
    marginBottom: Spacing.lg,
    fontSize: Typography.size.sm,
    lineHeight: 20,
    color: Colors.light.textSecondary,
  },
  requestGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
  requestTile: {
    width: "47.5%",
    minHeight: 178,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surface,
    ...Shadows.card,
  },
  requestTileTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  requestTileIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primaryLight,
  },
  requestTileTitle: {
    marginTop: Spacing.md,
    fontSize: Typography.size.sm,
    lineHeight: 18,
    fontWeight: "800",
    color: Colors.light.text,
  },
  requestTileCaption: {
    marginTop: 4,
    fontSize: Typography.size.xs,
    color: Colors.light.textMuted,
  },
  requestTileArrow: {
    position: "absolute",
    right: Spacing.md,
    bottom: Spacing.md,
  },
  requestTabs: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: Colors.light.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  requestTab: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    backgroundColor: Colors.light.surfaceSecondary,
  },
  requestTabActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  requestTabText: {
    fontSize: Typography.size.xs,
    fontWeight: "700",
    color: Colors.light.textSecondary,
  },
  requestTabTextActive: {
    color: Colors.light.primaryDark,
  },
  requestCount: {
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.danger,
  },
  requestCountEmpty: {
    backgroundColor: Colors.light.textMuted,
  },
  requestCountText: {
    color: Colors.light.white,
    fontSize: 10,
    fontWeight: "800",
  },
  listContent: {
    padding: Spacing.xl,
    gap: Spacing.md,
    paddingBottom: Spacing.xxl + 40,
  },
  card: {
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
    marginBottom: Spacing.xs,
  },
  outletTitle: {
    fontSize: Typography.size.md,
    fontWeight: "700",
    color: Colors.light.text,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: Spacing.xs,
  },
  qtyBadge: {
    fontSize: Typography.size.xs,
    color: Colors.light.primary,
    fontWeight: "700",
  },
  dateText: {
    fontSize: Typography.size.xs,
    color: Colors.light.textMuted,
  },
  reasonText: {
    fontSize: Typography.size.sm,
    color: Colors.light.text,
    marginTop: 2,
  },
  remarksText: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    fontStyle: "italic",
    marginTop: 2,
  },
  reviewActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  reviewButton: {
    minWidth: 88,
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  rejectButton: {
    borderColor: "#D64545",
    backgroundColor: "#FDECEC",
  },
  rejectButtonText: {
    color: "#D64545",
    fontSize: Typography.size.sm,
    fontWeight: "700",
  },
  approveButton: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primary,
  },
  approveButtonText: {
    color: Colors.light.white,
    fontSize: Typography.size.sm,
    fontWeight: "700",
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
    maxWidth: 260,
  },
  modalArea: {
    flex: 1,
    backgroundColor: Colors.light.surface,
  },
  modalHeader: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: Typography.size.md,
    fontWeight: "700",
    color: Colors.light.text,
  },
  modalBody: {
    padding: Spacing.xl,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.light.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  outletChips: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
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
  outletChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: Radius.md,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  outletChipActive: {
    backgroundColor: Colors.light.primaryLight,
    borderColor: Colors.light.primary,
  },
  outletChipText: {
    fontSize: Typography.size.xs,
    fontWeight: "600",
    color: Colors.light.textSecondary,
  },
  outletChipTextActive: {
    color: Colors.light.primaryDark,
    fontWeight: "700",
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
  submitBtn: {
    backgroundColor: Colors.light.primary,
    height: 50,
    borderRadius: Radius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
    marginBottom: Spacing.xxl,
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
