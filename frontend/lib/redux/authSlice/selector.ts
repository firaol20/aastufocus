import { RootState } from "../store";

export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsRegistered = (state: RootState) => state.auth.isRegistered;
export const selectAuthError = (state: RootState) => state.auth.error;
export const selectAuthLoading = (state: RootState) => state.auth.loading;

// Auth is considered initialized once loading is false (initial load complete)
export const selectIsInitialized = (state: RootState) => !state.auth.loading;

// Derive permissions from user role
export const selectUserPermissions = (state: RootState) => {
  const role = state.auth.user?.role;
  const isAdmin = role === "admin";
  const isLeader = role === "leader" || isAdmin;
  const isMember = !!role;

  return {
    canManageUsers: isAdmin,
    canViewAdminPanel: isAdmin,
    canManageContent: isLeader,
    canViewAnalytics: isAdmin,
    canManageDonations: isAdmin,
    canManageContacts: isLeader,
    isRegularMember: isMember,
  };
};

