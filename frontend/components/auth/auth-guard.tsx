"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { Loader2 } from "lucide-react"

interface AuthGuardProps {
  children: React.ReactNode
  requireAdmin?: boolean
  redirectTo?: string
}

export default function AuthGuard({ children, requireAdmin = false, redirectTo }: AuthGuardProps) {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (isLoading) return

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      const loginUrl = `/login?redirect=${encodeURIComponent(redirectTo || pathname)}`
      router.push(loginUrl)
      return
    }

    // If admin access required but user is not admin, redirect to home
    if (requireAdmin && !isAdmin) {
      router.push("/")
      return
    }

    // If user is admin and trying to access non-admin pages, redirect to admin dashboard
    if (isAdmin && !pathname.startsWith("/admin") && !pathname.startsWith("/login")) {
      router.push("/")
      return
    }
  }, [isLoading, isAuthenticated, isAdmin, requireAdmin, router, pathname, redirectTo])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render children if not authenticated or not authorized
  if (!isAuthenticated || (requireAdmin && !isAdmin)) {
    return null
  }

  return <>{children}</>
}
