# Missing Features & Edge Cases

## SFTP Features (Not Implemented)

### Remote to Remote Transfer
**Description:** Currently only supports local↔remote transfers. Need server-to-server direct transfers.  
**Implementation needed:**
- UI: Add "Remote Source" panel alongside existing local/remote panels
- Backend: Create dual SFTP client handler that streams between two SSH sessions
- Transfer: Direct pipe from source SFTP to destination SFTP without local storage
- Progress: Track bytes transferred between remote endpoints
- Use case: Copy files between staging/production servers, sync between remote locations

### SFTP Browser Enhancements
- Drag and drop between two remote panels

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