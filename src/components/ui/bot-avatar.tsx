"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function BotAvatar() {
  return (
    <Avatar>
      <AvatarImage src="/bot-avatar.png" alt="MusTax AI" />
      <AvatarFallback>AI</AvatarFallback>
    </Avatar>
  );
}
