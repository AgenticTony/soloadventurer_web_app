import '../styles/globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/AuthContext'
import { WebSocketProvider } from '@/contexts/WebSocketContext'
import { ToastProvider } from '@/contexts/ToastContext'
import ApolloProvider from './providers/ApolloProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SoloAdventurer - Connect with Solo Travelers',
  description: 'A social platform designed specifically for solo travelers to connect, share experiences, and find travel companions.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <ApolloProvider>
          <AuthProvider>
            <WebSocketProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </WebSocketProvider>
          </AuthProvider>
        </ApolloProvider>
      </body>
    </html>
  )
}
