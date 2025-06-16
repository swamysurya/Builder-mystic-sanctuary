import {
  Issue,
  ChatMessage,
  User,
  IssueType,
  ResolutionStatus,
  Priority,
  MediaFile,
} from "./types";

// Generate unique IDs
export const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Mock users
export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Alex Johnson",
    email: "alex@company.com",
    avatar: "AJ",
    role: "user",
  },
  {
    id: "user-2",
    name: "Sarah Wilson",
    email: "sarah@company.com",
    avatar: "SW",
    role: "admin",
  },
  {
    id: "user-3",
    name: "Mike Chen",
    email: "mike@company.com",
    avatar: "MC",
    role: "support",
  },
];

// Current user (mock)
export const currentUser = mockUsers[0];

// Generate mock issues
const generateMockIssue = (type: IssueType, index: number): Issue => {
  const baseIssue = {
    id: generateId(),
    submittedBy: mockUsers[index % mockUsers.length].name,
    submittedAt: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    ),
    updatedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
    status: (
      ["open", "in-progress", "resolved", "closed"] as ResolutionStatus[]
    )[Math.floor(Math.random() * 4)],
    priority: (["low", "medium", "high", "urgent"] as Priority[])[
      Math.floor(Math.random() * 4)
    ],
    mediaFiles: [],
    tags: [],
  };

  switch (type) {
    case "content":
      return {
        ...baseIssue,
        type: "content",
        title: `Content Request: ${["Blog Post", "Social Media", "Newsletter", "Video Script"][index % 4]}`,
        description:
          "Need assistance with content creation and strategy for upcoming campaign.",
        tags: ["content", "marketing", "creative"],
        contentDetails: {
          contentType: ["blog", "social", "email", "video"][
            Math.floor(Math.random() * 4)
          ],
          platform: ["Website", "Instagram", "LinkedIn", "YouTube"][
            Math.floor(Math.random() * 4)
          ],
          audience: ["B2B", "B2C", "Internal", "Partners"][
            Math.floor(Math.random() * 4)
          ],
          deadline: new Date(
            Date.now() + Math.random() * 14 * 24 * 60 * 60 * 1000,
          ),
        },
      };
    case "technical":
      return {
        ...baseIssue,
        type: "technical",
        title: `Technical Issue: ${["Login Error", "Database Connection", "API Timeout", "UI Bug"][index % 4]}`,
        description:
          "Experiencing technical difficulties that need immediate attention.",
        tags: ["bug", "technical", "urgent"],
        technicalDetails: {
          systemType: ["Web Application", "Mobile App", "API", "Database"][
            Math.floor(Math.random() * 4)
          ],
          browser: ["Chrome", "Firefox", "Safari", "Edge"][
            Math.floor(Math.random() * 4)
          ],
          errorMessage: "TypeError: Cannot read property of undefined",
          stepsToReproduce:
            "1. Navigate to dashboard\n2. Click on user profile\n3. Error appears",
        },
      };
    case "general":
      return {
        ...baseIssue,
        type: "general",
        title: `General Request: ${["Account Access", "Feature Request", "Policy Question", "Training"][index % 4]}`,
        description:
          "General inquiry that requires attention from the appropriate team.",
        tags: ["general", "inquiry"],
        generalDetails: {
          category: ["Access", "Feature", "Policy", "Training"][
            Math.floor(Math.random() * 4)
          ],
          department: ["IT", "HR", "Marketing", "Sales"][
            Math.floor(Math.random() * 4)
          ],
          urgency: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)],
        },
      };
  }
};

// Generate initial mock issues
export const generateMockIssues = (): Issue[] => {
  const issues: Issue[] = [];
  const types: IssueType[] = ["content", "technical", "general"];

  for (let i = 0; i < 15; i++) {
    const type = types[i % 3];
    issues.push(generateMockIssue(type, i));
  }

  return issues.sort(
    (a, b) => b.submittedAt.getTime() - a.submittedAt.getTime(),
  );
};

// Generate mock chat messages for an issue
export const generateMockChatMessages = (issueId: string): ChatMessage[] => {
  const messages: ChatMessage[] = [];
  const responses = [
    "Thanks for reporting this issue. We'll look into it right away.",
    "I've assigned this to our technical team. You should hear back within 24 hours.",
    "Could you provide more details about when this started happening?",
    "We've identified the issue and are working on a fix.",
    "The issue has been resolved. Please let us know if you're still experiencing problems.",
    "I've updated the status. Is there anything else I can help you with?",
  ];

  // Initial system message
  messages.push({
    id: generateId(),
    issueId,
    sender: "System",
    message:
      "Issue created successfully. A support representative will be with you shortly.",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    isSystem: true,
  });

  // Add 2-4 mock responses
  const numMessages = 2 + Math.floor(Math.random() * 3);
  for (let i = 0; i < numMessages; i++) {
    messages.push({
      id: generateId(),
      issueId,
      sender: mockUsers[1 + (i % 2)].name,
      message: responses[i % responses.length],
      timestamp: new Date(Date.now() - (numMessages - i) * 30 * 60 * 1000),
      isSystem: false,
    });
  }

  return messages;
};

// Local storage utilities
export const STORAGE_KEYS = {
  ISSUES: "fusion-issues",
  CHAT_MESSAGES: "fusion-chat-messages",
} as const;

export const saveToLocalStorage = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save to localStorage:", error);
  }
};

export const loadFromLocalStorage = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects for issues
      if (key === STORAGE_KEYS.ISSUES && Array.isArray(parsed)) {
        return parsed.map((issue: any) => ({
          ...issue,
          submittedAt: new Date(issue.submittedAt),
          updatedAt: new Date(issue.updatedAt),
          contentDetails: issue.contentDetails
            ? {
                ...issue.contentDetails,
                deadline: issue.contentDetails.deadline
                  ? new Date(issue.contentDetails.deadline)
                  : undefined,
              }
            : undefined,
        })) as T;
      }
      // Convert date strings back to Date objects for chat messages
      if (key === STORAGE_KEYS.CHAT_MESSAGES) {
        Object.keys(parsed).forEach((issueId) => {
          parsed[issueId] = parsed[issueId].map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
        });
      }
      return parsed;
    }
  } catch (error) {
    console.error("Failed to load from localStorage:", error);
  }
  return defaultValue;
};

// API simulation for media upload
export const uploadMediaFile = async (file: File): Promise<MediaFile> => {
  // Simulate API call delay
  await new Promise((resolve) =>
    setTimeout(resolve, 1500 + Math.random() * 1000),
  );

  // Simulate Google Drive response
  const mockDriveLink = `https://drive.google.com/file/d/${generateId()}/view?usp=sharing`;

  return {
    id: generateId(),
    name: file.name,
    url: mockDriveLink,
    type: file.type,
    size: file.size,
    uploadedAt: new Date(),
  };
};
