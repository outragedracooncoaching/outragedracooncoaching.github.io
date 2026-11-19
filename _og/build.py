#!/usr/bin/env python3
"""Builds 1200x630 share-image HTML from _og/ templates, then screenshots to assets/images/og/ with headless Chrome.
Run from repo root: python3 _og/build.py"""
import os, subprocess, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
IMGS = {
  "me": "assets/images/brand-images/Me.webp",
  "beret": "assets/images/poster/raccoon-beret.webp",
  "balloon": "assets/images/poster/raccoon-balloon.webp",
  "scream": "assets/images/site/racoon-screaming-900.jpg",
  "hsiam": "assets/images/site/hsiam-raccoon-1100.webp",
}
PAGES = [
  dict(slug="default", kicker="Outraged Racoon Coaching", l1="Outraged", l2="Racoon", sub="No-bullshit coaching for the messy, human, hard parts of working in tech.", img="scream", foot="Val Dryden · VP Engineering · ILM executive coach"),
  dict(slug="home", kicker="1:1 coaching · for the hard parts of tech", l1="No-bullshit", l2="coaching", sub="for engineering managers and folks in tech.", img="scream", foot="Val Dryden · VP Engineering · ILM executive coach"),
  dict(slug="engineering-managers", kicker="Coaching · engineering managers", l1="Engineering managers", size="84", l2="coaching", sub="Because there's no undo button for people.", img="hsiam", foot="Val Dryden · VP Engineering · ILM executive coach"),
  dict(slug="folks-in-tech", kicker="Coaching · folks in tech", l1="Coaching for", l2="folks in tech", sub="More power, more credit, less bullshit.", img="scream", foot="Val Dryden · VP Engineering · ILM executive coach"),
  dict(slug="course", kicker="Online course · engineering management first aid", l1="Holy shit,", l2="I'm a Manager!", sub="Nobody prepares you for this job. <span class=\"pk\">So I wrote the manual.</span>", img="hsiam", foot="★★★★★ Every review · 100+ managers · 52+ lessons · £400"),
]
TPL = (root/"_og/template.html").read_text()
for p in PAGES:
    p.setdefault("size","118")
    html = TPL
    for k, v in p.items():
        html = html.replace("{{%s}}" % k, v)
    html = html.replace("{{imgsrc}}", "file://%s/%s" % (root, IMGS[p["img"]]))
    f = root/f"_og/out-{p['slug']}.html"
    f.write_text(html)
    out = root/f"assets/images/og/{p['slug']}.png"
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
        "--force-device-scale-factor=1", "--window-size=1200,630", "--virtual-time-budget=8000",
        f"--screenshot={out}", f"file://{f}"], check=True, capture_output=True)
    f.unlink()
    print(out)

# LinkedIn profile banner, 1584x396 (profile photo covers bottom-left, so content sits right of x=480)
b = root/"_og/out-banner.html"
b.write_text((root/"_og/banner.html").read_text().replace("ROOT", str(root)))
out = root/"linkedin/linkedin-banner.png"
subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--window-size=1584,396", "--virtual-time-budget=8000", f"--screenshot={out}", f"file://{b}"], check=True, capture_output=True)
b.unlink(); print(out)

