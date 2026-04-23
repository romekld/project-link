# Migration Reference: Supabase Schema from Previous Version

This directory contains reference material for Supabase schema migration work that was carried over from a previous version of the project.

## Purpose

- Provide a historical reference for schema changes, migration patterns, and previous Supabase migration files.
- Support AI agents and developers when reviewing or adapting old migration logic.
- Serve as a read-only aid unless the user explicitly asks to copy, adapt, or move content into the current project.

## Usage Guidelines for AI Agents

1. Treat this folder as a reference library, not a source of truth.
2. Always verify with the user before applying or copying migrations from this folder into the active project.
3. Do not assume the previous schema matches the current repository structure or business rules.
4. If the user asks for migration work, ask clarifying questions about the target database, current schema, and version compatibility.

## What to Expect

- Files here may reflect older project conventions, previous Supabase CLI output, or migration patterns from another branch/version.
- They are intended to inform decisions, not to be used verbatim without review.

## Best Practice

- Compare reference migrations against the current `packages/supabase/migrations/` and `project-link/packages/supabase/config.toml` before making changes.
- Use this folder to understand past decisions, then implement a fresh migration that fits the current codebase.
- Keep notes in the user conversation when an old migration file is adapted or reused.
