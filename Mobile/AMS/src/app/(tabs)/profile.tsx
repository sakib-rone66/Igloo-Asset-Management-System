// src/app/(tabs)/profile.tsx

import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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

import {
  Colors,
  Layout,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from "../../constants/theme";

import { useAuth } from "../../context/AuthContext";
import { authApi, getApiBaseUrl, userApi } from "../../services/api";

export default function ProfileScreen() {
  const { user, logout, refreshProfile } = useAuth();

  const [showEditModal, setShowEditModal] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const initial = user?.name?.trim().charAt(0).toUpperCase() || "U";

  useEffect(() => {
    if (!user) return;

    setName(user.name || "");
    setEmail(user.email || "");
    setPhone(user.phone || "");
    setAddress(user.address || "");

    if (!user.profilePicture) {
      setProfileImageUrl(null);
      return;
    }

    if (user.profilePicture.startsWith("http")) {
      setProfileImageUrl(user.profilePicture);
      return;
    }

    getApiBaseUrl().then((apiUrl) => {
      setProfileImageUrl(
        `${apiUrl.replace(/\/api\/?$/, "")}${user.profilePicture}`,
      );
    });
  }, [user]);

  const openEditModal = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setAddress(user?.address || "");
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    if (!name.trim() || !email.trim() || !email.includes("@")) {
      Alert.alert("Invalid details", "Enter a valid name and email address.");
      return;
    }

    try {
      setSaving(true);
      await userApi.updateMyProfile({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim(),
      });
      await refreshProfile();
      setShowEditModal(false);
      Alert.alert("Profile updated", "Your profile details have been saved.");
    } catch (error: any) {
      Alert.alert(
        "Unable to update profile",
        error?.data?.message || error?.message || "Please try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChooseProfilePicture = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Photo permission required",
        "Allow photo access to choose a profile picture.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets[0]?.uri) return;

    try {
      setUploading(true);
      await userApi.uploadMyProfilePicture(result.assets[0].uri);
      await refreshProfile();
      Alert.alert("Photo updated", "Your profile picture has been updated.");
    } catch (error: any) {
      Alert.alert(
        "Unable to upload photo",
        error?.data?.message || error?.message || "Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Missing details", "Complete all password fields.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert(
        "Password too short",
        "Your new password must be at least 6 characters.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert(
        "Passwords do not match",
        "Confirm your new password correctly.",
      );
      return;
    }

    try {
      setChangingPassword(true);
      await authApi.changePassword(
        currentPassword,
        newPassword,
        confirmPassword,
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordModal(false);
      Alert.alert(
        "Password changed",
        "Your password was updated successfully.",
      );
    } catch (error: any) {
      Alert.alert(
        "Unable to change password",
        error?.data?.message || error?.message || "Please try again.",
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign out",
        style: "destructive",
        onPress: async () => {
          await logout();

          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER */}

        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>ACCOUNT</Text>

            <Text style={styles.title}>Profile</Text>
          </View>
        </View>

        {/* PROFILE CARD */}

        <View style={styles.profileCard}>
          <TouchableOpacity
            style={styles.avatar}
            onPress={handleChooseProfilePicture}
            activeOpacity={0.8}
            disabled={uploading}
          >
            {profileImageUrl ? (
              <Image
                source={{ uri: profileImageUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
            <View style={styles.avatarCamera}>
              {uploading ? (
                <ActivityIndicator size="small" color={Colors.light.white} />
              ) : (
                <Ionicons name="camera" size={13} color={Colors.light.white} />
              )}
            </View>
          </TouchableOpacity>

          <Text style={styles.name}>{user?.name || "User"}</Text>

          <Text style={styles.email}>{user?.email || ""}</Text>

          <View style={styles.roleBadge}>
            <Ionicons
              name="shield-checkmark-outline"
              size={16}
              color={Colors.light.primary}
            />

            <Text style={styles.roleText}>{user?.role || "USER"}</Text>
          </View>

          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />

            <Text style={styles.statusText}>{user?.status || "ACTIVE"}</Text>
          </View>
        </View>

        {/* ACCOUNT INFORMATION */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account information</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={openEditModal}
            activeOpacity={0.8}
          >
            <Ionicons
              name="create-outline"
              size={17}
              color={Colors.light.white}
            />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="person-outline"
                size={19}
                color={Colors.light.primary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Full name</Text>

              <Text style={styles.infoValue}>{user?.name || "—"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="mail-outline"
                size={19}
                color={Colors.light.primary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email address</Text>

              <Text style={styles.infoValue}>{user?.email || "—"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="call-outline"
                size={19}
                color={Colors.light.primary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Phone</Text>

              <Text style={styles.infoValue}>{user?.phone || "—"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="location-outline"
                size={19}
                color={Colors.light.primary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Address</Text>

              <Text style={styles.infoValue}>{user?.address || "—"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="shield-outline"
                size={19}
                color={Colors.light.primary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Role</Text>

              <Text style={styles.infoValue}>{user?.role || "—"}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="checkmark-circle-outline"
                size={19}
                color={Colors.light.primary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Account status</Text>

              <Text style={styles.infoValue}>{user?.status || "—"}</Text>
            </View>
          </View>
        </View>

        {/* SETTINGS */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Account settings</Text>
        </View>

        <TouchableOpacity
          style={styles.settingCard}
          activeOpacity={0.8}
          onPress={() => setShowPasswordModal(true)}
        >
          <View
            style={[
              styles.settingIcon,
              {
                backgroundColor: Colors.light.primaryLight,
              },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={21}
              color={Colors.light.primary}
            />
          </View>

          <View style={styles.settingContent}>
            <Text style={styles.settingTitle}>Change password</Text>

            <Text style={styles.settingText}>Update your account password</Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.light.textMuted}
          />
        </TouchableOpacity>

        {/* LOGOUT */}

        <TouchableOpacity
          style={styles.logoutCard}
          activeOpacity={0.8}
          onPress={handleLogout}
        >
          <View style={styles.logoutIcon}>
            <Ionicons
              name="log-out-outline"
              size={21}
              color={Colors.light.danger}
            />
          </View>

          <View style={styles.logoutContent}>
            <Text style={styles.logoutTitle}>Sign out</Text>

            <Text style={styles.logoutText}>Sign out from this device</Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.light.danger}
          />
        </TouchableOpacity>

        {/* FOOTER */}

        <View style={styles.footer}>
          <Text style={styles.footerBrand}>IGLOO</Text>

          <Text style={styles.footerText}>Asset Management System</Text>

          <Text style={styles.version}>Version 1.0.0</Text>
        </View>
      </ScrollView>

      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.editModal}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit profile</Text>
                <Text style={styles.modalSubtitle}>
                  Update your account details
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowEditModal(false)}
                hitSlop={10}
              >
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.editLabel}>FULL NAME</Text>
              <TextInput
                style={styles.editInput}
                value={name}
                onChangeText={setName}
                placeholder="Your full name"
                placeholderTextColor={Colors.light.textMuted}
              />
              <Text style={styles.editLabel}>EMAIL ADDRESS</Text>
              <TextInput
                style={styles.editInput}
                value={email}
                onChangeText={setEmail}
                placeholder="name@example.com"
                placeholderTextColor={Colors.light.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Text style={styles.editLabel}>PHONE</Text>
              <TextInput
                style={styles.editInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="Phone number"
                placeholderTextColor={Colors.light.textMuted}
                keyboardType="phone-pad"
              />
              <Text style={styles.editLabel}>ADDRESS</Text>
              <TextInput
                style={[styles.editInput, styles.addressInput]}
                value={address}
                onChangeText={setAddress}
                placeholder="Address"
                placeholderTextColor={Colors.light.textMuted}
                multiline
              />
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowEditModal(false)}
                  disabled={saving}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, saving && styles.disabledButton]}
                  onPress={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator color={Colors.light.white} />
                  ) : (
                    <Text style={styles.saveButtonText}>Save changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showPasswordModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.editModal}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Change password</Text>
                <Text style={styles.modalSubtitle}>
                  Keep your account secure
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowPasswordModal(false)}
                hitSlop={10}
              >
                <Ionicons name="close" size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView keyboardShouldPersistTaps="handled">
              <Text style={styles.editLabel}>CURRENT PASSWORD</Text>
              <View style={styles.passwordInputRow}>
                <TextInput
                  style={styles.passwordInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Enter current password"
                  placeholderTextColor={Colors.light.textMuted}
                  secureTextEntry={!showCurrentPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowCurrentPassword((visible) => !visible)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={
                      showCurrentPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={20}
                    color={Colors.light.textMuted}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.editLabel}>NEW PASSWORD</Text>
              <View style={styles.passwordInputRow}>
                <TextInput
                  style={styles.passwordInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="At least 6 characters"
                  placeholderTextColor={Colors.light.textMuted}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={() => setShowNewPassword((visible) => !visible)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={Colors.light.textMuted}
                  />
                </TouchableOpacity>
              </View>

              <Text style={styles.editLabel}>CONFIRM NEW PASSWORD</Text>
              <View style={styles.passwordInputRow}>
                <TextInput
                  style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Repeat new password"
                  placeholderTextColor={Colors.light.textMuted}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleChangePassword}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword((visible) => !visible)}
                  hitSlop={8}
                >
                  <Ionicons
                    name={
                      showConfirmPassword ? "eye-off-outline" : "eye-outline"
                    }
                    size={20}
                    color={Colors.light.textMuted}
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowPasswordModal(false)}
                  disabled={changingPassword}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.saveButton,
                    changingPassword && styles.disabledButton,
                  ]}
                  onPress={handleChangePassword}
                  disabled={changingPassword}
                >
                  {changingPassword ? (
                    <ActivityIndicator color={Colors.light.white} />
                  ) : (
                    <Text style={styles.saveButtonText}>Update password</Text>
                  )}
                </TouchableOpacity>
              </View>
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

  container: {
    flex: 1,
  },

  content: {
    paddingHorizontal: Layout.screenPadding,
    paddingBottom: Spacing.massive,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.light.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 9,
  },

  editButtonText: {
    color: Colors.light.white,
    fontSize: Typography.size.sm,
    fontWeight: "700",
  },

  eyebrow: {
    color: Colors.light.primary,
    fontSize: Typography.size.xs,
    fontWeight: "800",
    letterSpacing: 1.4,
  },

  title: {
    color: Colors.light.text,
    fontSize: Typography.size.xxxl,
    fontWeight: "800",
    marginTop: 3,
  },

  profileCard: {
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    ...Shadows.card,
  },

  avatar: {
    width: 82,
    height: 82,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
    overflow: "visible",
  },

  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: Radius.pill,
  },

  avatarCamera: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 27,
    height: 27,
    borderRadius: Radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.light.primaryDark,
    borderWidth: 2,
    borderColor: Colors.light.surface,
  },

  avatarText: {
    color: Colors.light.white,
    fontSize: Typography.size.xxxl,
    fontWeight: "800",
  },

  name: {
    color: Colors.light.text,
    fontSize: Typography.size.xl,
    fontWeight: "800",
  },

  email: {
    color: Colors.light.textSecondary,
    fontSize: Typography.size.sm,
    marginTop: 4,
  },

  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.primaryLight,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    marginTop: Spacing.lg,
  },

  roleText: {
    color: Colors.light.primary,
    fontSize: Typography.size.xs,
    fontWeight: "800",
    marginLeft: 5,
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 7,
    backgroundColor: Colors.light.success,
    marginRight: 5,
  },

  statusText: {
    color: Colors.light.success,
    fontSize: Typography.size.xs,
    fontWeight: "700",
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.xxxl,
    marginBottom: Spacing.md,
  },

  sectionTitle: {
    color: Colors.light.text,
    fontSize: Typography.size.lg,
    fontWeight: "800",
  },

  infoCard: {
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    ...Shadows.card,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.sm,
    backgroundColor: Colors.light.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    color: Colors.light.textMuted,
    fontSize: Typography.size.xs,
  },

  infoValue: {
    color: Colors.light.text,
    fontSize: Typography.size.sm,
    fontWeight: "700",
    marginTop: 3,
  },

  divider: {
    height: 1,
    backgroundColor: Colors.light.border,
  },

  settingCard: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.light.surface,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    ...Shadows.card,
  },

  settingIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },

  settingContent: {
    flex: 1,
  },

  settingTitle: {
    color: Colors.light.text,
    fontSize: Typography.size.md,
    fontWeight: "800",
  },

  settingText: {
    color: Colors.light.textSecondary,
    fontSize: Typography.size.xs,
    marginTop: 3,
  },

  logoutCard: {
    minHeight: 78,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FDECEC",
    borderWidth: 1,
    borderColor: "#F4CCCC",
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },

  logoutIcon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },

  logoutContent: {
    flex: 1,
  },

  logoutTitle: {
    color: Colors.light.danger,
    fontSize: Typography.size.md,
    fontWeight: "800",
  },

  logoutText: {
    color: Colors.light.textSecondary,
    fontSize: Typography.size.xs,
    marginTop: 3,
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(12, 24, 18, 0.45)",
  },

  editModal: {
    maxHeight: "88%",
    backgroundColor: Colors.light.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },

  modalTitle: {
    color: Colors.light.text,
    fontSize: Typography.size.xl,
    fontWeight: "800",
  },

  modalSubtitle: {
    color: Colors.light.textSecondary,
    fontSize: Typography.size.sm,
    marginTop: 3,
  },

  editLabel: {
    color: Colors.light.textMuted,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    marginTop: Spacing.md,
    marginBottom: 6,
  },

  editInput: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surfaceSecondary,
    color: Colors.light.text,
    fontSize: Typography.size.sm,
    paddingHorizontal: Spacing.md,
  },

  passwordInputRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.surfaceSecondary,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.md,
  },

  passwordInput: {
    flex: 1,
    color: Colors.light.text,
    fontSize: Typography.size.sm,
    paddingVertical: 0,
  },

  addressInput: {
    minHeight: 78,
    paddingTop: Spacing.md,
    textAlignVertical: "top",
  },

  modalActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    paddingBottom: Spacing.sm,
  },

  cancelButton: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },

  cancelButtonText: {
    color: Colors.light.textSecondary,
    fontSize: Typography.size.sm,
    fontWeight: "700",
  },

  saveButton: {
    flex: 1.4,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: Radius.md,
    backgroundColor: Colors.light.primary,
  },

  saveButtonText: {
    color: Colors.light.white,
    fontSize: Typography.size.sm,
    fontWeight: "700",
  },

  disabledButton: {
    opacity: 0.6,
  },

  footer: {
    alignItems: "center",
    paddingTop: Spacing.xxxl,
  },

  footerBrand: {
    color: Colors.light.primaryDark,
    fontSize: Typography.size.md,
    fontWeight: "800",
    letterSpacing: 2,
  },

  footerText: {
    color: Colors.light.textMuted,
    fontSize: Typography.size.xs,
    marginTop: 4,
  },

  version: {
    color: Colors.light.textMuted,
    fontSize: 10,
    marginTop: 3,
  },
});
