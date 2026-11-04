import type { Metadata, Viewport } from 'next';
import { Cairo, Lalezar } from 'next/font/google';

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { ScrollToTop } from '@/components/ScrollToTop';
import { getCategories } from '@/lib/api';
import { SITE_URL } from '@/lib/links';

import './globals.css';

// Cairo is the app's font; Lalezar is shop-sign lettering, used only for the home banner headlines.
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
});
const lalezar = Lalezar({
  subsets: ['arabic', 'latin'],
  weight: '400',
  variable: '--font-lalezar',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'فاترينة | براندات ومعارض ومخازن ومحلات مصر في مكان واحد', template: '%s | فاترينة' },
  description: 'تسوّق من براندات ومعارض ومخازن ومحلات مصرية في مكان واحد. اطلب من الموقع أو من التطبيق، أسعار واضحة، توصيل لكل المحافظات، والدفع كاش عند الاستلام.',
  applicationName: 'فاترينة',
  openGraph: { type: 'website', locale: 'ar_EG', siteName: 'فاترينة' },
  twitter: { card: 'summary_large_image' },
  other: { 'google-play-app': 'app-id=app.fatrina' },
};

// White on every device, dark mode included.
export const viewport: Viewport = {
  themeColor: '#ffffff',
  colorScheme: 'light',
  // Android: the on-screen keyboard shrinks the layout, so full-screen panels (the chat) keep their composer visible.
  interactiveWidget: 'resizes-content',
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Sections for the header's "تسوّق" menu and the footer (cached with the rest of the API).
  const categories = await getCategories();
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${lalezar.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <ScrollToTop />
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:inset-s-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent">
          تخطّى للمحتوى
        </a>
        <Header categories={categories} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer categories={categories} />
      </body>
    </html>
  );
}
