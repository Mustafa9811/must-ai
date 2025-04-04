"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function AuthGuard({ 
  children, 
  requireAuth = true 
}: AuthGuardProps) {
  const { status } = useSession();
  
  if (status === "loading") {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && status !== "authenticated") {
    redirect("/login");
  }

  // If authentication is not required and user is authenticated (e.g., login page)
  if (!requireAuth && status === "authenticated") {
    redirect("/");
  }

  return <>{children}</>;
}
