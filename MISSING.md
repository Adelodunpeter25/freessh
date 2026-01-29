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
**Status:** ✅ Implemented  
**Auto-reconnect on connection loss:**
- ✅ Exponential backoff utility (1s → 2s → 4s → 8s → 16s → 30s max)
- ✅ Automatic reconnection on keepalive failure
- ✅ Max 10 reconnect attempts
- ✅ Callback hooks for status updates (optional)
- ✅ Can be disabled if needed
- ✅ Transparent to user - works silently in background

### File Operations
- Large file handling (>1GB) - memory optimization needed
- Concurrent transfer limits (currently unlimited, could overwhelm system)
- Resume interrupted transfers
- Verify file integrity after transfer (checksums)

### Terminal
**Status:** ✅ Implemented  
**Implementation:**
- ✅ Handle terminal resize during active session
- ✅ Copy/paste support improvements
- ✅ Search in terminal output (live search with result count and navigation)
- ⏳ Terminal session logging to file (not yet implemented)

### SFTP Browser
- Bulk operations (select multiple files for delete/download)
- File preview for more types (PDFs, videos)
- Drag and drop between two remote panels
- Bookmark frequently accessed remote paths

---

## Future Features

### Connection Groups/Folders
**Status:** ✅ Implemented  
**Description:** Organize connections by project/environment.  
**Implementation:**
- ✅ Backend group management system with CRUD operations
- ✅ Groups stored in separate groups.json file
- ✅ Connection count calculated dynamically
- ✅ Frontend group UI components (GroupCard, GroupList, GroupsSection, GroupSidebar)
- ✅ Group detail view showing all connections in a group
- ✅ Breadcrumb navigation for group detail view
- ✅ Group selector in connection form
- ✅ Collapsible groups and connections sections with badges
- ✅ Context menu for group operations (Edit, Delete)
- ✅ Double-click to open group detail view

### Port Forwarding
**Status:** ✅ Implemented  
**Implementation:**
- ✅ UI for managing SSH tunnels (backend already implemented)
- ✅ List active tunnels
- ✅ Create/Edit/Delete port forwarding configurations
- ✅ Support for local and remote port forwarding
- ✅ Tunnel status monitoring and management

### Settings Page
**Status:** ✅ Implemented  
**Description:** Settings page with tabs for Theme and Logs.  
**Implementation:**
- ✅ Settings dialog with tab navigation
- ✅ Theme toggle (Light/Dark/System)
- ✅ Log settings (Auto-logging toggle, Delete All Logs)
- ✅ Settings stored in backend (theme in Zustand, logs in backend storage)

### Session Logging
**Status:** ✅ Implemented  
**Description:** Record terminal sessions to log files.  
**Implementation:**
- ✅ Auto-logging toggle in settings
- ✅ Manual start/stop logging per session
- ✅ Logs stored with connection name and timestamp
- ✅ Logs page with table view (Date, Name, Size, Actions)
- ✅ Double-click to open log in read-only terminal viewer
- ✅ Delete individual or all logs
- ✅ ANSI code rendering in log viewer
- ✅ Theme support (black/white backgrounds)

---

## Planned Features

### Dynamic Port Forwarding (SOCKS Proxy)
**Status:** Not implemented  
**Description:** Create a SOCKS proxy through SSH tunnel for routing all traffic.  
**Use case:** Browse internet through remote server, bypass firewalls, access region-locked content.  
**Implementation needed:**
- Backend: Add SOCKS proxy support using `ssh -D` equivalent
- UI: Add "Dynamic" option to port forwarding form
- Config: Local port for SOCKS proxy
- Status: Show active SOCKS proxy with port number

### Export/Import Connections
**Status:** Not implemented  
**Description:** Backup and share connection configurations.  
**Implementation needed:**
- Export: Save connections to JSON/encrypted file
- Import: Load connections from file
- Options: Export all, export selected, export group
- Security: Option to exclude passwords/keys from export

### Snippets/Commands
**Status:** Not implemented  
**Description:** Save and execute frequently used commands.  
**Implementation needed:**
- UI: Snippets sidebar or panel
- Storage: snippets.json with name, command, description
- Features: Quick execute, variables/placeholders, organize by tags
- Integration: Right-click in terminal to save selection as snippet
