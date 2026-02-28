# Collaborative Terminal Sessions

## Overview
Enable real-time collaboration on SSH sessions without requiring user accounts. Sessions are ephemeral, privacy-focused, and controlled by the host.

## Core Concept

**Session Host:**
- Creates a session, gets a shareable code/link (e.g., `join.freessh.app/abc-def-123`)
- Has full control (can kick users, toggle permissions)
- Session ends when host disconnects

**Guests:**
- Enter code or click link to join
- Choose a display name (optional, or auto-generate like "User-1234")
- Get assigned a random color for their cursor
- No signup, no login, no email required

## Protocol & Guardrails

### Session Code and Join Rules
- Session code must be cryptographically random
- Codes expire when session ends or after a host-defined timeout
- Join attempts are rate-limited per IP/session code
- Optional host approval gate before guest joins
- Max guests per session should be configurable

### Host Disconnect and Recovery
- Session should not end immediately on transient disconnect
- Add host reconnect grace period (example: 30-90 seconds)
- If host reconnects within grace period, session continues
- If grace period expires, session terminates for all guests

### Input Arbitration
- **Read-only mode**: guests cannot send input
- **Shared mode**: all guest input allowed, events serialized in arrival order
- **Locked mode**: one active input owner at a time (host can transfer/revoke)
- Host can always override and reclaim input control

### Kick and Ban Model (No Accounts)
- Kick: remove participant from current session only
- Ban: block rejoin for current session by session-scoped identity
- Session-scoped identity should combine connection fingerprint + temporary token
- Ban list is in-memory only and cleared when session ends

## Features Roadmap

### Phase 1 - Basic Sharing
- Generate shareable session link/code
- Real-time terminal output sync
- User presence indicators (who's connected)
- Cursor position indicators

### Phase 2 - Collaboration
- Shared input mode (multiple people can type)
- Read-only mode toggle
- Input locking/turn-taking
- Kick/ban users
- Chat sidebar for communication

## Permission System

**Host Controls:**
- Read-only mode (guests can only watch)
- Shared input mode (everyone can type)
- Individual user permissions
- End session for all users

## Technical Architecture

### Backend Requirements
- WebSocket server for real-time sync
- Session state management (in-memory)
- Terminal output buffering
- Connection handling and user management
- Rate limiting and join policy enforcement
- Host reconnect grace tracking
- Session lifecycle cleanup on timeout/disconnect

### Frontend Changes
- "Share Session" button in terminal
- Presence UI (user avatars, colored cursors)
- Permission controls panel
- Connection status indicators
- Chat sidebar

### Session Flow
1. Host clicks "Share Session" -> backend generates unique code
2. Guest enters code -> WebSocket connects them to host's session
3. Terminal output broadcasts to all connected users
4. Input routing based on host's permission settings
5. On host disconnect, grace timer starts; reconnect resumes session
6. Session terminates only when host grace period expires or host ends session

## Privacy & Security

**Privacy Benefits:**
- No data stored (ephemeral sessions only)
- No user tracking or analytics
- No accounts to compromise
- Sessions exist only in memory

**Security Considerations:**
- Session codes are cryptographically random
- Join attempts are rate-limited
- Host has full control over participants
- No persistent storage of terminal content
- WebSocket connections are encrypted

## Operational Scope

### Initial Scope (v1)
- Single-node collaboration service
- In-memory state only
- No cross-node failover

### Future Scope (v2+)
- Multi-node support with shared session coordinator
- Sticky routing or distributed state layer
- Optional persistence for audit metadata only (not terminal content)
