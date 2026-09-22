import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../lib/api";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    if (!token && !user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setLoading(true);
      const data = await api.get(`/notifications${unreadOnly ? "?unread_only=true" : ""}`);
      if (data && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count ?? 0);
      }
    } catch (err) {
      console.warn("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [token, user]);

  const fetchUnreadCount = useCallback(async () => {
    if (!token && !user) return;
    try {
      const data = await api.get("/notifications/unread-count");
      if (data && typeof data.unread_count === "number") {
        setUnreadCount(data.unread_count);
      }
    } catch {
      // silent
    }
  }, [token, user]);

  // Initial fetch on login / token update
  useEffect(() => {
    if (token || user) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [token, user, fetchNotifications]);

  // Background polling every 60s
  useEffect(() => {
    if (!token && !user) return;
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 60000);
    return () => clearInterval(interval);
  }, [token, user, fetchUnreadCount]);

  const markAsRead = useCallback(async (notificationId) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      const data = await api.patch(`/notifications/${notificationId}/read`);
      if (data && typeof data.unread_count === "number") {
        setUnreadCount(data.unread_count);
      }
    } catch (err) {
      console.warn("Failed to mark notification as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    try {
      const data = await api.patch("/notifications/read-all");
      if (data && typeof data.unread_count === "number") {
        setUnreadCount(data.unread_count);
      }
    } catch (err) {
      console.warn("Failed to mark all as read:", err);
    }
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    const target = notifications.find((n) => n.id === notificationId);
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    if (target && !target.is_read) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await api.delete(`/notifications/${notificationId}`);
    } catch (err) {
      console.warn("Failed to delete notification:", err);
    }
  }, [notifications]);

  const clearAllRead = useCallback(async () => {
    setNotifications((prev) => prev.filter((n) => !n.is_read));
    try {
      await api.delete("/notifications");
    } catch (err) {
      console.warn("Failed to clear read notifications:", err);
    }
  }, []);

  const seedDemoNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.post("/notifications/seed", {});
      if (data && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count ?? 0);
      }
    } catch (err) {
      console.warn("Failed to seed notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    isOpen,
    setIsOpen,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllRead,
    seedDemoNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
