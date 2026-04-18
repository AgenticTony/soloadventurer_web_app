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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Connections</h1>
            <p className="text-gray-600 mt-1">
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
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{accepted.length}</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                <UserPlus className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingIncoming.length}</p>
                <p className="text-xs text-muted-foreground">Pending Requests</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingOutgoing.length}</p>
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
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-6 flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 flex-1">{error}</p>
            <Button variant="outline" size="sm" onClick={loadConnections}>
              Retry
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-white border border-gray-200 animate-pulse" />
            ))}
          </div>
        ) : filteredConnections.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
            <Users className="mx-auto mb-3 h-12 w-12 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-700 mb-1">
              {activeTab === 'pending'
                ? 'No pending requests'
                : activeTab === 'accepted'
                  ? 'No connections yet'
                  : 'No connections yet'}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
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
                  className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
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
                          <Badge variant="outline" className="text-xs border-amber-300 text-amber-700 bg-amber-50">
                            Incoming
                          </Badge>
                        )}
                        {isPending && !isIncoming && (
                          <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 bg-blue-50">
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
    pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
    accepted: { label: 'Connected', className: 'bg-green-100 text-green-700' },
    declined: { label: 'Declined', className: 'bg-red-100 text-red-700' },
    blocked: { label: 'Blocked', className: 'bg-gray-100 text-gray-700' },
  };
  const { label, className } = config[status];
  return (
    <Badge variant="outline" className={`text-xs border-0 ${className}`}>
      {label}
    </Badge>
  );
}
