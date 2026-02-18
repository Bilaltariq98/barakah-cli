#!/usr/bin/env node

/**
 * BarakahCLI - Shukr (Gratitude) Hook
 * 
 * Hook Event: PostToolUse
 * BRD Reference: §3.3
 * 
 * Behavior:
 *   - Fires after Claude completes a tool action.
 *   - Checks tool output and tool name for success indicators.
 *   - If success is detected, shows a Shukr reminder via stderr.
 *   - Adds gratitude context to stdout for Claude.
 */

const {
  loadConfig,
  loadContent,
  randomPick,
  readStdin,
  isQuietHours,
  formatMessage
} = require('./utils');

// Success patterns to detect in tool output or tool name
const SUCCESS_PATTERNS = [
  /\bsuccess(fully)?\b/i,
  /\bcompleted?\b/i,
  /\bfixed\b/i,
  /\bresolved\b/i,
  /\bpassed\b/i,
  /\ball\s+tests?\s+(pass|green)/i,
  /\bbuild\s+succeed/i,
  /\b0\s+(errors?|failures?)\b/i,
  /\bno\s+errors?\b/i,
  /\bclean\s+build\b/i,
  /\bdeployed\b/i,
  /\bmerged\b/i,
  /\binstalled\b/i,
  /\bcreated\s+successfully\b/i,
  /\bcompilation\s+succeed/i
];

// Tool names that indicate constructive output (file creation, etc.)
const SUCCESS_TOOLS = [
  /^Write$/i,
  /^Edit$/i
];

function detectSuccess(input) {
  // Check tool output text
  const output = input.tool_output || input.output || input.stdout || '';
  const toolName = input.tool_name || '';

  const outputMatch = typeof output === 'string' &&
    SUCCESS_PATTERNS.some(p => p.test(output));

  // We don't fire on every Write/Edit - only when output also signals success
  // This prevents noise on routine file operations
  const toolMatch = SUCCESS_TOOLS.some(p => p.test(toolName));

  return outputMatch;
}

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

  if (detectSuccess(input)) {
    const snippet = randomPick(content.shukr.snippets);

    // stderr = shown to user
    process.stderr.write(formatMessage('Alhamdulillah!', snippet));

    // stdout = context for Claude
    console.log(JSON.stringify({
      barakah_cli: {
        event: 'shukr',
        message: snippet
      }
    }));
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
