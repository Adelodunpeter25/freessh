# FreeSSH Application Architecture

## Overview
FreeSSH is a cross-platform SSH client built with Electron (frontend) and Go (backend). It provides terminal access, SFTP file transfer, SSH key management, port forwarding, and known hosts management.

## Technology Stack

### Frontend
- **Framework**: Electron + React 19 + TypeScript
- **UI Library**: Radix UI + Tailwind CSS
- **State Management**: Zustand
- **Terminal**: xterm.js with addons (fit, search)
- **Code Editor**: Monaco Editor
- **Build Tool**: Vite + electron-vite

### Backend
- **Language**: Go 1.25.5
- **SSH Library**: golang.org/x/crypto/ssh
- **SFTP Library**: github.com/pkg/sftp
- **Keychain**: github.com/zalando/go-keyring
- **IPC**: JSON over stdin/stdout

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Electron Main Process                    │
│  - Window Management                                         │
│  - Menu System                                               │
│  - IPC Bridge (stdin/stdout ↔ IPC channels)                 │
│  - File System Handlers                                      │
└─────────────────────────────────────────────────────────────┘
                            ↕ IPC
┌─────────────────────────────────────────────────────────────┐
│                    Electron Renderer Process                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  React Application                                   │   │
│  │  - MainLayout (Sidebar + Content Area)              │   │
│  │  - ConnectionsPage                                   │   │
│  │  - TerminalView (xterm.js)                          │   │
│  │  - SFTPBrowser (dual-pane file manager)            │   │
│  │  - KeygenList (SSH key management)                  │   │
│  │  - KnownHostsPage                                   │   │
│  │  - PortForwardPage                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  State Management (Zustand)                         │   │
│  │  - connectionStore                                   │   │
│  │  - sessionStore                                      │   │
│  │  - tabStore                                          │   │
│  │  - uiStore                                           │   │
│  │  - themeStore                                        │   │
│  │  - terminalFontStore                                 │   │
│  │  - terminalThemeStore                                │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Services Layer                                      │   │
│  │  - backendService (IPC message router)              │   │
│  │  - sshService                                        │   │
│  │  - sftpService                                       │   │
│  │  - terminalService                                   │   │
│  │  - keygenService                                     │   │
│  │  - portForwardService                                │   │
│  │  - knownHostsService                                 │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ JSON Messages
┌─────────────────────────────────────────────────────────────┐
│                      Go Backend Server                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  IPC Server                                          │   │
│  │  - Reader (stdin → JSON messages)                   │   │
│  │  - Writer (JSON messages → stdout)                  │   │
│  │  - Message Router                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Handlers                                            │   │
│  │  - SSHHandler                                        │   │
│  │  - TerminalHandler                                   │   │
│  │  - SessionHandler                                    │   │
│  │  - ConnectionHandler                                 │   │
│  │  - SFTPHandler                                       │   │
│  │  - PortForwardHandler                                │   │
│  │  - PortForwardConfigHandler                          │   │
│  │  - KeygenHandler                                     │   │
│  │  - KeychainHandler                                   │   │
│  │  - KnownHostsHandler                                 │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Core Services                                       │   │
│  │  - Session Manager (manages active SSH sessions)    │   │
│  │  - SSH Client (connection, auth, keepalive)         │   │
│  │  - Terminal (PTY, shell, I/O)                       │   │
│  │  - SFTP Client (file operations, transfers)         │   │
│  │  - Port Forward Manager (local/remote tunnels)      │   │
│  │  - Keygen (RSA/Ed25519 generation)                  │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Storage Layer                                       │   │
│  │  - ConnectionStorage (connections.json)             │   │
│  │  - KeyStorage (keys.json)                           │   │
│  │  - KnownHostStorage (known_hosts)                   │   │
│  │  - PortForwardStorage (port_forwards.json)          │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ SSH Protocol
┌─────────────────────────────────────────────────────────────┐
│                      Remote SSH Servers                      │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. SSH Connection Flow
```
User clicks "Connect" 
  → ConnectionForm validates input
  → sshService.connect(config)
  → backendService.send({ type: "connect", data: config })
  → Electron Main forwards to Go backend (stdin)
  → Go IPC Reader parses JSON
  → SSHHandler.Handle()
  → SSH Client establishes connection
  → Session Manager creates ActiveSession
  → Terminal initialized with PTY
  → Response sent back (stdout)
  → Electron Main forwards to Renderer (IPC)
  → backendService routes to handler
  → sessionStore updated
  → tabStore creates new tab
  → TerminalView renders xterm.js
```

### 2. Terminal I/O Flow
```
User types in terminal
  → xterm.js onData event
  → terminalService.sendInput(sessionId, data)
  → backendService.send({ type: "input", session_id, data })
  → Go backend routes to TerminalHandler
  → Terminal.Write() sends to SSH session
  → Remote server processes input
  → Output received from SSH
  → Terminal.IO reads output
  → Sent to frontend via stdout
  → xterm.js writes to terminal display
```

### 3. SFTP Transfer Flow
```
User drags file to remote panel
  → FilePanel onDrop handler
  → sftpService.upload(localPath, remotePath)
  → backendService.send({ type: "sftp:upload", session_id, data })
  → Go SFTPHandler.Upload()
  → SFTP Client reads local file
  → Streams to remote server
  → Progress updates sent periodically
  → Frontend updates TransferQueue UI
  → Completion message sent
  → Remote file list refreshed
```

### 4. Port Forwarding Flow
```
User creates tunnel config
  → portForwardService.createTunnel(config)
  → backendService.send({ type: "portforward:create", session_id, data })
  → Go PortForwardHandler
  → Port Forward Manager creates tunnel
  → Local/Remote tunnel starts listening
  → Tunnel info returned to frontend
  → UI shows active tunnel status
```

## Key Components

### Frontend Components

#### Layout
- **MainLayout**: Root layout with sidebar and content area
- **TitleBar**: Custom window controls (macOS/Windows)
- **Sidebar**: Navigation tabs (Connections, Keys, Known Hosts, Port Forward, Settings)
- **SessionTabBar**: Manages multiple terminal tabs

#### Connection Management
- **ConnectionsPage**: Lists saved connections
- **ConnectionCard**: Individual connection display
- **ConnectionForm**: Create/edit connection dialog
- **ConnectionFormGeneral**: Host, port, username fields
- **ConnectionFormCredentials**: Auth method selection (password/key)

#### Terminal
- **TerminalView**: Main terminal container
- **TerminalPane**: xterm.js wrapper with fit addon
- **TerminalSettings**: Font, theme, size customization
- **TerminalSearchBar**: Search in terminal output

#### SFTP
- **SFTPBrowser**: Dual-pane file manager
- **FilePanel**: Local file browser
- **RemotePanel**: Remote file browser
- **FileList**: File/directory listing
- **FileItem**: Individual file/folder row
- **TransferQueue**: Shows active/completed transfers
- **FilePreview**: Text/code preview with Monaco Editor
- **PermissionModal**: chmod dialog

#### Key Management
- **KeygenList**: Lists stored SSH keys
- **KeygenForm**: Generate new key pairs
- **KeyCard**: Individual key display
- **ExportKeySidebar**: Export key in various formats

#### Port Forwarding
- **PortForwardPage**: Manage tunnels
- **TunnelConfigForm**: Create tunnel configuration
- **TunnelList**: Active tunnels display

#### Known Hosts
- **KnownHostsPage**: Manage trusted hosts
- **HostKeyVerificationDialog**: Trust new host keys

### Backend Packages

#### IPC Layer
- **ipc/server.go**: Main IPC server, message routing
- **ipc/reader.go**: Reads JSON from stdin
- **ipc/writer.go**: Writes JSON to stdout
- **ipc/handlers/**: Message handlers for each feature

#### SSH Layer
- **ssh/client.go**: SSH connection management, keepalive
- **ssh/auth/**: Authentication methods (password, publickey)
- **ssh/host_key_callback.go**: Host key verification

#### Terminal Layer
- **terminal/terminal.go**: Terminal lifecycle
- **terminal/pty.go**: PTY request and resize
- **terminal/shell.go**: Shell startup
- **terminal/io.go**: Input/output streaming

#### SFTP Layer
- **sftp/client.go**: SFTP client wrapper
- **sftp/operations.go**: File operations (list, mkdir, delete, rename, chmod)
- **sftp/transfer.go**: Upload/download with progress

#### Session Management
- **session/manager.go**: Manages active sessions
- **session/session.go**: ActiveSession struct
- **session/create.go**: Session creation
- **session/close.go**: Session cleanup
- **session/input.go**: Input handling
- **session/output.go**: Output streaming

#### Port Forwarding
- **portforward/manager.go**: Tunnel lifecycle
- **portforward/local/tunnel.go**: Local port forwarding
- **portforward/remote/tunnel.go**: Remote port forwarding

#### Key Generation
- **keygen/keygen.go**: RSA/Ed25519 key generation
- **keygen/fingerprint.go**: Key fingerprinting
- **keygen/import.go**: Import existing keys

#### Storage
- **storage/manager.go**: Generic JSON file storage
- **storage/connection.go**: Connection configs
- **storage/keys.go**: SSH keys
- **storage/known_hosts.go**: Trusted host keys
- **storage/port_forwards.go**: Tunnel configurations

## Message Types

### Connection Messages
- `connect`: Establish SSH connection
- `disconnect`: Close SSH connection
- `session_status`: Session state updates
- `session_list`: List active sessions

### Terminal Messages
- `input`: User input to terminal
- `output`: Terminal output to display
- `resize`: Terminal dimensions changed

### SFTP Messages
- `sftp:list`: List directory contents
- `sftp:upload`: Upload file
- `sftp:download`: Download file
- `sftp:delete`: Delete file/directory
- `sftp:mkdir`: Create directory
- `sftp:rename`: Rename file/directory
- `sftp:chmod`: Change permissions
- `sftp:readfile`: Read file content
- `sftp:writefile`: Write file content
- `sftp:progress`: Transfer progress update
- `sftp:cancel`: Cancel transfer

### Port Forward Messages
- `portforward:create`: Create tunnel
- `portforward:stop`: Stop tunnel
- `portforward:list`: List active tunnels
- `portforward_config:*`: Manage saved tunnel configs

### Key Management Messages
- `keygen:generate`: Generate new key pair
- `keygen:fingerprint`: Get key fingerprint
- `key:list`: List stored keys
- `key:save`: Save key
- `key:import`: Import existing key
- `key:update`: Update key metadata
- `key:delete`: Delete key
- `key:export`: Export key

### Known Hosts Messages
- `known_host:list`: List trusted hosts
- `known_host:remove`: Remove host
- `known_host:trust`: Trust new host
- `host_key:verify`: Verify host key
- `host_key:verify_response`: User's verification decision

### Keychain Messages
- `keychain:set`: Store password in system keychain
- `keychain:get`: Retrieve password from keychain
- `keychain:delete`: Remove password from keychain

## State Management

### Zustand Stores

#### connectionStore
- Manages saved connection configurations
- CRUD operations for connections
- Selected connection tracking

#### sessionStore
- Tracks active SSH sessions
- Session status (connecting, connected, disconnected, error)
- OS type detection for remote systems

#### tabStore
- Manages terminal tabs
- Active tab tracking
- Tab creation/closing
- Tab renaming

#### uiStore
- UI state (sidebar visibility, active view)
- SFTP connection selection
- Modal/dialog states

#### themeStore
- Application theme (light/dark/system)
- Persisted to localStorage

#### terminalFontStore
- Terminal font family and size
- Available fonts list

#### terminalThemeStore
- Terminal color schemes
- Preset themes (Dracula, Monokai, etc.)

#### osTypeStore
- Detected OS type for remote systems
- Used for icon display

## Authentication

### Supported Methods
1. **Password**: Username + password
2. **Public Key**: Username + private key (with optional passphrase)

### Key Storage
- Keys stored in `~/.freessh/keys.json`
- Private keys can be encrypted with passphrase
- Passwords stored in system keychain (macOS Keychain, Windows Credential Manager, Linux Secret Service)

### Host Key Verification
- First connection: User prompted to trust host key
- Trusted keys stored in `~/.freessh/known_hosts`
- Subsequent connections: Automatic verification
- Changed keys: Warning dialog with option to update

## File Storage Locations

### User Data Directory
- **macOS**: `~/Library/Application Support/freessh/`
- **Windows**: `%APPDATA%/freessh/`
- **Linux**: `~/.config/freessh/`

### Stored Files
- `connections.json`: Saved SSH connections
- `keys.json`: SSH key metadata and content
- `known_hosts`: Trusted host keys (OpenSSH format)
- `port_forwards.json`: Saved tunnel configurations

## Security Considerations

### Sensitive Data Handling
- Passwords never stored in JSON files
- Passwords stored in system keychain only
- Private keys can be passphrase-protected
- Connection passwords not persisted (entered per-connection)

### SSH Security
- Host key verification on first connection
- Support for modern key types (RSA 2048+, Ed25519)
- Keepalive to detect connection loss
- Automatic reconnection with exponential backoff

### IPC Security
- Backend runs as child process (not exposed to network)
- Communication via stdin/stdout (local only)
- No external API or network listeners

## Performance Optimizations

### Terminal
- Buffered output streaming
- Efficient xterm.js rendering
- Lazy loading of terminal components

### SFTP
- Chunked file transfers (128KB buffer)
- Progress reporting throttled (every 512KB)
- Concurrent transfer support
- Transfer cancellation

### Frontend
- Lazy loading of pages/components
- React.memo for expensive components
- Zustand for efficient state updates
- Virtual scrolling for large file lists

## Error Handling

### Connection Errors
- Network timeouts
- Authentication failures
- Host key mismatches
- Connection refused

### Transfer Errors
- Permission denied
- Disk full
- Network interruption
- File not found

### Recovery Mechanisms
- Automatic reconnection (max 10 attempts)
- Exponential backoff (1s → 30s)
- Transfer retry capability
- Graceful degradation

## Future Architecture Considerations

### Collaborative Sessions (Planned)
- WebSocket server for real-time sync
- Session sharing with unique codes
- Multi-user input coordination
- Presence indicators
- Chat sidebar

### Remote-to-Remote SFTP (Implemented)
- Dual SFTP client management
- Direct server-to-server transfers
- Direct local-to-local transfers
- Progress tracking between remotes
- No local storage required

## Build and Deployment

### Development
```bash
bun install                    # Install frontend deps
cd backend && go mod download  # Install backend deps
bun run dev                    # Start dev server
```

### Production Build
```bash
bun run build:backend          # Build Go binary               # Build Electron app
bun run build:mac              # Package for macOS
```

### Binary Locations
- **Development**: `backend/bin/server`
- **Production**: Bundled in `app.asar` resources

## Dependencies

### Frontend Key Dependencies
- electron: ^39.2.6
- react: ^19.2.1
- xterm: ^5.3.0
- monaco-editor: ^0.55.1
- zustand: ^5.0.10
- @radix-ui/*: UI components
- tailwindcss: ^3

### Backend Key Dependencies
- golang.org/x/crypto/ssh: SSH protocol
- github.com/pkg/sftp: SFTP protocol
- github.com/zalando/go-keyring: System keychain
- github.com/google/uuid: UUID generation
