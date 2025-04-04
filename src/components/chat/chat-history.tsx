"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MessageSquare } from "lucide-react";

interface Chat {
  id: string;
  title: string;
  createdAt: Date;
}

interface ChatHistoryProps {
  className?: string;
}

export function ChatHistory({ className }: ChatHistoryProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch("/api/chat/history");
        if (response.ok) {
          const data = await response.json();
          setChats(data);
        }
      } catch (error) {
        console.error("Failed to fetch chat history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChats();
  }, []);

  const handleChatSelect = (chatId: string) => {
    router.push(`/chat/${chatId}`);
  };

  // Group chats by date
  const groupedChats = chats.reduce<Record<string, Chat[]>>((groups, chat) => {
    const date = new Date(chat.createdAt);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    let groupKey: string;
    
    if (date.toDateString() === today.toDateString()) {
      groupKey = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      groupKey = "Yesterday";
    } else if (
      date.getTime() > today.getTime() - 7 * 24 * 60 * 60 * 1000
    ) {
      groupKey = "Last 7 Days";
    } else if (
      date.getTime() > today.getTime() - 30 * 24 * 60 * 60 * 1000
    ) {
      groupKey = "Last 30 Days";
    } else {
      groupKey = "Older";
    }

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    
    groups[groupKey].push(chat);
    return groups;
  }, {});

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center text-sm text-muted-foreground">
        <MessageSquare className="mb-2 h-10 w-10 opacity-50" />
        <p>No chat history found</p>
        <p>Start a new chat to begin</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full pr-2">
      {Object.entries(groupedChats).map(([group, groupChats]) => (
        <div key={group} className="mb-4">
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">
            {group}
          </h3>
          <div className="space-y-1">
            {groupChats.map((chat) => (
              <Button
                key={chat.id}
                variant="ghost"
                className="w-full justify-start truncate text-left"
                onClick={() => handleChatSelect(chat.id)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                <span className="truncate">{chat.title}</span>
              </Button>
            ))}
          </div>
          <Separator className="my-2" />
        </div>
      ))}
    </ScrollArea>
  );
}
