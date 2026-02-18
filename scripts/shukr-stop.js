#!/usr/bin/env node

/**
 * BarakahCLI - Shukr (Gratitude) Stop Hook
 * 
 * Hook Event: Stop
 * 
 * Behavior:
 *   - Fires when Claude finishes responding.
 *   - Reads the stop reason and recent context.
 *   - Shows a Shukr (gratitude) reminder via systemMessage.
 *   - Does NOT fire every time — only periodically to avoid spam.
 */

const {
  loadConfig,
  loadContent,
  randomPick,
  readStdin,
  loadState,
  saveState,
  isQuietHours
} = require('./utils');

async function main() {
  const config = loadConfig();

  if (!config.enabled || !config.shukr_hook) {
    process.exit(0);
  }

  if (isQuietHours(config)) {
    process.exit(0);
  }

  const content = loadContent();
  if (!content || !content.shukr || !content.shukr.snippets) {
    process.exit(0);
  }

  const input = await readStdin();

  // Read state to check if we should show a message
  const state = loadState();
  const count = state.interaction_count || 0;

  // Only show Shukr periodically to avoid spamming
  const shukrInterval = 2;
  const lastShukrAt = state.last_shukr_at || 0;

  if (count > 0 && count < lastShukrAt + shukrInterval) {
    process.exit(0);
  }

  const snippet = randomPick(content.shukr.snippets);

  // Update state
  state.last_shukr_at = count;
  saveState(state);

  // Use systemMessage format that Claude Code displays to user
  console.log(JSON.stringify({
    continue: true,
    systemMessage: snippet
  }));

  process.exit(0);
}

main().catch(() => process.exit(0));
