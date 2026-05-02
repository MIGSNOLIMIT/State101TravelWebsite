const SUPER_ADMIN_EMAIL = "statetravel101@gmail.com";

export function normalizeAdminEmail(email) {
  return String(email || "").trim().toLowerCase();
}

export function isSuperAdminEmail(email) {
  return normalizeAdminEmail(email) === SUPER_ADMIN_EMAIL;
}

export function isSuperAdminUser(user) {
  return Boolean(user?.email) && isSuperAdminEmail(user.email);
}

export function getEffectiveAdminRole(user) {
  if (!user) return null;
  if (isSuperAdminUser(user)) return "super_admin";
  return user.role || "editor";
}

export function withEffectiveAdminRole(user) {
  if (!user) return null;
  return {
    ...user,
    role: getEffectiveAdminRole(user),
  };
}

export function isAdminRole(role) {
  return role === "admin" || role === "super_admin";
}

export function isEditorRole(role) {
  return role === "editor" || isAdminRole(role);
}

export function canAccessAdminRoles(user, allowedRoles = ["admin", "editor"]) {
  const role = typeof user === "string" ? user : getEffectiveAdminRole(user);
  if (!role) return false;

  return allowedRoles.some((allowedRole) => {
    if (allowedRole === "admin") return isAdminRole(role);
    if (allowedRole === "editor") return isEditorRole(role);
    return allowedRole === role;
  });
}

export function isProtectedSuperAdminUser(user) {
  return isSuperAdminUser(user);
}

export function canManageAdminUsers(user) {
  return getEffectiveAdminRole(user) === "super_admin";
}

export function canManageEditorUsers(user) {
  return isAdminRole(getEffectiveAdminRole(user));
}

export function getAdminRoleBadgeLabel(role) {
  if (role === "super_admin") return "Admin";
  if (role === "admin") return "Admin";
  return "Editor";
}

export function getAdminRoleDisplayText(role) {
  if (role === "super_admin") return "admin";
  return role || "admin";
}
