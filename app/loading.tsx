export default function Loading() {
  return (
    <div className="kfar-preloader">
      {/* Background layers */}
      <div className="kfar-preloader__bg" />
      <div className="kfar-preloader__grain" />

      {/* 3D Stage */}
      <div className="kfar-preloader__stage">
        {/* Orbital rings in 3D space */}
        <div className="kfar-preloader__orbit kfar-preloader__orbit--1" />
        <div className="kfar-preloader__orbit kfar-preloader__orbit--2" />
        <div className="kfar-preloader__orbit kfar-preloader__orbit--3" />

        {/* Floating particles */}
        <div className="kfar-preloader__particles">
          {[...Array(8)].map((_, i) => (
            <span key={i} className="kfar-preloader__particle" style={{ '--i': i } as React.CSSProperties} />
          ))}
        </div>

        {/* Logo container with 3D float */}
        <div className="kfar-preloader__logo-wrap">
          {/* Glow backdrop */}
          <div className="kfar-preloader__glow" />

          {/* Logo */}
          <img
            src="/images/logos/kfar_icon_leaf_gold.png"
            alt=""
            className="kfar-preloader__logo"
            width={80}
            height={80}
          />
        </div>

        {/* Wordmark */}
        <div className="kfar-preloader__text">
          <span className="kfar-preloader__brand">KFAR</span>
          <span className="kfar-preloader__tagline">The Whole Village, In Your Hand.</span>
        </div>

        {/* Progress bar */}
        <div className="kfar-preloader__progress">
          <div className="kfar-preloader__progress-bar" />
        </div>
      </div>

      <style>{`
        /* ─── Base ─────────────────────────────────────────── */
        .kfar-preloader {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: #0a1a0a;
        }

        /* Radial gradient background */
        .kfar-preloader__bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 50% 40%, rgba(45, 90, 39, 0.4) 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 30% 70%, rgba(71, 140, 11, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 70% 30%, rgba(246, 175, 13, 0.08) 0%, transparent 50%),
            linear-gradient(180deg, #0a1a0a 0%, #0d200d 50%, #0a1a0a 100%);
          animation: kfar-bg-breathe 4s ease-in-out infinite;
        }

        @keyframes kfar-bg-breathe {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.85; }
        }

        /* Film grain texture */
        .kfar-preloader__grain {
          position: absolute;
          inset: 0;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
          pointer-events: none;
        }

        /* ─── 3D Stage ─────────────────────────────────────── */
        .kfar-preloader__stage {
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          perspective: 1200px;
          perspective-origin: 50% 45%;
        }

        /* ─── Orbital Rings ────────────────────────────────── */
        .kfar-preloader__orbit {
          position: absolute;
          border-radius: 50%;
          border: 1px solid transparent;
          pointer-events: none;
        }

        .kfar-preloader__orbit--1 {
          width: 200px;
          height: 200px;
          border-color: rgba(246, 175, 13, 0.15);
          transform: rotateX(70deg) rotateZ(0deg);
          animation: kfar-orbit-spin 6s linear infinite;
        }

        .kfar-preloader__orbit--1::before {
          content: '';
          position: absolute;
          top: -4px;
          left: 50%;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #f6af0d;
          box-shadow: 0 0 12px 4px rgba(246, 175, 13, 0.5);
          transform: translateX(-50%);
        }

        .kfar-preloader__orbit--2 {
          width: 260px;
          height: 260px;
          border-color: rgba(71, 140, 11, 0.12);
          transform: rotateX(65deg) rotateZ(60deg);
          animation: kfar-orbit-spin 8s linear infinite reverse;
        }

        .kfar-preloader__orbit--2::before {
          content: '';
          position: absolute;
          top: -3px;
          left: 50%;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #478c0b;
          box-shadow: 0 0 10px 3px rgba(71, 140, 11, 0.5);
          transform: translateX(-50%);
        }

        .kfar-preloader__orbit--3 {
          width: 320px;
          height: 320px;
          border-color: rgba(246, 175, 13, 0.06);
          transform: rotateX(75deg) rotateZ(120deg);
          animation: kfar-orbit-spin 12s linear infinite;
        }

        .kfar-preloader__orbit--3::before {
          content: '';
          position: absolute;
          top: -2.5px;
          left: 50%;
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(246, 175, 13, 0.6);
          box-shadow: 0 0 8px 2px rgba(246, 175, 13, 0.3);
          transform: translateX(-50%);
        }

        @keyframes kfar-orbit-spin {
          from { transform: rotateX(70deg) rotateZ(0deg); }
          to   { transform: rotateX(70deg) rotateZ(360deg); }
        }

        /* ─── Particles ────────────────────────────────────── */
        .kfar-preloader__particles {
          position: absolute;
          width: 300px;
          height: 300px;
          pointer-events: none;
        }

        .kfar-preloader__particle {
          position: absolute;
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: rgba(246, 175, 13, 0.6);
          top: 50%;
          left: 50%;
          animation: kfar-particle-float 3s ease-in-out infinite;
          animation-delay: calc(var(--i) * 0.35s);
        }

        @keyframes kfar-particle-float {
          0%, 100% {
            transform: translate(0, 0) scale(0);
            opacity: 0;
          }
          20% {
            opacity: 1;
            transform: translate(
              calc(cos(calc(var(--i) * 45deg)) * 60px),
              calc(sin(calc(var(--i) * 45deg)) * 60px)
            ) scale(1);
          }
          80% {
            opacity: 0.5;
            transform: translate(
              calc(cos(calc(var(--i) * 45deg)) * 120px),
              calc(sin(calc(var(--i) * 45deg)) * 120px)
            ) scale(0.5);
          }
          100% {
            transform: translate(
              calc(cos(calc(var(--i) * 45deg)) * 140px),
              calc(sin(calc(var(--i) * 45deg)) * 140px)
            ) scale(0);
            opacity: 0;
          }
        }

        /* ─── Logo ─────────────────────────────────────────── */
        .kfar-preloader__logo-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 120px;
          height: 120px;
          animation: kfar-logo-float 3s ease-in-out infinite;
          transform-style: preserve-3d;
        }

        @keyframes kfar-logo-float {
          0%, 100% {
            transform: translateZ(0px) rotateY(0deg) translateY(0px);
          }
          25% {
            transform: translateZ(30px) rotateY(3deg) translateY(-8px);
          }
          50% {
            transform: translateZ(50px) rotateY(0deg) translateY(-12px);
          }
          75% {
            transform: translateZ(30px) rotateY(-3deg) translateY(-8px);
          }
        }

        /* Glow behind logo */
        .kfar-preloader__glow {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(246, 175, 13, 0.3) 0%, rgba(246, 175, 13, 0.1) 40%, transparent 70%);
          animation: kfar-glow-pulse 2s ease-in-out infinite;
          filter: blur(10px);
        }

        @keyframes kfar-glow-pulse {
          0%, 100% { transform: scale(1); opacity: 0.6; }
          50% { transform: scale(1.3); opacity: 1; }
        }

        .kfar-preloader__logo {
          position: relative;
          width: 80px;
          height: 80px;
          object-fit: contain;
          z-index: 2;
          filter: drop-shadow(0 0 20px rgba(246, 175, 13, 0.4));
          animation: kfar-logo-breathe 2s ease-in-out infinite;
        }

        @keyframes kfar-logo-breathe {
          0%, 100% { transform: scale(1); filter: drop-shadow(0 0 20px rgba(246, 175, 13, 0.4)); }
          50% { transform: scale(1.05); filter: drop-shadow(0 0 30px rgba(246, 175, 13, 0.6)); }
        }

        /* ─── Text ─────────────────────────────────────────── */
        .kfar-preloader__text {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-top: 28px;
          animation: kfar-text-reveal 1s ease-out 0.3s both;
        }

        @keyframes kfar-text-reveal {
          from {
            opacity: 0;
            transform: translateY(15px) translateZ(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateZ(0);
          }
        }

        .kfar-preloader__brand {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 32px;
          font-weight: 800;
          letter-spacing: 8px;
          color: #f6af0d;
          text-shadow: 0 0 30px rgba(246, 175, 13, 0.3);
        }

        .kfar-preloader__tagline {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 11px;
          font-weight: 400;
          letter-spacing: 2px;
          color: rgba(255, 255, 255, 0.4);
          margin-top: 6px;
          animation: kfar-tagline-reveal 1s ease-out 0.8s both;
        }

        @keyframes kfar-tagline-reveal {
          from { opacity: 0; letter-spacing: 6px; }
          to { opacity: 1; letter-spacing: 2px; }
        }

        /* ─── Progress Bar ─────────────────────────────────── */
        .kfar-preloader__progress {
          width: 120px;
          height: 2px;
          background: rgba(255, 255, 255, 0.08);
          border-radius: 2px;
          margin-top: 32px;
          overflow: hidden;
          animation: kfar-progress-reveal 0.6s ease-out 1s both;
        }

        @keyframes kfar-progress-reveal {
          from { opacity: 0; width: 0; }
          to { opacity: 1; width: 120px; }
        }

        .kfar-preloader__progress-bar {
          height: 100%;
          border-radius: 2px;
          background: linear-gradient(90deg, #478c0b, #f6af0d, #478c0b);
          background-size: 200% 100%;
          animation:
            kfar-progress-fill 2.5s ease-in-out infinite,
            kfar-progress-shimmer 1.5s ease-in-out infinite;
        }

        @keyframes kfar-progress-fill {
          0%   { width: 0%; }
          50%  { width: 80%; }
          100% { width: 100%; }
        }

        @keyframes kfar-progress-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        /* ─── Reduced Motion ───────────────────────────────── */
        @media (prefers-reduced-motion: reduce) {
          .kfar-preloader__orbit,
          .kfar-preloader__logo-wrap,
          .kfar-preloader__logo,
          .kfar-preloader__glow,
          .kfar-preloader__particle,
          .kfar-preloader__bg {
            animation: none !important;
          }
          .kfar-preloader__orbit { opacity: 0.3; }
          .kfar-preloader__logo-wrap { transform: none; }
          .kfar-preloader__progress-bar {
            animation: kfar-progress-fill 2.5s ease-in-out infinite;
          }
        }
      `}</style>
    </div>
  );
}
