import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Send,
  Calendar,
  Clock,
  User,
  Bot,
  Paperclip,
  ExternalLink,
} from "lucide-react";
import { Issue, ChatMessage } from "@/lib/types";
import { generateId, currentUser } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ChatInterfaceProps {
  issue: Issue;
  messages: ChatMessage[];
  onBack: () => void;
  onSendMessage: (issueId: string, message: string) => void;
}

export default function ChatInterface({
  issue,
  messages,
  onBack,
  onSendMessage,
}: ChatInterfaceProps) {
  const [newMessage, setNewMessage] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(issue.id, newMessage.trim());
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "status-open";
      case "in-progress":
        return "status-in-progress";
      case "resolved":
        return "status-resolved";
      case "closed":
        return "status-closed";
      default:
        return "status-open";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "priority-low";
      case "medium":
        return "priority-medium";
      case "high":
        return "priority-high";
      case "urgent":
        return "priority-urgent";
      default:
        return "priority-medium";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "content":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "technical":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "general":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[80vh]">
      {/* Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Issues
            </Button>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge
                  variant="outline"
                  className={cn("status-badge", getStatusColor(issue.status))}
                >
                  {issue.status.replace("-", " ")}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn("status-badge", getTypeColor(issue.type))}
                >
                  {issue.type}
                </Badge>
                <span
                  className={cn(
                    "text-sm font-medium",
                    getPriorityColor(issue.priority),
                  )}
                >
                  {issue.priority.toUpperCase()}
                </span>
              </div>
              <CardTitle className="text-xl">{issue.title}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">{issue.description}</p>

            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>Submitted by {issue.submittedBy}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{format(issue.submittedAt, "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>Updated {format(issue.updatedAt, "MMM d, HH:mm")}</span>
              </div>
            </div>

            {issue.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {issue.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {issue.mediaFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Attachments:</h4>
                <div className="space-y-2">
                  {issue.mediaFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center space-x-2 p-2 bg-muted/50 rounded-md"
                    >
                      <Paperclip className="h-4 w-4" />
                      <span className="text-sm flex-1">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(file.url, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col">
        <CardHeader>
          <CardTitle className="text-lg">Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
            <div className="space-y-4 pb-4">
              {messages.map((message, index) => (
                <div key={message.id}>
                  {index > 0 &&
                    format(message.timestamp, "yyyy-MM-dd") !==
                      format(messages[index - 1].timestamp, "yyyy-MM-dd") && (
                      <div className="flex items-center my-4">
                        <Separator className="flex-1" />
                        <span className="px-3 text-xs text-muted-foreground bg-background">
                          {format(message.timestamp, "MMMM d, yyyy")}
                        </span>
                        <Separator className="flex-1" />
                      </div>
                    )}
                  <MessageBubble message={message} />
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
              />
              <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
}

function MessageBubble({ message }: MessageBubbleProps) {
  const isCurrentUser = message.sender === currentUser.name;
  const isSystem = message.isSystem;

  if (isSystem) {
    return (
      <div className="flex justify-center">
        <div className="bg-muted/50 rounded-lg px-3 py-2 max-w-md text-center">
          <p className="text-sm text-muted-foreground">{message.message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {format(message.timestamp, "HH:mm")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("flex", isCurrentUser ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "flex space-x-2 max-w-[80%]",
          isCurrentUser && "flex-row-reverse space-x-reverse",
        )}
      >
        <Avatar className="h-8 w-8 mt-1">
          <AvatarFallback className="text-xs">
            {isCurrentUser ? (
              currentUser.name
                .split(" ")
                .map((n) => n[0])
                .join("")
            ) : message.sender === "System" ? (
              <Bot className="h-4 w-4" />
            ) : (
              message.sender
                .split(" ")
                .map((n) => n[0])
                .join("")
            )}
          </AvatarFallback>
        </Avatar>

        <div className={cn("space-y-1", isCurrentUser && "items-end")}>
          <div
            className={cn(
              "rounded-lg px-3 py-2",
              isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted",
            )}
          >
            <p className="text-sm">{message.message}</p>
          </div>
          <div
            className={cn(
              "flex items-center space-x-2 text-xs text-muted-foreground",
              isCurrentUser && "justify-end",
            )}
          >
            <span>{message.sender}</span>
            <span>•</span>
            <span>{format(message.timestamp, "HH:mm")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
