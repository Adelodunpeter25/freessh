import { app, BrowserWindow, ipcMain } from "electron";
import { spawn, ChildProcess } from "child_process";
import { createWindow } from "./window";
import { createMenu } from "./menu";
import { setupMenuHandlers } from "./menuHandlers";
import { setupFileSystemHandlers } from "./fs";
import * as path from "path";
import * as fs from "fs";

app.setName("FreeSSH");

let goBackend: ChildProcess | null = null;
let stdoutBuffer = "";

// Start Go backend
function startBackend() {
  const isDev = !app.isPackaged;
  const binaryName = process.platform === "win32" ? "server.exe" : "server";
  const binaryPath = resolveBackendPath(isDev, binaryName);

  goBackend = spawn(binaryPath, [], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  goBackend.on("error", (error) => {
    console.error("Failed to start backend:", error);
  });

  goBackend.stdout?.on("data", (data: Buffer) => {
    stdoutBuffer += data.toString();
    const lines = stdoutBuffer.split("\n");
    stdoutBuffer = lines.pop() || ""; // Keep incomplete line in buffer

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const message = JSON.parse(line);
        BrowserWindow.getAllWindows().forEach((win) => {
          win.webContents.send("backend:message", message);
        });
      } catch (error) {
        console.error("Failed to parse backend message:", error);
      }
    }
  });

  goBackend.stderr?.on("data", (data: Buffer) => {
    console.error("Backend error:", data.toString());
  });

  goBackend.on("exit", (code) => {
    console.log("Backend exited with code:", code);
    goBackend = null;
  });
}

function resolveBackendPath(isDev: boolean, binaryName: string): string {
  if (!isDev) {
    return path.join(process.resourcesPath, "backend", binaryName);
  }

  const candidates = [
    path.join(process.cwd(), "backend", "bin", binaryName),
    path.join(app.getAppPath(), "backend", "bin", binaryName),
    path.join(path.dirname(app.getAppPath()), "backend", "bin", binaryName),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  return candidates[0];
}

// Send message to Go backend
ipcMain.on("backend:send", (event, message) => {
  if (goBackend && goBackend.stdin) {
    const json = JSON.stringify(message) + "\n";
    goBackend.stdin.write(json);
  }
});

app.whenReady().then(() => {
  ipcMain.on("ping", () => console.log("pong"));

  setupFileSystemHandlers();
  setupMenuHandlers();
  createMenu();
  startBackend();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (goBackend) {
    goBackend.kill();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});
