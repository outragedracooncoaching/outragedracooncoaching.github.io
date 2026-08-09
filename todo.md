# Todo

- Check 320px horizontal overflow on homepage. Seen in a headless Chrome
  screenshot at 320px wide: content runs off the right edge. Unverified,
  and quite possibly a headless artefact rather than a real bug, since
  `--window-size` does not set a true mobile layout viewport, so the page
  renders at desktop width and gets clipped. Renders identically on a clean
  build of the pre-optimisation commit, so it is not caused by the image /
  font perf work in 48d3b3d. Confirm in real device emulation before fixing.

- Make a hero callout of Hugh's quote