#!/usr/bin/env node

/**
 * BarakahCLI - Quran Verse Break
 *
 * Hook Event: UserPromptSubmit
 *
 * Behavior:
 *   - Every N interactions (configurable, default 15), opens a Quran verse on quran.com.
 *   - Random mode: picks from a curated pool (or user-defined list).
 *   - Sequential mode: reads the Quran page-by-page (1–604), persisting progress across sessions.
 */

const { exec } = require('child_process');

const {
  loadConfig,
  loadContent,
  randomPick,
  readStdin,
  loadState,
  saveState,
  isQuietHours
} = require('./utils');

function openUrl(url) {
  const platform = process.platform;
  let cmd;
  if (platform === 'darwin') {
    cmd = `open "${url}"`;
  } else if (platform === 'win32') {
    cmd = `start "" "${url}"`;
  } else {
    cmd = `xdg-open "${url}"`;
  }
  exec(cmd); // fire and forget
}

async function main() {
  const config = loadConfig();

  if (!config.enabled || !config.quran_verse) {
    process.exit(0);
  }

  if (isQuietHours(config)) {
    process.exit(0);
  }

  // Consume stdin (required even if unused)
  await readStdin();

  const state = loadState();
  const count = state.interaction_count || 0;
  const interval = config.quran_verse_interval || 15;
  const lastQuranAt = state.last_quran_at || 0;

  // Check if we've hit the interval since the last verse break
  if (count <= 0 || count < lastQuranAt + interval) {
    process.exit(0);
  }

  const mode = config.quran_verse_mode || 'random';

  if (mode === 'sequential') {
    const page = state.quran_page || 1;
    const url = `https://quran.com/page/${page}`;

    if (page >= 604) {
      process.stderr.write(
        `\n  Masha'Allah! You've completed a full reading of the Quran.\n` +
        `  Beginning again from Page 1. May Allah accept it from you.\n` +
        `  → ${url}\n`
      );
    } else {
      process.stderr.write(
        `\n  Quran Reading | Page ${page} of 604\n` +
        `  → ${url}\n`
      );
    }

    openUrl(url);

    state.quran_page = (page % 604) + 1;
    state.last_quran_at = count;
    saveState(state);

    console.log(JSON.stringify({
      barakah_cli: {
        event: 'quran_verse',
        mode: 'sequential',
        url,
        guidance: 'A Quran verse was just opened for the user as a mindful break. Acknowledge it warmly if they mention it, but don\'t force it into the conversation.'
      }
    }));

  } else {
    // Random mode
    const content = loadContent();
    const userVerses = Array.isArray(config.quran_verses) ? config.quran_verses : [];
    const defaultVerses = (content && Array.isArray(content.quran_verses)) ? content.quran_verses : [];
    const pool = userVerses.length > 0 ? userVerses : defaultVerses;

    if (pool.length === 0) {
      process.exit(0);
    }

    const verse = randomPick(pool);
    if (!verse) {
      process.exit(0);
    }

    const url = `https://quran.com/${verse.surah}/${verse.ayah}`;

    process.stderr.write(
      `\n  Ayah Break: ${verse.name}\n` +
      `  "${verse.note || ''}"\n` +
      `  → ${url}\n`
    );

    openUrl(url);

    state.last_quran_at = count;
    saveState(state);

    console.log(JSON.stringify({
      barakah_cli: {
        event: 'quran_verse',
        mode: 'random',
        url,
        guidance: 'A Quran verse was just opened for the user as a mindful break. Acknowledge it warmly if they mention it, but don\'t force it into the conversation.'
      }
    }));
  }

  process.exit(0);
}

main().catch(() => process.exit(0));
