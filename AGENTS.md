# Agents

This project uses the Payload CMS skill at `.agents/skills/payload/`.
Start with `.agents/skills/payload/SKILL.md` for a quick reference, then see `.agents/skills/payload/reference/` for detailed docs.

## Code Style

- Prefer arrow functions over function declarations.
- When a function or component returns an expression or JSX directly, omit the `return` keyword and use the parenthesized implicit-return form: `() => (...)`.
- Declare components with `const ComponentName = ...`.
- Keep named exports at the bottom of the file using `export { ComponentName }`.
- Use `kebab-case` for file names.
- Prefer logical operators such as `&&` for conditional rendering when there is no meaningful fallback value.
- For numeric conditions, use explicit comparisons such as `count > 0 && <Component />` instead of relying on numeric truthiness such as `count && <Component />`.
- Avoid ternary expressions that only return `null` or `undefined`, especially for boolean or comparison conditions such as `condition ? <Component /> : null`, `items.length > 0 ? <Component /> : null`, or `count > 0 ? <Component /> : undefined`; use `condition && <Component />` instead.
- Use ternary expressions when both branches produce meaningful values.
- Prefer early returns and guard clauses to reduce unnecessary nesting.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
