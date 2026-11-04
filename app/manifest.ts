import type { MetadataRoute } from 'next';

import { PLAY_URL, ANDROID_PACKAGE } from '@/lib/links';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'فاترينة',
    short_name: 'فاترينة',
    description: 'براندات ومعارض ومخازن ومحلات مصرية في مكان واحد، والدفع كاش عند الاستلام.',
    lang: 'ar',
    dir: 'rtl',
    start_url: '/',
    display: 'standalone',
    background_color: '#fefcf7',
    theme_color: '#fefcf7',
    icons: [{ src: '/brand/fatrina-icon.png', sizes: '1024x1024', type: 'image/png', purpose: 'any' }],
    related_applications: [{ platform: 'play', url: PLAY_URL, id: ANDROID_PACKAGE }],
    prefer_related_applications: false,
  };
}
