# Real-Time Data Setup Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install @tanstack/react-query
```

### 2. Set Up React Query Provider

Create `src/providers/QueryProvider.tsx`:

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

export const QueryProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
```

Update `src/main.tsx` or `src/App.tsx`:

```typescript
import { QueryProvider } from './providers/QueryProvider';

// Wrap your app
<QueryProvider>
  <App />
</QueryProvider>
```

### 3. Initialize WebSocket Connection

Update `src/App.tsx` or create a WebSocket manager component:

```typescript
import { useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { websocketService } from './services/websocket';

function WebSocketManager() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      websocketService.connect().catch(console.error);
    } else {
      websocketService.disconnect();
    }

    return () => {
      websocketService.disconnect();
    };
  }, [isAuthenticated]);

  return null;
}

// Add to your App component
<WebSocketManager />
```

### 4. Environment Variables

Update `.env.local`:

```env
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001
VITE_WS_SECURE=false  # Set to true for WSS in production
```

### 5. Use Real-Time Hooks in Components

Example in `src/pages/PriceTracking.tsx`:

```typescript
import { useRealtimePrices } from '../hooks/useRealtimePrices';

function PriceTracking() {
  const { prices, alerts, isConnected, lastUpdate } = useRealtimePrices({
    material: 'cement',
    country: 'Kenya',
    onPriceUpdate: (update) => {
      console.log('Price updated:', update);
    },
    onAlert: (alert) => {
      console.log('Alert received:', alert);
    },
  });

  return (
    <div>
      <div>Connection: {isConnected ? 'Connected' : 'Disconnected'}</div>
      <div>Last Update: {lastUpdate?.toLocaleTimeString()}</div>
      {/* Render prices */}
    </div>
  );
}
```

## Implementation Checklist

### ✅ Created
- [x] WebSocket service (`src/services/websocket.ts`)
- [x] Real-time prices hook (`src/hooks/useRealtimePrices.ts`)
- [x] Real-time suppliers hook (`src/hooks/useRealtimeSuppliers.ts`)
- [x] Real-time logistics hook (`src/hooks/useRealtimeLogistics.ts`)
- [x] Implementation guide (`REALTIME-IMPLEMENTATION.md`)

### 📋 Next Steps

1. **Install React Query**
   ```bash
   npm install @tanstack/react-query
   ```

2. **Set Up QueryProvider**
   - Create `src/providers/QueryProvider.tsx`
   - Wrap app in `QueryProvider`

3. **Create WebSocket Manager**
   - Add to `App.tsx`
   - Connect when user logs in
   - Disconnect when user logs out

4. **Update Components to Use Real-Time Hooks**
   - Dashboard → Use real-time market data
   - PriceTracking → Use `useRealtimePrices`
   - SupplierDirectory → Use `useRealtimeSuppliers`
   - Logistics → Use `useRealtimeLogistics`
   - RiskMitigation → Use real-time alerts

5. **Backend Setup** (Required for production)
   - WebSocket server implementation
   - API endpoints for all data types
   - Database queries
   - Redis caching
   - Data aggregation services

## Backend Requirements

### WebSocket Server Events

Your backend should emit these events:

```typescript
// Price Updates
{
  type: 'price:update',
  data: {
    id: string,
    material: string,
    location: string,
    country: string,
    price: number,
    currency: string,
    unit: string,
    change: number,
    changeType: 'increase' | 'decrease' | 'stable',
    timestamp: number,
  }
}

// Supplier Updates
{
  type: 'supplier:update',
  data: {
    id: string,
    name: string,
    country: string,
    industry: string,
    materials: string[],
    status: 'active' | 'inactive' | 'pending',
    rating?: number,
    verified: boolean,
    updateType: 'new' | 'updated' | 'status_changed',
    timestamp: number,
  }
}

// Logistics Updates
{
  type: 'logistics:update',
  data: {
    id: string,
    trackingNumber?: string,
    routeId?: string,
    status: 'pending' | 'in_transit' | 'delivered',
    origin: string,
    destination: string,
    currentLocation?: { lat: number; lng: number },
    timestamp: number,
  }
}
```

## Testing

### Test WebSocket Connection

```typescript
import { websocketService } from './services/websocket';

// Test connection
websocketService.connect().then(() => {
  console.log('Connected!');
  
  // Test subscription
  websocketService.subscribe('prices', { material: 'cement' });
  
  // Test listener
  websocketService.on('price:update', (message) => {
    console.log('Price update received:', message.data);
  });
});
```

## Troubleshooting

### WebSocket Won't Connect
1. Check `VITE_WS_URL` environment variable
2. Ensure backend WebSocket server is running
3. Check browser console for errors
4. Verify token is being sent correctly

### No Updates Received
1. Verify subscription is active
2. Check backend is emitting events
3. Verify filters match backend data
4. Check network tab for WebSocket messages

### Performance Issues
1. Reduce update frequency
2. Implement debouncing/throttling
3. Limit number of subscriptions
4. Use virtual scrolling for large lists




