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

### File Operations Enhancements
- Large file handling (>1GB) - memory optimization needed
- Concurrent transfer limits (currently unlimited, could overwhelm system)
- Resume interrupted transfers
- Verify file integrity after transfer (checksums)

### SFTP Browser Enhancements
- Bulk operations (select multiple files for delete/download) ✅
- File preview for more types (PDFs, videos)
- Drag and drop between two remote panels

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