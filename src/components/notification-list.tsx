"use client";

import Link from "next/link";
import { useState } from "react";
import type { ApiNotification } from "@/lib/member-api";

export function NotificationList({ initialNotifications }: { initialNotifications: ApiNotification[] }) {
  const [notifications, setNotifications] = useState(initialNotifications);

  async function markRead(notification: ApiNotification) {
    if (notification.read_at) return;
    const response = await fetch(`/api/dashboard/notifications/${notification.notification_id}/read`, { method: "POST" });
    if (response.ok) setNotifications((items) => items.map((item) => item.notification_id === notification.notification_id ? { ...item, read_at: new Date().toISOString() } : item));
  }

  if (!notifications.length) return <section className="panel p-6 text-sm text-muted">You’re all caught up.</section>;
  return <section className="grid gap-3">
    {notifications.map((notification) => {
      return <article key={notification.notification_id} className={`panel p-5 ${notification.read_at ? "opacity-70" : "border-accent"}`}>
        <div className="flex items-start gap-3">
          <span className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${notification.read_at ? "bg-line" : "bg-accent"}`} aria-hidden="true" />
          <div className="min-w-0 flex-1"><h2 className="text-sm font-medium">{notification.href ? <Link href={notification.href} onClick={() => markRead(notification)} className="hover:text-accent">{notification.title}</Link> : notification.title}</h2><p className="mt-1 text-sm leading-relaxed text-muted">{notification.body}</p><time className="mt-3 block text-xs text-muted" dateTime={notification.created_at}>{new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(notification.created_at))}</time></div>
          {!notification.read_at && <button type="button" className="text-xs text-accent hover:underline" onClick={() => markRead(notification)}>Mark read</button>}
        </div>
      </article>;
    })}
  </section>;
}
