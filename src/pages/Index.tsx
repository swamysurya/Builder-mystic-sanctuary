import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, MessageSquare } from "lucide-react";
import IssueSubmissionForm from "@/components/IssueSubmissionForm";
import IssuesList from "@/components/IssuesList";
import ChatInterface from "@/components/ChatInterface";
import { Issue, ChatMessage, ResolutionStatus } from "@/lib/types";
import {
  generateMockIssues,
  generateMockChatMessages,
  saveToLocalStorage,
  loadFromLocalStorage,
  STORAGE_KEYS,
  generateId,
  currentUser,
} from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type View = "submit" | "issues" | "chat";

export default function Index() {
  const [currentView, setCurrentView] = useState<View>("issues");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [chatMessages, setChatMessages] = useState<
    Record<string, ChatMessage[]>
  >({});
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  // Initialize data on component mount
  useEffect(() => {
    const savedIssues = loadFromLocalStorage(STORAGE_KEYS.ISSUES, []);
    const savedMessages = loadFromLocalStorage(STORAGE_KEYS.CHAT_MESSAGES, {});

    if (savedIssues.length === 0) {
      // Generate initial mock data
      const mockIssues = generateMockIssues();
      setIssues(mockIssues);
      saveToLocalStorage(STORAGE_KEYS.ISSUES, mockIssues);

      // Generate mock chat messages for each issue
      const mockMessages: Record<string, ChatMessage[]> = {};
      mockIssues.forEach((issue) => {
        mockMessages[issue.id] = generateMockChatMessages(issue.id);
      });
      setChatMessages(mockMessages);
      saveToLocalStorage(STORAGE_KEYS.CHAT_MESSAGES, mockMessages);
    } else {
      setIssues(savedIssues);
      setChatMessages(savedMessages);
    }
  }, []);

  const handleSubmitIssue = (newIssue: Issue) => {
    const updatedIssues = [newIssue, ...issues];
    setIssues(updatedIssues);
    saveToLocalStorage(STORAGE_KEYS.ISSUES, updatedIssues);

    // Generate initial chat messages for the new issue
    const initialMessages = generateMockChatMessages(newIssue.id);
    const updatedMessages = { ...chatMessages, [newIssue.id]: initialMessages };
    setChatMessages(updatedMessages);
    saveToLocalStorage(STORAGE_KEYS.CHAT_MESSAGES, updatedMessages);

    setCurrentView("issues");
  };

  const handleStatusChange = (issueId: string, status: ResolutionStatus) => {
    const updatedIssues = issues.map((issue) =>
      issue.id === issueId
        ? { ...issue, status, updatedAt: new Date() }
        : issue,
    );
    setIssues(updatedIssues);
    saveToLocalStorage(STORAGE_KEYS.ISSUES, updatedIssues);

    // Add system message about status change
    const systemMessage: ChatMessage = {
      id: generateId(),
      issueId,
      sender: "System",
      message: `Issue status changed to "${status.replace("-", " ")}"`,
      timestamp: new Date(),
      isSystem: true,
    };

    const updatedMessages = {
      ...chatMessages,
      [issueId]: [...(chatMessages[issueId] || []), systemMessage],
    };
    setChatMessages(updatedMessages);
    saveToLocalStorage(STORAGE_KEYS.CHAT_MESSAGES, updatedMessages);
  };

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
    setCurrentView("chat");
  };

  const handleSendMessage = (issueId: string, message: string) => {
    const newMessage: ChatMessage = {
      id: generateId(),
      issueId,
      sender: currentUser.name,
      message,
      timestamp: new Date(),
      isSystem: false,
    };

    const updatedMessages = {
      ...chatMessages,
      [issueId]: [...(chatMessages[issueId] || []), newMessage],
    };
    setChatMessages(updatedMessages);
    saveToLocalStorage(STORAGE_KEYS.CHAT_MESSAGES, updatedMessages);

    // Simulate auto-response after a delay
    setTimeout(
      () => {
        const autoResponses = [
          "Thanks for the update! I'll look into this right away.",
          "I've received your message and will get back to you shortly.",
          "Let me check on this and I'll update you soon.",
          "Thanks for the additional information. This helps a lot!",
          "I'm working on this now. I'll keep you posted on the progress.",
        ];

        const autoResponse: ChatMessage = {
          id: generateId(),
          issueId,
          sender: "Sarah Wilson",
          message:
            autoResponses[Math.floor(Math.random() * autoResponses.length)],
          timestamp: new Date(),
          isSystem: false,
        };

        setChatMessages((prev) => {
          const updated = {
            ...prev,
            [issueId]: [...(prev[issueId] || []), autoResponse],
          };
          saveToLocalStorage(STORAGE_KEYS.CHAT_MESSAGES, updated);
          return updated;
        });
      },
      2000 + Math.random() * 3000,
    );
  };

  if (currentView === "chat" && selectedIssue) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ChatInterface
          issue={selectedIssue}
          messages={chatMessages[selectedIssue.id] || []}
          onBack={() => setCurrentView("issues")}
          onSendMessage={handleSendMessage}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Issue Tracker
            </h1>
            <p className="text-muted-foreground mt-2">
              Streamline your workflow with intelligent issue management
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              variant={currentView === "issues" ? "default" : "outline"}
              onClick={() => setCurrentView("issues")}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              All Issues
            </Button>
            <Button
              variant={currentView === "submit" ? "default" : "outline"}
              onClick={() => setCurrentView("submit")}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Issue
            </Button>
          </div>
        </div>

        {/* Main Content */}
        {currentView === "submit" && (
          <IssueSubmissionForm
            onSubmit={handleSubmitIssue}
            onCancel={() => setCurrentView("issues")}
          />
        )}

        {currentView === "issues" && (
          <IssuesList
            issues={issues}
            onIssueClick={handleIssueClick}
            onStatusChange={handleStatusChange}
          />
        )}
      </div>
    </div>
  );
}
