"use client";

import { useRef, useState, useEffect } from "react";
import { useChat } from "ai/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpIcon, PaperclipIcon, StopCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface ChatInputProps {
  className?: string;
  chatId?: string;
}

export function ChatInput({ className, chatId }: ChatInputProps) {
  const [inputValue, setInputValue] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { input, handleInputChange, handleSubmit, isLoading, stop } = useChat({
    api: chatId ? `/api/chat/${chatId}` : "/api/chat",
    onResponse: () => {
      setInputValue("");
      setAttachments([]);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to send message");
    },
  });

  // Sync internal state with useChat input
  useEffect(() => {
    setInputValue(input);
  }, [input]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "inherit";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(file => {
      const validTypes = [
        "application/pdf", 
        "text/plain", 
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/msword",
        "image/jpeg",
        "image/png"
      ];
      const maxSize = 10 * 1024 * 1024; // 10MB
      
      if (!validTypes.includes(file.type)) {
        toast.error(`Invalid file type: ${file.name}`);
        return false;
      }
      
      if (file.size > maxSize) {
        toast.error(`File too large: ${file.name}`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length > 0) {
      setAttachments(prev => [...prev, ...validFiles]);
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadAttachments = async () => {
    if (attachments.length === 0) return null;
    
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      attachments.forEach(file => {
        formData.append("files", file);
      });
      
      const response = await fetch("/api/temp-documents", {
        method: "POST",
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload attachments");
      }
      
      const data = await response.json();
      return data.fileIds;
    } catch (error) {
      console.error("Error uploading attachments:", error);
      toast.error("Failed to upload attachments");
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!inputValue.trim() && attachments.length === 0) return;
    
    let message = inputValue;
    
    // If there are attachments, upload them first
    if (attachments.length > 0) {
      const fileIds = await handleUploadAttachments();
      if (fileIds) {
        // Append file references to message
        const fileNames = attachments.map(file => file.name).join(", ");
        const fileReference = `[Attached files: ${fileNames}]`;
        message = message ? `${message}\n\n${fileReference}` : fileReference;
      }
    }
    
    // Use the handleSubmit from useChat but with our processed message
    const customEvent = {
      currentTarget: {
        elements: {
          input: { value: message }
        }
      },
      preventDefault: () => {}
    } as unknown as React.FormEvent<HTMLFormElement>;
    
    handleSubmit(customEvent);
  };

  return (
    <div className={cn("relative pb-8", className)}>
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mb-2 flex flex-wrap gap-2"
          >
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-md bg-secondary p-2 text-xs"
              >
                <span className="truncate max-w-[150px]">{file.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4"
                  onClick={() => handleRemoveAttachment(index)}
                >
                  <span className="sr-only">Remove</span>
                  <span aria-hidden="true">×</span>
                </Button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={onSubmit} className="relative flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          tabIndex={0}
          placeholder="Type your message..."
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            handleInputChange(e);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
            }
          }}
          className="min-h-[60px] w-full resize-none rounded-md border border-input bg-background p-3 pr-12 focus-visible:ring-0"
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.txt,.docx,.doc,.jpg,.jpeg,.png"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading || isUploading}
          >
            <PaperclipIcon className="h-5 w-5" />
            <span className="sr-only">Attach files</span>
          </Button>
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
              disabled={(!inputValue.trim() && attachments.length === 0) || isLoading || isUploading}
            >
              <ArrowUpIcon className="h-5 w-5" />
              <span className="sr-only">Send message</span>
            </Button>
          )}
        </div>
      </form>
      {isUploading && (
        <div className="mt-2 text-xs text-muted-foreground">
          Uploading attachments...
        </div>
      )}
    </div>
  );
}
