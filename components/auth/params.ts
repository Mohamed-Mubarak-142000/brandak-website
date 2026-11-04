/** `?next=` / `?identifier=` from a page's searchParams (first value if repeated). */
export type AuthSearch = Promise<Record<string, string | string[] | undefined>>;

export const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
