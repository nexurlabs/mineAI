# Contributing to mineAI

Thanks for helping make mineAI better! Here's how to get started.

## Development Setup

```bash
# Clone the repo
git clone https://github.com/nexurlabs/mineAI.git
cd mineAI

# Install dependencies
npm install

# Build the TypeScript project
npm run build

# Run onboarding
npm start -- onboard

# Run mineAI in dev mode with auto-reload
npm run dev
```

## Project Structure

```
mineAI/
├── src/
│   ├── bot/
│   │   └── manager.ts         # Mineflayer bot lifecycle
│   ├── brain/
│   │   ├── agent.ts           # High-level agent (goals, replanning)
│   │   └── llm.ts             # LLM client (OpenAI, Groq, Gemini)
│   ├── cli/
│   │   ├── index.ts           # CLI entry point
│   │   └── onboard.ts         # Interactive setup wizard
│   ├── storage/
│   │   └── config.ts          # config.yaml loading/saving
│   └── web/
│       └── ws.ts              # WebSocket dashboard server
├── package.json
└── tsconfig.json
```

## Provider Support Status

| Provider | Status |
|----------|--------|
| Groq     | ✅ Fully working |
| OpenAI   | ✅ Fully working |
| Gemini   | 🔨 Work-in-progress |

If adding a new provider, implement it in `src/brain/llm.ts` and update the onboard choices in `src/cli/onboard.ts`.

## Code Style

- TypeScript strict mode enabled — no `any` without comment
- Use `console.log` for startup/info logs; return clean strings for agent actions
- All tools in `src/bot/tools/` must follow the `Tool` type from `src/brain/llm.ts`

## Submitting Changes

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature`
3. Make changes and test against a live Minecraft server
4. Run `npm run build` to confirm no TypeScript errors
5. Commit with a clear message: `git commit -m "feat: add something"`
6. Open a Pull Request against `main`

## Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation only
- `refactor:` — code restructure
- `test:` — adding or updating tests
- `chore:` — tooling, dependencies, CI

## Questions?

Open a GitHub Discussion or reach out at `dev@nexurlabs.com`.
