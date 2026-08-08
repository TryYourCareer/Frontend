/**
 * useCommunityMessages — real-time message hook.
 *
 * Behaviour:
 * 1. On mount, fetches paginated history from GET /api/communities/{id}/messages.
 * 2. Opens a Supabase Realtime channel scoped to community_id, listening for
 *    INSERT events on the `messages` table.
 * 3. Appends new messages and dedupes by id.
 * 4. Cleans up the Realtime channel on unmount.
 * 5. Exposes loadMore() for cursor-based pagination.
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import api from "../lib/api";

export function useCommunityMessages(communityId) {
  const [messages, setMessages]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [hasMore, setHasMore]       = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const cursorRef = useRef(null);  // ISO datetime of oldest fetched message

  // -----------------------------------------------------------------------
  // Merge helper — inserts new messages and dedupes by id, preserving order
  // -----------------------------------------------------------------------
  const mergeMessages = useCallback((existing, incoming) => {
    const seen = new Map(existing.map((m) => [m.id, m]));
    for (const m of incoming) {
      seen.set(m.id, m);
    }
    // Sort oldest → newest for display
    return Array.from(seen.values()).sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );
  }, []);

  // -----------------------------------------------------------------------
  // Initial load
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!communityId) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setMessages([]);
    cursorRef.current = null;

    api
      .get(`/api/communities/${communityId}/messages?limit=50`)
      .then((data) => {
        if (cancelled) return;
        // API returns newest-first; we reverse for display (oldest first)
        const ordered = [...(data.messages || [])].reverse();
        setMessages(ordered);
        setHasMore(Boolean(data.next_cursor));
        cursorRef.current = data.next_cursor || null;
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Failed to load messages.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [communityId]);

  // -----------------------------------------------------------------------
  // Supabase Realtime subscription
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!communityId) return;

    const channel = supabase
      .channel(`messages:community_id=eq.${communityId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `community_id=eq.${communityId}`,
        },
        (payload) => {
          const newMsg = payload.new;
          setMessages((prev) => mergeMessages(prev, [newMsg]));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [communityId, mergeMessages]);

  // -----------------------------------------------------------------------
  // Load older messages (pagination)
  // -----------------------------------------------------------------------
  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !cursorRef.current) return;
    setLoadingMore(true);
    try {
      const data = await api.get(
        `/api/communities/${communityId}/messages?limit=50&cursor=${encodeURIComponent(cursorRef.current)}`
      );
      const older = [...(data.messages || [])].reverse();
      setMessages((prev) => mergeMessages(older, prev));
      setHasMore(Boolean(data.next_cursor));
      cursorRef.current = data.next_cursor || null;
    } catch (err) {
      setError(err.message || "Failed to load more messages.");
    } finally {
      setLoadingMore(false);
    }
  }, [communityId, hasMore, loadingMore, mergeMessages]);

  return { messages, loading, error, hasMore, loadingMore, loadMore };
}

export default useCommunityMessages;
