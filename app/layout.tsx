import type { Metadata, Viewport } from 'next';
import { Cairo, Lalezar } from 'next/font/google';

import { AppBanner } from '@/components/AppBanner';
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { SITE_URL } from '@/lib/links';

import './globals.css';

// Cairo is the app's font; Lalezar is shop-sign lettering, used only for big headlines.
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
  description: 'تسوّق من براندات ومعارض ومخازن ومحلات مصرية في مكان واحد. أسعار واضحة، توصيل لكل المحافظات، والدفع كاش عند الاستلام.',
  applicationName: 'فاترينة',
  openGraph: { type: 'website', locale: 'ar_EG', siteName: 'فاترينة' },
  twitter: { card: 'summary_large_image' },
  other: { 'google-play-app': 'app-id=app.fatrina' },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fefcf7' },
    { media: '(prefers-color-scheme: dark)', color: '#17110d' },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${lalezar.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent">
          تخطّى للمحتوى
        </a>
        <AppBanner />
        <Header />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
