"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch } from "react-redux";
import { setUser } from "@/lib/redux/authSlice";
import { ToastService } from "@/lib/services/toastService";
import axiosClient from "@/lib/api/axiosClient";
import { apiRoutes } from "@/lib/api";

function AuthCallbackInner() {
  const searchParams = useSearchParams();
  const authStatus = searchParams.get("auth");
  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axiosClient.get(apiRoutes.users.profile, {
          withCredentials: true,
        });
        const user = response.data?.data?.user;
        if (user) {
          dispatch(setUser(user));
          ToastService.success("Login successful");
          router.push("/");
        } else {
          ToastService.error("No user found");
          router.push("/login");
        }
      } catch (error: any) {
        ToastService.error(error?.message || "Google login failed");
        router.push("/login");
      }
    };

    if (authStatus === "success") {
      fetchUser();
    } else if (authStatus === "failed") {
      ToastService.error("Google login failed");
      router.push("/login");
    } else if (authStatus === "csrf_failed") {
      ToastService.error("Security validation failed");
      router.push("/login");
    }
  }, [authStatus, dispatch, router]);

  return <p className="text-center mt-20">Processing login...</p>;
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<p className="text-center mt-20">Loading...</p>}>
      <AuthCallbackInner />
    </Suspense>
  );
}
