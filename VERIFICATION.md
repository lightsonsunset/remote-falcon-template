# Verification and compatibility

The customiser is tested at three separate levels:

- Automated Node tests cover settings migrations, rendering, escaping, URL validation, catalogue parsing and export safety.
- Local browser checks cover the illustrative demo, both seasonal themes, Jukebox/Voting, On air/Off air, navigation, category filters, NEW sashes, messages, narrow layouts, enlarged text, keyboard focus, setup, tour and settings persistence.
- Generated pages have passed Remote Falcon’s validator in a separate non-live draft. That validates markup compatibility; it does not establish live playback, location-code acceptance, vote limits or live countdown updates.

Device presets check layout, not a particular phone operating system. Test your own exported page in an RF draft and with your show before making it live. The demo never sends RF requests or votes.

The v1.5 release checks also cover backup confirmation and cancellation, export navigation and filenames, clipboard fallback, Help focus, and show-name contrast advice. A local CSS simulation checks the simple scrollable layout when `:has()` is unavailable; it is not a test on an actual older device. Recent browsers retain the normal panel navigation and filters.

Run `npm run verify` for automated release checks. Browser harnesses in `tests/` are local development tools and are excluded from the published website. Publication checks verify the final URLs, artwork, documentation and downloads separately.

The v1.5.1 preview-link regression checks cover resolved link addresses, intercepted and native anchor clicks, CSS targets, Back/Forward, external-link blocking and panel retention after edits across both themes, music modes and availability states. The preview-only base URL does not enter generated RF pages. Desktop browser checks are not a substitute for the reported iPhone path being rechecked on the device.
