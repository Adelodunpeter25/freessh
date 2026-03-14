# Changelog

All notable changes to this project are documented in this file.

## [Unreleased]

### Features
- Per-connection terminal theme override in connection profiles, using the full theme picker UI.
- Improved Monaco editor theming to match app theme.
- JSONC and Fish support in the built-in editor.

### Fixes
- Correct group connection counts in FreeSSH format exports.
- Windows path navigation fixes for SFTP preview panels and local shell args.

## [1.0.0] - 2026-03-03

Initial public release of FreeSSH.

### Features
- Local-first SSH client for macOS, Windows, and Linux.
- Saved connection management with create, edit, duplicate, delete, and quick connect flows.
- Connection groups for organizing hosts, including drag-and-drop move to group.
- SSH authentication with password and public key support.
- Known-host verification dialog and trusted host management.
- Local terminal and remote SSH terminal sessions.
- Multi-session tab workflow with session context actions.
- Terminal profile settings per connection.
- Command history capture and reusable command snippets with placeholders.
- SFTP file manager for remote browsing and transfer workflows.
- Remote file preview with text/code highlighting support.
- Port forwarding management (local/remote/dynamic).
- Session logs with configurable logging behavior.
- Keyboard shortcuts dialog with configurable shortcut settings.
- Import/Export support:
  - FreeSSH format (connections, groups, keys, snippets, known hosts, port-forwards)
  - OpenSSH import/export compatibility flows.
- Multi-platform desktop release pipeline via GitHub Actions:
  - macOS DMG (x64, arm64)
  - Windows MSI (x64)
  - Linux DEB and AppImage (x64)
