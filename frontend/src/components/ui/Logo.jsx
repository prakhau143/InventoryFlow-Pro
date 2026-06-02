/**
 * InventoryFlow Pro — Premium SaaS Logo
 * Hexagonal emblem with 3D isometric cube, flow lines, growth arrow,
 * and analytics bars. Electric Blue (#00D4FF) + Neon Violet (#8B5CF6).
 */

export default function Logo({ size = 40, showText = false, showTagline = false, className = "" }) {
  const uid = `ifp-${size}`;
  return (
    <div className={className} style={{ display: "inline-flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
      {/* ── Icon Mark ── */}
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
        aria-label="InventoryFlow Pro"
      >
        <defs>
          {/* Primary gradient: electric blue → neon violet */}
          <linearGradient id={`${uid}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00D4FF" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>

          {/* Cube top-face gradient */}
          <linearGradient id={`${uid}-top`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00D4FF" stopOpacity="1" />
            <stop offset="100%" stopColor="#00a8cc" stopOpacity="0.9" />
          </linearGradient>

          {/* Cube left-face gradient */}
          <linearGradient id={`${uid}-left`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0078a0" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#005580" stopOpacity="0.85" />
          </linearGradient>

          {/* Cube right-face gradient */}
          <linearGradient id={`${uid}-right`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6640b8" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.85" />
          </linearGradient>

          {/* Dark bg radial glow */}
          <radialGradient id={`${uid}-bg`} cx="50%" cy="45%" r="52%">
            <stop offset="0%" stopColor="#1a1040" />
            <stop offset="100%" stopColor="#050816" />
          </radialGradient>

          {/* Neon glow filter */}
          <filter id={`${uid}-glow`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Soft inner glow */}
          <filter id={`${uid}-softglow`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Clip to circle */}
          <clipPath id={`${uid}-clip`}>
            <circle cx="50" cy="50" r="47" />
          </clipPath>
        </defs>

        {/* ── Background ── */}
        <circle cx="50" cy="50" r="49" fill="url(#${uid}-bg)" />
        <circle cx="50" cy="50" r="49" fill={`url(#${uid}-bg)`} />

        {/* Subtle ambient glow behind cube */}
        <ellipse cx="50" cy="52" rx="22" ry="14" fill="#00D4FF" fillOpacity="0.07" />

        {/* ── Outer hexagon ring (glowing) ── */}
        <polygon
          points="50,4 88,26 88,74 50,96 12,74 12,26"
          fill="none"
          stroke={`url(#${uid}-grad)`}
          strokeWidth="2"
          filter={`url(#${uid}-glow)`}
        />

        {/* Hex corner dots */}
        {[
          [50, 4], [88, 26], [88, 74], [50, 96], [12, 74], [12, 26]
        ].map(([cx, cy], i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r="2"
            fill={i % 2 === 0 ? "#00D4FF" : "#8B5CF6"}
            fillOpacity="0.9"
            filter={`url(#${uid}-softglow)`}
          />
        ))}

        {/* ── Inner hex (glass surface) ── */}
        <polygon
          points="50,16 78,32 78,62 50,78 22,62 22,32"
          fill="#00D4FF"
          fillOpacity="0.03"
          stroke="#00D4FF"
          strokeOpacity="0.15"
          strokeWidth="0.8"
        />

        {/* ── 3D Isometric Cube ── */}
        {/* Top face */}
        <polygon
          points="50,27 64,35 50,43 36,35"
          fill={`url(#${uid}-top)`}
          filter={`url(#${uid}-softglow)`}
        />
        {/* Left face */}
        <polygon
          points="36,35 50,43 50,58 36,50"
          fill={`url(#${uid}-left)`}
        />
        {/* Right face */}
        <polygon
          points="64,35 50,43 50,58 64,50"
          fill={`url(#${uid}-right)`}
        />

        {/* Cube edge highlights */}
        <polyline
          points="36,35 50,27 64,35 50,43 36,35"
          fill="none" stroke="#00D4FF" strokeWidth="0.9" strokeOpacity="0.9"
        />
        <line x1="50" y1="43" x2="50" y2="58" stroke="#ffffff" strokeWidth="0.7" strokeOpacity="0.4" />
        <line x1="64" y1="35" x2="64" y2="50" stroke="#8B5CF6" strokeWidth="0.7" strokeOpacity="0.7" />
        <line x1="36" y1="35" x2="36" y2="50" stroke="#00D4FF" strokeWidth="0.7" strokeOpacity="0.7" />
        {/* Bottom edge */}
        <polyline
          points="36,50 50,58 64,50"
          fill="none" stroke="#8B5CF6" strokeWidth="0.7" strokeOpacity="0.5"
        />

        {/* ── Upward growth arrow ── */}
        <line
          x1="50" y1="72" x2="50" y2="61"
          stroke={`url(#${uid}-grad)`} strokeWidth="1.8"
          strokeLinecap="round"
          filter={`url(#${uid}-softglow)`}
        />
        <polygon
          points="50,57 46.5,63 53.5,63"
          fill="#8B5CF6"
          filter={`url(#${uid}-softglow)`}
        />

        {/* ── Analytics bars (left side) ── */}
        <rect x="22" y="70" width="3.5" height="5" rx="1" fill="#00D4FF" fillOpacity="0.55" />
        <rect x="27" y="67" width="3.5" height="8" rx="1" fill="#00D4FF" fillOpacity="0.7" />
        <rect x="32" y="64" width="3.5" height="11" rx="1" fill="#8B5CF6" fillOpacity="0.8" />

        {/* ── Analytics bars (right side, mirrored) ── */}
        <rect x="65" y="70" width="3.5" height="5" rx="1" fill="#00D4FF" fillOpacity="0.55" />
        <rect x="60" y="67" width="3.5" height="8" rx="1" fill="#00D4FF" fillOpacity="0.7" />
        <rect x="55" y="64" width="3.5" height="11" rx="1" fill="#8B5CF6" fillOpacity="0.8" />

        {/* ── Flow lines (left) ── */}
        <path
          d="M16,40 C10,40 10,46 16,46"
          stroke="#00D4FF" strokeWidth="1.2" fill="none" strokeOpacity="0.6"
        />
        <line x1="16" y1="43" x2="11" y2="43" stroke="#00D4FF" strokeWidth="1" strokeOpacity="0.5" />

        {/* ── Flow lines (right) ── */}
        <path
          d="M84,40 C90,40 90,46 84,46"
          stroke="#8B5CF6" strokeWidth="1.2" fill="none" strokeOpacity="0.6"
        />
        <line x1="84" y1="43" x2="89" y2="43" stroke="#8B5CF6" strokeWidth="1" strokeOpacity="0.5" />

        {/* ── Network nodes (supply chain) ── */}
        <circle cx="22" cy="30" r="1.5" fill="#00D4FF" fillOpacity="0.6" />
        <circle cx="78" cy="30" r="1.5" fill="#8B5CF6" fillOpacity="0.6" />
        <line x1="22" y1="30" x2="36" y2="35" stroke="#00D4FF" strokeWidth="0.6" strokeOpacity="0.4" strokeDasharray="2,2" />
        <line x1="78" y1="30" x2="64" y2="35" stroke="#8B5CF6" strokeWidth="0.6" strokeOpacity="0.4" strokeDasharray="2,2" />
      </svg>

      {/* ── Wordmark ── */}
      {showText && (
        <div style={{ lineHeight: 1 }}>
          <div style={{
            fontSize: size * 0.35,
            fontWeight: 800,
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #00D4FF 0%, #8B5CF6 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            whiteSpace: "nowrap",
          }}>
            InventoryFlow <span style={{ fontWeight: 400, opacity: 0.85 }}>Pro</span>
          </div>
          {showTagline && (
            <div style={{
              fontSize: size * 0.13,
              fontWeight: 600,
              letterSpacing: "0.18em",
              color: "#00D4FF",
              opacity: 0.55,
              marginTop: 2,
              textTransform: "uppercase",
            }}>
              Track · Manage · Grow
            </div>
          )}
        </div>
      )}
    </div>
  );
}
