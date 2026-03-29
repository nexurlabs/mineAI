# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability in mineAI, please:

1. **Do not** open a public GitHub issue.
2. Email: `security@nexurlabs.com`
3. Include details — we will acknowledge within 48 hours.

We request that you give us reasonable time before disclosing any vulnerability publicly.

## Security Best Practices

When running mineAI:

- **Never** commit your `config.yaml` or API keys to version control
- Keep your LLM API keys private
- The Minecraft server should be behind a firewall if exposed publicly
- The `online-mode=false` setting bypasses Minecraft's built-in auth — only run mineAI on private/trusted networks or alongside additional authentication (e.g., AuthMe for player authentication)
- Keep mineAI updated with `git pull` periodically
