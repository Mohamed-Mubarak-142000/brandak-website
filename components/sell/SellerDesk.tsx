import { ClipboardList, FileSpreadsheet, Link2, Megaphone, ShieldCheck, Sparkles, TicketPercent, TrendingUp } from 'lucide-react';

/** What a store gets in the app's seller desk. Facts from the FAQ's "أصحاب المتاجر" answers. */
const FEATURES = [
  {
    icon: ClipboardList,
    title: 'الطلبات على موبايلك',
    body: 'الطلب الجديد بيوصلك بإشعار. أكّده وجهّزه واشحنه وحدّث حالته، والعميل بيتابع كل خطوة.',
  },
  {
    icon: FileSpreadsheet,
    title: 'منتجاتك كلها مرة واحدة',
    body: 'ضيف المنتج بصوره ومقاساته وألوانه ومخزونه، أو املا قالب Excel وارفعه وراجعه قبل ما يتحفظ.',
  },
  {
    icon: Sparkles,
    title: 'اعمل المنتج من صورة',
    body: 'ارفع صورة المنتج والذكاء الاصطناعي يكتب الاسم والوصف والقسم والمقاسات والألوان، وانت تراجع وتحط السعر.',
  },
  {
    icon: TicketPercent,
    title: 'عروض وكوبونات',
    body: 'اعمل خصم لفترة محدودة على منتج، أو شارك في موسم شغال، أو اعمل كود خصم لمتابعينك.',
  },
  {
    icon: Megaphone,
    title: 'إعلانات مميزة',
    body: 'اظهر في أول البحث أو أول القسم أو في «مميز» على الرئيسية، وتابع المشاهدات والضغطات.',
  },
  {
    icon: TrendingUp,
    title: 'الناس بتدوّر على إيه',
    body: 'الكلمات اللي الناس لقيت بيها منتجاتك، واللي بيدوّروا عليه ومش لاقيينه، وتقرير أسبوعي على الإيميل.',
  },
  {
    icon: Link2,
    title: 'لينك لمتجرك والبيكسل',
    body: 'صفحة لمتجرك على الويب تحطها في البايو، واربط Facebook Pixel أو TikTok Pixel عشان تقيس إعلاناتك.',
  },
  {
    icon: ShieldCheck,
    title: 'حماية من الطلبات الوهمية',
    body: 'العميل الجديد بيأكد طلبه بكود على الإيميل، وعلى كل طلب بتشوف استلم كام ورفض كام، وتقدر تحظر اللي بيرفض.',
  },
];

export function SellerDesk() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {FEATURES.map(({ icon: Icon, title, body }) => (
        <li key={title} className="rounded-panel border border-line bg-surface p-5 transition-colors hover:border-line-strong">
          <span className="grid size-12 place-items-center rounded-card bg-accent-soft text-accent">
            <Icon aria-hidden className="size-6" strokeWidth={1.75} />
          </span>
          <h3 className="mt-4 font-extrabold">{title}</h3>
          <p className="mt-1 text-ui text-ink-2">{body}</p>
        </li>
      ))}
    </ul>
  );
}
