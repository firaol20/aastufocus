import VerifyEmail from "@/components/auth/verify-email";
import { Suspense } from "react";
import { Loader } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin w-8 h-8 text-primary" />
      </div>
    }>
      <VerifyEmail />
    </Suspense>
  );
}
