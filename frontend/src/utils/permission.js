// ========================================
// PERMISSION UTILITY
// ========================================
// System Admin:
// - Has full access automatically.
// Other users:
// - Can access ONLY permissions assigned by System Admin from UserAccessRights.

// ========================================
// CHECK SINGLE PERMISSION
// ========================================

export const hasPermission = (user, group, permission) => {
  // ----------------------------------------
  // No user
  // ----------------------------------------

  if (!user) {
    return false;
  }

  // ----------------------------------------
  // SYSTEM ADMIN
  // ----------------------------------------
  if (user.role === "SYSTEM_ADMIN") {
    return true;
  }

  // ----------------------------------------
  // Get permission group
  // ----------------------------------------

  const groupPermissions = user.permissions?.[group];

  if (!groupPermissions) {
    return false;
  }

  // ----------------------------------------
  // Check permission
  // ----------------------------------------

  return groupPermissions[permission] === true;
};

// ========================================
// CHECK MULTIPLE PERMISSIONS
// ========================================
export const hasAnyPermission = (user, group, permissions = []) => {
  if (!user) {
    return false;
  }

  // System Admin has everything

  if (user.role === "SYSTEM_ADMIN") {
    return true;
  }

  return permissions.some((permission) =>
    hasPermission(user, group, permission),
  );
};

// ========================================
// CHECK ALL PERMISSIONS
// ========================================
export const hasAllPermissions = (user, group, permissions = []) => {
  if (!user) {
    return false;
  }

  // System Admin has everything

  if (user.role === "SYSTEM_ADMIN") {
    return true;
  }

  return permissions.every((permission) =>
    hasPermission(user, group, permission),
  );
};

// ========================================
// CHECK PERMISSION OBJECT
// ========================================
export const hasPermissions = (user, requiredPermissions = []) => {
  if (!user) {
    return false;
  }

  // System Admin has complete access

  if (user.role === "SYSTEM_ADMIN") {
    return true;
  }

  return requiredPermissions.every(([group, permission]) =>
    hasPermission(user, group, permission),
  );
};

// ========================================
// GET USER PERMISSIONS
// ========================================
export const getUserPermissions = (user) => {
  if (!user) {
    return {};
  }

  // System Admin does not need manually
  // assigned permissions, but returning
  // the existing object keeps the function
  // predictable.

  return user.permissions || {};
};

// ========================================
// IS SYSTEM ADMIN
// ========================================

export const isSystemAdmin = (user) => {
  return user?.role === "SYSTEM_ADMIN";
};
