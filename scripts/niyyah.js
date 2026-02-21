#!/usr/bin/env node

/**
 * BarakahCLI - Niyyah (Intention) Protocol
 * 
 * Hook Event: SessionStart
 * BRD Reference: §3.1
 * 
 * Behavior:
 *   - Displays the Niyyah greeting when a Claude Code session starts.
 *   - Outputs context that Claude will see, prompting the intention question.
 *   - Resets the interaction counter and session state.
 */

const {
  loadConfig,
  loadContent,
  readStdin,
  loadState,
  saveState,
  isQuietHours,
  formatMessage
} = require('./utils');

async function main() {
  const config = loadConfig();

  // Master kill switch
  if (!config.enabled || !config.niyyah_prompt) {
    process.exit(0);
  }

  // Respect quiet hours
  if (isQuietHours(config)) {
    process.exit(0);
  }

  const content = loadContent();
  if (!content || !content.niyyah) {
    process.exit(0);
  }

  // Read hook input (contains session info)
  await readStdin();

  // Reset session state
  const state = loadState();
  state.interaction_count = 0;
  state.last_timer_at = 0;
  state.last_quran_at = 0;
  state.session_start_time = new Date().toISOString();
  state.niyyah = null;
  saveState(state);

  // Output the Niyyah greeting
  // Use systemMessage field - this is what Claude Code displays for SessionStart hooks
  const greeting = content.niyyah.greeting;

  console.log(JSON.stringify({
    continue: true,
    systemMessage: greeting,
    barakah_cli: {
      event: 'niyyah',
      guidance: 'Greet the user warmly. Ask about their intention for this session. If they share one, acknowledge it briefly with Bismillah. If they skip, proceed naturally without pressure.'
    }
  }));

  process.exit(0);
}

main().catch(() => process.exit(0));
