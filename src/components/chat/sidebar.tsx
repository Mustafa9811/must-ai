"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PanelLeftIcon, PlusIcon, LogOut } from "lucide-react";
import { ChatHistory } from "./chat-history";
import { UserAvatar } from "../ui/user-avatar";
import { ModeToggle } from "../ui/mode-toggle";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const handleNewChat = () => {
    router.push("/");
  };

  const handleAnalyze = () => {
    router.push("/analyze");
  };

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-2 top-2 z-50 md:hidden"
        onClick={toggleSidebar}
      >
        <PanelLeftIcon className="h-5 w-5" />
      </Button>

      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col bg-background/80 backdrop-blur-md",
          className
        )}
      >
        <div className="flex h-14 items-center border-b px-4">
          <div className="flex items-center gap-2">
            <div className="font-bold">MusTax AI</div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="ml-auto"
            onClick={toggleSidebar}
          >
            <PanelLeftIcon className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <Button onClick={handleNewChat} className="w-full justify-start gap-2">
            <PlusIcon className="h-4 w-4" />
            New Chat
          </Button>
          <Button 
            onClick={handleAnalyze} 
            className="w-full justify-start gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <div className="relative">
              <span className="absolute -right-1 -top-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500"></span>
              </span>
              <span>MusTax AI Analyze</span>
            </div>
          </Button>
          <Separator className="my-2" />
          <ScrollArea className="flex-1">
            <ChatHistory />
          </ScrollArea>
        </div>
        <div className="border-t p-4">
          <div className="flex items-center justify-between">
            {session?.user && (
              <div className="flex items-center gap-2">
                <UserAvatar user={session.user} />
                <div className="text-sm font-medium">
                  {session.user.name || session.user.email}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <ModeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
