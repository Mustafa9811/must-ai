"use client";

import { useState, useRef } from "react";
import { useChat } from "ai/react";
import { Message } from "ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpIcon, StopCircle } from "lucide-react";
import { ChatMessage } from "../chat/chat-message";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";

interface AnalysisFollowUpChatProps {
  analysisId: string;
}

export function AnalysisFollowUpChat({ analysisId }: AnalysisFollowUpChatProps) {
  const [inputValue, setInputValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    stop,
  } = useChat({
    api: `/api/analyze/question`,
    body: {
      analysisId,
    },
    onResponse: () => {
      setInputValue("");
    },
  });

  // Auto-resize textarea
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    handleInputChange(e);
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  // Scroll to bottom when messages change
  useState(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  });

  return (
    <div className="flex flex-col h-[500px] border rounded-lg overflow-hidden">
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <p className="text-muted-foreground">
              Ask specific questions about your analyzed document. For example:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              <li>"What are the key tax implications mentioned in this document?"</li>
              <li>"Explain the deductible expenses in this financial statement."</li>
              <li>"How does this affect my corporate tax liability?"</li>
            </ul>
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
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>
      
      <div className="border-t p-4">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <Textarea
            ref={textareaRef}
            tabIndex={0}
            placeholder="Ask a question about your document..."
            value={inputValue}
            onChange={handleTextareaChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
              }
            }}
            className="min-h-[60px] w-full resize-none rounded-md border border-input bg-background p-3 pr-12 focus-visible:ring-0"
          />
          <div className="absolute bottom-3 right-3">
            {isLoading ? (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={() => stop()}
              >
                <StopCircle className="h-5 w-5" />
                <span className="sr-only">Stop generating</span>
              </Button>
            ) : (
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                disabled={!inputValue.trim() || isLoading}
              >
                <ArrowUpIcon className="h-5 w-5" />
                <span className="sr-only">Send message</span>
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
