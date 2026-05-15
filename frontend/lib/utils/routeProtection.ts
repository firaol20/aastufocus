import { useAppSelector } from "../redux/hooks";
import {
  selectIsAuthenticated,
  selectUserPermissions,
  selectIsInitialized,
} from "../redux/authSlice/selector";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ErrorHandler from "./errorHandler";

// User roles
export enum UserRole {
  ADMIN = "admin",
  LEADER = "leader",
  MEMBER = "member",
}

// Permission types
export enum Permission {
  // User management
  MANAGE_USERS = "manage_users",
  VIEW_USERS = "view_users",

  // Content management
  MANAGE_CONTENT = "manage_content",
  VIEW_CONTENT = "view_content",

  // Event management
  MANAGE_EVENTS = "manage_events",
  VIEW_EVENTS = "view_events",
  REGISTER_EVENTS = "register_events",

  // Team management
  MANAGE_TEAMS = "manage_teams",
  VIEW_TEAMS = "view_teams",
  JOIN_TEAMS = "join_teams",

  // Media management
  MANAGE_MEDIA = "manage_media",
  UPLOAD_MEDIA = "upload_media",
  VIEW_MEDIA = "view_media",

  // Analytics
  VIEW_ANALYTICS = "view_analytics",

  // Donations
  MANAGE_DONATIONS = "manage_donations",
  VIEW_DONATIONS = "view_donations",

  // Contacts
  MANAGE_CONTACTS = "manage_contacts",
  VIEW_CONTACTS = "view_contacts",

  // Admin panel
  VIEW_ADMIN_PANEL = "view_admin_panel",
}

// Route protection levels
export enum ProtectionLevel {
  PUBLIC = "public", // No authentication required
  AUTHENTICATED = "authenticated", // Any authenticated user
  ADMIN_ONLY = "admin_only", // Admin users only
  LEADER_OR_ADMIN = "leader_or_admin", // Leader or Admin users
  MEMBER_OR_ABOVE = "member_or_above", // Member, Leader, or Admin users
}

// Route configuration interface
export interface RouteConfig {
  path: string;
  protectionLevel: ProtectionLevel;
  requiredPermissions?: Permission[];
  redirectTo?: string;
  fallbackComponent?: React.ComponentType;
}

// Permission mapping for roles
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    Permission.MANAGE_USERS,
    Permission.VIEW_USERS,
    Permission.MANAGE_CONTENT,
    Permission.VIEW_CONTENT,
    Permission.MANAGE_EVENTS,
    Permission.VIEW_EVENTS,
    Permission.REGISTER_EVENTS,
    Permission.MANAGE_TEAMS,
    Permission.VIEW_TEAMS,
    Permission.JOIN_TEAMS,
    Permission.MANAGE_MEDIA,
    Permission.UPLOAD_MEDIA,
    Permission.VIEW_MEDIA,
    Permission.VIEW_ANALYTICS,
    Permission.MANAGE_DONATIONS,
    Permission.VIEW_DONATIONS,
    Permission.MANAGE_CONTACTS,
    Permission.VIEW_CONTACTS,
    Permission.VIEW_ADMIN_PANEL,
  ],
  [UserRole.LEADER]: [
    Permission.VIEW_USERS,
    Permission.MANAGE_CONTENT,
    Permission.VIEW_CONTENT,
    Permission.MANAGE_EVENTS,
    Permission.VIEW_EVENTS,
    Permission.REGISTER_EVENTS,
    Permission.MANAGE_TEAMS,
    Permission.VIEW_TEAMS,
    Permission.JOIN_TEAMS,
    Permission.MANAGE_MEDIA,
    Permission.UPLOAD_MEDIA,
    Permission.VIEW_MEDIA,
    Permission.VIEW_DONATIONS,
    Permission.MANAGE_CONTACTS,
    Permission.VIEW_CONTACTS,
  ],
  [UserRole.MEMBER]: [
    Permission.VIEW_CONTENT,
    Permission.VIEW_EVENTS,
    Permission.REGISTER_EVENTS,
    Permission.VIEW_TEAMS,
    Permission.JOIN_TEAMS,
    Permission.VIEW_MEDIA,
    Permission.VIEW_DONATIONS,
    Permission.VIEW_CONTACTS,
  ],
};

// Route protection hook
export const useRouteProtection = (config: RouteConfig) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const userPermissions = useAppSelector(selectUserPermissions);
  const isInitialized = useAppSelector(selectIsInitialized);
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return; // Wait for auth initialization

    const hasAccess = checkAccess(config, isAuthenticated, userPermissions);

    if (!hasAccess) {
      const redirectPath =
        config.redirectTo || getDefaultRedirectPath(config.protectionLevel);
      router.push(redirectPath);

      // Show appropriate error message
      if (!isAuthenticated) {
        ErrorHandler.showWarningToast(
          "Authentication Required",
          "Please log in to access this page."
        );
      } else {
        ErrorHandler.showWarningToast(
          "Access Denied",
          "You do not have permission to access this page."
        );
      }
    }
  }, [isInitialized, isAuthenticated, userPermissions, config, router]);

  return {
    hasAccess: checkAccess(config, isAuthenticated, userPermissions),
    isAuthenticated,
    userPermissions,
    isInitialized,
  };
};

// Check if user has access to a route
export const checkAccess = (
  config: RouteConfig,
  isAuthenticated: boolean,
  userPermissions: ReturnType<typeof selectUserPermissions>
): boolean => {
  // Public routes are always accessible
  if (config.protectionLevel === ProtectionLevel.PUBLIC) {
    return true;
  }

  // Check authentication
  if (!isAuthenticated) {
    return false;
  }

  // Check protection level
  switch (config.protectionLevel) {
    case ProtectionLevel.AUTHENTICATED:
      return true;

    case ProtectionLevel.ADMIN_ONLY:
      return userPermissions.canViewAdminPanel;

    case ProtectionLevel.LEADER_OR_ADMIN:
      return userPermissions.canManageContent;

    case ProtectionLevel.MEMBER_OR_ABOVE:
      return (
        userPermissions.isRegularMember || userPermissions.canManageContent
      );

    default:
      return false;
  }
};

// Check if user has specific permission
export const hasPermission = (
  permission: Permission,
  userRole: UserRole
): boolean => {
  const rolePermissions = ROLE_PERMISSIONS[userRole];
  return rolePermissions.includes(permission);
};

// Get default redirect path based on protection level
export const getDefaultRedirectPath = (
  protectionLevel: ProtectionLevel
): string => {
  switch (protectionLevel) {
    case ProtectionLevel.PUBLIC:
      return "/";
    case ProtectionLevel.AUTHENTICATED:
    case ProtectionLevel.MEMBER_OR_ABOVE:
    case ProtectionLevel.LEADER_OR_ADMIN:
    case ProtectionLevel.ADMIN_ONLY:
      return "/login";
    default:
      return "/";
  }
};

// Higher-order component for route protection
export const withRouteProtection = <P extends object>(
  Component: React.ComponentType<P>,
  config: RouteConfig
) => {
  return function ProtectedComponent(props: P) {
    const { hasAccess, isInitialized } = useRouteProtection(config);

    // Show loading while checking auth
    if (!isInitialized) {
      return <div>Loading...</div>;
    }

    // Show fallback component if access denied
    if (!hasAccess) {
      const FallbackComponent = config.fallbackComponent;
      return FallbackComponent ? <FallbackComponent /> : null;
    }

    return <Component {...props} />;
  };
};

// Component for conditional rendering based on permissions
export const PermissionGate: React.FC<{
  permission: Permission;
  userRole: UserRole;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ permission, userRole, fallback = null, children }) => {
  const hasAccess = hasPermission(permission, userRole);

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// Hook for checking multiple permissions
export const usePermissions = (permissions: Permission[]) => {
  const userPermissions = useAppSelector(selectUserPermissions);

  return permissions.map((permission) => ({
    permission,
    hasAccess: checkPermissionAccess(permission, userPermissions),
  }));
};

// Check permission access based on user permissions
const checkPermissionAccess = (
  permission: Permission,
  userPermissions: ReturnType<typeof selectUserPermissions>
): boolean => {
  switch (permission) {
    case Permission.MANAGE_USERS:
    case Permission.VIEW_ADMIN_PANEL:
      return userPermissions.canManageUsers;

    case Permission.MANAGE_CONTENT:
    case Permission.MANAGE_EVENTS:
    case Permission.MANAGE_TEAMS:
    case Permission.MANAGE_MEDIA:
    case Permission.MANAGE_CONTACTS:
      return userPermissions.canManageContent;

    case Permission.VIEW_ANALYTICS:
    case Permission.MANAGE_DONATIONS:
      return userPermissions.canViewAnalytics;

    case Permission.VIEW_USERS:
    case Permission.VIEW_CONTENT:
    case Permission.VIEW_EVENTS:
    case Permission.VIEW_TEAMS:
    case Permission.VIEW_MEDIA:
    case Permission.VIEW_DONATIONS:
    case Permission.VIEW_CONTACTS:
    case Permission.REGISTER_EVENTS:
    case Permission.JOIN_TEAMS:
    case Permission.UPLOAD_MEDIA:
      return true; // All authenticated users can view/register

    default:
      return false;
  }
};

// Route configuration for common routes
export const ROUTE_CONFIGS: Record<string, RouteConfig> = {
  // Public routes
  "/": { path: "/", protectionLevel: ProtectionLevel.PUBLIC },
  "/login": { path: "/login", protectionLevel: ProtectionLevel.PUBLIC },
  "/signup": { path: "/signup", protectionLevel: ProtectionLevel.PUBLIC },
  "/contact": { path: "/contact", protectionLevel: ProtectionLevel.PUBLIC },
  "/events": { path: "/events", protectionLevel: ProtectionLevel.PUBLIC },
  "/gallery": { path: "/gallery", protectionLevel: ProtectionLevel.PUBLIC },
  "/about": { path: "/about", protectionLevel: ProtectionLevel.PUBLIC },
  "/location": { path: "/location", protectionLevel: ProtectionLevel.PUBLIC },
  "/donate": { path: "/donate", protectionLevel: ProtectionLevel.PUBLIC },
  "/join-us": { path: "/join-us", protectionLevel: ProtectionLevel.PUBLIC },
  "/teams": { path: "/teams", protectionLevel: ProtectionLevel.PUBLIC },

  // Authenticated routes
  "/home": { path: "/home", protectionLevel: ProtectionLevel.AUTHENTICATED },

  // Admin routes
  "/admin": {
    path: "/admin",
    protectionLevel: ProtectionLevel.ADMIN_ONLY,
    redirectTo: "/login",
  },
  "/admin/users": {
    path: "/admin/users",
    protectionLevel: ProtectionLevel.ADMIN_ONLY,
    redirectTo: "/login",
  },
  "/admin/analytics": {
    path: "/admin/analytics",
    protectionLevel: ProtectionLevel.ADMIN_ONLY,
    redirectTo: "/login",
  },
  "/admin/donations": {
    path: "/admin/donations",
    protectionLevel: ProtectionLevel.ADMIN_ONLY,
    redirectTo: "/login",
  },

  // Leader/Admin routes
  "/admin/content": {
    path: "/admin/content",
    protectionLevel: ProtectionLevel.LEADER_OR_ADMIN,
    redirectTo: "/login",
  },
  "/admin/events": {
    path: "/admin/events",
    protectionLevel: ProtectionLevel.LEADER_OR_ADMIN,
    redirectTo: "/login",
  },
  "/admin/teams": {
    path: "/admin/teams",
    protectionLevel: ProtectionLevel.LEADER_OR_ADMIN,
    redirectTo: "/login",
  },
  "/admin/media": {
    path: "/admin/media",
    protectionLevel: ProtectionLevel.LEADER_OR_ADMIN,
    redirectTo: "/login",
  },
  "/admin/contact": {
    path: "/admin/contact",
    protectionLevel: ProtectionLevel.LEADER_OR_ADMIN,
    redirectTo: "/login",
  },
};

export default {
  useRouteProtection,
  withRouteProtection,
  PermissionGate,
  usePermissions,
  checkAccess,
  hasPermission,
  getDefaultRedirectPath,
  ROUTE_CONFIGS,
};
