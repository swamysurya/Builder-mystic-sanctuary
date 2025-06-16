#!/usr/bin/env node

/**
 * Simple script to start the backend server
 * Run this separately if you want to use real Google Drive uploads
 *
 * Usage: node start-backend.js
 */

import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log("🚀 Starting Issue Tracker Backend Server...");
console.log(
  "📝 Make sure you have configured Google Drive credentials in .env",
);
console.log("📖 See GOOGLE_DRIVE_SETUP.md for setup instructions");
console.log("");

const serverPath = join(__dirname, "server", "index.js");

const server = spawn("node", [serverPath], {
  stdio: "inherit",
  cwd: __dirname,
});

server.on("error", (error) => {
  console.error("❌ Failed to start server:", error.message);
  process.exit(1);
});

server.on("close", (code) => {
  console.log(`\n📛 Server exited with code ${code}`);
  process.exit(code);
});

// Handle graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down server...");
  server.kill("SIGINT");
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down server...");
  server.kill("SIGTERM");
});
