import React from "react";
import { Link } from "react-router";
import { MailCheck, ArrowLeft } from "lucide-react";
import audex from "../../../assets/auth_assets/fonts/Audex-Regular.otf";

const VerifyEmail = () => {
  return (
    <>
      <style>
        {`
          @font-face {
            font-family: 'Audex';
            src: url(${audex}) format('opentype');
            font-weight: 400;
            font-style: normal;
            font-display: swap;
          }
        `}
      </style>

      <main className="min-h-screen bg-[#0b0b0b] px-5 flex items-center justify-center font-sans">
        {/* Ambient glow */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/3 h-[320px] w-[320px] -translate-x-1/2 rounded-full bg-[#e08d2e]/[0.035] blur-[120px]" />
        </div>

        <div
          className="
            relative
            w-full
            max-w-[420px]
            rounded-2xl
            border
            border-white/[0.08]
            bg-[#111111]
            px-7
            py-9
            text-center
            shadow-[0_20px_70px_rgba(0,0,0,0.35)]
            sm:px-10
            sm:py-10
          "
        >
          {/* Logo */}
          <Link
            to="/"
            className="mb-9 inline-block transition-opacity duration-200 hover:opacity-80"
          >
            <span className="font-[Audex] text-[25px] tracking-tight text-[#e08d2e]">
              Hermes
            </span>
            <span className="font-sans text-[25px] tracking-tight text-white/65">
              .AI
            </span>
          </Link>

          {/* Mail Icon */}
          <div
            className="
              mx-auto
              mb-6
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              border
              border-[#e08d2e]/20
              bg-[#e08d2e]/[0.08]
            "
          >
            <MailCheck size={30} strokeWidth={1.7} className="text-[#e08d2e]" />
          </div>

          {/* Heading */}
          <h1 className="text-[25px] font-medium tracking-[-0.02em] text-white">
            Check your email
          </h1>

          {/* Description */}
          <p className="mx-auto mt-3 max-w-[325px] text-[14px] leading-6 text-white/45">
            We've sent a verification link to your email address. Please verify
            your email to start using Hermes.ai.
          </p>

          {/* Divider */}
          <div className="mx-auto my-7 h-px w-full bg-white/[0.06]" />

          {/* Spam Note */}
          <div className="flex items-start justify-center gap-2 text-left">
            <MailCheck
              size={15}
              strokeWidth={1.7}
              className="mt-[3px] shrink-0 text-white/30"
            />

            <p className="text-[12px] leading-5 text-white/30">
              Didn't receive the email? Check your spam or junk folder.
            </p>
          </div>

          {/* Back to Login */}
          <Link
            to="/login"
            className="
              group
              mt-8
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-white/[0.09]
              bg-white/[0.04]
              px-5
              py-2.5
              text-[13px]
              font-medium
              text-white/75
              transition-all
              duration-200
              hover:border-[#e08d2e]/30
              hover:bg-[#e08d2e]/[0.08]
              hover:text-white
            "
          >
            <ArrowLeft
              size={15}
              strokeWidth={1.8}
              className="transition-transform duration-200 group-hover:-translate-x-0.5"
            />
            Back to Login
          </Link>
        </div>
      </main>
    </>
  );
};

export default VerifyEmail;
