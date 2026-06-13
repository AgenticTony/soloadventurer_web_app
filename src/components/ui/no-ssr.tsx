import dynamic from 'next/dynamic'
import React from 'react'

// This is a wrapper component that disables SSR for its children
export const NoSSR = dynamic(
  () => Promise.resolve(({ children }: { children: React.ReactNode }) => <>{children}</>),
  {
    ssr: false,
  }
)
