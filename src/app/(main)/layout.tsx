import { MainLayout } from '@/components/layout/MainLayout'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function MainLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorBoundary context="main application">
      <MainLayout>
        {children}
      </MainLayout>
    </ErrorBoundary>
  )
}
