export type Locale = 'uk' | 'in'
export const SUPPORTED_LOCALES: Locale[] = ['uk', 'in']
const LOCALE_COOKIE = 'locale'

export function parseLocale(value: string | undefined | null): Locale {
  return (SUPPORTED_LOCALES as string[]).includes(value ?? '')
    ? (value as Locale)
    : 'uk'
}

export async function getServerLocale(): Promise<Locale> {
  const { cookies } = await import('next/headers')
  const jar = await cookies()
  return parseLocale(jar.get(LOCALE_COOKIE)?.value)
}
