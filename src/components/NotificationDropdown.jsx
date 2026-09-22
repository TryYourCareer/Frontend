import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Trash2,
  ExternalLink,
  Target,
  Compass,
  MessageSquare,
  Award,
  Sparkles,
  Inbox,
  X,
} from "lucide-react";
import { useNotifications } from "../contexts/NotificationContext";

function formatRelativeTime(dateString) {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

function getCategoryMeta(category) {
  switch (category) {
    case "mission":
      return {
        icon: Target,
        color: "text-sky-600 bg-sky-50 border-sky-200",
        label: "Mission",
      };
    case "career":
      return {
        icon: Compass,
        color: "text-purple-600 bg-purple-50 border-purple-200",
        label: "Career",
      };
    case "community":
      return {
        icon: MessageSquare,
        color: "text-emerald-600 bg-emerald-50 border-emerald-200",
        label: "Community",
      };
    case "assessment":
      return {
        icon: Award,
        color: "text-amber-600 bg-amber-50 border-amber-200",
        label: "Assessment",
      };
    case "system":
    default:
      return {
        icon: Sparkles,
        color: "text-blue-600 bg-blue-50 border-blue-200",
        label: "Update",
      };
  }
}

export default function NotificationDropdown({ isDark = false }) {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    isOpen,
    setIsOpen,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllRead,
  } = useNotifications();

  const [activeTab, setActiveTab] = useState("all"); // "all" | "unread"
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread") return !n.is_read;
    return true;
  });

  const handleNotificationClick = (item) => {
    if (!item.is_read) {
      markAsRead(item.id);
    }
    if (item.link) {
      setIsOpen(false);
      navigate(item.link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative rounded-xl p-2 transition cursor-pointer flex items-center justify-center ${
          isOpen
            ? isDark
              ? "bg-slate-800 text-sky-400"
              : "bg-[#e0f2fe] text-[#0284c7]"
            : isDark
            ? "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            : "text-slate-600 hover:bg-[#F0F6FC] hover:text-[#0b1a36]"
        }`}
        aria-label="Notifications"
      >
        <Bell size={19} className={unreadCount > 0 ? "animate-wiggle" : ""} />

        {/* Unread Pill / Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-red-500 to-rose-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-sm shadow-red-500/40 animate-pulse">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown (Always in pure White Mode) */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2.5 w-[360px] sm:w-[400px] max-w-[calc(100vw-32px)] rounded-2xl shadow-2xl border border-slate-200 bg-white text-slate-900 z-50 overflow-hidden flex flex-col transition-all duration-200 animate-in fade-in zoom-in-95 origin-top-right"
          style={{ maxHeight: "560px" }}
        >
          {/* Header */}
          <div className="px-4 py-3.5 border-b border-slate-100 bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-[11px] font-semibold bg-[#e0f2fe] text-[#0284c7] px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-medium text-[#0284c7] hover:text-[#0369a1] hover:bg-sky-50 px-2 py-1 rounded-lg transition cursor-pointer"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-black p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center px-4 pt-2 border-b border-slate-100 bg-white gap-4 text-xs font-semibold">
            <button
              onClick={() => setActiveTab("all")}
              className={`pb-2.5 relative transition cursor-pointer ${
                activeTab === "all"
                  ? "text-[#0284c7] border-b-2 border-[#0284c7] font-bold"
                  : "text-slate-500 hover:text-black"
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setActiveTab("unread")}
              className={`pb-2.5 relative transition cursor-pointer ${
                activeTab === "unread"
                  ? "text-[#0284c7] border-b-2 border-[#0284c7] font-bold"
                  : "text-slate-500 hover:text-black"
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 max-h-[380px] bg-white">
            {loading && notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 animate-pulse">
                Loading notifications...
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <Inbox className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  {activeTab === "unread" ? "No unread notifications" : "No notifications yet"}
                </p>
                <p className="text-[11px] text-slate-500 max-w-[200px]">
                  You're all caught up! New missions, updates, and community alerts will show here.
                </p>
              </div>
            ) : (
              filteredNotifications.map((item) => {
                const meta = getCategoryMeta(item.category);
                const IconComponent = meta.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleNotificationClick(item)}
                    className={`group relative p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-slate-100 ${
                      !item.is_read
                        ? "bg-sky-50/50"
                        : "bg-white"
                    }`}
                  >
                    {/* Unread Indicator Dot */}
                    {!item.is_read && (
                      <span className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-[#0284c7]" />
                    )}

                    {/* Category Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${meta.color}`}
                    >
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center justify-between gap-1.5 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-black transition-colors">
                          {meta.label}
                        </span>
                        <span className="text-[10px] text-slate-400 group-hover:text-black shrink-0 transition-colors">
                          {formatRelativeTime(item.created_at)}
                        </span>
                      </div>

                      <h4
                        className={`text-xs line-clamp-1 mb-0.5 group-hover:text-black transition-colors ${
                          !item.is_read
                            ? "text-slate-900 font-bold"
                            : "text-slate-700 font-semibold"
                        }`}
                      >
                        {item.title}
                      </h4>

                      <p className="text-[11px] text-slate-600 group-hover:text-black line-clamp-2 leading-relaxed transition-colors">
                        {item.message}
                      </p>

                      {item.link && (
                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-bold text-[#0284c7] group-hover:text-black group-hover:underline transition-colors">
                          <span>View details</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </div>
                      )}
                    </div>

                    {/* Delete button on hover */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(item.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 group-hover:text-black transition rounded-md cursor-pointer"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.some((n) => n.is_read) && (
            <div className="p-2.5 border-t border-slate-100 bg-slate-50 text-center">
              <button
                onClick={clearAllRead}
                className="text-[11px] font-semibold text-slate-600 hover:text-black transition cursor-pointer"
              >
                Clear all read notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
