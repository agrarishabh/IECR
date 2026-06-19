/* eslint-disable react-refresh/only-export-components */
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-react';
import { WatchlistProvider } from './context/WatchlistContext.jsx';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setTokenGetter } from './lib/api.js';
import api from './lib/api.js';
import { useEffect } from 'react';

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) throw new Error('Missing Publishable Key');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,      // 5 min — data stays fresh
      gcTime: 1000 * 60 * 10,         // 10 min — cache retention
      retry: 1,
      refetchOnWindowFocus: false,    // Don't refetch every tab switch
    },
  },
});

// Connects Clerk's getToken to the api.js interceptor
const TokenBridge = () => {
  const { getToken } = useAuth();
  useEffect(() => { setTokenGetter(getToken); }, [getToken]);
  return null;
};

// Syncs user to MongoDB bypassing Inngest webhooks
const UserSync = () => {
  const { user, isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      api.post('/api/users/sync', {
        name: user.fullName || user.firstName,
        email: user.primaryEmailAddress?.emailAddress,
        image: user.imageUrl,
      }).catch(err => console.error('Failed to sync user to DB:', err));
    }
  }, [isLoaded, isSignedIn, user]);

  return null;
};

import ErrorBoundary from './components/ErrorBoundary.jsx';
import { HelmetProvider } from 'react-helmet-async';

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <HelmetProvider>
      <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl='/'>
        <BrowserRouter>
          <QueryClientProvider client={queryClient}>
            <TokenBridge />
            <UserSync />
            <WatchlistProvider>
              <App />
            </WatchlistProvider>
          </QueryClientProvider>
        </BrowserRouter>
      </ClerkProvider>
    </HelmetProvider>
  </ErrorBoundary>,
);
