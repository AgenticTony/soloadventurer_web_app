'use client'

import { ApolloProvider as ApolloClientProvider } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { makeApolloClient, type RedirectFn } from '@/lib/apolloClient'
import { initializeWaveAPI } from '@/lib/api/waves'
import { useMemo } from 'react'

export default function ApolloProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  const redirect: RedirectFn = useMemo(() => (url: string) => {
    if (typeof window !== 'undefined') {
      router.push(url)
    }
  }, [router])

  const client = useMemo(() => {
    const c = makeApolloClient(redirect)
    // Initialize WaveAPI synchronously so it's ready before any renders
    initializeWaveAPI(c)
    return c
  }, [redirect])

  return (
    <ApolloClientProvider client={client}>
      {children}
    </ApolloClientProvider>
  )
}
