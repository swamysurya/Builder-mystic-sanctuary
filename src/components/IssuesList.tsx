import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  MessageSquare,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Pause,
  Paperclip,
} from "lucide-react";
import { Issue, ResolutionStatus, IssueType, Priority } from "@/lib/types";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface IssuesListProps {
  issues: Issue[];
  onIssueClick: (issue: Issue) => void;
  onStatusChange: (issueId: string, status: ResolutionStatus) => void;
}

export default function IssuesList({
  issues,
  onIssueClick,
  onStatusChange,
}: IssuesListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<ResolutionStatus | "all">(
    "all",
  );
  const [typeFilter, setTypeFilter] = useState<IssueType | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<Priority | "all">("all");

  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      const matchesSearch =
        issue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        issue.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase()),
        );

      const matchesStatus =
        statusFilter === "all" || issue.status === statusFilter;
      const matchesType = typeFilter === "all" || issue.type === typeFilter;
      const matchesPriority =
        priorityFilter === "all" || issue.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesType && matchesPriority;
    });
  }, [issues, searchTerm, statusFilter, typeFilter, priorityFilter]);

  const getStatusIcon = (status: ResolutionStatus) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4" />;
      case "in-progress":
        return <Pause className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "closed":
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ResolutionStatus) => {
    switch (status) {
      case "open":
        return "status-open";
      case "in-progress":
        return "status-in-progress";
      case "resolved":
        return "status-resolved";
      case "closed":
        return "status-closed";
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "low":
        return "priority-low";
      case "medium":
        return "priority-medium";
      case "high":
        return "priority-high";
      case "urgent":
        return "priority-urgent";
    }
  };

  const getTypeColor = (type: IssueType) => {
    switch (type) {
      case "content":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "technical":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "general":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
    }
  };

  const issuesByStatus = useMemo(() => {
    const grouped = filteredIssues.reduce(
      (acc, issue) => {
        if (!acc[issue.status]) {
          acc[issue.status] = [];
        }
        acc[issue.status].push(issue);
        return acc;
      },
      {} as Record<ResolutionStatus, Issue[]>,
    );

    // Sort each group by date
    Object.keys(grouped).forEach((status) => {
      grouped[status as ResolutionStatus].sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      );
    });

    return grouped;
  }, [filteredIssues]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Issues Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as ResolutionStatus | "all")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={typeFilter}
              onValueChange={(value) =>
                setTypeFilter(value as IssueType | "all")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="content">Content</SelectItem>
                <SelectItem value="technical">Technical</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={priorityFilter}
              onValueChange={(value) =>
                setPriorityFilter(value as Priority | "all")
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Issues Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(issuesByStatus).map(([status, statusIssues]) => (
          <Card key={status}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(status as ResolutionStatus)}
                <div>
                  <p className="text-2xl font-bold">{statusIssues.length}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {status.replace("-", " ")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Issues List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">
            All Issues ({filteredIssues.length})
          </TabsTrigger>
          <TabsTrigger value="open">
            Open ({issuesByStatus.open?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="in-progress">
            In Progress ({issuesByStatus["in-progress"]?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({issuesByStatus.resolved?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredIssues.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  No issues found matching your criteria.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredIssues.map((issue) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  onClick={() => onIssueClick(issue)}
                  onStatusChange={onStatusChange}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {Object.entries(issuesByStatus).map(([status, statusIssues]) => (
          <TabsContent key={status} value={status} className="space-y-4">
            {statusIssues.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">
                    No {status.replace("-", " ")} issues.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {statusIssues.map((issue) => (
                  <IssueCard
                    key={issue.id}
                    issue={issue}
                    onClick={() => onIssueClick(issue)}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

interface IssueCardProps {
  issue: Issue;
  onClick: () => void;
  onStatusChange: (issueId: string, status: ResolutionStatus) => void;
}

function IssueCard({ issue, onClick, onStatusChange }: IssueCardProps) {
  const getStatusIcon = (status: ResolutionStatus) => {
    switch (status) {
      case "open":
        return <AlertCircle className="h-4 w-4" />;
      case "in-progress":
        return <Pause className="h-4 w-4" />;
      case "resolved":
        return <CheckCircle className="h-4 w-4" />;
      case "closed":
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ResolutionStatus) => {
    switch (status) {
      case "open":
        return "status-open";
      case "in-progress":
        return "status-in-progress";
      case "resolved":
        return "status-resolved";
      case "closed":
        return "status-closed";
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case "low":
        return "priority-low";
      case "medium":
        return "priority-medium";
      case "high":
        return "priority-high";
      case "urgent":
        return "priority-urgent";
    }
  };

  const getTypeColor = (type: IssueType) => {
    switch (type) {
      case "content":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      case "technical":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300";
      case "general":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
    }
  };

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0" onClick={onClick}>
            <div className="flex items-center space-x-2 mb-2">
              <Badge
                variant="outline"
                className={cn("status-badge", getStatusColor(issue.status))}
              >
                {getStatusIcon(issue.status)}
                <span className="ml-1 capitalize">
                  {issue.status.replace("-", " ")}
                </span>
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

            <h3 className="text-lg font-semibold mb-2 truncate">
              {issue.title}
            </h3>
            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {issue.description}
            </p>

            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Avatar className="h-5 w-5">
                  <AvatarFallback className="text-xs">
                    {issue.submittedBy
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <span>{issue.submittedBy}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{format(issue.submittedAt, "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{format(issue.updatedAt, "MMM d, HH:mm")}</span>
              </div>
              {issue.mediaFiles.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Paperclip className="h-4 w-4" />
                  <span>{issue.mediaFiles.length}</span>
                </div>
              )}
            </div>

            {issue.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {issue.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col space-y-2 ml-4">
            <Select
              value={issue.status}
              onValueChange={(value) =>
                onStatusChange(issue.id, value as ResolutionStatus)
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm" onClick={onClick}>
              <MessageSquare className="h-4 w-4 mr-1" />
              Chat
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
