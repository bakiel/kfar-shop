import type { Metadata } from "next";
import { Inter, Rubik, Space_Grotesk, Fraunces } from "next/font/google";
import "./globals.css";
import "../styles/voice-button.css";
import { CartProvider } from "@/lib/context/CartContext";
import { LanguageProvider } from "@/lib/context/LanguageContext";
import { AuthProvider } from "@/lib/context/AuthContext";
import ClientLayout from "@/components/ClientLayout";
import ErrorBoundary from "@/components/ErrorBoundary";
import FaviconMeta from "@/components/FaviconMeta";

// Premium Display Font - Fraunces (organic, warm, artisanal feel)
// Perfect for headlines, gives that handcrafted village marketplace vibe
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800', '900'],
});

// Body Font - Inter (ultra-readable, professional)
// Industry standard for readability at all sizes
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

// Hebrew Font - Rubik (excellent Hebrew support, modern)
// Best-in-class Hebrew typography with personality
const rubik = Rubik({
  subsets: ['latin', 'hebrew'],
  variable: '--font-hebrew',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900'],
});

// Accent Font - Space Grotesk (technical, for prices/buttons/badges)
// Adds modern edge for UI elements
const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-accent',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: "KFAR Marketplace - Village of Peace",
  description: "Authentic vegan products and services from the Village of Peace community in Dimona, Israel",
  openGraph: {
    title: "KFAR Marketplace - Village of Peace",
    description: "Authentic vegan products and services from the Village of Peace community in Dimona, Israel",
    url: 'https://kfar-final.vercel.app',
    siteName: 'KFAR Marketplace',
    images: [
      {
        url: '/images/logos/kfar_logo_africa_heritage.png',
        width: 1200,
        height: 630,
        alt: 'KFAR Marketplace - Village of Peace',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "KFAR Marketplace - Village of Peace",
    description: "Authentic vegan products and services from the Village of Peace community",
    images: ['/images/logos/kfar_logo_africa_heritage.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <FaviconMeta />
      </head>
      <body
        className={`${fraunces.variable} ${inter.variable} ${rubik.variable} ${spaceGrotesk.variable} antialiased`}
      >
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <ErrorBoundary>
                <ClientLayout>
                  {children}
                </ClientLayout>
              </ErrorBoundary>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}