Toggle Ramadan mode for BarakahCLI.

Check if the file `~/.barakah-cli/config.json` exists. If it does, read it and toggle the `ramadan_mode` field. If it doesn't exist, create it with `ramadan_mode: true`.

If the user says `/barakah-cli:ramadan-mode on` → set `ramadan_mode` to `true`
If the user says `/barakah-cli:ramadan-mode off` → set `ramadan_mode` to `false`
If no argument, toggle the current value.

After updating, confirm to the user:
- "Ramadan mode activated 🌙 — BarakahCLI will include fasting-aware reminders and energy checks."
- OR "Ramadan mode deactivated — standard reminders will continue."

Ramadan Mubarak! 🌙

$ARGUMENTS
