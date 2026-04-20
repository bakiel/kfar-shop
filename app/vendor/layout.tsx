import VendorLayoutClient from './VendorLayoutClient';

export const dynamic = 'force-dynamic';

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return <VendorLayoutClient>{children}</VendorLayoutClient>;
}
