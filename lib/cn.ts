import clsx, { type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Teach tailwind-merge the custom type scale from globals.css, or it reads `text-ui` as a colour
// and drops `text-on-accent`.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [{ text: ['meta', 'ui', 'body', 'section', 'page', 'display', 'hero'] }],
    },
  },
});

/** clsx + tailwind-merge: classes passed in by the caller win over a component's defaults. */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
