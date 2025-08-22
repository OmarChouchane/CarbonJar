"use client";

import { useEffect, useRef, useState } from "react";

export type NotificationItem = {
  id: string;
  content: string;
  status: "read" | "unread";
  createdAt: string;
  updatedAt: string;
  type?: string;
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/notifications", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch notifications");
      const data = await res.json();
      setItems(data.items || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Optional: simple polling every 60s
    const t = setInterval(fetchNotifications, 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [open]);

  const markAllRead = async () => {
    try {
      await fetch("/api/user/notifications", { method: "PATCH" });
      await fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleRead = async (id: string, current: "read" | "unread") => {
    try {
      const next = current === "read" ? "unread" : "read";
      const res = await fetch(`/api/user/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Failed to update notification");
      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: next } : n))
      );
      setUnreadCount((c) => Math.max(0, c + (next === "unread" ? 1 : -1)));
    } catch (e) {
      console.error(e);
    }
  };

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/user/notifications/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete notification");
      setItems((prev) => {
        const next = prev.filter((n) => n.id !== id);
        const nextUnread = next.filter((n) => n.status === "unread").length;
        setUnreadCount(nextUnread);
        return next;
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        className="relative p-2 rounded-full hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        aria-label="Notifications"
        onClick={() => setOpen((o) => !o)}
      >
        <svg
          className="h-6 w-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-3 border-b flex items-center justify-between">
            <span className="font-medium text-gray-800">Notifications</span>
            <button
              className="text-xs text-green hover:underline disabled:opacity-50"
              onClick={markAllRead}
              disabled={loading || unreadCount === 0}
            >
              Mark all as read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-sm text-gray-500">Loading…</div>
            ) : items.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
                You're all caught up.
              </div>
            ) : (
              <ul className="divide-y">
                {items.map((n) => (
                  <li
                    key={n.id}
                    className={`p-3 flex gap-2 items-start ${
                      n.status === "unread" ? "bg-green-50" : "bg-white"
                    }`}
                  >
                    <div className="flex-1 text-sm text-gray-800 text-left">
                      <div className="whitespace-pre-wrap break-words">
                        {n.content}
                      </div>
                      <div className="mt-1 text-xs text-gray-500">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <button
                        className="text-xs text-green hover:underline"
                        onClick={() => toggleRead(n.id, n.status)}
                        title={
                          n.status === "unread"
                            ? "Mark as read"
                            : "Mark as unread"
                        }
                      >
                        {n.status === "unread" ? "Mark read" : "Mark unread"}
                      </button>
                      <button
                        className="text-xs text-red-600 hover:underline"
                        onClick={() => remove(n.id)}
                        title="Delete"
                      >
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
