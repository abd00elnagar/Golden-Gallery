"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { updateProfile } from "./actions";
import { useEffect } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={"outline"}
      className="w-full sm:w-auto"
      disabled={pending}
    >
      {pending ? "Saving..." : "Save Changes"}
    </Button>
  );
}

export function ProfileForm({ user }: { user: User | null }) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(updateProfile, null);

  // Handle form state changes
  useEffect(() => {
    if (state?.error) {
      toast({
        title: "Error",
        description: state.error,
        variant: "destructive",
      });
    } else if (state?.success) {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="userId" value={user?.id} />
      <Card>
        <CardHeader>
          <CardTitle>Profile Picture</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage
                  src={user?.image || "/placeholder.svg"}
                  alt={user?.name || ""}
                />
                <AvatarFallback className="text-lg">
                  {user?.name}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-semibold">{user?.name}</h3>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Personal Information</CardTitle>
          <SubmitButton />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" defaultValue={user?.name || ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                name="email"
                value={user?.email || ""}
                disabled={true}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Enter your phone number"
                defaultValue={user?.phone || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                name="address"
                placeholder="Enter your address"
                defaultValue={user?.address || ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Member Since</Label>
            <p className="text-sm text-muted-foreground">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </p>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
