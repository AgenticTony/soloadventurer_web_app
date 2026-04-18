import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ functionName: string[] }> },
) {
  const { functionName } = await params
  const fn = functionName.join('/')
  const body = await request.json()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: 'Missing Supabase configuration' }, { status: 500 })
  }

  // Forward the user's auth cookies so the edge function runs as them
  const supabase = createServerClient(supabaseUrl, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll() {
        // No-op — we're just reading the session, not setting cookies
      },
    },
  })

  const { data: { session } } = await supabase.auth.getSession()

  // Call the edge function server-side (no CORS)
  const functionUrl = `${supabaseUrl}/functions/v1/${fn}`
  const response = await fetch(functionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token ?? anonKey}`,
      apikey: anonKey,
    },
    body: JSON.stringify(body),
  })

  const responseData = await response.json()
  return NextResponse.json(responseData, { status: response.status })
}
