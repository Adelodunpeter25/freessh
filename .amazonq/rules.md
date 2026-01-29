# Development Rules

## Git Commit Guidelines

### Commit Message Format
- **Always use single-line commit messages**
- Keep messages concise and descriptive
- Use imperative mood (e.g., "Add feature" not "Added feature")
- Maximum 72 characters
- No period at the end

### Examples
```bash
git commit -m "Add SSH key file selection dialog"
git commit -m "Fix SFTP upload progress reporting"
git commit -m "Implement terminal search functionality"
git commit -m "Update connection form validation"
git commit -m "Remove unused dependencies"
```

### Commit Frequency
- **Commit after every completed task**
- Each commit should represent a single logical change
- Don't accumulate multiple unrelated changes
- Commit working code, not broken states

### What Constitutes a Task
- Implementing a single feature
- Fixing a specific bug
- Refactoring a component
- Updating documentation
- Adding/removing dependencies

## Code Style

### TypeScript/React
- Use functional components with hooks
- Prefer `const` over `let`
- Use TypeScript strict mode
- No `any` types unless absolutely necessary
- Use meaningful variable names
- Keep components small and focused
- Extract reusable logic into hooks

### Go
- Follow standard Go conventions
- Use `gofmt` for formatting
- Handle errors explicitly
- Use meaningful package names
- Keep functions focused and small
- Document exported functions

### File Organization
- Group related files in directories
- Use index files for clean imports

## Component Guidelines

### React Components
- One component per file
- Export component as named export
- Props interface defined above component
- Use TypeScript for all props
- Destructure props in function signature

### Hooks
- Prefix custom hooks with `use`
- Keep hooks focused on single responsibility
- Return objects for multiple values
- Document complex hooks

## State Management

### Zustand Stores
- One store per domain (connections, sessions, etc.)
- Keep stores flat and simple
- Use selectors for derived state
- Don't store computed values

### Local State
- Use `useState` for component-local state
- Use `useRef` for non-rendering values
- Lift state only when necessary

## Error Handling

### Frontend
- Use try-catch for async operations
- Show user-friendly error messages
- Log errors to console in development
- Use toast notifications for user feedback

### Backend
- Return errors, don't panic
- Wrap errors with context
- Log errors to stderr
- Send structured error responses

## Performance

### Frontend
- Lazy load pages and heavy components
- Use React.memo for expensive renders
- Debounce user input
- Virtualize long lists
- Optimize re-renders with proper dependencies

### Backend
- Use buffered I/O for file operations
- Implement progress throttling
- Close resources properly
- Use goroutines for concurrent operations

## Security

### Never Commit
- Passwords or API keys
- Private SSH keys
- Connection credentials
- Personal information

### Sensitive Data
- Store passwords in system keychain
- Validate all user input
- Sanitize file paths

## Documentation

### Code Comments
- Comment complex logic
- Explain "why" not "what"
- Keep comments up to date
- Remove commented-out code

## Dependencies

### Adding Dependencies
- Evaluate necessity before adding
- Check bundle size impact
- Verify license compatibility
- Keep dependencies up to date

### Removing Dependencies
- Remove unused imports
- Clean up package.json
- Update lock files
- Test after removal

## Testing (Manual)

### Before Committing
- Test the changed functionality
- Verify no regressions
- Check console for errors
- Test on target platform

### Feature Testing
- Test happy path
- Test error cases
- Test edge cases
- Test with real SSH servers

## Pull Request Guidelines

### PR Description
- Describe what changed
- Explain why it changed
- List any breaking changes
- Include screenshots for UI changes

### PR Size
- Keep PRs focused and small
- One feature or fix per PR
- Split large changes into multiple PRs

## Branch Strategy

### Branch Naming
- `feature/description` for new features
- `fix/description` for bug fixes
- `refactor/description` for refactoring
- `docs/description` for documentation

### Branch Lifecycle
- Create branch from main
- Keep branch up to date with main
- Delete branch after merge

## Code Review

### Reviewing Code
- Check for logic errors
- Verify code style
- Test functionality
- Suggest improvements
- Be constructive and respectful

### Responding to Reviews
- Address all comments
- Explain decisions
- Make requested changes
- Thank reviewers

## Build and Deploy

### Before Building
- Update version number
- Test on all platforms
- Update changelog
- Verify all features work

### Build Process
- Build backend first
- Then build frontend
- Test packaged app
- Verify binary sizes

## Debugging

### Frontend Debugging
- Use React DevTools
- Check browser console
- Use debugger statements
- Log state changes

### Backend Debugging
- Use Go debugger (delve)
- Add log statements
- Check stderr output
- Test with mock data

## Maintenance

### Regular Tasks
- Update dependencies monthly
- Review and close stale issues
- Clean up old branches
- Archive old releases

### Code Cleanup
- Remove dead code
- Refactor duplicated code
- Update outdated comments
- Improve naming

## Communication

### Issue Reporting
- Use issue templates
- Provide reproduction steps
- Include error messages
- Specify environment details

### Feature Requests
- Describe the problem
- Propose a solution
- Consider alternatives
- Discuss implementation

## Workflow Summary

1. Create feature branch
2. Implement change
3. Test manually
4. **Commit with single-line message**
5. Push to remote
6. Create pull request
7. Address review comments
8. Merge and delete branch
9. **Repeat for next task**

## Remember

- **Commit after every task**
- **Use single-line commit messages**
- Keep changes focused
- Test before committing
- Write clean, readable code
- Document complex logic
- Be consistent with style
- Prioritize security
- Think about performance
- Help your teammates
