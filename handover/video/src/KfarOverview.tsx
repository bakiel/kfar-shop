import {
  useCurrentFrame,
  interpolate,
  Sequence,
  Audio,
  staticFile,
  Img,
  spring,
  useVideoConfig,
} from "remotion";

// ── KFAR Brand Colors ────────────────────────────────────────
const COLORS = {
  greenDeep: "#2D5A27",
  greenLeaf: "#478c0b",
  goldPremium: "#C4A265",
  cream: "#F5F0E8",
  darkBg: "#0a1f0a",
  textWhite: "#FDFBF7",
  cloudflareOrange: "#F6821F",
};

// ── SLIDE TIMINGS (from SRT timestamps × 30fps) ─────────────
// Precisely synced to narration audio
const T = {
  // S1: Cover — "Welcome to KFAR" → "Let me walk you through"
  s1: { from: 0, dur: 762 },
  // S2: Stats — "First, the technology" → "205 static pages"
  s2: { from: 762, dur: 762 },
  // S3: Vendors — "Your six active vendors" → "113 products total"
  s3: { from: 1524, dur: 560 },
  // S4: Vendor Dashboard — "Each vendor has their own" → "management suite"
  s4: { from: 2084, dur: 421 },
  // S5: Payments — "For payments" → "production credentials"
  s5: { from: 2505, dur: 752 },
  // S6: Order Flow — "The order flow" → "loyalty points are earned"
  s6: { from: 3257, dur: 455 },
  // S7: Email — "For email" → "both English and Hebrew"
  s7: { from: 3712, dur: 1024 },
  // S8: Admin & CRM — "The admin dashboard" → "full interaction histories"
  s8: { from: 4736, dur: 1548 },
  // S9: Loyalty — "The loyalty system" → "discount coupons"
  s9: { from: 6284, dur: 701 },
  // S10: Cloudflare — "For performance, KFAR uses Cloudflare" → "no matter where"
  s10: { from: 6985, dur: 984 },
  // S11: Language & AI — "The platform supports" → "zero-downtime"
  s11: { from: 7969, dur: 873 },
  // S12: Closing — "That's KFAR Marketplace" → "Thank you"
  s12: { from: 8842, dur: 458 },
};

// ── Background Image with Ken Burns ─────────────────────────
const BgImage: React.FC<{
  src: string;
  motion?: "zoomIn" | "zoomOut" | "panLeft" | "panRight";
  brightness?: number;
}> = ({ src, motion = "zoomIn", brightness = 0.35 }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = frame / durationInFrames;

  const transforms: Record<string, string> = {
    zoomIn: `scale(${1 + p * 0.15})`,
    zoomOut: `scale(${1.15 - p * 0.1})`,
    panLeft: `scale(1.15) translateX(${p * 60}px)`,
    panRight: `scale(1.15) translateX(${-p * 60}px)`,
  };

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Img
        src={staticFile(src)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: transforms[motion],
          filter: `brightness(${brightness}) saturate(1.1)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(10,31,10,0.6) 0%, rgba(10,31,10,0.3) 40%, rgba(10,31,10,0.7) 100%)",
        }}
      />
    </div>
  );
};

// ── Animated Text ───────────────────────────────────────────
const FadeInText: React.FC<{
  children: React.ReactNode;
  delay?: number;
  style?: React.CSSProperties;
}> = ({ children, delay = 0, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const opacity = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });

  const y = interpolate(frame - delay, [0, 20], [40, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        opacity: Math.max(0, opacity),
        transform: `translateY(${Math.max(0, y)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// ── Gold Divider Line ───────────────────────────────────────
const GoldLine: React.FC<{ delay?: number; width?: number }> = ({
  delay = 10,
  width = 200,
}) => {
  const frame = useCurrentFrame();
  const lineWidth = interpolate(frame - delay, [0, 20], [0, width], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        width: lineWidth,
        height: 3,
        background: `linear-gradient(90deg, transparent, ${COLORS.goldPremium}, transparent)`,
        margin: "20px auto",
      }}
    />
  );
};

// ── Stat Card ───────────────────────────────────────────────
const StatCard: React.FC<{
  number: string;
  label: string;
  delay: number;
}> = ({ number, label, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame: frame - delay, fps, config: { damping: 12 } });

  return (
    <div
      style={{
        opacity: Math.max(0, scale),
        transform: `scale(${Math.max(0.5, Math.min(1, scale))})`,
        background: "rgba(255,255,255,0.08)",
        border: `1px solid rgba(196,162,101,0.2)`,
        borderRadius: 20,
        padding: "30px 40px",
        textAlign: "center",
        backdropFilter: "blur(10px)",
        minWidth: 200,
      }}
    >
      <div
        style={{
          fontSize: 72,
          fontWeight: 900,
          color: COLORS.goldPremium,
          lineHeight: 1,
        }}
      >
        {number}
      </div>
      <div
        style={{
          fontSize: 22,
          color: "rgba(255,255,255,0.7)",
          marginTop: 8,
          textTransform: "uppercase",
          letterSpacing: 2,
        }}
      >
        {label}
      </div>
    </div>
  );
};

// ── Vendor Card ─────────────────────────────────────────────
const VendorCard: React.FC<{
  name: string;
  products: number;
  logo: string;
  delay: number;
}> = ({ name, products, logo, delay }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });

  return (
    <div
      style={{
        opacity: Math.max(0, opacity),
        display: "flex",
        alignItems: "center",
        gap: 20,
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 16,
        padding: "16px 24px",
        width: 340,
      }}
    >
      <Img
        src={staticFile(logo)}
        style={{
          width: 60,
          height: 60,
          borderRadius: 12,
          objectFit: "cover",
          border: "2px solid rgba(196,162,101,0.3)",
        }}
      />
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: "white" }}>
          {name}
        </div>
        <div style={{ fontSize: 16, color: COLORS.goldPremium }}>
          {products} products
        </div>
      </div>
    </div>
  );
};

// ── Feature Item ────────────────────────────────────────────
const FeatureItem: React.FC<{
  icon: string;
  title: string;
  desc: string;
  delay: number;
  iconBg?: string;
}> = ({ icon, title, desc, delay, iconBg }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const opacity = spring({
    frame: frame - delay,
    fps,
    config: { damping: 200 },
  });

  return (
    <div
      style={{
        opacity: Math.max(0, opacity),
        display: "flex",
        alignItems: "flex-start",
        gap: 20,
        marginBottom: 24,
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: 12,
          background: iconBg || `linear-gradient(135deg, ${COLORS.greenDeep}, ${COLORS.greenLeaf})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 22,
          fontWeight: 800,
          color: "white",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 26, fontWeight: 700, color: "white" }}>
          {title}
        </div>
        <div
          style={{
            fontSize: 20,
            color: "rgba(255,255,255,0.6)",
            marginTop: 4,
          }}
        >
          {desc}
        </div>
      </div>
    </div>
  );
};

// ── Flow Step ───────────────────────────────────────────────
const FlowStep: React.FC<{
  label: string;
  sub: string;
  delay: number;
  isLast?: boolean;
}> = ({ label, sub, delay, isLast }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scale = spring({ frame: frame - delay, fps, config: { damping: 15 } });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        opacity: Math.max(0, scale),
        transform: `scale(${Math.max(0.8, Math.min(1, scale))})`,
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.08)",
          border: `1px solid ${COLORS.greenLeaf}`,
          borderRadius: 14,
          padding: "14px 24px",
          textAlign: "center",
          minWidth: 130,
        }}
      >
        <div style={{ fontSize: 20, fontWeight: 700, color: "white" }}>
          {label}
        </div>
        <div style={{ fontSize: 14, color: COLORS.goldPremium }}>{sub}</div>
      </div>
      {!isLast && (
        <div style={{ fontSize: 30, color: COLORS.goldPremium }}>&#8594;</div>
      )}
    </div>
  );
};

// ── SLIDE DEFINITIONS ───────────────────────────────────────

// S1: Cover (0:00 - 0:25)
const SlideCover: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const logoScale = spring({
    frame: frame - 10,
    fps,
    config: { damping: 12 },
  });

  return (
    <div style={{ width: 1920, height: 1080, position: "relative" }}>
      <BgImage src="images/community-2.jpg" motion="zoomIn" brightness={0.25} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        <div
          style={{
            transform: `scale(${Math.max(0, logoScale)})`,
            marginBottom: 30,
          }}
        >
          <Img
            src={staticFile("images/kfar-logo-gold.png")}
            style={{ height: 160 }}
          />
        </div>
        <GoldLine delay={20} width={300} />
        <FadeInText
          delay={25}
          style={{
            fontSize: 100,
            fontWeight: 900,
            color: "white",
            textAlign: "center",
            textShadow: "0 6px 40px rgba(0,0,0,0.8)",
            letterSpacing: -2,
          }}
        >
          KFAR Marketplace
        </FadeInText>
        <FadeInText
          delay={35}
          style={{
            fontSize: 32,
            color: COLORS.goldPremium,
            textTransform: "uppercase",
            letterSpacing: 8,
            marginTop: 20,
          }}
        >
          Platform Overview
        </FadeInText>
        <FadeInText
          delay={50}
          style={{
            fontSize: 24,
            color: "rgba(255,255,255,0.5)",
            marginTop: 40,
            textAlign: "center",
            lineHeight: 1.6,
          }}
        >
          Multi-vendor e-commerce for the Village of Peace community
        </FadeInText>
      </div>
    </div>
  );
};

// S2: Stats (0:25 - 0:51)
const SlideStats: React.FC = () => (
  <div style={{ width: 1920, height: 1080, position: "relative" }}>
    <BgImage src="images/community-1.jpg" motion="panRight" brightness={0.3} />
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
        padding: 80,
      }}
    >
      <FadeInText
        delay={5}
        style={{
          fontSize: 64,
          fontWeight: 800,
          color: "white",
          textShadow: "0 4px 30px rgba(0,0,0,0.6)",
          marginBottom: 60,
        }}
      >
        The Technology
      </FadeInText>
      <div style={{ display: "flex", gap: 40 }}>
        <StatCard number="24" label="DB Tables" delay={15} />
        <StatCard number="133" label="API Routes" delay={25} />
        <StatCard number="205" label="Pages" delay={35} />
        <StatCard number="6" label="Vendors" delay={45} />
      </div>
      <FadeInText
        delay={55}
        style={{
          marginTop: 40,
          fontSize: 26,
          color: "rgba(255,255,255,0.5)",
          textAlign: "center",
        }}
      >
        Next.js 15 | PostgreSQL | JWT Auth | Tailwind CSS
      </FadeInText>
    </div>
  </div>
);

// S3: Vendors (0:51 - 1:09)
const SlideVendors: React.FC = () => (
  <div style={{ width: 1920, height: 1080, position: "relative" }}>
    <BgImage src="images/community-5.jpg" motion="panLeft" brightness={0.25} />
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        zIndex: 1,
        padding: "60px 120px",
      }}
    >
      <FadeInText
        delay={5}
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: "white",
          marginBottom: 50,
        }}
      >
        6 Community Vendors
      </FadeInText>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 20,
          maxWidth: 800,
        }}
      >
        <VendorCard name="Teva Deli" products={32} logo="images/teva-deli.jpg" delay={10} />
        <VendorCard name="Queen's Cuisine" products={25} logo="images/queens-cuisine.jpg" delay={18} />
        <VendorCard name="People's Store" products={18} logo="images/people-store.jpg" delay={26} />
        <VendorCard name="Garden of Light" products={14} logo="images/garden-of-light.jpg" delay={34} />
        <VendorCard name="Gahn Delight" products={12} logo="images/gahn-delight.jpg" delay={42} />
        <VendorCard name="VOP Shop" products={12} logo="images/vop-shop.jpg" delay={50} />
      </div>
      <FadeInText
        delay={58}
        style={{ fontSize: 28, color: COLORS.goldPremium, marginTop: 30 }}
      >
        113 products total
      </FadeInText>
    </div>
  </div>
);

// S4: Vendor Dashboard (1:09 - 1:24)
const SlideVendorDash: React.FC = () => (
  <div style={{ width: 1920, height: 1080, position: "relative" }}>
    <BgImage src="images/community-6.jpg" motion="zoomIn" brightness={0.22} />
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        zIndex: 1,
        padding: "80px 120px",
      }}
    >
      <FadeInText
        delay={5}
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: "white",
          marginBottom: 50,
        }}
      >
        Vendor Dashboard
      </FadeInText>
      <div style={{ display: "flex", gap: 60 }}>
        <div style={{ flex: 1 }}>
          <FeatureItem icon="D" title="Dashboard" desc="Sales, revenue & customer insights" delay={10} />
          <FeatureItem icon="P" title="Products" desc="CRUD, stock, pricing, images" delay={18} />
          <FeatureItem icon="O" title="Orders" desc="Accept, process, ready, complete" delay={26} />
        </div>
        <div style={{ flex: 1 }}>
          <FeatureItem icon="Q" title="QR Codes" desc="Products, stores, promos" delay={34} />
          <FeatureItem icon="A" title="Analytics" desc="Revenue trends, top products" delay={42} />
          <FeatureItem icon="S" title="Settings" desc="Store name, hours, delivery" delay={50} />
        </div>
      </div>
    </div>
  </div>
);

// S5: Payments (1:24 - 1:49)
const SlidePayments: React.FC = () => (
  <div style={{ width: 1920, height: 1080, position: "relative" }}>
    <BgImage src="images/community-4.jpg" motion="panRight" brightness={0.25} />
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        zIndex: 1,
        padding: "80px 120px",
      }}
    >
      <FadeInText
        delay={5}
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: "white",
          marginBottom: 50,
        }}
      >
        Payment Methods
      </FadeInText>
      <div style={{ display: "flex", gap: 30 }}>
        {[
          { name: "Cash on Delivery", status: "Active", color: COLORS.greenLeaf },
          { name: "Braysheet Token", status: "Active", color: COLORS.greenLeaf },
          { name: "Bank Transfer", status: "Active", color: COLORS.greenLeaf },
          { name: "Credit Card (YPAY)", status: "Sandbox", color: COLORS.goldPremium },
        ].map((pm, i) => (
          <FadeInText
            key={pm.name}
            delay={15 + i * 15}
            style={{
              background: "rgba(255,255,255,0.06)",
              border: `1px solid rgba(255,255,255,0.1)`,
              borderRadius: 16,
              padding: "30px 32px",
              flex: 1,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 700, color: "white" }}>
              {pm.name}
            </div>
            <div
              style={{
                fontSize: 16,
                color: pm.color,
                marginTop: 8,
                textTransform: "uppercase",
                letterSpacing: 2,
              }}
            >
              {pm.status}
            </div>
          </FadeInText>
        ))}
      </div>
    </div>
  </div>
);

// S6: Order Flow (1:49 - 2:04)
const SlideOrderFlow: React.FC = () => (
  <div style={{ width: 1920, height: 1080, position: "relative" }}>
    <BgImage src="images/community-7.jpg" motion="zoomOut" brightness={0.2} />
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1,
        padding: 80,
      }}
    >
      <FadeInText
        delay={5}
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: "white",
          marginBottom: 60,
        }}
      >
        Order Lifecycle
      </FadeInText>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
        <FlowStep label="Customer" sub="Places Order" delay={10} />
        <FlowStep label="Payment" sub="Processed" delay={18} />
        <FlowStep label="Vendor" sub="Accepts" delay={26} />
        <FlowStep label="Processing" sub="Preparing" delay={34} />
        <FlowStep label="Ready" sub="For Pickup" delay={42} />
        <FlowStep label="Completed" sub="Points Earned" delay={50} isLast />
      </div>
    </div>
  </div>
);

// S7: Email System (2:04 - 2:38)
const SlideEmail: React.FC = () => (
  <div style={{ width: 1920, height: 1080, position: "relative" }}>
    <BgImage src="images/community-3.jpg" motion="panLeft" brightness={0.2} />
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        zIndex: 1,
        padding: "60px 120px",
      }}
    >
      <FadeInText
        delay={5}
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: "white",
          marginBottom: 40,
        }}
      >
        Email &amp; Notifications
      </FadeInText>
      <div style={{ display: "flex", gap: 60 }}>
        <div style={{ flex: 1 }}>
          <FadeInText delay={10} style={{ fontSize: 28, fontWeight: 700, color: COLORS.goldPremium, marginBottom: 20 }}>
            3 Email Accounts
          </FadeInText>
          <FeatureItem icon="N" title="noreply@kfarapp.com" desc="Transactional emails" delay={15} />
          <FeatureItem icon="A" title="admin@kfarapp.com" desc="Admin inbox" delay={25} />
          <FeatureItem icon="S" title="support@kfarapp.com" desc="Customer support" delay={35} />
        </div>
        <div style={{ flex: 1 }}>
          <FadeInText delay={45} style={{ fontSize: 28, fontWeight: 700, color: COLORS.goldPremium, marginBottom: 20 }}>
            10 Email Templates
          </FadeInText>
          <FadeInText delay={50} style={{ fontSize: 20, color: "rgba(255,255,255,0.7)", lineHeight: 1.8 }}>
            Order Confirmation | Status Update | New Order Alert | Welcome Customer | Points Earned | Tier Upgrade | Password Reset | Promotion Alert | Welcome Vendor | QR Loyalty Card
          </FadeInText>
          <FadeInText delay={65} style={{ marginTop: 20 }}>
            <div style={{ display: "flex", gap: 16 }}>
              {["WhatsApp", "Email", "In-App"].map((ch) => (
                <div
                  key={ch}
                  style={{
                    background: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 10,
                    padding: "10px 20px",
                    fontSize: 18,
                    color: "white",
                    fontWeight: 600,
                  }}
                >
                  {ch}
                </div>
              ))}
            </div>
          </FadeInText>
        </div>
      </div>
    </div>
  </div>
);

// S8: Admin & CRM (2:38 - 3:30)
const SlideAdmin: React.FC = () => (
  <div style={{ width: 1920, height: 1080, position: "relative" }}>
    <BgImage src="images/community-1.jpg" motion="zoomIn" brightness={0.2} />
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        zIndex: 1,
        padding: "60px 120px",
      }}
    >
      <FadeInText
        delay={5}
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: "white",
          marginBottom: 40,
        }}
      >
        Admin Dashboard &amp; CRM
      </FadeInText>
      <div style={{ display: "flex", gap: 60 }}>
        <div style={{ flex: 1 }}>
          <FadeInText delay={10} style={{ fontSize: 26, fontWeight: 700, color: COLORS.goldPremium, marginBottom: 16 }}>
            10 Admin Sections
          </FadeInText>
          {[
            "Dashboard", "Vendors", "Orders", "CRM",
            "Bundles", "Accounts", "Promotions",
            "Notifications", "Drivers", "Settings",
          ].map((s, i) => (
            <FadeInText
              key={s}
              delay={15 + i * 4}
              style={{
                fontSize: 22,
                color: "white",
                padding: "6px 0",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {s}
            </FadeInText>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <FadeInText delay={55} style={{ fontSize: 26, fontWeight: 700, color: COLORS.goldPremium, marginBottom: 16 }}>
            CRM Capabilities
          </FadeInText>
          <FeatureItem icon="C" title="Customer Profiles" desc="Orders, points, activity" delay={60} />
          <FeatureItem icon="S" title="Segmentation" desc="Auto/manual targeting" delay={70} />
          <FeatureItem icon="A" title="Activity Log" desc="Full interaction timeline" delay={80} />
          <FeatureItem icon="B" title="Broadcast" desc="Mass notifications to all" delay={90} />
        </div>
      </div>
    </div>
  </div>
);

// S9: Loyalty (3:30 - 3:53)
const SlideLoyalty: React.FC = () => (
  <div style={{ width: 1920, height: 1080, position: "relative" }}>
    <BgImage src="images/community-5.jpg" motion="panRight" brightness={0.22} />
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        zIndex: 1,
        padding: "80px 120px",
      }}
    >
      <FadeInText
        delay={5}
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: "white",
          marginBottom: 50,
        }}
      >
        Loyalty &amp; Rewards
      </FadeInText>
      <div style={{ display: "flex", gap: 40 }}>
        {[
          { tier: "Bronze", range: "0-499 pts", bonus: "Base", color: "#CD7F32" },
          { tier: "Silver", range: "500-1499 pts", bonus: "5%", color: "#C0C0C0" },
          { tier: "Gold", range: "1500+ pts", bonus: "10%", color: COLORS.goldPremium },
        ].map((t, i) => (
          <FadeInText
            key={t.tier}
            delay={10 + i * 12}
            style={{
              flex: 1,
              background: "rgba(255,255,255,0.06)",
              border: `2px solid ${t.color}`,
              borderRadius: 20,
              padding: "40px 30px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 48,
                fontWeight: 900,
                color: t.color,
                marginBottom: 10,
              }}
            >
              {t.tier}
            </div>
            <div
              style={{
                fontSize: 24,
                color: "rgba(255,255,255,0.7)",
                marginBottom: 8,
              }}
            >
              {t.range}
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "white" }}>
              {t.bonus} bonus
            </div>
          </FadeInText>
        ))}
      </div>
      <FadeInText delay={50} style={{ fontSize: 24, color: "rgba(255,255,255,0.5)", marginTop: 40, textAlign: "center" }}>
        50 welcome points on registration | Points on every purchase | Redeem for discount coupons
      </FadeInText>
    </div>
  </div>
);

// S10: Cloudflare Performance (3:53 - 4:26)
const SlideCloudflare: React.FC = () => (
  <div style={{ width: 1920, height: 1080, position: "relative" }}>
    <BgImage src="images/community-4.jpg" motion="zoomOut" brightness={0.18} />
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        zIndex: 1,
        padding: "60px 120px",
      }}
    >
      <FadeInText
        delay={5}
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: "white",
          marginBottom: 16,
        }}
      >
        Performance &amp; Security
      </FadeInText>
      <FadeInText
        delay={10}
        style={{
          fontSize: 28,
          color: COLORS.cloudflareOrange,
          fontWeight: 700,
          marginBottom: 40,
          letterSpacing: 2,
        }}
      >
        Powered by Cloudflare
      </FadeInText>
      <div style={{ display: "flex", gap: 60 }}>
        <div style={{ flex: 1 }}>
          <FeatureItem icon="S" title="SSL Encryption" desc="End-to-end HTTPS security" delay={15} iconBg={`linear-gradient(135deg, ${COLORS.cloudflareOrange}, #E55300)`} />
          <FeatureItem icon="D" title="DDoS Protection" desc="Enterprise-grade defense" delay={25} iconBg={`linear-gradient(135deg, ${COLORS.cloudflareOrange}, #E55300)`} />
          <FeatureItem icon="C" title="Global CDN" desc="Edge caching worldwide" delay={35} iconBg={`linear-gradient(135deg, ${COLORS.cloudflareOrange}, #E55300)`} />
        </div>
        <div style={{ flex: 1 }}>
          <FeatureItem icon="G" title="Gzip Compression" desc="87% size reduction" delay={45} iconBg={`linear-gradient(135deg, ${COLORS.cloudflareOrange}, #E55300)`} />
          <FeatureItem icon="R" title="Rate Limiting" desc="Auth endpoint protection" delay={55} iconBg={`linear-gradient(135deg, ${COLORS.cloudflareOrange}, #E55300)`} />
          <FeatureItem icon="H" title="Security Headers" desc="HSTS + CSP enforced" delay={65} iconBg={`linear-gradient(135deg, ${COLORS.cloudflareOrange}, #E55300)`} />
        </div>
      </div>
      <div style={{ display: "flex", gap: 30, justifyContent: "center", marginTop: 40 }}>
        <StatCard number="87%" label="Compression" delay={75} />
        <StatCard number="365d" label="Asset Cache" delay={80} />
        <StatCard number="5/sec" label="Rate Limit" delay={85} />
      </div>
    </div>
  </div>
);

// S11: Language & AI (4:27 - 4:55)
const SlideLanguage: React.FC = () => (
  <div style={{ width: 1920, height: 1080, position: "relative" }}>
    <BgImage src="images/community-6.jpg" motion="panRight" brightness={0.22} />
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        zIndex: 1,
        padding: "80px 120px",
      }}
    >
      <FadeInText
        delay={5}
        style={{
          fontSize: 56,
          fontWeight: 800,
          color: "white",
          marginBottom: 50,
        }}
      >
        Bilingual &amp; AI Powered
      </FadeInText>
      <div style={{ display: "flex", gap: 60 }}>
        <div style={{ flex: 1 }}>
          <FadeInText delay={10} style={{ fontSize: 28, fontWeight: 700, color: COLORS.goldPremium, marginBottom: 20 }}>
            Hebrew &amp; English
          </FadeInText>
          <FeatureItem icon="T" title="Language Toggle" desc="Switch in header instantly" delay={15} />
          <FeatureItem icon="R" title="RTL Layout" desc="Auto-applied for Hebrew" delay={25} />
          <FeatureItem icon="E" title="Email Templates" desc="All 10 templates bilingual" delay={35} />
        </div>
        <div style={{ flex: 1 }}>
          <FadeInText delay={40} style={{ fontSize: 28, fontWeight: 700, color: COLORS.goldPremium, marginBottom: 20 }}>
            AI Shopping Assistant
          </FadeInText>
          <FeatureItem icon="G" title="Google Gemini" desc="Intelligent product search" delay={45} />
          <FeatureItem icon="V" title="Voice Support" desc="Hebrew & English speech" delay={55} />
          <FeatureItem icon="Z" title="Zero Downtime" desc="Modern DevOps deployment" delay={65} />
        </div>
      </div>
    </div>
  </div>
);

// S12: Closing (4:55 - 5:07)
const SlideClosing: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const logoScale = spring({
    frame: frame - 15,
    fps,
    config: { damping: 12 },
  });

  // Fade out near end
  const fadeOut = interpolate(frame, [durationInFrames - 60, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ width: 1920, height: 1080, position: "relative", opacity: fadeOut }}>
      <BgImage src="images/community-2.jpg" motion="zoomIn" brightness={0.2} />
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        <div
          style={{
            transform: `scale(${Math.max(0, logoScale)})`,
            marginBottom: 30,
          }}
        >
          <Img
            src={staticFile("images/kfar-logo-gold.png")}
            style={{ height: 200 }}
          />
        </div>
        <GoldLine delay={25} width={400} />
        <FadeInText
          delay={30}
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: "white",
            textAlign: "center",
            textShadow: "0 6px 40px rgba(0,0,0,0.8)",
          }}
        >
          Community Powered
        </FadeInText>
        <FadeInText
          delay={45}
          style={{
            fontSize: 32,
            color: COLORS.goldPremium,
            marginTop: 20,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          kfarapp.com
        </FadeInText>
        <FadeInText
          delay={60}
          style={{
            fontSize: 22,
            color: "rgba(255,255,255,0.4)",
            marginTop: 60,
          }}
        >
          Village of Peace | Dimona, Israel | February 2026
        </FadeInText>
      </div>
    </div>
  );
};

// ── MAIN COMPOSITION ────────────────────────────────────────
export const KfarOverview: React.FC = () => {
  return (
    <div
      style={{
        width: 1920,
        height: 1080,
        background: COLORS.darkBg,
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <Audio src={staticFile("narration.mp3")} volume={1} />

      {/* S1: Cover (0:00-0:25) — "Welcome to KFAR Marketplace" */}
      <Sequence from={T.s1.from} durationInFrames={T.s1.dur}>
        <SlideCover />
      </Sequence>

      {/* S2: Stats (0:25-0:51) — "First, the technology" */}
      <Sequence from={T.s2.from} durationInFrames={T.s2.dur}>
        <SlideStats />
      </Sequence>

      {/* S3: Vendors (0:51-1:09) — "Your six active vendors" */}
      <Sequence from={T.s3.from} durationInFrames={T.s3.dur}>
        <SlideVendors />
      </Sequence>

      {/* S4: Vendor Dashboard (1:09-1:24) — "Each vendor has their own" */}
      <Sequence from={T.s4.from} durationInFrames={T.s4.dur}>
        <SlideVendorDash />
      </Sequence>

      {/* S5: Payments (1:24-1:49) — "For payments" */}
      <Sequence from={T.s5.from} durationInFrames={T.s5.dur}>
        <SlidePayments />
      </Sequence>

      {/* S6: Order Flow (1:49-2:04) — "The order flow" */}
      <Sequence from={T.s6.from} durationInFrames={T.s6.dur}>
        <SlideOrderFlow />
      </Sequence>

      {/* S7: Email (2:04-2:38) — "For email" */}
      <Sequence from={T.s7.from} durationInFrames={T.s7.dur}>
        <SlideEmail />
      </Sequence>

      {/* S8: Admin & CRM (2:38-3:30) — "The admin dashboard" */}
      <Sequence from={T.s8.from} durationInFrames={T.s8.dur}>
        <SlideAdmin />
      </Sequence>

      {/* S9: Loyalty (3:30-3:53) — "The loyalty system" */}
      <Sequence from={T.s9.from} durationInFrames={T.s9.dur}>
        <SlideLoyalty />
      </Sequence>

      {/* S10: Cloudflare (3:53-4:26) — "For performance, KFAR uses Cloudflare" */}
      <Sequence from={T.s10.from} durationInFrames={T.s10.dur}>
        <SlideCloudflare />
      </Sequence>

      {/* S11: Language & AI (4:27-4:55) — "The platform supports full Hebrew" */}
      <Sequence from={T.s11.from} durationInFrames={T.s11.dur}>
        <SlideLanguage />
      </Sequence>

      {/* S12: Closing (4:55-5:07) — "That's KFAR Marketplace" */}
      <Sequence from={T.s12.from} durationInFrames={T.s12.dur}>
        <SlideClosing />
      </Sequence>
    </div>
  );
};
