export default function NewStoreBadgeTestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Set demo mode to false for this test page
  if (typeof window !== 'undefined') {
    localStorage.setItem('demoMode', 'false');
  }
  
  return <>{children}</>;
}