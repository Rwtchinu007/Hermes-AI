import React from "react";
import { Link, useLocation } from "react-router";
import { ArrowLeft, MailCheck } from "lucide-react";
import AuthLayout from "../components/AuthLayout";

const VerifyEmail = () => {
  const email = useLocation().state?.email;

  return (
    <AuthLayout
      title="Check your email"
      subtitle={
        email ? (
          <>
            We sent a verification link to{" "}
            <span className="font-medium text-white">{email}</span>. Open it to activate your account.
          </>
        ) : (
          "We sent a verification link to your email address. Open it to activate your account."
        )
      }
    >
      <div className="flex flex-col items-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-[#e08d2e]/30 bg-[#e08d2e]/10 text-[#f0a044] shadow-[0_0_40px_rgba(224,141,46,0.25)]">
          <MailCheck size={26} strokeWidth={1.5} />
        </div>

        <div className="w-full rounded-md border border-white/10 bg-white/[0.04] p-4 text-[12.5px] leading-relaxed text-white/55">
          Didn't get it? Check your spam or promotions folder. Once your email
          is verified, come back here and sign in.
        </div>

        <Link
          to="/login"
          className="mt-6 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-white text-[13px] font-semibold text-black transition-colors hover:bg-[#f4f1ec]"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
