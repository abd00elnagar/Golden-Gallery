"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { markNotificationAsRead } from "@/lib/actions";
import { User } from "@/lib/types";
import { useOptimistic } from "react";

export default function NotificationsClient({ user }: { user: User }) {
  const [optimisticNotifications, addOptimisticNotification] = useOptimistic(
    user.notifications || [],
    (state, notificationId: string) =>
      state.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
  );

  const handleMarkAsRead = async (notificationId: string) => {
    // Optimistically update UI
    addOptimisticNotification(notificationId);

    // Call server action
    const formData = new FormData();
    formData.append("notificationId", notificationId);
    await markNotificationAsRead(null, formData);
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notifications</h1>
        <p className="text-sm text-muted-foreground">
          {optimisticNotifications.filter((n) => !n.read).length} unread
        </p>
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
