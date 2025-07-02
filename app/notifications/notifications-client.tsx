"use client";

import { useState, useOptimistic, startTransition } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/actions";
import { User } from "@/lib/types";

export default function NotificationsClient({ user }: { user: User }) {
  const [notifications, setNotifications] = useState(user.notifications || []);
  const [optimisticNotifications, addOptimisticNotification] = useOptimistic(
    notifications,
    (state, notificationIds: string | string[]) => {
      const ids = Array.isArray(notificationIds)
        ? notificationIds
        : [notificationIds];
      return state.map((n) => (ids.includes(n.id) ? { ...n, read: true } : n));
    }
  );

  const handleMarkAsRead = async (notificationId: string) => {
    startTransition(() => {
      addOptimisticNotification(notificationId);
    });

    // Call server action
    const formData = new FormData();
    formData.append("notificationId", notificationId);
    await markNotificationAsRead(null, formData);

    // Update local state after server action completes
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = async () => {
    const unreadIds = optimisticNotifications
      .filter((n) => !n.read)
      .map((n) => n.id);

    if (unreadIds.length === 0) return;

    startTransition(() => {
      addOptimisticNotification(unreadIds);
    });

    // Mark all notifications as read in a single server action
    const formData = new FormData();
    const result = await markAllNotificationsAsRead(null, formData);

    if (result.success) {
      // Update local state after server action completes
      setNotifications((prev) =>
        prev.map((n) => (unreadIds.includes(n.id) ? { ...n, read: true } : n))
      );
    } else {
      console.error("Failed to mark all notifications as read:", result.error);
    }
  };

  const unreadCount = optimisticNotifications.filter((n) => !n.read).length;

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <div className="flex items-center gap-4">
          <p className="text-sm text-muted-foreground">{unreadCount} unread</p>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {optimisticNotifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 bg-background border rounded-lg"
            >
              <p className="text-muted-foreground">No notifications yet</p>
            </motion.div>
          ) : (
            optimisticNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{
                  duration: 0.2,
                  delay: index * 0.05,
                }}
                layout
                className={cn(
                  "p-4 rounded-lg border shadow-sm transition-colors duration-200",
                  !notification.read ? "bg-accent/50" : "bg-background"
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm">{notification.message}</p>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-blue-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString()} at{" "}
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="hidden sm:inline-flex whitespace-nowrap"
                      >
                        Mark as read
                      </Button>
                    )}
                    <Link
                      href={`/orders/${notification.orderId}`}
                      className="flex-shrink-0"
                    >
                      <Button variant="outline" size="sm">
                        View Order
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
