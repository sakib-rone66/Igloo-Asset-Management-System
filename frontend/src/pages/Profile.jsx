import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import AppPageLayout from "../components/AppPageLayout";
import api from "../services/api";

import "./Profile.css";

function Profile() {
  const fileInputRef = useRef(null);
  const { userId } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("user") || "null");
  const isViewingOtherUser = Boolean(userId);
  const isOwnUserProfile =
    isViewingOtherUser &&
    String(currentUser?._id || currentUser?.id) === String(userId);
  const canEditOtherUser =
    isViewingOtherUser &&
    (currentUser?.role === "SYSTEM_ADMIN" ||
      currentUser?.permissions?.users?.update === true);
  const isEditableProfile =
    !isViewingOtherUser || isOwnUserProfile || canEditOtherUser;

  const formatProfileDate = (value) => {
    if (!value) {
      return "Not available";
    }

    return new Date(value).toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    profilePicture: "",
    role: "",
    status: "",
    createdAt: "",
    updatedAt: "",
  });

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ========================================
  // POPUP NOTIFICATION
  // ========================================

  const [notification, setNotification] = useState({
    type: "",
    message: "",
  });

  // ========================================
  // SHOW NOTIFICATION
  // ========================================

  const showNotification = (type, message) => {
    setNotification({
      type,
      message,
    });

    window.setTimeout(() => {
      setNotification({
        type: "",
        message: "",
      });
    }, 4000);
  };

  // ========================================
  // LOAD PROFILE
  // ========================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const response = await api.get(
          isViewingOtherUser ? `/users/${userId}` : "/users/me",
        );

        const user = response.data.user;

        setProfile(user);

        setForm({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
          address: user.address || "",
        });
      } catch (err) {
        console.error("Load Profile Error:", err.response?.data || err.message);

        showNotification(
          "error",
          err.response?.data?.message ||
            (isViewingOtherUser
              ? "Unable to load this user profile."
              : "Unable to load your profile."),
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [isViewingOtherUser, userId]);

  // ========================================
  // INPUT CHANGE
  // ========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // ========================================
  // SAVE PROFILE
  // ========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isEditableProfile) {
      return;
    }

    try {
      setSaving(true);

      const response = await api.patch(
        isViewingOtherUser && !isOwnUserProfile
          ? `/users/${userId}`
          : "/users/me",
        form,
      );

      const updatedUser = response.data.user;

      setProfile((current) => ({
        ...current,
        ...updatedUser,
      }));

      setForm({
        name: updatedUser.name || "",
        email: updatedUser.email || "",
        phone: updatedUser.phone || "",
        address: updatedUser.address || "",
      });

      // ========================================
      // KEEP NAVBAR / LOCAL STORAGE IN SYNC
      // ========================================

      if (!isViewingOtherUser) {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");

        if (storedUser) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...storedUser,
              ...updatedUser,
              name: updatedUser.name,
              email: updatedUser.email,
              role: updatedUser.role,
              permissions:
                storedUser.permissions || updatedUser.permissions || {},
            }),
          );
        }
      }

      // ========================================
      // SHOW SUCCESS POPUP
      // ========================================

      showNotification(
        "success",
        isViewingOtherUser
          ? "User profile has been updated successfully."
          : "Your profile has been updated successfully.",
      );

      // ========================================
      // SCROLL PAGE TO TOP
      // ========================================

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (err) {
      console.error("Update Profile Error:", err.response?.data || err.message);

      showNotification(
        "error",
        err.response?.data?.message || "Unable to update your profile.",
      );

      // Also bring the user back to the notification
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSaving(false);
    }
  };

  // ========================================
  // PROFILE PICTURE
  // ========================================

  const handleProfilePicture = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // ========================================
    // FRONTEND VALIDATION
    // ========================================

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      showNotification("error", "Please select a JPG, PNG or WEBP image.");

      event.target.value = "";
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showNotification("error", "Profile picture must be smaller than 2 MB.");

      event.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();

      formData.append("profilePicture", file);

      const response = await api.patch("/users/me/profile-picture", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const updatedUser = response.data.user;

      setProfile((current) => ({
        ...current,
        ...updatedUser,
      }));

      // ========================================
      // SHOW SUCCESS POPUP
      // ========================================

      showNotification("success", "Profile picture updated successfully.");

      // ========================================
      // UPDATE LOCAL STORAGE
      // ========================================

      const storedUser = JSON.parse(localStorage.getItem("user") || "null");

      if (storedUser) {
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...storedUser,
            ...updatedUser,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            profilePicture: updatedUser.profilePicture,
            permissions:
              storedUser.permissions || updatedUser.permissions || {},
          }),
        );
      }
    } catch (err) {
      console.error(
        "Profile Picture Upload Error:",
        err.response?.data || err.message,
      );

      showNotification(
        "error",
        err.response?.data?.message || "Unable to upload profile picture.",
      );
    } finally {
      setUploading(false);

      event.target.value = "";
    }
  };

  // ========================================
  // HELPERS
  // ========================================

  const getInitials = () => {
    if (!profile.name) {
      return "U";
    }

    return profile.name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  };

  const getRoleLabel = (role) => {
    if (!role) {
      return "User";
    }

    return role
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  const profileImageUrl = profile.profilePicture
    ? profile.profilePicture.startsWith("http")
      ? profile.profilePicture
      : `${api.defaults.baseURL?.replace("/api", "") || ""}${
          profile.profilePicture.startsWith("/")
            ? profile.profilePicture
            : `/${profile.profilePicture}`
        }`
    : "";

  return (
    <AppPageLayout>
      {/* ========================================
          POPUP NOTIFICATION
          ======================================== */}

      {notification.message && (
        <div
          className={`profile-toast ${
            notification.type === "success"
              ? "profile-toast-success"
              : "profile-toast-error"
          }`}
        >
          <div className="profile-toast-icon">
            {notification.type === "success" ? "✓" : "!"}
          </div>

          <div className="profile-toast-content">
            <strong>
              {notification.type === "success" ? "Success" : "Error"}
            </strong>

            <span>{notification.message}</span>
          </div>

          <button
            type="button"
            className="profile-toast-close"
            onClick={() =>
              setNotification({
                type: "",
                message: "",
              })
            }
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

      <main className="profile-page">
        {/* ========================================
            PAGE HEADER
            ======================================== */}

        <section className="profile-page-header">
          <div>
            <span className="profile-eyebrow">
              {isViewingOtherUser ? "USER PROFILE" : "ACCOUNT SETTINGS"}
            </span>

            <h1>{isViewingOtherUser ? "User Profile" : "My Profile"}</h1>

            <p>
              {isViewingOtherUser
                ? "View the selected user's profile details."
                : "Manage your personal information, profile picture and account preferences."}
            </p>
          </div>

          {!isViewingOtherUser && (
            <Link to="/change-password" className="profile-security-button">
              <span className="profile-security-icon">⌁</span>

              <span>
                <strong>Security</strong>
                <small>Change password</small>
              </span>

              <span className="profile-security-arrow">→</span>
            </Link>
          )}
        </section>

        {/* ========================================
            LOADING
            ======================================== */}

        {loading ? (
          <div className="profile-loading">
            <div className="profile-spinner" />

            <span>Loading your profile...</span>
          </div>
        ) : (
          <div className="profile-layout">
            {/* ========================================
                PROFILE HERO CARD
                ======================================== */}

            <section className="profile-identity-card">
              <div className="profile-identity-glow" />

              <div className="profile-identity-content">
                <div className="profile-avatar-wrapper">
                  {profileImageUrl ? (
                    <img
                      src={profileImageUrl}
                      alt={profile.name}
                      className="profile-avatar-image"
                    />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      {getInitials()}
                    </div>
                  )}

                  {isEditableProfile &&
                    (isOwnUserProfile || !isViewingOtherUser) && (
                      <>
                        <button
                          type="button"
                          className="profile-avatar-edit"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading}
                          aria-label="Change profile picture"
                        >
                          {uploading ? "..." : "✎"}
                        </button>

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          className="profile-file-input"
                          onChange={handleProfilePicture}
                        />
                      </>
                    )}
                </div>

                <div className="profile-identity-info">
                  <span className="profile-account-label">YOUR ACCOUNT</span>

                  <h2>{profile.name || "User"}</h2>

                  <p>{profile.email}</p>

                  <p className="profile-identity-user-id">
                    <span>User ID:</span> {profile._id || profile.id || "N/A"}
                  </p>

                  <div className="profile-identity-meta">
                    <span className="profile-role-badge">
                      {getRoleLabel(profile.role)}
                    </span>

                    <span className="profile-status">
                      <span className="profile-status-dot" />

                      {profile.status || "ACTIVE"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="profile-photo-hint">
                <strong>Profile photo</strong>

                <span>JPG, PNG or WEBP · Maximum 2 MB</span>
              </div>
            </section>

            {/* ========================================
                INFORMATION CARD
                ======================================== */}

            <section className="profile-form-card">
              <div className="profile-card-heading">
                <div className="profile-heading-icon">◈</div>

                <div>
                  <h2>Personal Information</h2>

                  <p>Keep your contact details up to date.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="profile-form-grid">
                  {/* NAME */}

                  <div className="profile-field profile-field-full">
                    <label htmlFor="name">Full name</label>

                    <div className="profile-input-wrapper">
                      <span className="profile-input-icon">♙</span>

                      <input
                        id="name"
                        name="name"
                        type="text"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        autoComplete="name"
                        required
                        disabled={!isEditableProfile || saving}
                      />
                    </div>
                  </div>

                  {/* EMAIL */}

                  <div className="profile-field">
                    <label htmlFor="email">Email address</label>

                    <div
                      className={`profile-input-wrapper ${
                        profile.role !== "SYSTEM_ADMIN"
                          ? "profile-input-disabled"
                          : ""
                      }`}
                    >
                      <span className="profile-input-icon">@</span>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        disabled={
                          !isEditableProfile ||
                          (profile.role !== "SYSTEM_ADMIN" && !isOwnUserProfile)
                        }
                        placeholder="Enter your email address"
                        autoComplete="email"
                      />

                      {profile.role === "SYSTEM_ADMIN" && (
                        <span className="profile-verified">✓</span>
                      )}
                    </div>

                    {profile.role === "SYSTEM_ADMIN" ? (
                      <small className="profile-field-note">
                        As System Admin, you can update your email address.
                      </small>
                    ) : (
                      <small className="profile-field-note">
                        Email address can only be changed by the System Admin.
                      </small>
                    )}
                  </div>

                  {/* PHONE */}

                  <div className="profile-field">
                    <label htmlFor="phone">Phone number</label>

                    <div className="profile-input-wrapper">
                      <span className="profile-input-icon">☎</span>

                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        autoComplete="tel"
                        disabled={!isEditableProfile || saving}
                      />
                    </div>
                  </div>

                  {/* ADDRESS */}

                  <div className="profile-field profile-field-full">
                    <label htmlFor="address">Address</label>

                    <div className="profile-input-wrapper profile-textarea-wrapper">
                      <span className="profile-input-icon profile-textarea-icon">
                        ⌖
                      </span>

                      <textarea
                        id="address"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        placeholder="Enter your address"
                        rows="4"
                        autoComplete="street-address"
                        disabled={!isEditableProfile || saving}
                      />
                    </div>
                  </div>
                </div>

                <div className="profile-account-meta">
                  <div className="profile-account-meta-item">
                    <span>Created</span>
                    <strong>{formatProfileDate(profile.createdAt)}</strong>
                  </div>

                  <div className="profile-account-meta-item">
                    <span>Last updated</span>
                    <strong>{formatProfileDate(profile.updatedAt)}</strong>
                  </div>
                </div>

                {/* ========================================
                    FORM FOOTER
                    ======================================== */}

                {isEditableProfile && (
                  <div className="profile-form-footer">
                    <div className="profile-last-updated">
                      <span>●</span>

                      <span>
                        {isViewingOtherUser
                          ? "This profile is editable by an admin user."
                          : "Your information is securely stored."}
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="profile-save-button"
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="profile-button-spinner" />
                          Saving...
                        </>
                      ) : (
                        <>
                          Save changes
                          <span>→</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </form>
            </section>
          </div>
        )}

        {/* ========================================
            SECURITY SECTION
            ======================================== */}

        {!loading && !isViewingOtherUser && (
          <section className="profile-security-card">
            <div className="profile-security-left">
              <div className="profile-security-large-icon">◉</div>

              <div>
                <span className="profile-security-eyebrow">
                  ACCOUNT SECURITY
                </span>

                <h2>Keep your account protected</h2>

                <p>
                  Regularly updating your password helps keep your account and
                  asset management data secure.
                </p>
              </div>
            </div>

            <Link to="/change-password" className="profile-security-action">
              Change password
              <span>→</span>
            </Link>
          </section>
        )}
      </main>
    </AppPageLayout>
  );
}

export default Profile;
