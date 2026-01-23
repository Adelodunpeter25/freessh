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
5. Session terminates when host disconnects

## Privacy & Security

**Privacy Benefits:**
- No data stored (ephemeral sessions only)
- No user tracking or analytics
- No accounts to compromise
- Sessions exist only in memory

**Security Considerations:**
- Session codes are cryptographically random
- Host has full control over participants
- No persistent storage of terminal content
- WebSocket connections are encrypted
