// src/app/outlets.tsx

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
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
import { router } from "expo-router";
import {
  Colors,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../constants/theme";
import { useAuth } from "../context/AuthContext";
import { outletApi } from "../services/api";
import {
  Asset,
  DistrictRef,
  DistributorRef,
  OutletRef,
  RegionRef,
} from "../services/apiTypes";

const STATUS_FILTERS = [
  { key: "ALL", label: "All Stores" },
  { key: "ACTIVE", label: "Active" },
  { key: "INACTIVE", label: "Inactive" },
];

const OUTLET_TYPES = [
  { _id: "Retail", name: "Retail" },
  { _id: "Distributor", name: "Distributor" },
];

export default function OutletsScreen() {
  const { hasPermission } = useAuth();
  const canEditOutlets = hasPermission("outlets", "update");
  const [outlets, setOutlets] = useState<OutletRef[]>([]);
  const [allOutlets, setAllOutlets] = useState<OutletRef[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Detail Modal State (View Freezers at Outlet)
  const [selectedOutlet, setSelectedOutlet] = useState<OutletRef | null>(null);
  const [outletAssets, setOutletAssets] = useState<Asset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Create Outlet Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOutlet, setEditingOutlet] = useState<OutletRef | null>(null);
  const [newName, setNewName] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState("");
  const [newRegion, setNewRegion] = useState("");
  const [newDistrict, setNewDistrict] = useState("");
  const [newDistributor, setNewDistributor] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newContact, setNewContact] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [creating, setCreating] = useState(false);
  const [regions, setRegions] = useState<RegionRef[]>([]);
  const [districts, setDistricts] = useState<DistrictRef[]>([]);
  const [distributors, setDistributors] = useState<DistributorRef[]>([]);

  useEffect(() => {
    outletApi
      .getRegions()
      .then((res) => setRegions(res.regions || []))
      .catch((err) => console.error("Failed to load regions:", err));
  }, []);

  const fetchOutlets = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const filter = statusFilter === "ALL" ? undefined : statusFilter;
        const [res, allRes] = await Promise.all([
          outletApi.getOutlets({
            status: filter,
            search: search.trim() || undefined,
          }),
          outletApi.getOutlets(),
        ]);
        setOutlets(res.outlets || []);
        setAllOutlets(allRes.outlets || []);
      } catch (err) {
        console.error("Failed to load outlets:", err);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, statusFilter],
  );

  useEffect(() => {
    fetchOutlets();
  }, [fetchOutlets]);

  const onRefresh = () => {
    fetchOutlets(true);
  };

  const handleOpenDetails = async (outlet: OutletRef) => {
    setSelectedOutlet(outlet);
    setShowDetailModal(true);
    setLoadingAssets(true);
    try {
      const detailResponse = await outletApi.getOutletById(outlet._id);
      setSelectedOutlet(detailResponse.outlet);
    } catch (err) {
      console.error("Failed to load outlet details:", err);
    }

    try {
      const res = await outletApi.getOutletAssets(outlet._id);
      setOutletAssets(res.assets || []);
    } catch {
      setOutletAssets([]);
    } finally {
      setLoadingAssets(false);
    }
  };

  const handleCall = (phone?: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone.replace(/\s+/g, "")}`);
  };

  const handleCreateOutlet = async () => {
    if (
      !newName.trim() ||
      !newCode.trim() ||
      !newType.trim() ||
      !newRegion ||
      !newDistrict ||
      !newAddress.trim() ||
      !newPhone.trim()
    ) {
      Alert.alert(
        "Required Information",
        "Name, code, type, region, district, address and phone are required.",
      );
      return;
    }

    try {
      setCreating(true);
      const outletData = {
        name: newName.trim(),
        code: newCode.trim(),
        type: newType.trim(),
        district: newDistrict,
        distributor: newDistributor || undefined,
        address: newAddress.trim(),
        contactPerson: newContact.trim() || undefined,
        phone: newPhone.trim(),
      };

      if (editingOutlet) {
        await outletApi.updateOutlet(editingOutlet._id, outletData);
      } else {
        await outletApi.createOutlet({ ...outletData, status: "ACTIVE" });
      }

      setShowCreateModal(false);
      setEditingOutlet(null);
      setNewName("");
      setNewCode("");
      setNewType("");
      setNewRegion("");
      setNewDistrict("");
      setNewDistributor("");
      setDistricts([]);
      setDistributors([]);
      setNewAddress("");
      setNewContact("");
      setNewPhone("");
      fetchOutlets();
    } catch (err: any) {
      Alert.alert("Error", err?.message || "Failed to create outlet.");
    } finally {
      setCreating(false);
    }
  };

  const handleEditOutlet = async () => {
    if (!selectedOutlet) return;

    setEditingOutlet(selectedOutlet);
    setNewName(selectedOutlet.name || "");
    setNewCode(selectedOutlet.outletCode || selectedOutlet.code || "");
    setNewType(selectedOutlet.type || "");
    setNewAddress(selectedOutlet.address || "");
    setNewContact(selectedOutlet.contactPerson || "");
    setNewPhone(selectedOutlet.phone || "");

    const districtId =
      typeof selectedOutlet.district === "object"
        ? selectedOutlet.district?._id || ""
        : selectedOutlet.district || "";
    const regionValue =
      typeof selectedOutlet.district === "object"
        ? selectedOutlet.district.region
        : undefined;
    const regionId =
      typeof regionValue === "object"
        ? regionValue?._id || ""
        : regionValue || "";
    const distributorId =
      typeof selectedOutlet.distributor === "object"
        ? selectedOutlet.distributor?._id || ""
        : selectedOutlet.distributor || "";

    setNewRegion(regionId);
    setNewDistrict(districtId);
    setNewDistributor(distributorId);

    if (regionId) {
      const districtResponse = await outletApi.getDistricts(regionId);
      setDistricts(districtResponse.districts || []);
    }
    if (districtId) {
      const distributorResponse = await outletApi.getDistributors(districtId);
      setDistributors(distributorResponse.distributors || []);
    }
    setShowDetailModal(false);
    setShowCreateModal(true);
  };

  const handleRegionChange = async (regionId: string) => {
    setNewRegion(regionId);
    setNewDistrict("");
    setNewDistributor("");
    setDistributors([]);
    if (!regionId) {
      setDistricts([]);
      return;
    }
    const response = await outletApi.getDistricts(regionId);
    setDistricts(response.districts || []);
  };

  const handleDistrictChange = async (districtId: string) => {
    setNewDistrict(districtId);
    setNewDistributor("");
    if (!districtId) {
      setDistributors([]);
      return;
    }
    const response = await outletApi.getDistributors(districtId);
    setDistributors(response.distributors || []);
  };

  const getSuggestedOutletCode = () => {
    if (!newDistrict) {
      return "Select a district first";
    }

    const selectedDistrict = districts.find((item) => item._id === newDistrict);

    if (!selectedDistrict) {
      return "Select a district first";
    }

    const districtCode = (
      selectedDistrict.code ||
      selectedDistrict.name ||
      "DHK"
    )
      .toString()
      .trim()
      .toUpperCase()
      .replace(/\s+/g, "-");
    const escapeRegExp = (value: string) =>
      value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const codePattern = new RegExp(
      `^OUT-${escapeRegExp(districtCode)}-(\\d+)$`,
    );

    const highestSequence = allOutlets.reduce((highest, item) => {
      if (editingOutlet && item._id === editingOutlet._id) {
        return highest;
      }

      const match = item.code?.trim().toUpperCase().match(codePattern);
      const sequence = match ? Number(match[1]) : 0;
      return Math.max(highest, sequence);
    }, 0);

    return `OUT-${districtCode}-${String(highestSequence + 1).padStart(3, "0")}`;
  };

  const renderOutletCard = ({ item }: { item: OutletRef }) => {
    const isActive = item.status !== "INACTIVE";
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleOpenDetails(item)}
        activeOpacity={0.92}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${item.name}`}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <TouchableOpacity
              onPress={() => handleOpenDetails(item)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel={`View details for ${item.name}`}
            >
              <Text style={styles.storeName}>{item.name}</Text>
            </TouchableOpacity>
            {item.outletCode || item.code ? (
              <View style={styles.codeBadge}>
                <Text style={styles.codeText}>
                  {item.outletCode || item.code}
                </Text>
              </View>
            ) : null}
          </View>
          <View
            style={[
              styles.statusDotBadge,
              {
                backgroundColor: isActive
                  ? Colors.light.primaryLight
                  : "#FDECEC",
              },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: isActive
                    ? Colors.light.primary
                    : Colors.light.danger,
                },
              ]}
            />
            <Text
              style={[
                styles.statusDotText,
                {
                  color: isActive
                    ? Colors.light.primaryDark
                    : Colors.light.danger,
                },
              ]}
            >
              {isActive ? "ACTIVE" : "INACTIVE"}
            </Text>
          </View>
        </View>

        {item.address ? (
          <View style={styles.infoRow}>
            <Ionicons
              name="location-outline"
              size={15}
              color={Colors.light.textMuted}
            />
            <Text style={styles.infoText} numberOfLines={1}>
              {item.address}
            </Text>
          </View>
        ) : null}

        {item.contactPerson || item.phone ? (
          <View style={styles.infoRow}>
            <Ionicons
              name="person-outline"
              size={15}
              color={Colors.light.textMuted}
            />
            <Text style={styles.infoText}>
              {item.contactPerson || "Contact"}{" "}
              {item.phone ? `• ${item.phone}` : ""}
            </Text>
          </View>
        ) : null}

        {/* ACTIONS */}
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionPill}
            onPress={() => handleOpenDetails(item)}
          >
            <Ionicons
              name="cube-outline"
              size={16}
              color={Colors.light.primary}
            />
            <Text style={styles.actionPillText}>View Freezers</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionPill, styles.actionPillPrimary]}
            onPress={() =>
              router.push({
                pathname: "/check-in" as any,
                params: { outletId: item._id },
              })
            }
          >
            <Ionicons name="location" size={16} color={Colors.light.white} />
            <Text style={styles.actionPillTextWhite}>Check-In Here</Text>
          </TouchableOpacity>

          {item.phone ? (
            <TouchableOpacity
              style={styles.actionIconBtn}
              onPress={() => handleCall(item.phone)}
            >
              <Ionicons
                name="call-outline"
                size={16}
                color={Colors.light.info}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>DIRECTORY</Text>
          <Text style={styles.title}>Outlets & Stores</Text>
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => {
            setEditingOutlet(null);
            setNewName("");
            setNewCode("");
            setNewType("");
            setNewRegion("");
            setNewDistrict("");
            setNewDistributor("");
            setDistricts([]);
            setDistributors([]);
            setNewAddress("");
            setNewContact("");
            setNewPhone("");
            setShowCreateModal(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={Colors.light.white} />
          <Text style={styles.addBtnText}>Add Store</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color={Colors.light.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by store name, code, or phone..."
            placeholderTextColor={Colors.light.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch("")} hitSlop={8}>
              <Ionicons
                name="close-circle"
                size={18}
                color={Colors.light.textMuted}
              />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* STATUS TABS */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map((tab) => {
          const isSelected = statusFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.filterChip, isSelected && styles.filterChipActive]}
              onPress={() => setStatusFilter(tab.key)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isSelected && styles.filterChipTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* OUTLETS LIST */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.light.primary} />
          <Text style={styles.loadingText}>Fetching outlets...</Text>
        </View>
      ) : (
        <FlatList
          data={outlets}
          keyExtractor={(item) => item._id}
          renderItem={renderOutletCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.light.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons
                name="storefront-outline"
                size={48}
                color={Colors.light.textMuted}
              />
              <Text style={styles.emptyTitle}>No stores found</Text>
              <Text style={styles.emptySubtitle}>
                Try adjusting your search query or status filter.
              </Text>
            </View>
          }
        />
      )}

      {/* VIEW FREEZERS MODAL */}
      <Modal
        visible={showDetailModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <SafeAreaView style={styles.modalArea}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowDetailModal(false)}
              hitSlop={10}
            >
              <Ionicons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle} numberOfLines={1}>
              {selectedOutlet?.name || "Store Details"}
            </Text>
            {canEditOutlets && selectedOutlet ? (
              <TouchableOpacity
                onPress={handleEditOutlet}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Edit outlet information"
              >
                <Ionicons
                  name="create-outline"
                  size={22}
                  color={Colors.light.primary}
                />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 24 }} />
            )}
          </View>

          <View style={styles.modalStoreHeader}>
            <View style={styles.modalStoreTitleRow}>
              <Text style={styles.modalStoreCode}>
                {selectedOutlet?.outletCode || selectedOutlet?.code || "—"}
              </Text>
              <View
                style={[
                  styles.modalStatusBadge,
                  {
                    backgroundColor:
                      selectedOutlet?.status === "INACTIVE"
                        ? "#FDECEC"
                        : Colors.light.primaryLight,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modalStatusText,
                    {
                      color:
                        selectedOutlet?.status === "INACTIVE"
                          ? Colors.light.danger
                          : Colors.light.primaryDark,
                    },
                  ]}
                >
                  {selectedOutlet?.status || "—"}
                </Text>
              </View>
            </View>

            <View style={styles.outletDetailsGrid}>
              <OutletDetail label="Outlet Type" value={selectedOutlet?.type} />
              <OutletDetail label="Address" value={selectedOutlet?.address} />
              <OutletDetail
                label="Region"
                value={
                  typeof selectedOutlet?.district === "object"
                    ? selectedOutlet.district?.region?.name
                    : undefined
                }
              />
              <OutletDetail
                label="District"
                value={
                  typeof selectedOutlet?.district === "object"
                    ? selectedOutlet.district?.name
                    : undefined
                }
              />
              <OutletDetail
                label="Distributor"
                value={
                  typeof selectedOutlet?.distributor === "object"
                    ? selectedOutlet.distributor?.name
                    : undefined
                }
                fallback="No Distributor"
              />
              <OutletDetail
                label="Contact Person"
                value={selectedOutlet?.contactPerson}
              />
              <OutletDetail label="Phone" value={selectedOutlet?.phone} />
            </View>
          </View>

          <View style={styles.modalSectionHeader}>
            <Text style={styles.modalSectionTitle}>
              Deployed Freezers ({outletAssets.length})
            </Text>
            <TouchableOpacity
              style={styles.addExistingAssetButton}
              onPress={() => {
                if (!selectedOutlet?._id) return;
                setShowDetailModal(false);
                router.push({
                  pathname: "/add-existing-asset",
                  params: { outletId: selectedOutlet._id },
                } as any);
              }}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel="Add existing asset to this outlet"
            >
              <Ionicons name="add" size={16} color={Colors.light.white} />
              <Text style={styles.addExistingAssetText}>
                Add Existing Asset
              </Text>
            </TouchableOpacity>
          </View>

          {loadingAssets ? (
            <ActivityIndicator
              color={Colors.light.primary}
              style={{ marginTop: 20 }}
            />
          ) : outletAssets.length === 0 ? (
            <View style={styles.emptyModalBox}>
              <Ionicons
                name="cube-outline"
                size={36}
                color={Colors.light.textMuted}
              />
              <Text style={styles.emptyModalText}>
                No freezers currently assigned to this store.
              </Text>
            </View>
          ) : (
            <FlatList
              data={outletAssets}
              keyExtractor={(a) => a._id}
              contentContainerStyle={{ padding: Spacing.xl, gap: Spacing.sm }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.freezerCard}
                  onPress={() => {
                    setShowDetailModal(false);
                    router.push({
                      pathname: "/asset/[id]",
                      params: { id: item._id },
                    } as any);
                  }}
                >
                  <View style={styles.freezerLeft}>
                    <Ionicons
                      name="cube"
                      size={20}
                      color={Colors.light.primary}
                    />
                    <View>
                      <Text style={styles.freezerAin}>{item.ain}</Text>
                      <Text style={styles.freezerSub}>
                        {item.capacity ? `${item.capacity}L • ` : ""}SN:{" "}
                        {item.serialNumber}
                      </Text>
                    </View>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={Colors.light.textMuted}
                  />
                </TouchableOpacity>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* CREATE OUTLET MODAL */}
      <Modal
        visible={showCreateModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <SafeAreaView style={styles.modalArea}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setShowCreateModal(false)}
              hitSlop={10}
            >
              <Ionicons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingOutlet ? "Edit Outlet Information" : "Add New Store"}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            contentContainerStyle={{ padding: Spacing.xl }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View>
              <OptionField
                label="REGION *"
                value={newRegion}
                placeholder="Select region"
                options={regions.filter((item) => item.status === "ACTIVE")}
                onSelect={handleRegionChange}
                searchable={false}
              />

              <OptionField
                label="DISTRICT *"
                value={newDistrict}
                placeholder={
                  newRegion ? "Select district" : "Select region first"
                }
                options={districts.filter((item) => item.status === "ACTIVE")}
                onSelect={handleDistrictChange}
                disabled={!newRegion}
                searchable={false}
              />

              <OptionField
                label="DISTRIBUTOR (OPTIONAL)"
                value={newDistributor}
                placeholder={
                  newDistrict ? "Select distributor" : "Select district first"
                }
                options={distributors.filter(
                  (item) => item.status === "ACTIVE",
                )}
                onSelect={setNewDistributor}
                disabled={!newDistrict}
                allowClear
                searchable={false}
              />

              <Text style={styles.inputLabel}>OUTLET NAME *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter outlet name"
                value={newName}
                onChangeText={setNewName}
              />

              <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>
                OUTLET CODE *
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter outlet code"
                value={newCode}
                onChangeText={setNewCode}
                autoCapitalize="characters"
              />
              <Text style={styles.outletCodeHint}>
                Suggested: {getSuggestedOutletCode()}
              </Text>

              <OptionField
                label="OUTLET TYPE *"
                value={newType}
                placeholder="Select Outlet Type"
                options={OUTLET_TYPES}
                onSelect={setNewType}
              />

              <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>
                STORE ADDRESS *
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Street, market, area..."
                value={newAddress}
                onChangeText={setNewAddress}
              />

              <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>
                CONTACT PERSON
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Store manager or owner name"
                value={newContact}
                onChangeText={setNewContact}
              />

              <Text style={[styles.inputLabel, { marginTop: Spacing.md }]}>
                PHONE NUMBER
              </Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 01712345678"
                value={newPhone}
                onChangeText={setNewPhone}
                keyboardType="phone-pad"
              />

              <TouchableOpacity
                style={[styles.modalSubmitBtn, creating && styles.btnDisabled]}
                onPress={handleCreateOutlet}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color={Colors.light.white} />
                ) : (
                  <Text style={styles.modalSubmitText}>
                    {editingOutlet ? "Save Changes" : "Create Store"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function OutletDetail({
  label,
  value,
  fallback = "N/A",
}: {
  label: string;
  value?: string;
  fallback?: string;
}) {
  return (
    <View style={styles.outletDetailItem}>
      <Text style={styles.outletDetailLabel}>{label}</Text>
      <Text style={styles.outletDetailValue}>{value || fallback}</Text>
    </View>
  );
}

function OptionField({
  label,
  value,
  placeholder,
  options,
  onSelect,
  disabled = false,
  allowClear = false,
  searchable = true,
}: {
  label: string;
  value: string;
  placeholder: string;
  options: { _id: string; name: string; code?: string }[];
  onSelect: (value: string) => void;
  disabled?: boolean;
  allowClear?: boolean;
  searchable?: boolean;
}) {
  const [visible, setVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const selectedOption = options.find((option) => option._id === value);
  const displayedValue = visible ? searchQuery : selectedOption?.name || "";
  const filteredOptions = options.filter((option) =>
    option.name.toLowerCase().includes(searchQuery.trim().toLowerCase()),
  );

  const closePicker = () => {
    setVisible(false);
    setSearchQuery("");
  };

  const openPicker = () => {
    setSearchQuery("");
    setVisible(true);
  };

  return (
    <View style={styles.optionField}>
      <Text style={styles.inputLabel}>{label}</Text>
      {searchable ? (
        <View
          style={[
            styles.optionControl,
            visible && styles.optionControlActive,
            disabled && styles.optionButtonDisabled,
          ]}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={
              disabled ? Colors.light.textMuted : Colors.light.textSecondary
            }
          />
          <TextInput
            style={styles.optionControlInput}
            placeholder={placeholder}
            placeholderTextColor={Colors.light.textMuted}
            value={displayedValue}
            onFocus={openPicker}
            onChangeText={(text) => {
              setSearchQuery(text);
              setVisible(true);
            }}
            editable={!disabled}
            autoCapitalize="words"
            accessibilityLabel={label}
          />
          <Ionicons
            name={visible ? "chevron-up" : "chevron-down"}
            size={18}
            color={
              disabled ? Colors.light.textMuted : Colors.light.textSecondary
            }
          />
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.optionControl,
            visible && styles.optionControlActive,
            disabled && styles.optionButtonDisabled,
          ]}
          onPress={openPicker}
          disabled={disabled}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={label}
        >
          <Text
            style={[
              styles.optionSelectText,
              !selectedOption && styles.optionPlaceholder,
            ]}
          >
            {selectedOption?.name || placeholder}
          </Text>
          <Ionicons
            name={visible ? "chevron-up" : "chevron-down"}
            size={18}
            color={
              disabled ? Colors.light.textMuted : Colors.light.textSecondary
            }
          />
        </TouchableOpacity>
      )}

      {visible ? (
        <View style={styles.inlineOptionDropdown}>
          <Text style={styles.optionDropdownTitle}>
            Choose {label.replace(" *", "").toLowerCase()}
          </Text>
          <ScrollView
            style={styles.inlineOptionList}
            contentContainerStyle={styles.inlineOptionListContent}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {allowClear ? (
              <TouchableOpacity
                style={styles.optionItem}
                onPress={() => {
                  onSelect("");
                  closePicker();
                }}
              >
                <Text style={styles.optionItemText}>No Distributor</Text>
                {!value ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={Colors.light.primary}
                  />
                ) : null}
              </TouchableOpacity>
            ) : null}
            {filteredOptions.slice(0, 20).map((option) => (
              <TouchableOpacity
                key={option._id}
                style={[
                  styles.optionItem,
                  option._id === value && styles.optionItemActive,
                ]}
                onPress={() => {
                  onSelect(option._id);
                  closePicker();
                }}
              >
                <View style={styles.optionItemContent}>
                  <Text style={styles.optionItemText}>{option.name}</Text>
                  {"code" in option && option.code ? (
                    <Text style={styles.optionItemCode}>{option.code}</Text>
                  ) : null}
                </View>
                {option._id === value ? (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={Colors.light.primary}
                  />
                ) : null}
              </TouchableOpacity>
            ))}
            {filteredOptions.length === 0 ? (
              <Text style={styles.optionEmptyText}>No options available.</Text>
            ) : null}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
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
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.pill,
    gap: 4,
  },
  addBtnText: {
    color: Colors.light.white,
    fontSize: Typography.size.sm,
    fontWeight: "700",
  },
  searchContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    backgroundColor: Colors.light.surface,
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surfaceSecondary,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: Colors.light.border,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: Colors.light.text,
    fontWeight: "600",
  },
  filterRow: {
    flexDirection: "row",
    backgroundColor: Colors.light.surface,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  filterChipActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  filterChipText: {
    fontSize: Typography.size.xs,
    fontWeight: "600",
    color: Colors.light.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.light.white,
    fontWeight: "700",
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  cardHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  storeName: {
    fontSize: Typography.size.md,
    fontWeight: "700",
    color: Colors.light.text,
  },
  codeBadge: {
    backgroundColor: Colors.light.surfaceSecondary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  codeText: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.light.textSecondary,
  },
  statusDotBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.pill,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  infoText: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    flex: 1,
  },
  cardActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.light.surfaceSecondary,
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: Colors.light.surfaceSecondary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  actionPillPrimary: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  actionPillText: {
    fontSize: Typography.size.xs,
    fontWeight: "700",
    color: Colors.light.primaryDark,
  },
  actionPillTextWhite: {
    fontSize: Typography.size.xs,
    fontWeight: "700",
    color: Colors.light.white,
  },
  actionIconBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    backgroundColor: "#EAF3FF",
    justifyContent: "center",
    alignItems: "center",
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
    maxWidth: 240,
  },
  modalStoreHeader: {
    padding: Spacing.xl,
    backgroundColor: Colors.light.surfaceSecondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalStoreTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  modalStoreCode: {
    fontSize: Typography.size.sm,
    fontWeight: "700",
    color: Colors.light.primary,
  },
  modalStatusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  modalStatusText: {
    fontSize: 10,
    fontWeight: "800",
  },
  outletDetailsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  outletDetailItem: {
    width: "46%",
    gap: 3,
  },
  outletDetailLabel: {
    fontSize: 10,
    color: Colors.light.textMuted,
    fontWeight: "600",
  },
  outletDetailValue: {
    fontSize: Typography.size.xs,
    color: Colors.light.text,
    fontWeight: "700",
  },
  modalSectionHeader: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  modalSectionTitle: {
    flex: 1,
    fontSize: Typography.size.sm,
    fontWeight: "700",
    color: Colors.light.text,
  },
  addExistingAssetButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 7,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
  },
  addExistingAssetText: {
    color: Colors.light.white,
    fontSize: Typography.size.xs,
    fontWeight: "700",
  },
  emptyModalBox: {
    padding: Spacing.xxl,
    alignItems: "center",
    gap: Spacing.xs,
  },
  emptyModalText: {
    fontSize: Typography.size.xs,
    color: Colors.light.textMuted,
    textAlign: "center",
  },
  freezerCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.surface,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  freezerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  freezerAin: {
    fontSize: Typography.size.sm,
    fontWeight: "700",
    color: Colors.light.text,
  },
  freezerSub: {
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: Colors.light.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  modalInput: {
    backgroundColor: Colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: 48,
    fontSize: Typography.size.sm,
    color: Colors.light.text,
  },
  optionField: {
    marginTop: Spacing.md,
  },
  optionButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  optionButtonDisabled: {
    opacity: 0.6,
  },
  optionControl: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    backgroundColor: Colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  optionControlActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.surface,
    shadowColor: Colors.light.primary,
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  optionControlInput: {
    flex: 1,
    minHeight: 46,
    fontSize: Typography.size.sm,
    color: Colors.light.text,
  },
  optionSelectText: {
    flex: 1,
    fontSize: Typography.size.sm,
    color: Colors.light.text,
  },
  optionPlaceholder: {
    color: Colors.light.textMuted,
  },
  inlineOptionDropdown: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.lg,
    backgroundColor: Colors.light.surface,
    shadowColor: "#17211B",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  optionDropdownTitle: {
    paddingHorizontal: Spacing.sm,
    paddingTop: 2,
    color: Colors.light.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  inlineOptionList: {
    maxHeight: 336,
    marginTop: Spacing.xs,
  },
  inlineOptionListContent: {
    gap: Spacing.xs,
    paddingBottom: 2,
  },
  outletCodeHint: {
    marginTop: 5,
    fontSize: Typography.size.xs,
    color: Colors.light.textSecondary,
  },
  optionList: {
    padding: Spacing.xl,
    gap: Spacing.sm,
  },
  optionItem: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surfaceSecondary,
  },
  optionItemActive: {
    borderColor: Colors.light.primary,
    backgroundColor: Colors.light.primaryLight,
  },
  optionItemContent: {
    flex: 1,
    gap: 2,
  },
  optionItemText: {
    fontSize: Typography.size.sm,
    color: Colors.light.text,
    fontWeight: "600",
  },
  optionItemCode: {
    fontSize: 10,
    color: Colors.light.textMuted,
    fontWeight: "600",
  },
  optionEmptyText: {
    padding: Spacing.xl,
    textAlign: "center",
    color: Colors.light.textMuted,
    fontSize: Typography.size.sm,
  },
  modalSubmitBtn: {
    backgroundColor: Colors.light.primary,
    height: 50,
    borderRadius: Radius.lg,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.xl,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  modalSubmitText: {
    color: Colors.light.white,
    fontSize: Typography.size.md,
    fontWeight: "700",
  },
});
