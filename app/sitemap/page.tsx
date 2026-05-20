import Link from 'next/link';
import Layout from '@/components/layout/Layout';

const sections = [
  {
    title: 'Shop',
    links: [
      { href: '/marketplace', label: 'Marketplace' },
      { href: '/vendors', label: 'Vendors' },
      { href: '/bundles', label: 'Bundles and offers' },
      { href: '/services', label: 'Services' },
    ],
  },
  {
    title: 'Account Access',
    links: [
      { href: '/login-portal', label: 'Account access' },
      { href: '/customer/login?role=customer', label: 'Customer login' },
      { href: '/vendor/login', label: 'Vendor portal' },
      { href: '/admin/login', label: 'Admin access' },
    ],
  },
  {
    title: 'Support',
    links: [
      { href: '/support', label: 'Help center' },
      { href: '/faq', label: 'FAQs' },
      { href: '/contact', label: 'Contact us' },
      { href: '/shipping', label: 'Shipping info' },
      { href: '/returns', label: 'Returns' },
    ],
  },
  {
    title: 'Community',
    links: [
      { href: '/about', label: 'About KFAR' },
      { href: '/join-kfar', label: 'Join KFAR' },
      { href: '/join-as-customer', label: 'Join as a customer' },
      { href: '/vendor/onboarding', label: 'Become a vendor' },
    ],
  },
];

export default function SitemapPage() {
  return (
    <Layout>
      <section className="bg-[#fef9ef] py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-display text-4xl font-bold text-[#3a3a1d]">Sitemap</h1>
            <p className="mt-3 text-gray-600">
              Quick access to KFAR Marketplace pages and account portals.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sections.map((section) => (
              <section key={section.title} className="rounded-lg border border-gray-100 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-[#3a3a1d]">{section.title}</h2>
                <ul className="mt-4 space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-gray-600 transition-colors hover:text-[#478c0b]">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
