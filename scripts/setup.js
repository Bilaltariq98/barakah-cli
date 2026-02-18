#!/usr/bin/env node

/**
 * BarakahCLI - First-run Setup
 * 
 * Creates ~/.barakah-cli/ directory and copies default config if not present.
 * Run manually or called during first SessionStart.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const USER_DIR = path.join(os.homedir(), '.barakah-cli');
const USER_CONFIG = path.join(USER_DIR, 'config.json');
const PLUGIN_ROOT = process.env.CLAUDE_PLUGIN_ROOT || path.resolve(__dirname, '..');
const DEFAULT_CONFIG = path.join(PLUGIN_ROOT, 'content', 'default-config.json');

function setup() {
  // Create user directory
  if (!fs.existsSync(USER_DIR)) {
    fs.mkdirSync(USER_DIR, { recursive: true });
    console.log(`Created ${USER_DIR}`);
  }

  // Copy default config if user doesn't have one
  if (!fs.existsSync(USER_CONFIG)) {
    try {
      const defaults = fs.readFileSync(DEFAULT_CONFIG, 'utf8');
      const config = JSON.parse(defaults);

      // Remove meta field from user copy
      delete config.meta;

      fs.writeFileSync(USER_CONFIG, JSON.stringify(config, null, 2), 'utf8');
      console.log(`Created default config at ${USER_CONFIG}`);
      console.log('');
      console.log('BarakahCLI Configuration:');
      console.log('  humor:        true   (developer jokes in reminders)');
      console.log('  ramadan_mode: false   (set to true during Ramadan)');
      console.log('  strict_mode:  false   (set to true for reminders only, no humor)');
      console.log('  timer:        10      (remind every 10 interactions)');
      console.log('');
      console.log(`Edit ${USER_CONFIG} to customize.`);
    } catch (err) {
      console.error(`Could not create config: ${err.message}`);
    }
  } else {
    console.log(`Config already exists at ${USER_CONFIG}`);
  }

  console.log('');
  console.log('Bismillah! BarakahCLI setup complete.');
}

setup();
