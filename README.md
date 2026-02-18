# ﷽ BarakahCLI — The Islamic Productivity Plugin for Claude Code

> *"More with Less."* — Transform your coding environment from a source of stress into a space of mindfulness.

BarakahCLI is a **spiritual pair programmer** that brings Islamic mindfulness into your Claude Code workflow. Based on the principles of *The Barakah Effect* (Intention, Focus, Gratitude), it offers context-aware reminders, developer-centric humor, and wellness checks — especially helpful during Ramadan.

---

## Features

### Niyyah (Intention) Protocol
Every session begins with purpose. BarakahCLI greets you with Salam and asks what you're building for today, grounding your work in intention.

### Sabr (Patience) Guard
When frustration keywords are detected in your prompts ("stupid", "broken", "why won't this work"), BarakahCLI gently intervenes with a patience reminder before you see Claude's response.

### Shukr (Gratitude) Hook
When builds succeed, tests pass, or bugs are fixed, BarakahCLI celebrates with you — a brief "Alhamdulillah" to acknowledge the blessing before moving on.

### Barakah Timer
Every N interactions (default: 10), BarakahCLI checks in. Are you hydrated? Is Salah approaching? Time for a Dhikr break? Your body is an Amanah.

### Ramadan Mode
Activate Ramadan-specific reminders that are mindful of fasting energy levels, encourage smaller task batches, and include Suhoor/Iftar awareness.

### Slash Commands
- `/barakah-cli:barakah` — Manual mindfulness check with session summary
- `/barakah-cli:niyyah` — Set or reset your intention mid-session
- `/barakah-cli:ramadan-mode` — Toggle Ramadan mode on/off

---

## Installation

### From a Marketplace

```bash
# Add the marketplace (replace with actual marketplace URL)
/plugin marketplace add kolesar/barakah-cli

# Install
/plugin install barakah-cli@kolesar
```

### Local Development

```bash
# Clone the repo
git clone https://github.com/kolesar/barakah-cli.git

# Test locally with Claude Code
claude --plugin-dir ./barakah-cli
```

### First Run

On first session start, BarakahCLI creates `~/.barakah-cli/` with a default config. Or run setup manually:

```bash
node ./barakah-cli/scripts/setup.js
```

---

## Configuration

Edit `~/.barakah-cli/config.json` to customize your experience:

```json
{
  "enabled": true,
  "humor": true,
  "ramadan_mode": false,
  "strict_mode": false,
  "niyyah_prompt": true,
  "sabr_guard": true,
  "shukr_hook": true,
  "barakah_timer": true,
  "timer_interval": 10,
  "quiet_hours": {
    "enabled": false,
    "start": "23:00",
    "end": "05:00"
  }
}
```

| Setting | Default | Description |
|---------|---------|-------------|
| `enabled` | `true` | Master switch for all BarakahCLI features |
| `humor` | `true` | Include developer humor in reminders |
| `ramadan_mode` | `false` | Fasting-aware reminders and energy checks |
| `strict_mode` | `false` | Reverent tone only, no jokes |
| `niyyah_prompt` | `true` | Show intention prompt on session start |
| `sabr_guard` | `true` | Detect frustration and show patience reminders |
| `shukr_hook` | `true` | Celebrate successful operations |
| `barakah_timer` | `true` | Periodic mindfulness reminders |
| `timer_interval` | `10` | Interactions between timer reminders |
| `quiet_hours` | off | Suppress all reminders during specified hours |

---

## Plugin Structure

```
barakah-cli/
├── .claude-plugin/
│   └── plugin.json            # Plugin manifest
├── hooks/
│   └── hooks.json             # Event → script wiring
├── scripts/
│   ├── utils.js               # Shared utilities (config, content, state)
│   ├── niyyah.js              # SessionStart: intention protocol
│   ├── sabr-guard.js          # UserPromptSubmit: frustration detection
│   ├── shukr-hook.js          # PostToolUse: success gratitude
│   ├── barakah-timer.js       # UserPromptSubmit: periodic reminders
│   └── setup.js               # First-run initialization
├── commands/
│   ├── barakah.md             # /barakah-cli:barakah command
│   ├── niyyah.md              # /barakah-cli:niyyah command
│   └── ramadan-mode.md        # /barakah-cli:ramadan-mode command
├── skills/
│   └── barakah-mindset/
│       └── SKILL.md           # Claude personality: spiritual pair programmer
├── content/
│   ├── content.json           # All reminders, snippets, and messages
│   └── default-config.json    # Default configuration template
└── README.md
```

---

## Compatibility

### With "Islamic Reminders" plugin (by Yusuf Saber)

BarakahCLI is a **superset** of the Islamic Reminders plugin. If you have both installed:

- You may see double greetings on session start (both Bismillah messages)
- You may see generic dhikr (from Islamic Reminders) alongside context-aware messages (from BarakahCLI)

**Recommendation:** Uninstall Islamic Reminders if you install BarakahCLI:

```bash
/plugin uninstall islamic-reminders@islamic-reminders-claude-plugin
```

BarakahCLI covers everything Islamic Reminders does, plus frustration detection, success gratitude, periodic timers, Ramadan mode, and a full skill/personality system.

---

## Customizing Content

All messages are in `content/content.json`. You can:

- **Add your own Sabr snippets** to the `sabr.snippets` array
- **Add Shukr messages** to `shukr.snippets`
- **Add Ramadan reminders** to `barakah_timer.ramadan_reminders`
- **Translate** — copy `content.json` to `content-ar.json` or any locale (locale support planned for v2)

---

## Known Limitations

1. **Plugin hook output capture** — There is a [known Claude Code issue](https://github.com/anthropics/claude-code/issues/12151) where plugin hook stdout may not always reach the agent context. If hooks execute but Claude doesn't seem aware of them, the stderr messages (shown to you directly) will still work. Workaround: define hooks in `~/.claude/settings.json` instead.

2. **No interactive SessionStart** — The Niyyah Protocol outputs a greeting, but the actual intention-setting conversation is handled by the Skill (SKILL.md), not a blocking prompt. This is by design — Claude Code hooks cannot block for user input.

3. **State resets** — The interaction counter persists in `~/.barakah-cli/state.json` but may occasionally reset if the file becomes corrupted.

---

## Contributing

Contributions welcome! Especially:

- New Sabr/Shukr snippets (keep them developer-relevant)
- Translations (Arabic, Urdu, Malay, Turkish, etc.)
- Ramadan mode enhancements
- Prayer time integration ideas (without external API calls)

---

## License

MIT

---

## Du'a

*"O Allah, benefit me with what You have taught me, teach me what will benefit me, and increase me in knowledge."*

— Hadith (Tirmidhi)

---

**Built with Tawakkul. Shipped with Bismillah. ﷽**
