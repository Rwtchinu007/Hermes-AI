import HermesGlyph from "./HermesGlyph";

/*
  Hermes brand.
  - HermesMark: static version of the home emblem (dark tile + vector H).
    Corner radius scales with size so it stays a smooth squircle-like tile.
  - Wordmark: "Hermes" in Sora semibold + a quieter ".ai".
*/

export const HermesMark = ({ size = 28, className = "" }) => (
  <span
    aria-hidden="true"
    className={`relative inline-flex shrink-0 items-center justify-center ${className}`}
    style={{
      width: size,
      height: size,
      borderRadius: size * 0.31,
      background:
        "radial-gradient(120% 90% at 30% 15%, #2e2b28 0%, transparent 60%), linear-gradient(165deg, #1f1d1b 0%, #121110 60%, #0c0b0a 100%)",
      boxShadow:
        "inset 0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 0 rgba(255,255,255,0.1), 0 1px 2px rgba(0,0,0,0.18)",
    }}
  >
    <HermesGlyph size={Math.round(size * 0.66)} className="block" />
  </span>
);

export const Wordmark = ({ className = "" }) => (
  <span
    className={`inline-flex items-baseline font-brand text-[17px] leading-none tracking-[-0.03em] ${className}`}
  >
    <span className="font-semibold text-fg">Hermes</span>
    <span className="font-medium text-muted">.ai</span>
  </span>
);

const Logo = ({ size = 26, className = "" }) => (
  <span className={`inline-flex items-center gap-2.5 ${className}`}>
    <HermesMark size={size} />
    <Wordmark />
  </span>
);

export default Logo;
