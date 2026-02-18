/**
 * BarakahCLI - Shared Utilities
 * 
 * Common functions for config loading, content access, state management,
 * and random selection used across all hook scripts.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

// Resolve plugin root from environment or fallback
const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..');
const USER_DIR = path.join(os.homedir(), '.barakah-cli');
const STATE_FILE = path.join(USER_DIR, 'state.json');
const USER_CONFIG_FILE = path.join(USER_DIR, 'config.json');
const DEFAULT_CONFIG_FILE = path.join(PLUGIN_ROOT, 'content', 'default-config.json');
const CONTENT_FILE = path.join(PLUGIN_ROOT, 'content', 'content.json');

/**
 * Ensure the ~/.barakah-cli directory exists
 */
function ensureUserDir() {
  try {
    if (!fs.existsSync(USER_DIR)) {
      fs.mkdirSync(USER_DIR, { recursive: true });
    }
  } catch {
    // Silently continue - state will be in-memory only
  }
}

/**
 * Load and merge config (user overrides defaults)
 */
function loadConfig() {
  let defaults = {};
  let userConfig = {};

  try {
    defaults = JSON.parse(fs.readFileSync(DEFAULT_CONFIG_FILE, 'utf8'));
  } catch {
    // If default config is missing, use hardcoded fallback
    defaults = {
      enabled: true,
      humor: true,
      ramadan_mode: false,
      strict_mode: false,
      niyyah_prompt: true,
      sabr_guard: true,
      shukr_hook: true,
      barakah_timer: true,
      timer_interval: 10,
      quiet_hours: { enabled: false, start: '23:00', end: '05:00' }
    };
  }

  try {
    if (fs.existsSync(USER_CONFIG_FILE)) {
      userConfig = JSON.parse(fs.readFileSync(USER_CONFIG_FILE, 'utf8'));
    }
  } catch {
    // Invalid user config - ignore and use defaults
  }

  return { ...defaults, ...userConfig };
}

/**
 * Load the content library
 */
function loadContent() {
  try {
    return JSON.parse(fs.readFileSync(CONTENT_FILE, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * Pick a random item from an array
 */
function randomPick(arr) {
  if (!arr || arr.length === 0) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Load persistent state (interaction counter, session niyyah, etc.)
 */
function loadState() {
  ensureUserDir();
  try {
    if (fs.existsSync(STATE_FILE)) {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
    }
  } catch {
    // Corrupted state file - reset
  }
  return {
    interaction_count: 0,
    session_start_time: null,
    niyyah: null,
    last_timer_at: 0
  };
}

/**
 * Save persistent state
 */
function saveState(state) {
  ensureUserDir();
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch {
    // Silently fail - non-critical
  }
}

/**
 * Read JSON input from stdin (used by all hook scripts)
 * Returns a promise that resolves with the parsed JSON
 */
function readStdin() {
  return new Promise((resolve, reject) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => { data += chunk; });
    process.stdin.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        resolve({});
      }
    });
    process.stdin.on('error', reject);

    // Safety timeout - hooks must be fast (BRD §6: <200ms)
    setTimeout(() => resolve({}), 3000);
  });
}

/**
 * Check if we're in quiet hours
 */
function isQuietHours(config) {
  if (!config.quiet_hours || !config.quiet_hours.enabled) return false;

  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentMinutes = hours * 60 + minutes;

  const [startH, startM] = config.quiet_hours.start.split(':').map(Number);
  const [endH, endM] = config.quiet_hours.end.split(':').map(Number);
  const startMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  // Handle overnight ranges (e.g., 23:00 - 05:00)
  if (startMinutes > endMinutes) {
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * Format a message for output to stderr (shown to user as hook feedback)
 */
function formatMessage(prefix, message) {
  return `\n  ${prefix} ${message}\n`;
}

module.exports = {
  PLUGIN_ROOT,
  USER_DIR,
  loadConfig,
  loadContent,
  randomPick,
  loadState,
  saveState,
  readStdin,
  isQuietHours,
  formatMessage
};
