export type IssueType = "content" | "technical" | "general";

export type ResolutionStatus = "open" | "in-progress" | "resolved" | "closed";

export type Priority = "low" | "medium" | "high" | "urgent";

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  type: IssueType;
  priority: Priority;
  status: ResolutionStatus;
  submittedBy: string;
  submittedAt: Date;
  updatedAt: Date;
  tags: string[];
  mediaFiles: MediaFile[];
  // Type-specific fields
  contentDetails?: {
    contentType: string;
    platform: string;
    audience: string;
    deadline?: Date;
  };
  technicalDetails?: {
    systemType: string;
    browser?: string;
    errorMessage?: string;
    stepsToReproduce?: string;
  };
  generalDetails?: {
    category: string;
    department: string;
    urgency: string;
  };
}

export interface ChatMessage {
  id: string;
  issueId: string;
  sender: string;
  message: string;
  timestamp: Date;
  isSystem: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "user" | "admin" | "support";
}
