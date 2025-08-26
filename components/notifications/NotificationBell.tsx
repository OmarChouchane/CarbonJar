'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export type NotificationItem = {
  id: string;
  content: string;
  status: 'read' | 'unread';
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

  type NotificationsResponse = { items?: NotificationItem[]; unreadCount?: number };

  const fetchNotifications = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const res = await fetch('/api/user/notifications', { cache: 'no-store' });
      if (!res.ok) throw new Error('Failed to fetch notifications');
      const data = (await res.json()) as NotificationsResponse;
      setItems(data.items ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchNotifications();
    // Optional: simple polling every 60s
    const t = setInterval(() => {
      void fetchNotifications();
    }, 60000);
    return () => clearInterval(t);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const markAllRead = async () => {
    try {
      await fetch('/api/user/notifications', { method: 'PATCH' });
      await fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleRead = async (id: string, current: 'read' | 'unread') => {
    try {
      const next = current === 'read' ? 'unread' : 'read';
      const res = await fetch(`/api/user/notifications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error('Failed to update notification');
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, status: next } : n)));
      setUnreadCount((c) => Math.max(0, c + (next === 'unread' ? 1 : -1)));
    } catch (e) {
      console.error(e);
    }
  };

  const remove = async (id: string) => {
    try {
      const res = await fetch(`/api/user/notifications/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete notification');
      setItems((prev) => {
        const next = prev.filter((n) => n.id !== id);
        const nextUnread = next.filter((n) => n.status === 'unread').length;
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
        className="relative rounded-full p-2 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:outline-none"
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
          <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-xs leading-none font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-lg border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b p-3">
            <span className="font-medium text-gray-800">Notifications</span>
            <button
              className="text-green text-xs hover:underline disabled:opacity-50"
              onClick={() => {
                void markAllRead();
              }}
              disabled={loading || unreadCount === 0}
            >
              Mark all as read
            </button>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-sm text-gray-500">Loading…</div>
            ) : items.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">You&#39;re all caught up.</div>
            ) : (
              <ul className="divide-y">
                {items.map((n) => (
                  <li
                    key={n.id}
                    className={`flex items-start gap-2 p-3 ${
                      n.status === 'unread' ? 'bg-green-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex-1 text-left text-sm text-gray-800">
                      <div className="break-words whitespace-pre-wrap">{n.content}</div>
                      <div className="mt-1 text-xs text-gray-500">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <button
                        className="text-green text-xs hover:underline"
                        onClick={() => {
                          void toggleRead(n.id, n.status);
                        }}
                        title={n.status === 'unread' ? 'Mark as read' : 'Mark as unread'}
                      >
                        {n.status === 'unread' ? 'Mark read' : 'Mark unread'}
                      </button>
                      <button
                        className="text-xs text-red-600 hover:underline"
                        onClick={() => {
                          void remove(n.id);
                        }}
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
