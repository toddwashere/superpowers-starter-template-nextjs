"use client";

import { useRef, useState } from "react";
import { authClient } from "@/features/auth/data/auth-client";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { toast } from "@workspace/ui/components/sonner";

export function ProfileSettings() {
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const [name, setName] = useState(user?.name ?? "");
  const [imageUrl, setImageUrl] = useState(user?.image ?? "");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDirty =
    name !== (user?.name ?? "") || imageUrl !== (user?.image ?? "");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageUrl((ev.target?.result as string) ?? "");
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await authClient.updateUser({ name, image: imageUrl });
      if (result.error) {
        toast.error(result.error.message ?? "Failed to update profile");
        return;
      }
      toast.success("Profile updated");
    } finally {
      setIsLoading(false);
    }
  };

  const displayName = user?.name ?? "User";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>Update your display name and avatar.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group relative"
            aria-label="Change avatar"
          >
            <Avatar className="size-16">
              <AvatarImage src={imageUrl} alt={displayName} />
              <AvatarFallback className="text-lg">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
              Change
            </span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageChange}
          />
          <p className="text-sm text-muted-foreground">
            Click avatar to upload. Stored as base64 — swap in S3/R2 for
            production.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
          />
        </div>
        <div className="space-y-2">
          <Label>Email</Label>
          <Input value={user?.email ?? ""} readOnly disabled />
          <p className="text-xs text-muted-foreground">
            Change your email in the Email section below.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={!isDirty || isLoading}>
          {isLoading ? "Saving..." : "Save changes"}
        </Button>
      </CardFooter>
    </Card>
  );
}
