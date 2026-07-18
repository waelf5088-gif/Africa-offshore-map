#!/usr/bin/env python
"""Helper SNAPSHOT-QA v2 : capture de la carte live avec Playwright (Chromium).
Contrairement a Edge --headless, Playwright rend le WebGL de MapLibre via SwiftShader,
donc le canvas n'est plus noir. Attend le rendu de la carte avant de capturer.

Usage : python snapshot.py <url> <out.png> [wait_ms]
"""
import sys


def main() -> int:
    if len(sys.argv) < 3:
        sys.stderr.write("usage: snapshot.py <url> <out.png> [wait_ms]\n")
        return 2
    url, out = sys.argv[1], sys.argv[2]
    wait_ms = int(sys.argv[3]) if len(sys.argv) > 3 else 9000

    from playwright.sync_api import sync_playwright

    with sync_playwright() as p:
        browser = p.chromium.launch(
            args=["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
        )
        page = browser.new_page(viewport={"width": 1600, "height": 1000}, device_scale_factor=1)
        page.goto(url, wait_until="networkidle", timeout=60000)
        # Laisse MapLibre charger tuiles + WebGL. Si l'app expose la carte, on attend 'idle'.
        try:
            page.wait_for_selector("canvas.maplibregl-canvas", timeout=15000)
        except Exception:  # noqa: BLE001
            pass
        page.wait_for_timeout(wait_ms)
        page.screenshot(path=out, full_page=False)
        browser.close()
    print(f"snapshot -> {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
