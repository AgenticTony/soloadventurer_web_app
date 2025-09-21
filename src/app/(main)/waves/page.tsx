'use client';

import { useState, useEffect } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { WaveList } from '@/components/waves/WaveList';
import { WaveNotification } from '@/components/waves/WaveNotification';
import { useWaves } from '@/hooks/useWaves';
import { useAuth } from '@/contexts/AuthContext';
import {
  Waves, Filter, Users, Heart, Clock, Zap,
  Wifi, WifiOff, RefreshCw, Search, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { WaveWithUsers } from '@/types/wave';

type FilterTab = 'all' | 'pending' | 'accepted' | 'mutual';

export default function WavesPage() {
  const { user } = useAuth();
  const {
    sentWaves,
    receivedWaves,
    mutualWaves,
    stats,
    isLoading,
    error,
    isConnected,
    refresh
  } = useWaves();

  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyUnread, setShowOnlyUnread] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Auto-refresh every 30 seconds when online
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(() => {
      refresh();
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, [isConnected, refresh]);

  // Filter waves based on active tab
  const getFilteredWaves = (): WaveWithUsers[] => {
    let waves: WaveWithUsers[] = [];

    switch (activeFilter) {
      case 'pending':
        waves = receivedWaves.filter(w => w.status === 'pending');
        break;
      case 'accepted':
        waves = [...sentWaves, ...receivedWaves].filter(w => w.status === 'accepted' && !w.isMutual);
        break;
      case 'mutual':
        waves = mutualWaves;
        break;
      case 'all':
      default:
        waves = [...sentWaves, ...receivedWaves, ...mutualWaves];
        break;
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      waves = waves.filter(wave =>
        wave.fromUser.name.toLowerCase().includes(query) ||
        wave.toUser.name.toLowerCase().includes(query) ||
        wave.message?.toLowerCase().includes(query)
      );
    }

    // Apply unread filter
    if (showOnlyUnread) {
      waves = waves.filter(wave => !wave.isRead);
    }

    // Sort by creation date (newest first)
    return waves.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const filteredWaves = getFilteredWaves();

  const handleRefresh = async () => {
    try {
      await refresh();
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Failed to refresh waves:', err);
    }
  };

  const filterTabs = [
    {
      id: 'all' as FilterTab,
      label: 'All Waves',
      icon: Waves,
      count: sentWaves.length + receivedWaves.length + mutualWaves.length,
      color: 'text-gray-600'
    },
    {
      id: 'pending' as FilterTab,
      label: 'Pending',
      icon: Clock,
      count: receivedWaves.filter(w => w.status === 'pending').length,
      color: 'text-yellow-600'
    },
    {
      id: 'accepted' as FilterTab,
      label: 'Accepted',
      icon: Heart,
      count: [...sentWaves, ...receivedWaves].filter(w => w.status === 'accepted' && !w.isMutual).length,
      color: 'text-green-600'
    },
    {
      id: 'mutual' as FilterTab,
      label: 'Mutual',
      icon: Zap,
      count: mutualWaves.length,
      color: 'text-purple-600'
    }
  ];

  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Waves className="w-16 h-16 mx-auto mb-4 text-blue-500" />
            <h2 className="text-2xl font-bold mb-2">Please sign in</h2>
            <p className="text-gray-600">You need to be signed in to view your waves.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Waves className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Waves</h1>
                    <p className="text-sm text-gray-500">
                      Manage your wave interactions and connections
                    </p>
                  </div>
                </div>

                {/* Connection Status & Refresh */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    {isConnected ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <Wifi className="w-4 h-4" />
                        <span>Online</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-red-600">
                        <WifiOff className="w-4 h-4" />
                        <span>Offline</span>
                      </div>
                    )}
                    <span className="text-gray-400 text-xs">
                      Last updated: {lastRefresh.toLocaleTimeString()}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleRefresh}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Waves className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-600">Sent</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900">{stats.sentCount}</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Heart className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Received</span>
                  </div>
                  <div className="text-2xl font-bold text-green-900">{stats.receivedCount}</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-600">Mutual</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900">{stats.mutualCount}</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-600">Pending</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-900">{stats.pendingCount}</div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search waves by name or message..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Unread Filter */}
                <Button
                  variant={showOnlyUnread ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowOnlyUnread(!showOnlyUnread)}
                  className="gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Unread Only
                </Button>
              </div>

              {/* Filter Tabs */}
              <div className="flex overflow-x-auto gap-1 bg-gray-100 rounded-lg p-1">
                {filterTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium text-sm whitespace-nowrap transition-colors ${
                      activeFilter === tab.id
                        ? 'bg-white shadow-sm text-gray-900'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                    }`}
                  >
                    <tab.icon className={`w-4 h-4 ${tab.color}`} />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {tab.count}
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <X className="w-5 h-5" />
                <span className="font-medium">Error loading waves</span>
              </div>
              <p className="text-red-600 text-sm mt-1">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="mt-3"
              >
                Try Again
              </Button>
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3 text-gray-600">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Loading waves...</span>
              </div>
            </div>
          ) : filteredWaves.length === 0 ? (
            <div className="text-center py-12">
              <Waves className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || showOnlyUnread ? 'No matching waves found' : 'No waves yet'}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery || showOnlyUnread
                  ? 'Try adjusting your search or filters'
                  : 'Start waving to connect with other travelers!'}
              </p>
              {(searchQuery || showOnlyUnread) && (
                <div className="flex gap-2 justify-center">
                  {searchQuery && (
                    <Button variant="outline" onClick={() => setSearchQuery('')}>
                      Clear Search
                    </Button>
                  )}
                  {showOnlyUnread && (
                    <Button variant="outline" onClick={() => setShowOnlyUnread(false)}>
                      Show All
                    </Button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  {filteredWaves.length} wave{filteredWaves.length !== 1 ? 's' : ''}
                  {searchQuery && ` matching "${searchQuery}"`}
                  {showOnlyUnread && ' (unread only)'}
                </h2>
                <div className="text-sm text-gray-500">
                  Showing {activeFilter === 'all' ? 'all' : activeFilter} waves
                </div>
              </div>

              <WaveList
                waves={filteredWaves}
                showControls={false}
                realTimeUpdates={isConnected}
                onWaveClick={(wave) => {
                  console.log('Wave clicked:', wave);
                }}
                onWaveRespond={(wave, response) => {
                  console.log('Wave response:', wave.id, response);
                }}
                className="space-y-4"
              />
            </div>
          )}
        </div>

        {/* Notification Component */}
        <div className="fixed bottom-6 right-6 z-50">
          <WaveNotification
            showDropdown
            maxCount={99}
            badgePosition="top-right"
            badgeVariant="danger"
            onClick={(wave) => {
              console.log('Notification clicked:', wave);
            }}
            onBadgeClick={() => {
              console.log('Badge clicked');
            }}
          />
        </div>
      </div>
    </MainLayout>
  );
}