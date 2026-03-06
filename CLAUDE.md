# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Initial setup (install deps, generate Prisma client, run migrations)
npm run setup

# Development server (uses Turbopack)
npm run dev

# Run all tests
npm test

# Run a single test file
npx vitest run src/lib/transform/__tests__/jsx-transformer.test.ts

# Lint
npm run lint

# Build for production
npm run build

# Reset database
npm run db:reset
```

## Environment Variables

- `ANTHROPIC_API_KEY` — Optional. Without it, the app uses `MockLanguageModel` instead of Claude.
- `JWT_SECRET` — Optional. Defaults to `"development-secret-key"` in dev.

## Architecture

### Core Concept: Virtual File System

Generated React components are never written to disk. `VirtualFileSystem` (`src/lib/file-system.ts`) is an in-memory tree structure that lives in React state. It is serialized to JSON and stored in SQLite (for authenticated users) or browser memory (anonymous users).

### Data Flow

1. User types a prompt in `ChatInterface`
2. `ChatProvider` (`src/lib/contexts/chat-context.tsx`) calls `/api/chat` via Vercel AI SDK's `useChat`, sending the serialized VFS and conversation messages
3. The API route (`src/app/api/chat/route.ts`) reconstructs the VFS server-side, passes it to two AI tools, and streams back responses
4. Tool calls (`str_replace_editor`, `file_manager`) are intercepted client-side by `FileSystemProvider.handleToolCall`, which mutates the in-memory VFS and triggers re-renders
5. `PreviewFrame` (`src/components/preview/PreviewFrame.tsx`) detects VFS changes via `refreshTrigger`, transforms all files client-side using Babel standalone, generates an ES module import map with blob URLs, and injects them into a sandboxed `<iframe>` via `srcdoc`

### AI Tools

- `str_replace_editor` (`src/lib/tools/str-replace.ts`) — create/view/str_replace/insert operations on the VFS
- `file_manager` (`src/lib/tools/file-manager.ts`) — rename/delete operations on the VFS

### Context Providers (wrapping order matters)

```
FileSystemProvider  →  ChatProvider  →  UI components
```

`ChatProvider` depends on `useFileSystem()` to serialize the VFS into each API request and to route tool calls back into the VFS.

### Auth

Custom JWT auth (`src/lib/auth.ts`) using `jose`. Sessions stored in httpOnly cookies (7-day expiry). No NextAuth. Passwords hashed with `bcrypt`. The `src/middleware.ts` handles session verification.

### Persistence

Prisma + SQLite (`prisma/dev.db`). Two models: `User` and `Project`. A `Project` stores `messages` (JSON string) and `data` (serialized VFS JSON string). Anonymous users have no `userId` on their project. The Prisma client is generated to `src/generated/prisma/`. Refer to `prisma/schema.prisma` for the authoritative database schema whenever working with persisted data.

### Preview Rendering

`src/lib/transform/jsx-transformer.ts` runs entirely in the browser:
- Transforms JSX/TSX to JS using `@babel/standalone`
- Creates blob URLs for each transformed file
- Builds an ES module import map (resolves `@/` aliases, fetches third-party packages from `esm.sh`)
- The preview iframe loads Tailwind CSS from CDN, so generated components can use Tailwind classes

### Mock Provider

When `ANTHROPIC_API_KEY` is absent, `MockLanguageModel` (`src/lib/provider.ts`) returns hardcoded Counter/Form/Card components. The real model is `claude-haiku-4-5`.

### Testing

Vitest with jsdom environment. Tests live in `__tests__/` subdirectories next to the code they test.

## Code Style

Only add comments for complex or non-obvious logic. Self-explanatory code should not be commented.
