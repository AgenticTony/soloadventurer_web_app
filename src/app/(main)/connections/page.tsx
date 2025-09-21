// Connections Page - Friend Connection Management with Real-time Updates
// Sprint 3: Complete connections system with optimistic updates and WebSocket integration

'use client';

import React, { useState, useEffect, useCallback, useReducer, useOptimistic } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Settings,
  Wifi,
  WifiOff,
  RefreshCw,
  AlertCircle,
  Bell,
  BellOff,
  Shield,
  Globe
} from 'lucide-react';
import {
  ConnectionWithUser,
  ConnectionSuggestion,
  ConnectionStats,
  ConnectionStatus,
  RequestDirection,
  ConnectionWebSocketEvent,
  OptimisticConnection,
  ConnectionState,
  ConnectionCache,
  User
} from '@/types/connection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
// Using simplified tabs implementation
interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ value, onValueChange, children }) => (
  <div data-value={value}>{children}</div>
);

const TabsList: React.FC<TabsListProps> = ({ className, children }) => (
  <div className={clsx('flex border-b', className)}>{children}</div>
);

const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, className, children }) => (
  <button className={clsx('px-4 py-2 border-b-2 border-transparent hover:border-primary', className)}>
    {children}
  </button>
);

const TabsContent: React.FC<TabsContentProps> = ({ value, className, children }) => (
  <div className={clsx('mt-4', className)}>{children}</div>
);
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConnectionList } from '@/components/connections/ConnectionList';
import { connectionsAPI, getConnectionsWebSocketUrl, connectionsWebSocketOptions, ConnectionError, mockUsers } from '@/lib/api/connections';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useToast } from '@/contexts/ToastContext';
import { clsx } from 'clsx';

/**
 * Connection state reducer following official React patterns
 * Handles complex state transitions with proper type safety
 */
type ConnectionAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONNECTIONS'; payload: ConnectionWithUser[] }
  | { type: 'SET_SUGGESTIONS'; payload: ConnectionSuggestion[] }
  | { type: 'SET_STATS'; payload: ConnectionStats }
  | { type: 'ADD_CONNECTION'; payload: ConnectionWithUser }
  | { type: 'UPDATE_CONNECTION'; payload: ConnectionWithUser }
  | { type: 'REMOVE_CONNECTION'; payload: string }
  | { type: 'SET_WEBSOCKET_STATUS'; payload: 'connecting' | 'connected' | 'disconnected' }
  | { type: 'START_OPTIMISTIC_OPERATION'; payload: OptimisticConnection }
  | { type: 'COMPLETE_OPTIMISTIC_OPERATION'; payload: string }
  | { type: 'REVERT_OPTIMISTIC_OPERATION'; payload: string };

const connectionReducer = (state: ConnectionState, action: ConnectionAction): ConnectionState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };

    case 'SET_CONNECTIONS':
      return {
        ...state,
        connections: action.payload,
        isLoading: false,
        error: null,
        lastFetched: new Date()
      };

    case 'SET_SUGGESTIONS':
      return { ...state, suggestions: action.payload };

    case 'SET_STATS':
      return { ...state, stats: action.payload };

    case 'ADD_CONNECTION':
      return {
        ...state,
        connections: [...state.connections, action.payload]
      };

    case 'UPDATE_CONNECTION':
      return {
        ...state,
        connections: state.connections.map(conn =>
          conn.id === action.payload.id ? { ...conn, ...action.payload } : conn
        )
      };

    case 'REMOVE_CONNECTION':
      return {
        ...state,
        connections: state.connections.filter(conn => conn.id !== action.payload)
      };

    case 'SET_WEBSOCKET_STATUS':
      return { ...state, websocketStatus: action.payload };

    case 'START_OPTIMISTIC_OPERATION':
      return {
        ...state,
        optimisticOperations: new Map(state.optimisticOperations).set(
          action.payload.id,
          action.payload
        )
      };

    case 'COMPLETE_OPTIMISTIC_OPERATION':
      const newOptimisticOps = new Map(state.optimisticOperations);
      newOptimisticOps.delete(action.payload);
      return { ...state, optimisticOperations: newOptimisticOps };

    case 'REVERT_OPTIMISTIC_OPERATION':
      const revertedOps = new Map(state.optimisticOperations);
      revertedOps.delete(action.payload);
      return { ...state, optimisticOperations: revertedOps };

    default:
      return state;
  }
};

const initialState: ConnectionState = {
  connections: [],
  suggestions: [],
  stats: {
    totalConnections: 0,
    pendingIncoming: 0,
    pendingOutgoing: 0,
    mutualConnections: 0,
    recentConnections: [],
    connectionGrowth: { thisWeek: 0, thisMonth: 0, percentage: 0 }
  },
  isLoading: true,
  error: null,
  websocketStatus: 'disconnected',
  optimisticOperations: new Map(),
  lastFetched: new Date(),
  cache: {
    connections: new Map(),
    suggestions: new Map(),
    lastFetched: new Date()
  },
  retryCount: 0
};

/**
 * Mock data for development - replace with real API integration
 */
const generateMockConnections = (): ConnectionWithUser[] => [
  {
    id: 'conn1',
    userId: 'current-user',
    connectedUserId: 'user1',
    status: ConnectionStatus.ACCEPTED,
    direction: RequestDirection.INCOMING,
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7),
    respondedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6),
    mutualConnections: 5,
    connectionSource: 'suggestion',
    user: mockUsers[0],
    metadata: {
      connectionStrength: 0.85,
      interactionHistory: {
        messages: 15,
        tripsTogether: 2,
        mutualGroups: 1
      }
    }
  },
  {
    id: 'conn2',
    userId: 'current-user',
    connectedUserId: 'user2',
    status: ConnectionStatus.PENDING,
    direction: RequestDirection.INCOMING,
    requestedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    mutualConnections: 3,
    connectionSource: 'mutual_friend',
    user: mockUsers[1],
    metadata: {
      requestMessage: 'Hi! I saw we have mutual friends and similar travel interests. Would love to connect!',
      connectionStrength: 0.72
    }
  }
];

const generateMockSuggestions = (): ConnectionSuggestion[] => [
  {
    id: 'sugg1',
    suggestedUser: {
      id: 'user3',
      username: 'travel_mike',
      name: 'Mike Rodriguez',
      avatar: '/avatars/mike.jpg',
      bio: 'Backpacker exploring Latin America',
      location: 'Mexico City, Mexico',
      isOnline: true,
      stats: { trips: 12, connections: 67, posts: 34 },
      preferences: { visibility: 'public', allowConnectionRequests: true }
    },
    reason: 'mutual_friends',
    confidence: 0.89,
    mutualConnections: [mockUsers[0]],
    metadata: {
      lastUpdated: new Date(),
      dismissed: false,
      viewCount: 0
    }
  }
];

/**
 * Main Connections Page Component
 */
export default function ConnectionsPage() {
  const router = useRouter();
  const { showSuccess, showError, showInfo } = useToast();

  // Complex state management with reducer
  const [state, dispatch] = useReducer(connectionReducer, initialState);

  // Optimistic updates state
  const [optimisticConnections, setOptimisticConnections] = useOptimistic(
    state.connections,
    (current: ConnectionWithUser[], optimisticValue: ConnectionWithUser) => {
      const existingIndex = current.findIndex(conn => conn.id === optimisticValue.id);
      if (existingIndex >= 0) {
        return current.map((conn, index) =>
          index === existingIndex ? optimisticValue : conn
        );
      }
      return [...current, optimisticValue];
    }
  );

  // Local state for UI
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'suggestions'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // WebSocket connection using react-use-websocket
  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    getConnectionsWebSocketUrl(),
    {
      ...connectionsWebSocketOptions,
      onMessage: (event: MessageEvent) => {
        try {
          const data: ConnectionWebSocketEvent = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      }
    }
  );

  /**
   * Initialize data
   */
  useEffect(() => {
    loadInitialData();
  }, []);

  /**
   * Update WebSocket status when connection state changes
   */
  useEffect(() => {
    const status = {
      [ReadyState.CONNECTING]: 'connecting' as const,
      [ReadyState.OPEN]: 'connected' as const,
      [ReadyState.CLOSING]: 'disconnected' as const,
      [ReadyState.CLOSED]: 'disconnected' as const,
      [ReadyState.UNINSTANTIATED]: 'disconnected' as const,
    }[readyState];

    dispatch({ type: 'SET_WEBSOCKET_STATUS', payload: status });
  }, [readyState]);

  /**
   * Load initial data from API
   */
  const loadInitialData = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // In development, use mock data
      if (process.env.NODE_ENV === 'development') {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading

        const mockConnections = generateMockConnections();
        const mockSuggestions = generateMockSuggestions();
        const mockStats: ConnectionStats = {
          totalConnections: mockConnections.length,
          pendingIncoming: mockConnections.filter(c =>
            c.status === ConnectionStatus.PENDING && c.direction === RequestDirection.INCOMING
          ).length,
          pendingOutgoing: mockConnections.filter(c =>
            c.status === ConnectionStatus.PENDING && c.direction === RequestDirection.OUTGOING
          ).length,
          mutualConnections: 5,
          recentConnections: mockConnections.slice(-5),
          connectionGrowth: { thisWeek: 2, thisMonth: 8, percentage: 15.5 }
        };

        dispatch({ type: 'SET_CONNECTIONS', payload: mockConnections });
        dispatch({ type: 'SET_SUGGESTIONS', payload: mockSuggestions });
        dispatch({ type: 'SET_STATS', payload: mockStats });
        return;
      }

      // Production API calls
      const [connectionsRes, suggestionsRes, statsRes] = await Promise.all([
        connectionsAPI.getConnections(),
        connectionsAPI.getConnectionSuggestions(),
        connectionsAPI.getConnectionStats()
      ]);

      dispatch({ type: 'SET_CONNECTIONS', payload: connectionsRes.connections });
      dispatch({ type: 'SET_SUGGESTIONS', payload: suggestionsRes });
      dispatch({ type: 'SET_STATS', payload: statsRes });

    } catch (error) {
      console.error('Failed to load connections data:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load connections. Please try again.' });
      showError('Failed to load connections');
    }
  }, [showError]);

  /**
   * Handle WebSocket messages for real-time updates
   */
  const handleWebSocketMessage = useCallback((data: ConnectionWebSocketEvent) => {
    switch (data.type) {
      case 'connection_request':
        if (notificationsEnabled) {
          showInfo(`New connection request from ${data.data.user?.name}`);
        }

        if (data.data.connection) {
          dispatch({ type: 'ADD_CONNECTION', payload: data.data.connection as ConnectionWithUser });
        }
        break;

      case 'connection_accepted':
        if (data.data.connection) {
          dispatch({ type: 'UPDATE_CONNECTION', payload: data.data.connection as ConnectionWithUser });
          showSuccess(`${data.data.user?.name} accepted your connection request`);
        }
        break;

      case 'connection_declined':
        if (data.data.connection) {
          dispatch({ type: 'UPDATE_CONNECTION', payload: data.data.connection as ConnectionWithUser });
        }
        break;

      case 'connection_removed':
        if (data.data.connection?.id) {
          dispatch({ type: 'REMOVE_CONNECTION', payload: data.data.connection.id });
        }
        break;

      case 'user_online':
        const onlineConnections = state.connections.map(conn => {
          if (conn.user.id === data.userId) {
            return { ...conn, user: { ...conn.user, isOnline: true } };
          }
          return conn;
        });
        dispatch({ type: 'SET_CONNECTIONS', payload: onlineConnections });
        break;

      case 'user_offline':
        const offlineConnections = state.connections.map(conn => {
          if (conn.user.id === data.userId) {
            return { ...conn, user: { ...conn.user, isOnline: false, lastSeen: new Date() } };
          }
          return conn;
        });
        dispatch({ type: 'SET_CONNECTIONS', payload: offlineConnections });
        break;

      default:
        console.log('Unhandled WebSocket message type:', data.type);
    }
  }, [state.connections, notificationsEnabled, showInfo, showSuccess]);

  /**
   * Handle connection updates with optimistic UI
   */
  const handleConnectionUpdate = useCallback(async (connectionId: string, newStatus: ConnectionStatus) => {
    const connection = state.connections.find(c => c.id === connectionId);
    if (!connection) return;

    // Optimistic update
    const optimisticConnection = { ...connection, status: newStatus };
    setOptimisticConnections(optimisticConnection);

    const optimisticOp: OptimisticConnection = {
      ...connection,
      status: newStatus,
      isOptimistic: true,
      optimisticOperation: 'accepting'
    };
    dispatch({ type: 'START_OPTIMISTIC_OPERATION', payload: optimisticOp });

    try {
      await connectionsAPI.updateConnectionStatus({
        connectionId,
        status: newStatus
      });

      dispatch({ type: 'COMPLETE_OPTIMISTIC_OPERATION', payload: connectionId });
      const updatedConnection: ConnectionWithUser = { ...connection, status: newStatus };
      dispatch({ type: 'UPDATE_CONNECTION', payload: updatedConnection });

    } catch (error) {
      console.error('Failed to update connection:', error);
      dispatch({ type: 'REVERT_OPTIMISTIC_OPERATION', payload: connectionId });

      if (error instanceof ConnectionError) {
        showError(error.message);
      } else {
        showError('Failed to update connection. Please try again.');
      }

      // Revert optimistic update by re-setting the original connection
      setOptimisticConnections(connection);
    }
  }, [state.connections, setOptimisticConnections, showError]);

  /**
   * Send connection request with optimistic updates
   */
  const handleSendRequest = useCallback(async (userId: string, message?: string) => {
    // Create optimistic connection
    const optimisticConnection: ConnectionWithUser = {
      id: `temp-${Date.now()}`,
      userId: 'current-user',
      connectedUserId: userId,
      status: ConnectionStatus.PENDING,
      direction: RequestDirection.OUTGOING,
      requestedAt: new Date(),
      mutualConnections: 0,
      connectionSource: 'search',
      user: mockUsers.find(u => u.id === userId) || mockUsers[0], // Fallback
      metadata: { requestMessage: message }
    };

    // Optimistic update
    setOptimisticConnections(optimisticConnection);

    try {
      const response = await connectionsAPI.sendConnectionRequest({
        targetUserId: userId,
        message
      });

      // Replace optimistic connection with real one
      // Convert Connection to ConnectionWithUser by finding user in suggestions or mock data
      const targetUser = mockUsers.find(user => user.id === userId) || {
        id: userId,
        username: `user_${userId}`,
        name: 'Unknown User',
        isOnline: false,
        stats: { trips: 0, connections: 0, posts: 0 },
        preferences: { visibility: 'public' as const, allowConnectionRequests: true }
      };

      const connectionWithUser: ConnectionWithUser = {
        ...response.connection,
        user: targetUser
      };

      dispatch({ type: 'ADD_CONNECTION', payload: connectionWithUser });
      showSuccess('Connection request sent');

    } catch (error) {
      console.error('Failed to send connection request:', error);

      if (error instanceof ConnectionError) {
        showError(error.message);
      } else {
        showError('Failed to send connection request. Please try again.');
      }

      // Remove optimistic connection on error
      // This will be handled by the optimistic state automatically
    }
  }, [setOptimisticConnections, showSuccess, showError]);

  /**
   * Handle suggestion dismissal
   */
  const handleDismissSuggestion = useCallback(async (suggestionId: string) => {
    // Optimistically remove suggestion
    const filteredSuggestions = state.suggestions.filter(s => s.id !== suggestionId);
    dispatch({ type: 'SET_SUGGESTIONS', payload: filteredSuggestions });

    try {
      await connectionsAPI.dismissSuggestion(suggestionId);
    } catch (error) {
      console.error('Failed to dismiss suggestion:', error);
      // Revert on error
      dispatch({ type: 'SET_SUGGESTIONS', payload: state.suggestions });
    }
  }, [state.suggestions]);

  /**
   * Handle user profile navigation
   */
  const handleUserClick = useCallback((userId: string) => {
    router.push(`/profile/${userId}`);
  }, [router]);

  /**
   * Refresh data manually
   */
  const handleRefresh = useCallback(() => {
    loadInitialData();
  }, [loadInitialData]);

  /**
   * Filter connections based on active tab
   */
  const getFilteredConnections = useCallback(() => {
    switch (activeTab) {
      case 'pending':
        return optimisticConnections.filter(conn => conn.status === ConnectionStatus.PENDING);
      case 'suggestions':
        return [];
      default:
        return optimisticConnections;
    }
  }, [activeTab, optimisticConnections]);

  const filteredConnections = getFilteredConnections();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Connections</h1>
          <p className="text-muted-foreground">
            Manage your travel connections and discover new adventure buddies
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* WebSocket Status */}
          <div className="flex items-center gap-2">
            {state.websocketStatus === 'connected' ? (
              <Wifi className="w-4 h-4 text-green-500" />
            ) : (
              <WifiOff className="w-4 h-4 text-red-500" />
            )}
          </div>

          {/* Notifications Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            className="flex items-center gap-2"
          >
            {notificationsEnabled ? (
              <Bell className="w-4 h-4" />
            ) : (
              <BellOff className="w-4 h-4" />
            )}
          </Button>

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={state.isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={clsx('w-4 h-4', state.isLoading && 'animate-spin')} />
            Refresh
          </Button>

          {/* Settings */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/settings/connections')}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Connections</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.stats.totalConnections}</div>
            <p className="text-xs text-muted-foreground">
              +{state.stats.connectionGrowth.thisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {state.stats.pendingIncoming + state.stats.pendingOutgoing}
            </div>
            <p className="text-xs text-muted-foreground">
              {state.stats.pendingIncoming} incoming, {state.stats.pendingOutgoing} outgoing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mutual Friends</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{state.stats.mutualConnections}</div>
            <p className="text-xs text-muted-foreground">
              Shared connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{state.stats.connectionGrowth.percentage}%</div>
            <p className="text-xs text-muted-foreground">
              This month vs last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'pending' | 'suggestions')}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            All Connections
            <Badge variant="secondary" className="ml-2">
              {optimisticConnections.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Pending
            {state.stats.pendingIncoming > 0 && (
              <Badge variant="destructive" className="ml-2">
                {state.stats.pendingIncoming}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Suggestions
            <Badge variant="secondary" className="ml-2">
              {state.suggestions.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        {/* All Connections Tab */}
        <TabsContent value="all" className="space-y-4">
          <ConnectionList
            connections={filteredConnections}
            onConnectionUpdate={handleConnectionUpdate}
            onUserClick={handleUserClick}
            isLoading={state.isLoading}
            error={state.error}
            emptyState={{
              title: 'No connections yet',
              description: 'Start connecting with fellow solo adventurers!',
              action: {
                label: 'Find People',
                onClick: () => router.push('/explore/people')
              }
            }}
          />
        </TabsContent>

        {/* Pending Connections Tab */}
        <TabsContent value="pending" className="space-y-4">
          <ConnectionList
            connections={filteredConnections}
            onConnectionUpdate={handleConnectionUpdate}
            onUserClick={handleUserClick}
            isLoading={state.isLoading}
            error={state.error}
            emptyState={{
              title: 'No pending requests',
              description: 'All caught up! No pending connection requests.',
              action: {
                label: 'Find More People',
                onClick: () => router.push('/explore/people')
              }
            }}
          />
        </TabsContent>

        {/* Suggestions Tab */}
        <TabsContent value="suggestions" className="space-y-4">
          <ConnectionList
            connections={[]}
            suggestions={state.suggestions}
            onConnectionUpdate={handleConnectionUpdate}
            onSendRequest={handleSendRequest}
            onDismissSuggestion={handleDismissSuggestion}
            onUserClick={handleUserClick}
            isLoading={state.isLoading}
            error={state.error}
            emptyState={{
              title: 'No suggestions available',
              description: 'Check back later for new connection suggestions!',
              action: {
                label: 'Browse People',
                onClick: () => router.push('/explore/people')
              }
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Error State */}
      {state.error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
        >
          <AlertCircle className="w-5 h-5" />
          <div className="flex-1">
            <p className="font-medium">Something went wrong</p>
            <p className="text-sm text-red-600">{state.error}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="text-red-700 border-red-200 hover:bg-red-100"
          >
            Try Again
          </Button>
        </motion.div>
      )}
    </div>
  );
}