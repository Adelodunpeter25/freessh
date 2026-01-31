# Missing Features & Edge Cases

## SFTP Features (Not Implemented)

_All SFTP features have been implemented!_

---

## UI/UX Improvements

### Session Tab Naming
**Description:** Detect duplicate session tab names and append (1), (2), etc.  
**Current behavior:** Multiple tabs can have the same name (e.g., "Local Terminal", "Local Terminal")  
**Expected behavior:** Auto-increment duplicates → "Local Terminal", "Local Terminal (1)", "Local Terminal (2)"  
**Implementation needed:**
- Track existing tab names when creating new sessions
- Detect duplicates and append counter
- Update counter when tabs are closed/renamed

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