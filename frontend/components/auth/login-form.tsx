"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import GoogleIcon from "../ui/googleIcon";
import ErrorHandler from "@/lib/utils/errorHandler";
import {
  selectAuthError,
  selectAuthLoading,
  selectIsAuthenticated,
  selectUser,
} from "@/lib/redux/authSlice/selector";
import { useDispatch, useSelector } from "react-redux";
import { googleRequest, loginRequest } from "@/lib/redux/authSlice";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const error = useSelector(selectAuthError);
  const loading = useSelector(selectAuthLoading);

  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if there's a redirect parameter
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get("redirect");

      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push("/");
      }
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authStatus = urlParams.get("auth");

    if (authStatus === "success") {
      router.push("/");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      dispatch(loginRequest({ email, password }));
    } catch (error) {
      ErrorHandler.handleReduxError(error as string, "LOGIN");
    }
  };

  const handleGoogleAuth = () => {
    const base = process.env.NEXT_PUBLIC_API || "http://localhost:5002/api";
    window.location.href = `${base}/auth/google`;
  };

  return (
    <div className="h-screen grid lg:grid-cols-2 relative overflow-hidden bg-background">
      {/* Left Side - Form (Scrollable) */}
      <div className="h-screen overflow-y-auto flex items-center justify-center px-6 py-12 lg:px-12 bg-background relative z-10 scrollbar-hide">
        <div className="w-full max-w-md my-auto">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
            <p className="text-muted-foreground">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email */}
            <div>
              <Label htmlFor="email" className="font-medium">
                Email*
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-border/60 focus-visible:ring-primary/40"
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password" className="font-medium">
                Password*
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-10 border-border/60 focus-visible:ring-primary/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" className="mt-0.5" />
                <Label
                  htmlFor="remember"
                  className="text-sm text-muted-foreground cursor-pointer"
                >
                  Remember me
                </Label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-12 bg-primary hover:bg-primary/80 text-white font-medium mt-6"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>

          {/* Google */}
          <Button
            variant="outline"
            className="w-full h-12 mb-6 border-muted-foreground hover:bg-card bg-transparent"
            type="button"
            onClick={handleGoogleAuth}
          >
            <GoogleIcon />
            <span className="ml-2">Login with Google</span>
          </Button>

          {/* Signup */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-primary font-medium hover:text-primary/80 transition-colors"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Hero Image (Fixed/Immovable) */}
      <div className="relative bg-gradient-to-br from-primary-foreground to-primary/20 hidden lg:block h-screen">
        {/* Logo - Positioned over the image */}
        <div className="absolute top-4 left-10 z-20">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold">
            <div className="flex items-center">
              <span className="text-primary-gradient mr-1">AASTU</span>
              <span className="text-white">FOCUS</span>
            </div>
          </Link>
        </div>

        <div className="absolute inset-2">
          <div className="absolute inset-0 rounded-[10px] overflow-hidden">
            <Image
              src="/hero-image.jpg"
              alt="Hero Image"
              fill
              priority
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-800" />
          </div>
        </div>

        {/* Content overlay */}
        <div className="relative z-10 p-12 flex flex-col justify-end h-full text-white">
          <div className="mb-8 max-w-lg">
            <h2 className="text-3xl font-bold mb-4 leading-tight">
              Welcome Back to AASTU Focus
            </h2>
            <p className="text-white/85 text-lg leading-relaxed">
              Continue your journey of faith and fellowship. Sign in to access
              events, connect with your team, and stay updated with our
              community.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
