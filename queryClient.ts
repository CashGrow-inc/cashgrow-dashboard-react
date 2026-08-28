import { QueryClient } from '@tanstack/react-query';

/**
 * The cache that makes tab switching free.
 *
 * `App.tsx` renders one screen at a time, so every tab switch unmounts the
 * previous screen and destroys its `useState`. This store lives outside the
 * React tree, so an unmounted screen's data survives and its next mount
 * renders from memory instead of re-hitting the API.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data younger than this renders straight from cache with no request.
      // Matches the 30s poll the screens used to run by hand, so revisiting a
      // tab is no staler than sitting on it was.
      staleTime: 30_000,
      // Keep entries around long after unmount — this is the part that makes
      // returning to a screen instant. Mirrors the backend summary cache TTL
      // (account/services/cache.py).
      gcTime: 10 * 60_000,
      retry: 1,
    },
  },
});

/** Poll interval for the screen-level summary queries. */
export const POLL_MS = 30_000;
