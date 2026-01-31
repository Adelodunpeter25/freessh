# Missing Features & Edge Cases

## UI/UX Improvements

_All planned UI/UX improvements have been implemented!_

---

## Completed Features

### Authentication ✅
- SSH Key File Selection with browse dialog
- Password and Public Key authentication
- System keychain integration

### Connection Management ✅
- Connection Groups/Folders
- Auto-reconnect with exponential backoff
- Host key verification

### Terminal ✅
- Terminal resize handling
- Copy/paste support
- Search in terminal output
- Session logging to file

### Port Forwarding ✅
- Local/Remote/Dynamic (SOCKS) tunnels
- Tunnel management UI
- Auto-start on connection

### Settings ✅
- Theme toggle (Light/Dark/System)
- Log management
- Settings persistence

### Snippets/Commands ✅
- Snippet storage and management
- Command history tracking
- Variables/placeholders with runtime input
- Save from history to snippets

### SFTP ✅
- Remote to Remote Transfer
  - UI: Remote source panel with connection selector
  - Backend: Dual SFTP client handler with streaming between sessions
  - Transfer: Direct pipe from source to destination without local storage
  - Progress: Byte tracking for remote transfers
  - Cancellation: Full cancel support for remote transfers
  - Directory support: Recursive remote-to-remote transfers
- Drag and drop between panels
  - Local to remote (upload)
  - Remote to local (download)
  - Remote to remote (server-to-server)
  - Visual indicator overlay for all transfer types

### Session Management ✅
- Duplicate tab name detection
  - Automatic counter appending: "Local Terminal", "Local Terminal (1)", "Local Terminal (2)"
  - Works for all tab types: SSH connections, local terminals, and log viewers
  - Clean utility-based implementation for maintainability