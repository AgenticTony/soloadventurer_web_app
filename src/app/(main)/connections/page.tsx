'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users, UserPlus, RefreshCw, Clock, CheckCircle2,
  XCircle, MessageSquare, MapPin, Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getConnections, respondToConnection } from '@/lib/api/matching';
import { useAuth } from '@/contexts/AuthContext';
import type { Connection, ConnectionStatus } from '@/types/matching';

type TabId = 'all' | 'pending' | 'accepted';

const tabs: { id: TabId; label: string; icon: typeof Users }[] = [
  { id: 'all', label: 'All', icon: Users },
  { id: 'pending', label: 'Pending', icon: Clock },
  { id: 'accepted', label: 'Connected', icon: CheckCircle2 },
];

export default function ConnectionsPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [connections, setConnections] = useState<Connection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>('all');
  const [responding, setResponding] = useState<Set<string>>(new Set());

  const loadConnections = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getConnections();
      setConnections(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load connections');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const handleRespond = async (connectionId: string, accept: boolean) => {
    setResponding((prev) => new Set(prev).add(connectionId));
    try {
      await respondToConnection(connectionId, accept);
      setConnections((prev) =>
        prev.map((c) =>
          c.id === connectionId
            ? { ...c, status: (accept ? 'accepted' : 'declined') as ConnectionStatus }
            : c
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update connection');
    } finally {
      setResponding((prev) => {
        const next = new Set(prev);
        next.delete(connectionId);
        return next;
      });
    }
  };

  // Computed values
  const pendingIncoming = connections.filter(
    (c) => c.status === 'pending' && c.recipientId === user?.id
  );
  const pendingOutgoing = connections.filter(
    (c) => c.status === 'pending' && c.requesterId === user?.id
  );
  const accepted = connections.filter((c) => c.status === 'accepted');

  const filteredConnections = (() => {
    switch (activeTab) {
      case 'pending':
        return connections.filter((c) => c.status === 'pending');
      case 'accepted':
        return accepted;
      default:
        return connections;
    }
  })();

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="p-8">
          <CardContent>
            <p className="text-lg text-muted-foreground mb-4">Please log in to view connections.</p>
            <Button onClick={() => router.push('/sign-in')}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Connections</h1>
            <p className="text-muted-foreground mt-1">
              Manage your travel connections and meet fellow adventurers
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={loadConnections} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
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
            <CardContent className="p-4 flex items-center gap-3">
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
            <CardContent className="p-4 flex items-center gap-3">
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
        <div className="flex gap-1 bg-muted rounded-full p-1 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const count =
              tab.id === 'all'
                ? connections.length
                : tab.id === 'pending'
                  ? pendingIncoming.length + pendingOutgoing.length
                  : accepted.length;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
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
            );
          })}
        </div>

        {/* Content */}
        {error && (
          <div className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 mb-6 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-destructive flex-shrink-0" />
            <p className="text-sm text-destructive flex-1">{error}</p>
            <Button variant="outline" size="sm" onClick={loadConnections}>
              Retry
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-card border border-border animate-pulse" />
            ))}
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <Users className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground mb-1">
              {activeTab === 'pending'
                ? 'No pending requests'
                : activeTab === 'accepted'
                  ? 'No connections yet'
                  : 'No connections yet'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {activeTab === 'pending'
                ? "You&apos;re all caught up!"
                : 'Discover travelers and send connection requests'}
            </p>
            {activeTab !== 'pending' && (
              <Button onClick={() => router.push('/discover')}>
                Discover Travelers
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredConnections.map((conn) => {
              const isIncoming = conn.recipientId === user.id;
              const otherProfile = isIncoming ? conn.requester : conn.recipient;
              const isPending = conn.status === 'pending';

              return (
                <div
                  key={conn.id}
                  className="bg-card rounded-2xl border border-border p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-brand to-connection flex items-center justify-center text-white font-semibold text-lg">
                      {otherProfile?.avatarUrl ? (
                        <img
                          src={otherProfile.avatarUrl}
                          alt={otherProfile.displayName ?? ''}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        (otherProfile?.displayName ?? '?').charAt(0).toUpperCase()
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground truncate">
                          {otherProfile?.displayName ?? otherProfile?.username ?? 'Traveler'}
                        </h3>
                        <ConnectionStatusBadge status={conn.status} />
                        {isPending && isIncoming && (
                          <Badge variant="outline" className="text-xs border-trust/40 text-trust bg-trust/10">
                            Incoming
                          </Badge>
                        )}
                        {isPending && !isIncoming && (
                          <Badge variant="outline" className="text-xs border-brand/40 text-brand bg-brand/10">
                            Outgoing
                          </Badge>
                        )}
                      </div>
                      {otherProfile?.bio && (
                        <p className="text-sm text-muted-foreground truncate mt-0.5">
                          {otherProfile.bio}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        <Calendar className="inline h-3 w-3 mr-1" />
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
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRespond(conn.id, false)}
                            disabled={responding.has(conn.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
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
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                      )}
                      {isPending && !isIncoming && (
                        <span className="text-xs text-muted-foreground">Awaiting response</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ConnectionStatusBadge({ status }: { status: ConnectionStatus }) {
  const config: Record<ConnectionStatus, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-trust/10 text-trust' },
    accepted: { label: 'Connected', className: 'bg-connection/10 text-connection' },
    declined: { label: 'Declined', className: 'bg-destructive/10 text-destructive' },
    blocked: { label: 'Blocked', className: 'bg-muted text-muted-foreground' },
  };
  const { label, className } = config[status];
  return (
    <Badge variant="outline" className={`text-xs border-0 ${className}`}>
      {label}
    </Badge>
  );
}
