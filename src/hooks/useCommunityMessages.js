/**
 * useCommunityMessages — real-time message hook.
 *
 * Behaviour:
 * 1. On mount, fetches paginated history from GET /api/communities/{id}/messages.
 * 2. Opens a Supabase Realtime channel scoped to community_id, listening for
 *    INSERT/UPDATE events on the `messages` table.
 * 3. Appends or updates messages and dedupes by id.
 * 4. Cleans up the Realtime channel on unmount.
 * 5. Exposes loadMore() for cursor-based pagination and deleteMessage().
 */
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import api from "../lib/api";

export function useCommunityMessages(communityId) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const cursorRef = useRef(null); // ISO datetime of oldest fetched message
  const localDeletedIdsRef = useRef(new Set());

  const mergeMessages = useCallback((existing, incoming) => {
    const seen = new Map();

    for (const m of existing) {
      const id = String(m.id);
      if (!localDeletedIdsRef.current.has(id) && !m.deleted_for_me) {
        seen.set(id, m);
      }
    }

    for (const m of incoming) {
      const id = String(m.id);
      if (localDeletedIdsRef.current.has(id) || m.deleted_for_me) {
        continue;
      }
      seen.set(id, m);
    }

    return Array.from(seen.values())
    .sort(
        (a, b) =>
            new Date(a.created_at) - new Date(b.created_at)
    );
  }, []);

  const deleteMessage = useCallback(async (messageId, mode = "everyone") => {
    const key = String(messageId);

    if (mode === "me") {
      localDeletedIdsRef.current.add(key);
      setMessages((prev) => prev.filter((message) => String(message.id) !== key));
      return { mode: "me", deleted_for_me: true };
    }

    localDeletedIdsRef.current.delete(key);

    try {
      const deletedMessage = await api.delete(`/api/messages/${messageId}`);
      setMessages((prev) =>
        prev.map((message) =>
          String(message.id) === key
            ? { ...message, ...(deletedMessage || {}), deleted: true }
            : message
        )
      );
      return deletedMessage;
    } catch (err) {
      setError(err.message || "Failed to delete message.");
      throw err;
    }
  }, []);

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
        const ordered = [...(data.messages || [])]
          .reverse()
          .filter((message) => !localDeletedIdsRef.current.has(String(message.id)));
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

  useEffect(() => {
    if (!communityId || !supabase?.channel) return;

    let channel;
    try {
      channel = supabase.channel(`messages:community_id=eq.${communityId}`);
      if (!channel?.on) return;

      channel
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
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "messages",
            filter: `community_id=eq.${communityId}`,
          },
          (payload) => {
            const updated = payload.new;
            setMessages((prev) => mergeMessages(prev, [updated]));
          }
        );

      if (typeof channel.subscribe === "function") {
        channel.subscribe();
      }
    } catch {
      return;
    }

    return () => {
      if (supabase?.removeChannel && channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [communityId, mergeMessages]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || !cursorRef.current) return;
    setLoadingMore(true);
    try {
      const data = await api.get(
        `/api/communities/${communityId}/messages?limit=50&cursor=${encodeURIComponent(cursorRef.current)}`
      );
      const older = [...(data.messages || [])]
        .reverse()
        .filter((message) => !localDeletedIdsRef.current.has(String(message.id)));
      setMessages((prev) => mergeMessages(older, prev));
      setHasMore(Boolean(data.next_cursor));
      cursorRef.current = data.next_cursor || null;
    } catch (err) {
      setError(err.message || "Failed to load more messages.");
    } finally {
      setLoadingMore(false);
    }
  }, [communityId, hasMore, loadingMore, mergeMessages]);

  return { messages, loading, error, hasMore, loadingMore, loadMore, deleteMessage };
}

export default useCommunityMessages;
