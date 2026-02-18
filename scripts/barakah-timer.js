#!/usr/bin/env node

/**
 * BarakahCLI - Barakah Timer
 * 
 * Hook Event: UserPromptSubmit (secondary, shares event with Sabr Guard)
 * BRD Reference: §3.4
 * 
 * Behavior:
 *   - Checks the interaction counter from shared state.
 *   - Every N interactions (configurable, default 10), shows a mindfulness reminder.
 *   - In Ramadan mode, uses Ramadan-specific reminders.
 *   - This script reads state written by sabr-guard.js (which increments the counter).
 */

const {
  loadConfig,
  loadContent,
  randomPick,
  readStdin,
  loadState,
  saveState,
  isQuietHours,
  formatMessage
} = require('./utils');

async function main() {
  const config = loadConfig();

  if (!config.enabled || !config.barakah_timer) {
    process.exit(0);
  }

  if (isQuietHours(config)) {
    process.exit(0);
  }

  const content = loadContent();
  if (!content || !content.barakah_timer) {
    process.exit(0);
  }

  // Consume stdin (required even if unused)
  await readStdin();

  const state = loadState();
  const count = state.interaction_count || 0;
  const interval = config.timer_interval || 10;
  const lastTimerAt = state.last_timer_at || 0;

  // Check if we've hit the interval since the last reminder
  if (count > 0 && count >= lastTimerAt + interval) {
    // Pick from the right pool
    let pool = content.barakah_timer.reminders || [];

    if (config.ramadan_mode && content.barakah_timer.ramadan_reminders) {
      // In Ramadan mode, mix in Ramadan-specific reminders (weighted)
      // 50% chance of Ramadan-specific reminder
      if (Math.random() < 0.5) {
        pool = content.barakah_timer.ramadan_reminders;
      }
    }

    const reminder = randomPick(pool);

    if (reminder) {
      // stderr = shown to user
      process.stderr.write(formatMessage('Dhikr Reminder:', `[Interaction #${count}] ${reminder}`));

      // stdout = context for Claude
      console.log(JSON.stringify({
        barakah_cli: {
          event: 'barakah_timer',
          interaction_count: count,
          message: reminder,
          ramadan_mode: config.ramadan_mode,
          guidance: 'The user has been coding for a while. Be mindful of their energy. If they seem tired, suggest they take a break.'
        }
      }));

      // Update last timer checkpoint
      state.last_timer_at = count;
      saveState(state);
    }
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
