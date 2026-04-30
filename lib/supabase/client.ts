// Supabase client factory
// This is a workaround for the SSR issue with @supabase/ssr
// During SSR, returns a minimal mock that won't throw

export function createClient() {
  // Check if we can safely create a Supabase client
  // This is a hack to avoid the "Your project's URL and API key are required" error during SSR
  
  // First, check if we're in a browser environment
  const isBrowser = typeof window !== 'undefined'
  
  // Check if environment variables are available
  const hasEnvVars = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // If we're not in a browser OR environment variables aren't available, return a mock
  if (!isBrowser || !hasEnvVars) {
    return createSafeMockClient()
  }
  
  // We're in a browser with environment variables - try to create the real client
  try {
    // Use require instead of import to avoid static analysis issues
    const { createBrowserClient } = require('@supabase/ssr')
    return createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  } catch (error) {
    console.warn('Failed to create Supabase browser client, using mock:', error)
    return createSafeMockClient()
  }
}

function createSafeMockClient() {
  // Return a mock client that has the same API but does nothing
  // This prevents errors during SSR/prerendering
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: null }),
      signUp: () => Promise.resolve({ data: { user: null }, error: null }),
      signInWithOAuth: () => Promise.resolve({ data: { url: '' }, error: null }),
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
          single: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
    }),
  } as any
}
