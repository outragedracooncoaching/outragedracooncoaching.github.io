# Todo

- Check 320px horizontal overflow on homepage. Seen in a headless Chrome
  screenshot at 320px wide: content runs off the right edge. Unverified,
  and quite possibly a headless artefact rather than a real bug, since
  `--window-size` does not set a true mobile layout viewport, so the page
  renders at desktop width and gets clipped. Renders identically on a clean
  build of the pre-optimisation commit, so it is not caused by the image /
  font perf work in 48d3b3d. Confirm in real device emulation before fixing.

- Make a hero callout of Hugh's quote

## Dark redesign follow-ups (Nov 2026)

- Bring the other pages in line with the homepage (they still use the old heavy italic and riso leftovers). Use `/design`.
- Top menu wraps onto two lines on phones (shared `_layouts/default.html`).
- Course page (`pages/holy-shit-im-a-manager.md`) still uses the old four-raccoon `hsiam_logo.webp`. New art: `assets/images/site/hsiam-raccoon-{600,1100}.webp`.
- Cutting "What I do" removed the only homepage mention of the Slack community. Maybe add it to the course description.
- Site-wide already changed: body font is now Source Serif 4; all buttons have cream shadows. Check other pages still look right.
- Copy idea for Val: "Email me →" instead of "Get in touch →", since the button opens an email.
