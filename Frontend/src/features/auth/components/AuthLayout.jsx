import { Link } from "react-router";

import bgimage from "../../../assets/auth_assets/img/bg-image.png";
import Logo from "../../ui/components/Logo";

/* Right-hand artwork panel (desktop only) */
const Showcase = () => (
  <div className="relative hidden overflow-hidden md:block">
    <img
      src={bgimage}
      alt=""
      className="absolute inset-0 h-full w-full object-cover object-[75%_50%]"
    />
    {/* Soft warm glow behind the monitor */}
    <div className="auth-glow pointer-events-none absolute left-[55%] top-[52%] h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#ff9a3c]/25 blur-3xl" />
    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

    <div className="absolute inset-x-8 bottom-8">
      <p className="text-[20px] font-semibold tracking-[-0.02em] text-white">
        Think. Create. Explore.
      </p>
      <p className="mt-1 text-[13px] text-white/60">
        Your AI companion, connected to the live web.
      </p>
    </div>
  </div>
);

/*
  Shared shell for login / signup / verify pages.
  The card always fits in one screen, with space around it.
  Always uses the dark palette so it matches the artwork.
*/
const AuthLayout = ({ title, subtitle, children, footer }) => (
  <main
    data-theme="dark"
    className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-[#0b0b0b] p-4 text-fg sm:p-8 lg:p-10"
  >
    {/* Background artwork */}
    <img
      src={bgimage}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover blur-[3px]"
    />
    <div className="pointer-events-none absolute inset-0 bg-black/55" />

    <div className="auth-card relative z-10 grid max-h-full w-full max-w-[980px] overflow-hidden rounded-2xl border border-white/20 bg-white/[0.03] shadow-[0_30px_80px_rgba(0,0,0,0.55)] backdrop-blur-[6px] md:h-full md:max-h-[620px] md:grid-cols-2">
      {/* Form panel (scrolls internally only on very short screens) */}
      <div className="hermes-scrollbar flex min-h-0 flex-col overflow-y-auto bg-black/70 px-6 py-6 sm:px-10 sm:py-7">
        <Link
          to="/"
          aria-label="Hermes.ai home"
          className="w-fit shrink-0 rounded transition-opacity hover:opacity-80"
        >
          <Logo size={26} />
        </Link>

        <div className="mx-auto my-auto w-full max-w-[340px] py-4">
          {/* Heading group */}
          <header className="mb-5">
            <h1 className="font-display text-[21px] font-semibold leading-tight tracking-[-0.02em] text-white">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-[12.5px] leading-relaxed text-white/55">{subtitle}</p>
            )}
          </header>

          {children}

          {footer && (
            <p className="mt-5 text-center text-[12px] text-white/50">{footer}</p>
          )}
        </div>
      </div>

      <Showcase />
    </div>
  </main>
);

export const AuthLink = ({ to, children }) => (
  <Link
    to={to}
    className="rounded font-medium text-[#ea9e33] underline-offset-4 transition-colors hover:text-[#f5b866] hover:underline"
  >
    {children}
  </Link>
);

export default AuthLayout;
