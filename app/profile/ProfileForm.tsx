"use client";

import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProfileFormProps {
  user: {
    id: string;
    email: string;
    name: string;
    image: string | null;
    phone: string | null;
    address: string | null;
    role: "user" | "admin";
    google_id: string | null;
    created_at: string;
  } | null;
}
export function ProfileForm({ user }: ProfileFormProps) {
  return (
    <div className="space-y-6">
      {/* Profile Picture */}
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
                  alt={user?.name}
                />
                <AvatarFallback className="text-lg">
                  {user?.name}
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
              >
                <Camera className="h-4 w-4" />
                <span className="sr-only">Change profile picture</span>
              </Button>
            </div>
            <div className="text-center sm:text-left">
              <h3 className="font-semibold">{user?.name}</h3>
              <p className="text-sm text-muted-foreground">
                Click the camera icon to change your profile picture
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <CardTitle>Personal Information</CardTitle>
          <Button
            variant={"outline"}
            className="w-full sm:w-auto"
            onClick={() => {}}
          >
            Edit Profile
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={user?.name}
                onChange={(e) => {}}
                disabled={true}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={user?.email}
                onChange={(e) => {}}
                disabled={true}
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
    </div>
  );
}
