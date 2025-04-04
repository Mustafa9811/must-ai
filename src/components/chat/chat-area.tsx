"use client";

import { useEffect, useRef } from "react";
import { useChat } from "ai/react";
import { Message } from "ai";
import { cn } from "@/lib/utils";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { Button } from "@/components/ui/button";
import { PanelLeftIcon, PlusIcon, ArrowUpIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatAreaProps {
  className?: string;
  chatId?: string;
}

const WELCOME_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Welcome to MusTax AI! I'm here to help you with UAE Corporate Tax regulations, compliance, registration, free zones, small business relief, calculations, and other related topics. How can I assist you today?",
  createdAt: new Date(),
};

const SUGGESTED_PROMPTS = [
  "What are the UAE Corporate Tax rates?",
  "How do I register for Corporate Tax in UAE?",
  "Explain free zone tax benefits",
  "What is the small business relief?",
  "How are taxable profits calculated?",
];

export function ChatArea({ className, chatId }: ChatAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
    setMessages,
  } = useChat({
    api: chatId ? `/api/chat/${chatId}` : "/api/chat",
    initialMessages: chatId ? [] : [WELCOME_MESSAGE],
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSuggestedPrompt = (prompt: string) => {
    append({
      role: "user",
      content: prompt,
    });
  };

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="mb-4 text-3xl font-bold">Welcome to MusTax AI</h1>
              <p className="mb-8 text-muted-foreground">
                Your AI assistant for UAE Corporate Tax information and analysis
              </p>
              <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    className="justify-start text-left"
                    onClick={() => handleSuggestedPrompt(prompt)}
                  >
                    <ArrowUpIcon className="mr-2 h-4 w-4" />
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
              </div>
            )}
            {error && (
              <div className="rounded-md bg-destructive/10 p-4 text-destructive">
                <p>An error occurred. Please try again.</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      <Separator />
      <div className="p-4">
        <ChatInput chatId={chatId} />
      </div>
    </div>
  );
}
