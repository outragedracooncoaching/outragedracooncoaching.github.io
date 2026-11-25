#!/usr/bin/env python3
"""Builds 1200x630 share-image HTML from _og/ templates, then screenshots to assets/images/og/ with headless Chrome.
Run from repo root: python3 _og/build.py
LinkedIn sale banner only, using the sale values in _config.yml: python3 _og/build.py sale"""
import re, subprocess, pathlib, sys
root = pathlib.Path(__file__).resolve().parent.parent
CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
IMGS = {
  "me": "assets/images/brand-images/Me.webp",
  "beret": "assets/images/poster/raccoon-beret.webp",
  "balloon": "assets/images/poster/raccoon-balloon.webp",
  "scream": "assets/images/site/racoon-screaming-900.jpg",
  "hsiam": "assets/images/site/hsiam-raccoon-1100.webp",
}

def shoot(html, out, size):
    f = root/f"_og/out-{out.stem}.html"
    f.write_text(html)
    subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars",
        "--force-device-scale-factor=1", f"--window-size={size}", "--virtual-time-budget=8000",
        f"--screenshot={out}", f"file://{f}"], check=True, capture_output=True)
    f.unlink()
    print(out)

# LinkedIn profile banner, 1584x396 (profile photo covers bottom-left, so content sits right of x=480)
BANNER = (root/"_og/banner.html").read_text().replace("ROOT", str(root))

if sys.argv[1:] == ["sale"]:
    block = re.search(r"^sale:\n((?:[ \t]+.*\n)+)", (root/"_config.yml").read_text(), re.M).group(1)
    sale = dict(re.findall(r'^\s+(\w+):\s*"([^"]*)"', block, re.M))
    sticker = (root/"_og/banner-sale.html").read_text()
    for k in ("name", "saving", "code", "ends"):
        sticker = sticker.replace("{{%s}}" % k, sale[k])
    style, div = sticker.split("</style>")
    html, n = re.subn(r'<div class="also">.*?</div>', lambda m: div.strip(), BANNER, flags=re.S)
    assert n == 1, "sticker not found in banner.html"
    html = html.replace("</head>", style + "</style></head>")
    shoot(html, root/"linkedin/linkedin-banner-sale.png", "1584,396")
    sys.exit()

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
    shoot(html, root/f"assets/images/og/{p['slug']}.png", "1200,630")

shoot(BANNER, root/"linkedin/linkedin-banner.png", "1584,396")
