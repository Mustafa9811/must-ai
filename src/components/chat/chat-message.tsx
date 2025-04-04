"use client";

import { useRef, useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { Message } from "ai";
import { cn } from "@/lib/utils";
import { UserAvatar } from "@/components/ui/user-avatar";
import { BotAvatar } from "@/components/ui/bot-avatar";
import { Button } from "@/components/ui/button";
import { CopyIcon, CheckIcon } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "sonner";

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
}

export function ChatMessage({ message, isLoading }: ChatMessageProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
  });
  const [isCopied, setIsCopied] = useRef(false);

  const isUser = message.role === "user";
  const messageContent = message.content;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(messageContent);
      setIsCopied.current = true;
      toast.success("Message copied to clipboard");
      setTimeout(() => {
        setIsCopied.current = false;
      }, 2000);
    } catch (error) {
      toast.error("Failed to copy message");
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group relative mb-4 flex items-start gap-3 px-4",
        isUser ? "flex-row-reverse" : ""
      )}
    >
      {isUser ? (
        <UserAvatar />
      ) : (
        <BotAvatar />
      )}
      <div
        className={cn(
          "flex flex-col space-y-2 rounded-lg p-4",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted"
        )}
      >
        <ReactMarkdown
          className="prose prose-sm dark:prose-invert max-w-none"
          remarkPlugins={[remarkGfm]}
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || "");
              return !inline && match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            },
            ul({ children }) {
              return <ul className="list-disc pl-4">{children}</ul>;
            },
            ol({ children }) {
              return <ol className="list-decimal pl-4">{children}</ol>;
            },
            li({ children }) {
              return <li className="mb-1">{children}</li>;
            },
            a({ href, children }) {
              return (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  {children}
                </a>
              );
            },
          }}
        >
          {messageContent}
        </ReactMarkdown>
      </div>
      {!isUser && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={copyToClipboard}
        >
          {isCopied.current ? (
            <CheckIcon className="h-4 w-4" />
          ) : (
            <CopyIcon className="h-4 w-4" />
          )}
          <span className="sr-only">Copy message</span>
        </Button>
      )}
    </motion.div>
  );
}
