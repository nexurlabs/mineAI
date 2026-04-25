# Configuration

The normal way to configure mineAI is:

```bash
node --import tsx/esm src/cli/index.ts onboard
```

## Onboarding asks for

- AI provider
- API key
- model
- trigger word
- Minecraft host
- Minecraft port
- bot username
- auth mode: `offline` or `microsoft`

## Providers

Onboarding currently exposes:

| Provider | Notes |
|---|---|
| Groq | Recommended in the wizard, fast/free-friendly path |
| OpenAI | Standard OpenAI models |
| Gemini | Present in the runtime, marked WIP in onboarding |
| Anthropic | Claude provider path |

## Trigger word

Default trigger word:

```text
rose
```

When someone says the trigger word in Minecraft chat, mineAI routes the interaction through the LLM agent.

## Minecraft auth modes

| Mode | Best for |
|---|---|
| `offline` | LAN, private, or offline-mode test servers |
| `microsoft` | Online-mode servers using Microsoft/Mojang auth |

## Runtime files

Daemon mode writes runtime files under:

```text
.mineai/
├── mineai.log
└── mineai.pid
```

## Environment variables

The README notes env-var fallback for supported providers. If you do not want to store an API key during onboarding, leave it blank and provide the provider key through your shell or service manager environment.
