# Workspace Detachable Windows Plan

## Vision
Enable users to treat terminal sessions like movable work units: open a new workspace window, move chosen tabs into it, and work from a sidebar plus split-pane layout without reconnecting sessions.

## Feature Flag Requirement
All workspace-window functionality must be gated behind a single boolean feature flag.

Flag design:
- Add a constants file for feature toggles.
- Define a single boolean toggle for detachable workspace windows.
- Default value should be false until rollout readiness.
- All UI entry points and IPC paths for this feature must early-return when flag is false.
- The same flag must control renderer behavior, window creation, and transfer flows.

Flag rollout policy:
- Development and QA can enable manually.
- Production remains disabled until hardening completion.
- Enablement should be one change to the constants file.

## Guiding Principles
- Session continuity first: moving a tab must not restart or drop the underlying session.
- Predictable ownership: each live tab belongs to exactly one renderer window at a time.
- Progressive rollout: ship safe transfer controls first, then richer drag interactions.
- Zero regression mandate: existing single-window terminal behavior remains unchanged.
- Flag-first delivery: each phase is complete only if behavior is fully controlled by the feature flag.

## Phase Breakdown

### Phase 1: Architecture Baseline and Flag Foundation
Goal: define durable state boundaries and set up the feature toggle foundation.

Tasks:
- Create constants file for feature flags.
- Add detachable workspace boolean flag with default false.
- Define canonical entities: Window, Workspace, Tab, Session, Pane.
- Decide single source of truth for tab ownership.
- Define transfer contract between source renderer, main process, and target renderer.
- Define error contract for rejected or failed transfers.
- Document event sequencing for normal and interrupted transfers.

Deliverables:
- Feature flag constants file committed.
- Architecture note for ownership and transfer lifecycle.
- Event and state transition matrix.

### Phase 2: Workspace Window Bootstrapping
Goal: add an empty workspace window that can receive tabs later.

Tasks:
- Implement renderer trigger from tab bar `+` action to create workspace.
- Guard `+` action visibility and behavior behind the feature flag.
- Add new window mode metadata at creation time.
- Render workspace shell with empty sidebar and empty pane area.
- Add close/restore behavior for empty workspace windows.
- Ensure window creation IPC is ignored when feature flag is false.

Deliverables:
- New workspace windows launch on demand when flag is true.
- No workspace UI appears when flag is false.
- Empty-state UI visible and stable.

### Phase 3: Transfer Engine (Non-Drag Path)
Goal: move tabs safely without drag complexity.

Tasks:
- Add context menu command to move selected tab to workspace window.
- Guard command visibility and action behind the feature flag.
- Add transfer transaction ID and completion acknowledgement.
- Transfer tab metadata and bind target UI to existing session ID.
- Remove tab from source UI only after successful target acknowledgement.
- Show explicit user feedback for transfer success/failure.

Deliverables:
- Reliable move command for local and remote terminal tabs when flag is true.
- No session restart during move.
- Command hidden or disabled when flag is false.

### Phase 4: Workspace Sidebar and Selection Model
Goal: provide strong navigability once multiple tabs are moved.

Tasks:
- Build workspace sidebar list model for moved tabs.
- Add active tab selection and last-active tracking.
- Add close and rename interactions consistent with existing tab behavior.
- Keep disconnected-state indicators visible in sidebar.
- Ensure all workspace sidebar rendering is gated by feature flag.

Deliverables:
- Workspace sidebar supports session selection and basic tab actions when flag is true.
- No sidebar regressions when flag is false.

### Phase 5: Split Pane Engine
Goal: display and operate multiple sessions in a single workspace window.

Tasks:
- Define pane tree model for horizontal and vertical splits.
- Add action paths for creating split from selected tab.
- Add drop zones for split placement within pane area.
- Implement pane resize, focus, and close behavior.
- Ensure terminal input focus follows active pane rules.
- Guard split initialization and controls behind feature flag.

Deliverables:
- Functional split workspace with reliable focus and resize behavior when flag is true.
- No split UI branches active when flag is false.

### Phase 6: Cross-Window Drag and Drop
Goal: upgrade from command-based move to direct manipulation.

Tasks:
- Implement draggable tab payload from source window header.
- Support inter-window drop target registration.
- Validate payload freshness and ownership at drop time.
- Handle race conditions when tab state changes mid-drag.
- Provide clear visual feedback for valid and invalid drop targets.
- Fully gate drag and drop event handling behind the feature flag.

Deliverables:
- Users can drag tabs from one window and drop into another when flag is true.
- Drag and drop path inactive when flag is false.

### Phase 7: Persistence and Recovery
Goal: ensure workspaces survive real-world interruptions.

Tasks:
- Persist workspace composition and pane layout.
- Restore workspace windows on relaunch when configured.
- Handle partial restore if sessions are unavailable.
- Recover gracefully when transfer fails due to closed target window.
- Ensure persistence and restore are bypassed when feature flag is false.

Deliverables:
- Predictable restore and failure recovery behavior when flag is true.
- No workspace persistence side effects when flag is false.

### Phase 8: Hardening and Rollout
Goal: ship with confidence.

Tasks:
- Add integration tests for move, split, and ownership invariants.
- Add tests verifying feature flag off path has zero functional impact.
- Stress test with many sessions and rapid tab moves.
- Verify on macOS, Linux, and Windows window managers.
- Add telemetry hooks for transfer failures and reconnect outcomes.
- Stage release with feature flag enablement plan.

Deliverables:
- Production-ready release checklist and go/no-go report.
- Explicit release decision based on flag toggle in constants file.

## Non-Functional Requirements
- Transfer action should feel near-instant for typical session counts.
- No memory growth from orphaned listeners after repeated transfers.
- Keyboard navigation remains intact across windows and panes.
- Security boundaries for IPC remain least-privilege and validated.
- Feature-flag disabled path remains equivalent to current production behavior.

## Open Decisions
- Whether workspace windows can host non-terminal tabs in version one.
- Whether move should support multi-select in first release.
- Whether pane layout should auto-balance after each drop.
- Whether workspace creation should support templates immediately.

## Recommended Initial Milestone
Milestone A includes Phase 1 through Phase 3 only, fully gated by feature flag.
- Outcome: users can create workspace windows and move tabs safely when enabled.
- Benefit: major user value delivered early with low drag-and-drop risk.
- Safety: zero user-facing change while flag remains false.
