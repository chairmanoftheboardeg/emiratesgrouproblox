# Emirates Group Roblox (EGR) — Static Website (Vanilla HTML/CSS/JS)

This site is designed for GitHub Pages / custom domain root.

## Quick setup
1) Upload the entire folder contents to your GitHub repository root.
2) Edit `assets/config.js` to set your real links (Discord channels, Careers, Flights, etc.).
3) Ensure your images exist in `/images/` with the filenames referenced in `assets/config.js`.

## Configure links
Open `assets/config.js` and replace the placeholder URLs in `CONFIG.links`.

## Configure Discord presence (optional)
If you enable your Discord Server Widget, set:
- `CONFIG.discord.serverId`
- `CONFIG.discord.widgetJsonUrl` (usually: https://discord.com/api/guilds/<SERVER_ID>/widget.json)

## Notes
- Redirect pages are intentionally minimal: instant redirect + a single fallback button.
- HQ status is automatic (6:00–22:30 Dubai time). Operations are always shown as 24/7.
