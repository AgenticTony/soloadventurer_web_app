'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  UserPlus,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  MessageSquare,
  MapPin,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getConnections, respondToConnection } from '@/lib/api/matching'
import { useAuth } from '@/contexts/AuthContext'
import type { Connection, ConnectionStatus } from '@/types/matching'

type TabId = 'all' | 'pending' | 'accepted'

const tabs: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: 'all', label: 'All', icon: Users },
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'accepted', label: 'Connected', icon: CheckCircle2 },
]

export default function ConnectionsPage() {
  const router = useRouter()
  const { user } = useAuth()

  const [connections, setConnections] = useState<Connection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<TabId>('all')
  const [responding, setResponding] = useState<Set<string>>(new Set())

  const loadConnections = useCallback(async () => {
    if (!user) return
    setIsLoading(true)
    setError(null)
    try {
      const data = await getConnections()
      setConnections(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load connections')
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadConnections()
  }, [loadConnections])

  const handleRespond = async (connectionId: string, accept: boolean) => {
    setResponding(prev => new Set(prev).add(connectionId))
    try {
      await respondToConnection(connectionId, accept)
      setConnections(prev =>
        prev.map(c =>
          c.id === connectionId
            ? { ...c, status: (accept ? 'accepted' : 'declined') as ConnectionStatus }
            : c
        )
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update connection')
    } finally {
      setResponding(prev => {
        const next = new Set(prev)
        next.delete(connectionId)
        return next
      })
    }
  }

  // Computed values
  const pendingIncoming = connections.filter(
    c => c.status === 'pending' && c.recipientId === user?.id
  )
  const pendingOutgoing = connections.filter(
    c => c.status === 'pending' && c.requesterId === user?.id
  )
  const accepted = connections.filter(c => c.status === 'accepted')

  const filteredConnections = (() => {
    switch (activeTab) {
      case 'pending':
        return connections.filter(c => c.status === 'pending')
      case 'accepted':
        return accepted
      default:
        return connections
    }
  })()

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-8">
          <CardContent>
            <p className="mb-4 text-lg text-muted-foreground">Please log in to view connections.</p>
            <Button onClick={() => router.push('/sign-in')}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Connections</h1>
            <p className="mt-1 text-muted-foreground">
              Manage your travel connections and meet fellow adventurers
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadConnections} disabled={isLoading}>
            <RefreshCw className={`mr-1 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-connection/10">
                <Users className="h-5 w-5 text-connection" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{accepted.length}</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-trust/10">
                <UserPlus className="h-5 w-5 text-trust" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingIncoming.length}</p>
                <p className="text-xs text-muted-foreground">Pending Requests</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10">
                <Clock className="h-5 w-5 text-brand" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingOutgoing.length}</p>
                <p className="text-xs text-muted-foreground">Sent Requests</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-full bg-muted p-1">
          {tabs.map(tab => {
            const Icon = tab.icon
            const count =
              tab.id === 'all'
                ? connections.length
                : tab.id === 'pending'
                  ? pendingIncoming.length + pendingOutgoing.length
                  : accepted.length
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-background text-foreground shadow'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
                {count > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {count}
                  </Badge>
                )}
              </button>
            )
          })}
        </div>

        {/* Content */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-destructive/20 bg-destructive/10 p-4">
            <XCircle className="h-5 w-5 flex-shrink-0 text-destructive" />
            <p className="flex-1 text-sm text-destructive">{error}</p>
            <Button variant="outline" size="sm" onClick={loadConnections}>
              Retry
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-28 animate-pulse rounded-2xl border border-border bg-card"
              />
            ))}
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
            <h3 className="mb-1 text-lg font-semibold text-foreground">
              {activeTab === 'pending'
                ? 'No pending requests'
                : activeTab === 'accepted'
                  ? 'No connections yet'
                  : 'No connections yet'}
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              {activeTab === 'pending'
                ? 'You&apos;re all caught up!'
                : 'Discover travelers and send connection requests'}
            </p>
            {activeTab !== 'pending' && (
              <Button onClick={() => router.push('/discover')}>Discover Travelers</Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConnections.map(conn => {
              const isIncoming = conn.recipientId === user.id
              const otherProfile = isIncoming ? conn.requester : conn.recipient
              const isPending = conn.status === 'pending'

              return (
                <div
                  key={conn.id}
                  className="rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-connection text-lg font-semibold text-white">
                      {otherProfile?.avatarUrl ? (
                        <img
                          src={otherProfile.avatarUrl}
                          alt={otherProfile.displayName ?? ''}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        (otherProfile?.displayName ?? '?').charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate font-semibold text-foreground">
                          {otherProfile?.displayName ?? otherProfile?.username ?? 'Traveler'}
                        </h3>
                        <ConnectionStatusBadge status={conn.status} />
                        {isPending && isIncoming && (
                          <Badge
                            variant="outline"
                            className="border-trust/40 bg-trust/10 text-xs text-trust"
                          >
                            Incoming
                          </Badge>
                        )}
                        {isPending && !isIncoming && (
                          <Badge
                            variant="outline"
                            className="border-brand/40 bg-brand/10 text-xs text-brand"
                          >
                            Outgoing
                          </Badge>
                        )}
                      </div>
                      {otherProfile?.bio && (
                        <p className="mt-0.5 truncate text-sm text-muted-foreground">
                          {otherProfile.bio}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        <Calendar className="mr-1 inline h-3 w-3" />
                        {new Date(conn.createdAt).toLocaleDateString()}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {isPending && isIncoming && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleRespond(conn.id, true)}
                            disabled={responding.has(conn.id)}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRespond(conn.id, false)}
                            disabled={responding.has(conn.id)}
                          >
                            <XCircle className="mr-1 h-4 w-4" />
                            Decline
                          </Button>
                        </>
                      )}
                      {conn.status === 'accepted' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => router.push(`/chat?connection=${conn.id}`)}
                        >
                          <MessageSquare className="mr-1 h-4 w-4" />
                          Message
                        </Button>
                      )}
                      {isPending && !isIncoming && (
                        <span className="text-xs text-muted-foreground">Awaiting response</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function ConnectionStatusBadge({ status }: { status: ConnectionStatus }) {
  const config: Record<ConnectionStatus, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-trust/10 text-trust' },
    accepted: { label: 'Connected', className: 'bg-connection/10 text-connection' },
    declined: { label: 'Declined', className: 'bg-destructive/10 text-destructive' },
    blocked: { label: 'Blocked', className: 'bg-muted text-muted-foreground' },
  }
  const { label, className } = config[status]
  return (
    <Badge variant="outline" className={`border-0 text-xs ${className}`}>
      {label}
    </Badge>
  )
}
