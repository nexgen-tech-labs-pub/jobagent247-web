import { createBrowserClient } from '@supabase/ssr'

// Singleton browser client — import this in Client Components
// Automatically syncs auth state with server via cookies
let client: ReturnType<typeof createBrowserClient> | null = null

export function getBrowserClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return client
}
