import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Upload, X, FileText, Image, Video } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Issue, IssueType, Priority, MediaFile } from "@/lib/types";
import { generateId, currentUser } from "@/lib/mockData";
import { uploadMediaFileWithFallback } from "@/lib/googleDriveUpload";
import { UploadStatusIndicator } from "./UploadStatusIndicator";
import { cn } from "@/lib/utils";

interface IssueFormData {
  title: string;
  description: string;
  priority: Priority;
  tags: string;
  // Content specific
  contentType?: string;
  platform?: string;
  audience?: string;
  deadline?: string;
  // Technical specific
  systemType?: string;
  browser?: string;
  errorMessage?: string;
  stepsToReproduce?: string;
  // General specific
  category?: string;
  department?: string;
  urgency?: string;
}

interface IssueSubmissionFormProps {
  onSubmit: (issue: Issue) => void;
  onCancel?: () => void;
}

export default function IssueSubmissionForm({
  onSubmit,
  onCancel,
}: IssueSubmissionFormProps) {
  const [activeTab, setActiveTab] = useState<IssueType>("content");
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<IssueFormData>({
    defaultValues: {
      priority: "medium",
      tags: "",
    },
  });

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    for (const file of Array.from(files)) {
      const fileId = generateId();
      setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const current = prev[fileId] || 0;
            if (current >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return { ...prev, [fileId]: current + 10 };
          });
        }, 200);

        const uploadedFile = await uploadMediaFileWithFallback(file);

        clearInterval(progressInterval);
        setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));

        setTimeout(() => {
          setMediaFiles((prev) => [...prev, uploadedFile]);
          setUploadProgress((prev) => {
            const { [fileId]: _, ...rest } = prev;
            return rest;
          });

          // Show a subtle indicator if using mock upload
          if (
            uploadedFile.url.includes("mock") ||
            uploadedFile.url.includes(generateId())
          ) {
            console.log(
              "📁 File uploaded successfully (demo mode - using mock storage)",
            );
          } else {
            console.log("☁️ File uploaded to Google Drive successfully");
          }
        }, 500);
      } catch (error) {
        console.error("Upload failed:", error);

        // Clear progress and show error
        setUploadProgress((prev) => {
          const { [fileId]: _, ...rest } = prev;
          return rest;
        });

        // You could add toast notification here if available
        alert(
          `Upload failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        );
      }
    }
  };

  const removeMediaFile = (fileId: string) => {
    setMediaFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const onFormSubmit = async (data: IssueFormData) => {
    setIsSubmitting(true);

    try {
      const tags = data.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const issue: Issue = {
        id: generateId(),
        title: data.title,
        description: data.description,
        type: activeTab,
        priority: data.priority,
        status: "open",
        submittedBy: currentUser.name,
        submittedAt: new Date(),
        updatedAt: new Date(),
        tags,
        mediaFiles,
        ...(activeTab === "content" && {
          contentDetails: {
            contentType: data.contentType || "",
            platform: data.platform || "",
            audience: data.audience || "",
            deadline: data.deadline ? new Date(data.deadline) : undefined,
          },
        }),
        ...(activeTab === "technical" && {
          technicalDetails: {
            systemType: data.systemType || "",
            browser: data.browser,
            errorMessage: data.errorMessage,
            stepsToReproduce: data.stepsToReproduce,
          },
        }),
        ...(activeTab === "general" && {
          generalDetails: {
            category: data.category || "",
            department: data.department || "",
            urgency: data.urgency || "",
          },
        }),
      };

      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate submission
      onSubmit(issue);

      // Reset form
      reset();
      setMediaFiles([]);
      setActiveTab("content");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <Image className="h-4 w-4" />;
    if (type.startsWith("video/")) return <Video className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Submit New Issue</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as IssueType)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content" className="text-sm font-medium">
                Content Issues
              </TabsTrigger>
              <TabsTrigger value="technical" className="text-sm font-medium">
                Technical Issues
              </TabsTrigger>
              <TabsTrigger value="general" className="text-sm font-medium">
                General Requests
              </TabsTrigger>
            </TabsList>

            {/* Common Fields */}
            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Issue Title *</Label>
                  <Input
                    id="title"
                    {...register("title", { required: "Title is required" })}
                    placeholder="Brief description of the issue"
                    className={cn(errors.title && "border-red-500")}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">
                      {errors.title.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("priority", value as Priority)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register("description", {
                    required: "Description is required",
                  })}
                  placeholder="Provide detailed information about the issue"
                  className={cn(
                    "min-h-[100px]",
                    errors.description && "border-red-500",
                  )}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">
                    {errors.description.message}
                  </p>
                )}
              </div>
            </div>

            {/* Type-specific Fields */}
            <TabsContent value="content" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contentType">Content Type</Label>
                  <Select
                    onValueChange={(value) => setValue("contentType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blog">Blog Post</SelectItem>
                      <SelectItem value="social">Social Media</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="infographic">Infographic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform">Platform</Label>
                  <Select
                    onValueChange={(value) => setValue("platform", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="website">Website</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="youtube">YouTube</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="audience">Target Audience</Label>
                  <Select
                    onValueChange={(value) => setValue("audience", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select audience" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="b2b">B2B</SelectItem>
                      <SelectItem value="b2c">B2C</SelectItem>
                      <SelectItem value="internal">Internal</SelectItem>
                      <SelectItem value="partners">Partners</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline (Optional)</Label>
                <Input id="deadline" type="date" {...register("deadline")} />
              </div>
            </TabsContent>

            <TabsContent value="technical" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="systemType">System/Application</Label>
                  <Select
                    onValueChange={(value) => setValue("systemType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">Web Application</SelectItem>
                      <SelectItem value="mobile">Mobile App</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="network">Network</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="browser">Browser (if applicable)</Label>
                  <Select onValueChange={(value) => setValue("browser", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select browser" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="chrome">Chrome</SelectItem>
                      <SelectItem value="firefox">Firefox</SelectItem>
                      <SelectItem value="safari">Safari</SelectItem>
                      <SelectItem value="edge">Edge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="errorMessage">Error Message</Label>
                <Textarea
                  id="errorMessage"
                  {...register("errorMessage")}
                  placeholder="Copy and paste any error messages"
                  className="min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stepsToReproduce">Steps to Reproduce</Label>
                <Textarea
                  id="stepsToReproduce"
                  {...register("stepsToReproduce")}
                  placeholder="1. Go to..."
                  className="min-h-[100px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="general" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    onValueChange={(value) => setValue("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="access">Account Access</SelectItem>
                      <SelectItem value="feature">Feature Request</SelectItem>
                      <SelectItem value="policy">Policy Question</SelectItem>
                      <SelectItem value="training">Training</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <Select
                    onValueChange={(value) => setValue("department", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it">IT</SelectItem>
                      <SelectItem value="hr">HR</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="urgency">Urgency Level</Label>
                  <Select onValueChange={(value) => setValue("urgency", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Media Upload */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Attachments</Label>
              <UploadStatusIndicator />
            </div>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <div className="mt-4">
                  <Label
                    htmlFor="media-upload"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-foreground bg-primary hover:bg-primary/90"
                  >
                    Choose Files
                  </Label>
                  <Input
                    id="media-upload"
                    type="file"
                    multiple
                    accept="image/*,video/*,.pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e.target.files)}
                  />
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Support for images, videos, and documents
                </p>
              </div>
            </div>

            {/* Upload Progress */}
            {Object.entries(uploadProgress).map(([fileId, progress]) => (
              <div key={fileId} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            ))}

            {/* Uploaded Files */}
            {mediaFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Uploaded Files</Label>
                <div className="space-y-2">
                  {mediaFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        {getFileIcon(file.type)}
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMediaFile(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              {...register("tags")}
              placeholder="e.g. urgent, bug, ui"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Issue"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
