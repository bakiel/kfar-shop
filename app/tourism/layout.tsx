import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visit Village of Peace - Tourism & Cultural Experiences | KFAR",
  description: "Plan your visit to the Village of Peace in Dimona. Experience vegan cooking workshops, heritage tours, organic farming, and authentic African Hebrew culture.",
  keywords: "Village of Peace tourism, Dimona tours, vegan cooking workshop, Kfar culture, Israel cultural tourism",
  openGraph: {
    title: "Visit Village of Peace - Authentic Cultural Tourism",
    description: "Immerse yourself in 55 years of heritage, taste delicious vegan cuisine, and experience sustainable living in Israel's most unique community.",
    images: ['/images/community/village_of_peace_community_authentic_dimona_israel_14.jpg'],
  },
};

export default function TourismLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}