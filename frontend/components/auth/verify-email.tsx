"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAuthError,
  selectAuthLoading,
  selectIsRegistered,
} from "@/lib/redux/authSlice/selector";
import { verifyEmailRequest, resendVerificationRequest } from "@/lib/redux/authSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader, ArrowLeft } from "lucide-react";

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";

  const dispatch = useDispatch();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  const isRegistered = useSelector(selectIsRegistered);

  useEffect(() => {
    // If we're here but not from a registration/verification flow, 
    // or we don't have an email, we might want to redirect back.
    if (!email) {
      router.push("/signup");
    }
  }, [email, router]);

  useEffect(() => {
    // Redirect to login on successful verification
    // Note: in our slice, verifyEmailSuccess sets isRegistered to false
    if (!isRegistered && !loading && !error && otp.length === 6) {
      router.push("/login?verified=true");
    }
  }, [isRegistered, loading, error, otp, router]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6 && email) {
      dispatch(verifyEmailRequest({ email, otp }));
    }
  };

  const handleResend = () => {
    if (canResend && email) {
      dispatch(resendVerificationRequest({ email }));
      setTimer(60);
      setCanResend(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 relative">
      {/* Logo - Top Left Corner */}
      <div className="absolute top-4 left-10 z-20">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold ">
          <div className="flex ">
            <span className="text-primary-gradient mr-1">AASTU</span>{" "}
            <span className="">FOCUS</span>
          </div>
        </Link>
      </div>

      {/* Left side - Form */}
      <div className="p-8 lg:p-12 flex flex-col justify-center bg-background h-screen">
        <div className="max-w-md mx-auto w-full">
          <Link 
            href="/signup" 
            className="flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Sign Up
          </Link>

          {/* Header */}
          <div className="mb-8 w-full mx-auto text-center">
            <h1 className="text-2xl font-bold mb-2">Verify your email</h1>
            <p className="text-gray-400">
              We've sent a 6-digit code to <span className="text-foreground font-medium">{email}</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Label htmlFor="otp" className="text-center font-medium">
                Enter Verification Code
              </Label>
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>

            {/* Verify Button */}
            <Button
              type="submit"
              disabled={otp.length !== 6 || loading}
              className="w-full h-12 bg-primary hover:bg-primary/80 text-white font-medium mt-6"
            >
              {loading ? <Loader className="animate-spin" /> : "Verify Email"}
            </Button>
          </form>

          {/* Resend Section */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={!canResend || loading}
              className={`text-sm font-medium transition-colors ${
                canResend 
                  ? "text-primary hover:text-primary/80" 
                  : "text-muted-foreground cursor-not-allowed"
              }`}
            >
              {canResend ? "Resend Verification Code" : `Resend in ${timer}s`}
            </button>
          </div>
        </div>
      </div>

      {/* Right side - Hero Image */}
      <div className="relative bg-gradient-to-br from-primary-foreground to-primary/20 hidden lg:block h-screen">
        <div className="absolute inset-2 ">
          <div className="absolute inset-0 rounded-[10px] overflow-hidden ">
            <Image
              src="https://res.cloudinary.com/dllg3vnae/image/upload/AASTU_Misc/hero-image.jpg"
              alt="Cozy living room with modern furniture"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-800" />
          </div>
        </div>

        {/* Content overlay */}
        <div className="relative z-10 p-12 flex flex-col justify-end h-full text-white ">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-4 text-balance">
              Secure Your Account
            </h2>
            <p className="text-white/90 text-lg leading-relaxed">
              Verify your email address to ensure you receive important updates and maintain access to our fellowship community resources.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
