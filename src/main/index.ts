import { app, BrowserWindow, ipcMain } from "electron";
import { spawn, ChildProcess } from "child_process";
import { createWindow, type AppWindowMode } from "./window";
import { createMenu } from "./menu";
import { setupMenuHandlers } from "./menuHandlers";
import { setupFileSystemHandlers } from "./fs";
import { FEATURE_FLAGS } from "./constants/features";
import * as path from "path";
import * as fs from "fs";

app.setName("FreeSSH");

let goBackend: ChildProcess | null = null;
let stdoutBuffer = "";
const windowModes = new Map<number, AppWindowMode>();
const requestOwners = new Map<string, number>();
const sessionOwners = new Map<string, number>();
let backendRestartTimer: ReturnType<typeof setTimeout> | null = null;
let backendRestartAttempts = 0;
let backendStopping = false;

const BACKEND_RESTART_BASE_MS = 500;
const BACKEND_RESTART_MAX_MS = 10_000;

type BackendMessage = {
  type?: string;
  request_id?: string;
  session_id?: string;
  data?: unknown;
};

function getWindowForMessage(message: BackendMessage): BrowserWindow | null {
  const requestId = typeof message.request_id === "string" ? message.request_id : "";
  if (requestId) {
    const ownerWindowId = requestOwners.get(requestId);
    if (ownerWindowId !== undefined) {
      const ownerWindow = BrowserWindow.fromId(ownerWindowId);
      if (ownerWindow && !ownerWindow.isDestroyed()) {
        return ownerWindow;
      }
      requestOwners.delete(requestId);
    }
  }

  const sessionId = typeof message.session_id === "string" ? message.session_id : "";
  if (sessionId) {
    const ownerWindowId = sessionOwners.get(sessionId);
    if (ownerWindowId !== undefined) {
      const ownerWindow = BrowserWindow.fromId(ownerWindowId);
      if (ownerWindow && !ownerWindow.isDestroyed()) {
        return ownerWindow;
      }
      sessionOwners.delete(sessionId);
    }
  }

  return null;
}

function getSessionIdFromMessage(message: BackendMessage): string | null {
  if (typeof message.session_id === "string" && message.session_id) {
    return message.session_id;
  }

  if (
    message.type === "session_status" &&
    message.data &&
    typeof message.data === "object" &&
    "id" in message.data &&
    typeof (message.data as { id?: unknown }).id === "string"
  ) {
    return (message.data as { id: string }).id;
  }

  return null;
}

function rememberSessionOwner(message: BackendMessage, windowId: number): void {
  const sessionId = getSessionIdFromMessage(message);
  if (!sessionId) return;

  sessionOwners.set(sessionId, windowId);
}

function clearWindowOwnership(windowId: number): void {
  for (const [requestId, ownerWindowId] of requestOwners.entries()) {
    if (ownerWindowId === windowId) {
      requestOwners.delete(requestId);
    }
  }

  for (const [sessionId, ownerWindowId] of sessionOwners.entries()) {
    if (ownerWindowId === windowId) {
      sessionOwners.delete(sessionId);
    }
  }
}

// Start Go backend
function startBackend() {
  if (goBackend) {
    return;
  }

  const isDev = !app.isPackaged;
  const binaryName = process.platform === "win32" ? "server.exe" : "server";
  const binaryPath = resolveBackendPath(isDev, binaryName);

  goBackend = spawn(binaryPath, [], {
    stdio: ["pipe", "pipe", "pipe"],
  });

  goBackend.once("spawn", () => {
    backendRestartAttempts = 0;
  });

  goBackend.on("error", (error) => {
    console.error("Failed to start backend:", error);
    scheduleBackendRestart("error");
  });

  goBackend.stdout?.on("data", (data: Buffer) => {
    stdoutBuffer += data.toString();
    const lines = stdoutBuffer.split("\n");
    stdoutBuffer = lines.pop() || ""; // Keep incomplete line in buffer

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const message = JSON.parse(line) as BackendMessage;
        const targetWindow = getWindowForMessage(message);

        if (targetWindow) {
          rememberSessionOwner(message, targetWindow.id);
          targetWindow.webContents.send("backend:message", message);

          const sessionId = getSessionIdFromMessage(message);
          if (
            sessionId &&
            message.type === "session_status" &&
            message.data &&
            typeof message.data === "object" &&
            "status" in message.data
          ) {
            const status = (message.data as { status?: unknown }).status;
            if (status === "disconnected") {
              sessionOwners.delete(sessionId);
            }
          }

          continue;
        }

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
    scheduleBackendRestart("exit");
  });
}

function scheduleBackendRestart(reason: "error" | "exit") {
  if (backendStopping) return;
  if (backendRestartTimer) return;

  const delay = Math.min(
    BACKEND_RESTART_BASE_MS * Math.pow(2, backendRestartAttempts),
    BACKEND_RESTART_MAX_MS
  );

  backendRestartAttempts += 1;
  backendRestartTimer = setTimeout(() => {
    backendRestartTimer = null;
    if (!backendStopping) {
      console.log(`Restarting backend after ${reason}...`);
      startBackend();
    }
  }, delay);
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
    if (message && typeof message.request_id === "string" && message.request_id) {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        requestOwners.set(message.request_id, window.id);
      }
    }

    if (message && typeof message.session_id === "string" && message.session_id) {
      const window = BrowserWindow.fromWebContents(event.sender);
      if (window) {
        sessionOwners.set(message.session_id, window.id);
      }
    }

    const json = JSON.stringify(message) + "\n";
    goBackend.stdin.write(json);
  }
});

app.whenReady().then(() => {
  ipcMain.on("ping", () => console.log("pong"));
  ipcMain.on("workspace:window-mode:set", (event, payload: { mode?: AppWindowMode }) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) return;
    const mode = payload?.mode === "workspace" ? "workspace" : "primary";
    windowModes.set(window.id, mode);
  });

  ipcMain.handle("workspace:create-window", () => {
    if (!FEATURE_FLAGS.DETACHABLE_WORKSPACES) {
      return { ok: false, reason: "feature_disabled" };
    }

    const window = createWindow({ mode: "workspace" });
    windowModes.set(window.id, "workspace");
    window.on("closed", () => {
      clearWindowOwnership(window.id);
      windowModes.delete(window.id);
    });

    return { ok: true, windowId: window.id };
  });

  ipcMain.handle("workspace:get-window-context", (event) => {
    const window = BrowserWindow.fromWebContents(event.sender);
    if (!window) {
      return { mode: "primary" as AppWindowMode, windowId: -1 };
    }

    const mode = windowModes.get(window.id) ?? "primary";
    return { mode, windowId: window.id };
  });

  setupFileSystemHandlers();
  setupMenuHandlers();
  createMenu();
  startBackend();
  const window = createWindow({ mode: "primary" });
  windowModes.set(window.id, "primary");
  window.on("closed", () => {
    clearWindowOwnership(window.id);
    windowModes.delete(window.id);
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      const newWindow = createWindow({ mode: "primary" });
      windowModes.set(newWindow.id, "primary");
      newWindow.on("closed", () => {
        clearWindowOwnership(newWindow.id);
        windowModes.delete(newWindow.id);
      });
    }
  });
});

app.on("window-all-closed", () => {
  backendStopping = true;
  if (backendRestartTimer) {
    clearTimeout(backendRestartTimer);
    backendRestartTimer = null;
  }
  if (goBackend) {
    goBackend.kill();
  }
  if (process.platform !== "darwin") {
    app.quit();
  }
});
