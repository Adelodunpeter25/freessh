# Missing Features & Edge Cases

## SFTP Features

### Remote to Remote Transfer
**Status:** Not implemented  
**Description:** Currently only supports local↔remote transfers. Need server-to-server direct transfers.  
**Implementation needed:**
- UI: Add "Remote Source" panel alongside existing local/remote panels
- Backend: Create dual SFTP client handler that streams between two SSH sessions
- Transfer: Direct pipe from source SFTP to destination SFTP without local storage
- Progress: Track bytes transferred between remote endpoints
- Use case: Copy files between staging/production servers, sync between remote locations

---

## Authentication

### SSH Key File Selection
**Status:** ✅ Implemented  
**Description:** Users can browse and select SSH key files from their system.  
**Implementation:**
- ✅ "Browse Key File" button in ConnectionForm
- ✅ Electron file dialog with .pem, .key, .pub filters
- ✅ Automatic key content loading into textarea
- ✅ Toast notification showing loaded file path
- ✅ Users can still paste keys directly if preferred
- ✅ Removed keyboard-interactive auth (simplified to Password and Public Key only)
- ✅ Form split into smaller components for maintainability
- ✅ Unsaved changes confirmation dialog

---

## Known Edge Cases

### Connection Management
- Auto-reconnect on connection loss (currently just fails)
- Connection status indicator in UI (show when connection is alive/dead)
- Handle network interruptions gracefully

### File Operations
- Large file handling (>1GB) - memory optimization needed
- Concurrent transfer limits (currently unlimited, could overwhelm system)
- Resume interrupted transfers
- Verify file integrity after transfer (checksums)

### Terminal
- Handle terminal resize during active session
- Copy/paste support improvements
- Search in terminal output
- Terminal session logging to file

### SFTP Browser
- Bulk operations (select multiple files for delete/download)
- File preview for more types (PDFs, videos)
- Drag and drop between two remote panels
- Bookmark frequently accessed remote paths

---

## Future Features

### Port Forwarding
- UI for managing SSH tunnels (backend already implemented)
- List active tunnels
- Auto-start tunnels on connection

### Settings Page
- Make settings sidebar functional (currently placeholder)
- Theme customization
- Default behaviors configuration
- Performance tuning options

### Snippets/Scripts
- Replace snippets sidebar with useful feature
- Options: SSH key management, transfer history, active sessions, bookmarks
