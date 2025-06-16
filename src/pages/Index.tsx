import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  MessageSquare,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Clock,
  Zap,
} from "lucide-react";
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

type View = "dashboard" | "submit" | "issues" | "chat";

export default function Index() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
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

  const getIssueStats = () => {
    const stats = {
      total: issues.length,
      open: issues.filter((i) => i.status === "open").length,
      inProgress: issues.filter((i) => i.status === "in-progress").length,
      resolved: issues.filter((i) => i.status === "resolved").length,
      urgent: issues.filter((i) => i.priority === "urgent").length,
    };
    return stats;
  };

  const getRecentActivity = () => {
    return issues
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 5);
  };

  const stats = getIssueStats();
  const recentActivity = getRecentActivity();

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
              variant={currentView === "dashboard" ? "default" : "outline"}
              onClick={() => setCurrentView("dashboard")}
            >
              Dashboard
            </Button>
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
        {currentView === "dashboard" && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100">Total Issues</p>
                      <p className="text-3xl font-bold">{stats.total}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full">
                      <MessageSquare className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-orange-100">Open</p>
                      <p className="text-3xl font-bold">{stats.open}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-100">In Progress</p>
                      <p className="text-3xl font-bold">{stats.inProgress}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full">
                      <Clock className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100">Resolved</p>
                      <p className="text-3xl font-bold">{stats.resolved}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full">
                      <CheckCircle className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100">Urgent</p>
                      <p className="text-3xl font-bold">{stats.urgent}</p>
                    </div>
                    <div className="p-3 bg-white/20 rounded-full">
                      <Zap className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Zap className="h-5 w-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="w-full justify-start h-12"
                    onClick={() => setCurrentView("submit")}
                  >
                    <Plus className="h-5 w-5 mr-3" />
                    Submit New Issue
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12"
                    onClick={() => setCurrentView("issues")}
                  >
                    <MessageSquare className="h-5 w-5 mr-3" />
                    View All Issues
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start h-12"
                    onClick={() => {
                      const openIssues = issues.filter(
                        (i) => i.status === "open",
                      );
                      if (openIssues.length > 0) {
                        handleIssueClick(openIssues[0]);
                      }
                    }}
                  >
                    <Calendar className="h-5 w-5 mr-3" />
                    View Open Issues
                  </Button>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.map((issue) => (
                      <div
                        key={issue.id}
                        className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleIssueClick(issue)}
                      >
                        <div className="flex-shrink-0">
                          <Badge
                            variant="outline"
                            className={cn(
                              "status-badge",
                              issue.status === "open" && "status-open",
                              issue.status === "in-progress" &&
                                "status-in-progress",
                              issue.status === "resolved" && "status-resolved",
                              issue.status === "closed" && "status-closed",
                            )}
                          >
                            {issue.status}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {issue.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Updated {format(issue.updatedAt, "MMM d, HH:mm")}
                          </p>
                        </div>
                      </div>
                    ))}
                    {recentActivity.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No recent activity
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Welcome Message */}
            <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-200 dark:border-blue-800">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-blue-500 rounded-full">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      Welcome to Issue Tracker
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Efficiently manage and track issues across your
                      organization. Submit new issues, collaborate with your
                      team, and monitor progress in real-time.
                    </p>
                    <div className="flex space-x-3">
                      <Button
                        size="sm"
                        onClick={() => setCurrentView("submit")}
                      >
                        Get Started
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentView("issues")}
                      >
                        Browse Issues
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {currentView === "submit" && (
          <IssueSubmissionForm
            onSubmit={handleSubmitIssue}
            onCancel={() => setCurrentView("dashboard")}
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
