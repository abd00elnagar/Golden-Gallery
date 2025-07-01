"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { markNotificationAsRead } from "@/lib/actions";
import { User } from "@/lib/types";
import { useOptimistic, useTransition } from "react";

const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

export function NotificationDropdown({ user }: { user: User }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(false);
  const [isPending, startTransition] = useTransition();
  const [optimisticNotifications, addOptimisticNotification] = useOptimistic(
    user.notifications || [],
    (state, notificationId: string) =>
      state.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
  );

  // Get unread count
  const unreadCount = optimisticNotifications.filter((n) => !n.read).length;

  // Get latest 3 notifications
  const latestNotifications = optimisticNotifications.slice(0, 3);

  const handleNotificationClick = async (
    notificationId: string,
    orderId: string
  ) => {
    // Close dropdown and navigate
    setIsOpen(false);

    startTransition(async () => {
      // Optimistically update UI
      addOptimisticNotification(notificationId);

      // Call server action
      const formData = new FormData();
      formData.append("notificationId", notificationId);
      await markNotificationAsRead(null, formData);

      // Navigate
      router.push(`/orders/${orderId}`);
    });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative w-10 h-10 rounded-full flex items-center justify-center hover:bg-accent"
          aria-label={`Notifications ${
            unreadCount > 0 ? `(${unreadCount} unread)` : ""
          }`}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 flex items-center justify-center">
              <div className="relative">
                <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-75" />
                <div className="relative rounded-full bg-red-500 h-5 w-5 flex items-center justify-center">
                  <span className="text-[10px] font-medium text-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 md:w-96 p-2"
        sideOffset={8}
      >
        {latestNotifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <>
            {latestNotifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={cn(
                  "p-4 cursor-pointer space-y-1 focus:bg-accent",
                  !notification.read && "bg-accent/50"
                )}
                onClick={() =>
                  handleNotificationClick(notification.id, notification.orderId)
                }
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm leading-none">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString()} at{" "}
                      {new Date(notification.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuItem
              className="w-full p-2 text-center text-sm text-primary hover:text-primary/80 cursor-pointer mt-2 focus:bg-accent"
              onClick={() => {
                setIsOpen(false);
                router.push("/notifications");
              }}
            >
              View all notifications
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
