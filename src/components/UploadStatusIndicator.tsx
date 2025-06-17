import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Cloud, HardDrive, Wifi, WifiOff } from "lucide-react";
import { checkServerHealth } from "@/lib/googleDriveUpload";

export function UploadStatusIndicator() {
  const [isServerHealthy, setIsServerHealthy] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      setIsChecking(true);
      try {
        // Check if we're in a hosted environment with localhost backend
        const isHostedEnvironment =
          !window.location.hostname.includes("localhost") &&
          !window.location.hostname.includes("127.0.0.1") &&
          !window.location.hostname.includes("0.0.0.0");

        const API_BASE_URL =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
        const shouldSkipCheck =
          isHostedEnvironment && API_BASE_URL.includes("localhost");

        if (shouldSkipCheck) {
          // Skip health check in hosted environments
          setIsServerHealthy(false);
        } else {
          const healthy = await checkServerHealth();
          setIsServerHealthy(healthy);
        }
      } catch (error) {
        console.warn("Health check failed:", error);
        setIsServerHealthy(false);
      } finally {
        setIsChecking(false);
      }
    };

    // Add a small delay to prevent immediate fetch on component mount
    const timeoutId = setTimeout(checkHealth, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  if (isChecking) {
    return (
      <Badge variant="outline" className="gap-1">
        <Wifi className="h-3 w-3 animate-pulse" />
        Checking upload service...
      </Badge>
    );
  }

  if (isServerHealthy === true) {
    return (
      <Badge
        variant="default"
        className="gap-1 bg-green-500 hover:bg-green-600"
      >
        <Cloud className="h-3 w-3" />
        Cloudinary Active
      </Badge>
    );
  }

  // Check if we're in a hosted environment
  const isHostedEnvironment = !window.location.hostname.includes("localhost");

  return (
    <div className="space-y-2">
      <Badge variant="secondary" className="gap-1">
        <HardDrive className="h-3 w-3" />
        Demo Mode
      </Badge>
      <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <WifiOff className="h-4 w-4" />
        <AlertDescription className="text-sm">
          <strong>Demo Mode:</strong> Files are simulated and won't be stored.
          {isHostedEnvironment ? (
            <span>
              {" "}
              This demo shows the UI and functionality with mock data.
            </span>
          ) : (
            <span>
              {" "}
              To enable Cloudinary uploads, start the backend server with{" "}
              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                node start-backend.js
              </code>
            </span>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
