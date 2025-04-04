"use client";

import * as React from "react";
import { User } from "next-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserAvatarProps {
  user?: User;
  className?: string;
}

export function UserAvatar({ user, className }: UserAvatarProps) {
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : user?.email?.charAt(0) || "U";

  return (
    <Avatar className={className}>
      {user?.image ? (
        <AvatarImage src={user.image} alt={user.name || "User"} />
      ) : null}
      <AvatarFallback>{initials}</AvatarFallback>
    </Avatar>
  );
}
