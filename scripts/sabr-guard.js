#!/usr/bin/env node

/**
 * BarakahCLI - Sabr (Patience) Guard
 * 
 * Hook Event: UserPromptSubmit
 * BRD Reference: §3.2
 * 
 * Behavior:
 *   - Reads the user's prompt from stdin JSON.
 *   - Checks for frustration keywords via regex.
 *   - If detected, outputs a Sabr snippet to stderr (shown to user)
 *     and adds context to stdout (seen by Claude).
 *   - Also increments the interaction counter for the Barakah Timer.
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

// Frustration detection patterns (BRD §3.2 keywords + extended set)
const FRUSTRATION_PATTERNS = [
  /\berror\b/i,
  /\bfailed\b/i,
  /\bcrash(ed|es|ing)?\b/i,
  /\bbug(s|gy)?\b/i,
  /\bstupid\b/i,
  /\bbroken\b/i,
  /\bexception\b/i,
  /\bwhy\s+(is|does|won'?t|isn'?t|doesn'?t|can'?t)\b/i,
  /\bhate\b/i,
  /\bfrustr/i,
  /\burghhh?\b/i,
  /\bugh+\b/i,
  /\bwtf\b/i,
  /\bwth\b/i,
  /\bdamn\b/i,
  /\bnot\s+working\b/i,
  /\bwon'?t\s+(compile|build|run|work|start|load)\b/i,
  /\bkeeps?\s+(failing|crashing|breaking)\b/i,
  /\bgive\s*up\b/i,
  /\bimpossible\b/i
];

// Moderate intensity patterns (strong frustration - use gentler Sabr)
const STRONG_FRUSTRATION = [
  /\bstupid\b/i,
  /\bhate\b/i,
  /\bwtf\b/i,
  /\bwth\b/i,
  /\bdamn\b/i,
  /\bgive\s*up\b/i,
  /\bimpossible\b/i
];

function detectFrustration(text) {
  if (!text || typeof text !== 'string') return { detected: false };

  const isStrong = STRONG_FRUSTRATION.some(p => p.test(text));
  const isAny = FRUSTRATION_PATTERNS.some(p => p.test(text));

  return {
    detected: isAny,
    intensity: isStrong ? 'strong' : 'mild'
  };
}

async function main() {
  const config = loadConfig();

  // Master kill switch
  if (!config.enabled) {
    process.exit(0);
  }

  if (isQuietHours(config)) {
    process.exit(0);
  }

  const content = loadContent();
  if (!content) {
    process.exit(0);
  }

  // Read the hook input
  const input = await readStdin();

  // Increment interaction counter regardless of frustration
  const state = loadState();
  state.interaction_count = (state.interaction_count || 0) + 1;
  saveState(state);

  // If Sabr Guard is disabled, exit after counting
  if (!config.sabr_guard) {
    process.exit(0);
  }

  // Extract user prompt text
  // UserPromptSubmit provides the prompt in the input
  const promptText = input.prompt || input.user_prompt || input.content || '';

  const result = detectFrustration(promptText);

  if (result.detected && content.sabr && content.sabr.snippets) {
    const snippet = randomPick(content.sabr.snippets);

    // stderr = shown to user as hook feedback
    process.stderr.write(formatMessage('Ya Sabr!', snippet));

    // stdout = added to Claude's context so it can respond with empathy
    console.log(JSON.stringify({
      barakah_cli: {
        event: 'sabr_guard',
        intensity: result.intensity,
        message: snippet,
        guidance: 'The user may be frustrated. Respond with extra patience and encouragement. Acknowledge their difficulty before jumping to solutions.'
      }
    }));
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
