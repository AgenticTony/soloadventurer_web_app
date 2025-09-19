'use client'

import { ApolloProvider as ApolloClientProvider } from '@apollo/client'
import { useRouter } from 'next/navigation'
import { makeApolloClient, type RedirectFn } from '@/lib/apolloClient'
import { useMemo } from 'react'

export default function ApolloProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()

  // Create SSR-safe redirect function using Next.js router
  const redirect: RedirectFn = useMemo(() => (url: string) => {
    if (typeof window !== 'undefined') {
      router.push(url)
    }
  }, [router])

  // Create Apollo client with SSR-safe redirect
  const client = useMemo(() => makeApolloClient(redirect), [redirect])

  return (
    <ApolloClientProvider client={client}>
      {children}
    </ApolloClientProvider>
  )
}