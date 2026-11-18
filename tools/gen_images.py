"""Procedural product + room imagery for the COTTO LiFE prototype."""
import os, math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageFont

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "assets", "img")
os.makedirs(OUT, exist_ok=True)

# ---------- noise ----------
def _grid(h, w, res, rng):
    res = max(2, min(res, 512))
    small = (rng.random((res, res)) * 255).astype(np.uint8)
    im = Image.fromarray(small).resize((w, h), Image.BICUBIC)
    return np.asarray(im, dtype=np.float32) / 255.0

def fbm(h, w, seed, octaves=6, base=4, pers=0.5):
    rng = np.random.default_rng(seed)
    out = np.zeros((h, w), np.float32); amp = 1.0; tot = 0.0
    for i in range(octaves):
        out += amp * _grid(h, w, base * (2 ** i), rng)
        tot += amp; amp *= pers
    return out / tot

def _mix(c1, c2, t):
    c1 = np.array(c1, np.float32); c2 = np.array(c2, np.float32)
    return c1[None, None, :] * (1 - t[..., None]) + c2[None, None, :] * t[..., None]

def _finish(arr, grain=0.012, seed=0):
    rng = np.random.default_rng(seed + 7)
    arr = arr + rng.normal(0, grain * 255, arr.shape[:2])[..., None]
    return Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))

# ---------- materials ----------
def marble(h, w, seed, base, vein, vein2=None, freq=2.4, warp=1.9, sharp=0.45, contrast=1.0):
    X = np.linspace(0, 1, w, dtype=np.float32)[None, :].repeat(h, 0)
    Y = np.linspace(0, 1, h, dtype=np.float32)[:, None].repeat(w, 1)
    n = fbm(h, w, seed, 6, 3)
    nf = fbm(h, w, seed + 51, 6, 12)
    t = np.sin((X * 1.0 + Y * 0.45 + warp * (n - 0.5)) * np.pi * freq * 2.0)
    v = np.clip(1.0 - np.abs(t) ** sharp, 0, 1)
    v = np.clip((v - 0.22) * 1.9 * contrast, 0, 1)
    t2 = np.sin((X * 0.6 - Y * 1.3 + warp * 1.4 * (fbm(h, w, seed + 7, 5, 5) - 0.5)) * np.pi * freq * 5.0)
    v2 = np.clip(1.0 - np.abs(t2) ** 0.3, 0, 1)
    v2 = np.clip((v2 - 0.55) * 1.4, 0, 1) * 0.55
    arr = _mix(base, vein, v)
    if vein2 is not None:
        arr = arr * (1 - v2[..., None]) + np.array(vein2, np.float32)[None, None, :] * v2[..., None]
    arr = arr + ((nf - 0.5) * 16)[..., None]
    return _finish(arr, 0.010, seed)

def terrazzo(h, w, seed, base, chips, density=0.00055, smin=6, smax=22):
    rng = np.random.default_rng(seed)
    bg = fbm(h, w, seed + 3, 4, 3)
    arr = _mix(base, tuple(min(255, c + 10) for c in base), bg)
    im = _finish(arr, 0.006, seed)
    d = ImageDraw.Draw(im)
    n = int(h * w * density)
    for _ in range(n):
        cx, cy = rng.integers(0, w), rng.integers(0, h)
        rx = rng.integers(smin, smax); ry = int(rx * rng.uniform(0.55, 1.0))
        col = tuple(int(c + rng.integers(-12, 12)) for c in chips[rng.integers(0, len(chips))])
        box = Image.new("RGBA", (rx * 2 + 4, ry * 2 + 4), (0, 0, 0, 0))
        ImageDraw.Draw(box).ellipse([2, 2, rx * 2, ry * 2], fill=col + (255,))
        box = box.rotate(float(rng.integers(0, 180)), expand=True, resample=Image.BICUBIC)
        im.paste(box, (int(cx - box.width / 2), int(cy - box.height / 2)), box)
    im = im.filter(ImageFilter.GaussianBlur(0.6))
    a = np.asarray(im, np.float32)
    return _finish(a, 0.010, seed + 1)

def wood(h, w, seed, light, dark, planks=3, horizontal=True):
    if horizontal:
        H, W = h, w
    else:
        H, W = w, h
    Y = np.linspace(0, 1, H, dtype=np.float32)[:, None].repeat(W, 1)
    n = fbm(H, W, seed, 6, 4)
    n2 = fbm(H, W, seed + 11, 6, 22)
    rings = np.sin((Y * 34 + (n - 0.5) * 2.2) * np.pi)
    g = np.clip(0.5 + rings * 0.5, 0, 1) ** 1.9
    fine = np.sin((Y * 190 + (n2 - 0.5) * 1.1) * np.pi) * 0.5 + 0.5
    g = g * 0.58 + fine * 0.20 + n2 * 0.22
    arr = _mix(dark, light, g)
    step = H / planks
    for i in range(1, planks):
        y = int(i * step)
        arr[max(0, y - 2):y + 2, :, :] *= 0.80
    arr[:2, :, :] *= 0.85; arr[-2:, :, :] *= 0.85
    im = _finish(arr, 0.012, seed)
    if not horizontal:
        im = im.transpose(Image.ROTATE_90)
    return im

def concrete(h, w, seed, base, spread=26):
    a = fbm(h, w, seed, 7, 3)
    b = fbm(h, w, seed + 31, 6, 16)
    t = np.clip(a * 0.75 + b * 0.25, 0, 1)
    lo = tuple(max(0, c - spread) for c in base)
    hi = tuple(min(255, c + spread) for c in base)
    arr = _mix(lo, hi, t)
    return _finish(arr, 0.016, seed)

def granito(h, w, seed, base, specks=(("#ffffff", 0.5), ("#8d8d8d", 0.5)), density=0.02):
    a = fbm(h, w, seed, 5, 4)
    arr = _mix(tuple(max(0, c - 10) for c in base), tuple(min(255, c + 10) for c in base), a)
    rng = np.random.default_rng(seed)
    m = rng.random((h, w))
    for hexc, share in specks:
        c = tuple(int(hexc[i:i + 2], 16) for i in (1, 3, 5))
        sel = m < density * share
        arr[sel] = np.array(c, np.float32) * 0.85 + arr[sel] * 0.15
        m[sel] = 1.0
    im = _finish(arr, 0.010, seed)
    return im.filter(ImageFilter.GaussianBlur(0.4))

def solid(h, w, seed, base, gloss=0.5):
    Y = np.linspace(0, 1, h, dtype=np.float32)[:, None].repeat(w, 1)
    X = np.linspace(0, 1, w, dtype=np.float32)[None, :].repeat(h, 0)
    sheen = np.clip(1.0 - np.hypot(X - 0.32, Y - 0.26) * 1.25, 0, 1) ** 2
    n = fbm(h, w, seed, 4, 3)
    t = 0.45 + (1 - Y) * 0.2 + sheen * gloss * 0.55 + (n - 0.5) * 0.08
    arr = _mix(tuple(max(0, c - 26) for c in base), tuple(min(255, c + 30) for c in base), np.clip(t, 0, 1))
    return _finish(arr, 0.006, seed)

# ---------- helpers ----------
def grouted(tex, cols, rows, gap=4, grout=(214, 212, 208), size=1000):
    """Lay the texture out as cols x rows tiles with grout lines."""
    canvas = Image.new("RGB", (size, size), grout)
    tw = (size - gap * (cols + 1)) // cols
    th = (size - gap * (rows + 1)) // rows
    for r in range(rows):
        for c in range(cols):
            t = tex.resize((tw, th), Image.LANCZOS)
            if (r + c) % 2:
                t = t.transpose(Image.FLIP_LEFT_RIGHT)
            if r % 2 and c % 3 == 0:
                t = t.transpose(Image.FLIP_TOP_BOTTOM)
            canvas.paste(t, (gap + c * (tw + gap), gap + r * (th + gap)))
    return canvas

def _coeffs(pa, pb):
    m = []
    for p1, p2 in zip(pa, pb):
        m.append([p2[0], p2[1], 1, 0, 0, 0, -p1[0] * p2[0], -p1[0] * p2[1]])
        m.append([0, 0, 0, p2[0], p2[1], 1, -p1[1] * p2[0], -p1[1] * p2[1]])
    A = np.matrix(m, dtype=float); B = np.array(pa).reshape(8)
    return np.array(np.dot(np.linalg.inv(A.T * A) * A.T, B)).reshape(8)

def room(tex, wall=(236, 233, 228), W=1400, H=900, horizon=0.44, cols=5, rows=5,
         wall_tex=None, warm=1.0):
    """A showroom-like scene: tiled floor in perspective under a plain wall."""
    im = Image.new("RGB", (W, H), wall)
    hz = int(H * horizon)
    # wall gradient
    wa = np.asarray(im, np.float32)
    g = np.linspace(1.06, 0.93, hz, dtype=np.float32)[:, None, None]
    wa[:hz] = np.clip(wa[:hz] * g, 0, 255)
    im = Image.fromarray(wa.astype(np.uint8))
    if wall_tex is not None:
        wt = grouted(wall_tex, 6, 3, 3, (222, 220, 216), 1000).resize((W, hz), Image.LANCZOS)
        wt = ImageEnhance.Brightness(wt).enhance(1.03)
        im.paste(wt, (0, 0))
    # floor in perspective
    floor = grouted(tex, cols, rows, 4, (210, 207, 202), 1200)
    fh = H - hz
    src = [(0, 0), (1200, 0), (1200, 1200), (0, 1200)]
    dst = [(0, 0), (W, 0), (int(W * 2.35), fh), (int(-W * 1.35), fh)]
    co = _coeffs(src, dst)
    warped = floor.transform((W, fh), Image.PERSPECTIVE, co, Image.BICUBIC)
    # light falloff toward the back
    fa = np.asarray(warped, np.float32)
    fg = np.linspace(0.78, 1.10, fh, dtype=np.float32)[:, None, None]
    fa = np.clip(fa * fg, 0, 255)
    im.paste(Image.fromarray(fa.astype(np.uint8)), (0, hz))
    # skirting + contact shadow
    d = ImageDraw.Draw(im)
    d.rectangle([0, hz - 10, W, hz - 1], fill=(246, 244, 240))
    d.line([(0, hz - 11), (W, hz - 11)], fill=(222, 219, 214), width=2)
    sh = Image.new("L", (W, 70), 0)
    ImageDraw.Draw(sh).rectangle([0, 0, W, 70], fill=90)
    sh = sh.filter(ImageFilter.GaussianBlur(26))
    im.paste(Image.new("RGB", (W, 70), (90, 86, 80)), (0, hz), sh)
    # warm vignette
    a = np.asarray(im, np.float32)
    Y, X = np.mgrid[0:H, 0:W].astype(np.float32)
    v = 1.0 - 0.30 * (((X / W - 0.5) ** 2) * 1.5 + ((Y / H - 0.52) ** 2) * 1.2)
    a *= v[..., None]
    a[..., 0] *= warm; a[..., 2] *= (2 - warm) * 0.5 + 0.5
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

def save(im, name, q=84, w=None):
    if w and im.width != w:
        im = im.resize((w, int(im.height * w / im.width)), Image.LANCZOS)
    p = os.path.join(OUT, name)
    im.convert("RGB").save(p, "JPEG", quality=q, optimize=True, progressive=True)
    return os.path.getsize(p)

# ---------- sanitaryware ----------
def _soft(im, r):
    return im.filter(ImageFilter.GaussianBlur(r))

def studio(W=1000, H=1000, bg=(226, 226, 224)):
    im = Image.new("RGB", (W, H), bg)
    a = np.asarray(im, np.float32)
    Y, X = np.mgrid[0:H, 0:W].astype(np.float32)
    v = 1.0 + 0.10 - 0.26 * (((X / W - 0.5) ** 2) * 1.8 + ((Y / H - 0.38) ** 2) * 1.5)
    a = np.clip(a * v[..., None], 0, 255)
    return Image.fromarray(a.astype(np.uint8))

def _shadow(im, box, blur=26, alpha=78):
    sh = Image.new("L", im.size, 0)
    ImageDraw.Draw(sh).ellipse(box, fill=alpha)
    sh = _soft(sh, blur)
    im.paste(Image.new("RGB", im.size, (120, 118, 114)), (0, 0), sh)


def _shade(im, lay, light=(255, 255, 255), dark=(198, 198, 194), angle=0.62):
    """Light the flat porcelain shape from the upper left using its own alpha."""
    W, H = im.size
    a = lay.split()[3]
    Y, X = np.mgrid[0:H, 0:W].astype(np.float32)
    t = np.clip((X / W) * angle + (Y / H) * (1 - angle), 0, 1) ** 1.25
    g = np.array(light, np.float32)[None, None, :] * (1 - t[..., None]) + np.array(dark, np.float32)[None, None, :] * t[..., None]
    rim = np.clip(1.0 - np.abs(Y / H - 0.86) * 9.0, 0, 1) * 0.16
    g = np.clip(g * (1 - rim[..., None]), 0, 255)
    grad = Image.fromarray(g.astype(np.uint8))
    base = Image.composite(grad, Image.new("RGB", (W, H), (255, 255, 255)), a)
    im.paste(base, (0, 0), a)
    return im

def toilet(seed=1, two_piece=True, W=1000, H=1000):
    S = 3
    im = studio(W, H)
    _shadow(im, [W * 0.22, H * 0.80, W * 0.80, H * 0.91], 22, 110)
    lay = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    white = (253, 253, 252, 255); edge = (176, 176, 172, 255); shade = (232, 232, 228, 255)
    cx = W * S / 2
    if two_piece:
        tw, th = 330 * S, 250 * S
        tx, ty = cx - tw / 2 + 10 * S, 150 * S
        d.rounded_rectangle([tx, ty, tx + tw, ty + th], radius=26 * S, fill=white, outline=edge, width=3 * S)
        d.rounded_rectangle([tx + 8 * S, ty + 8 * S, tx + tw - 8 * S, ty + 44 * S], radius=16 * S, fill=shade)
        d.ellipse([tx + tw / 2 - 26 * S, ty + 62 * S, tx + tw / 2 + 26 * S, ty + 114 * S], fill=(228, 226, 220, 255), outline=edge, width=2 * S)
    bw, bh = 300 * S, 230 * S
    bx, by = cx - bw / 2 + 4 * S, 385 * S
    d.polygon([(bx + 26 * S, by), (bx + bw - 26 * S, by), (bx + bw, by + bh * 0.72),
               (bx + bw - 54 * S, by + bh), (bx + 54 * S, by + bh), (bx, by + bh * 0.72)],
              fill=white, outline=edge)
    d.ellipse([bx - 16 * S, by - 42 * S, bx + bw + 16 * S, by + 86 * S], fill=white, outline=edge, width=3 * S)
    d.ellipse([bx + 24 * S, by - 14 * S, bx + bw - 24 * S, by + 58 * S], fill=(234, 233, 229, 255))
    pw = 190 * S
    d.polygon([(cx - pw / 2 + 14 * S, 600 * S), (cx + pw / 2 - 14 * S, 600 * S),
               (cx + pw / 2 + 16 * S, 830 * S), (cx - pw / 2 - 16 * S, 830 * S)],
              fill=white, outline=edge)
    d.ellipse([cx - pw / 2 - 20 * S, 818 * S, cx + pw / 2 + 20 * S, 848 * S], fill=shade, outline=edge, width=2 * S)
    lay = lay.resize((W, H), Image.LANCZOS)
    im.paste(lay, (0, 0), lay)
    hl = Image.new("L", (W, H), 0)
    ImageDraw.Draw(hl).ellipse([W * 0.33, H * 0.17, W * 0.47, H * 0.43], fill=52)
    im.paste(Image.new("RGB", (W, H), (255, 255, 255)), (0, 0), _soft(hl, 16))
    return im


def toilet_one(W=1000, H=1000):
    """One-piece: tank and bowl in one continuous silhouette."""
    S = 3
    im = studio(W, H)
    _shadow(im, [W * 0.22, H * 0.80, W * 0.80, H * 0.91], 22, 110)
    lay = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    white = (253, 253, 252, 255); edge = (176, 176, 172, 255); shade = (232, 232, 228, 255)
    cx = W * S / 2
    d.rounded_rectangle([cx - 150 * S, 250 * S, cx + 150 * S, 430 * S], radius=70 * S, fill=white, outline=edge, width=3 * S)
    d.ellipse([cx + 60 * S, 290 * S, cx + 108 * S, 338 * S], fill=(226, 226, 221, 255), outline=edge, width=2 * S)
    d.polygon([(cx - 150 * S, 400 * S), (cx + 150 * S, 400 * S), (cx + 168 * S, 560 * S), (cx - 168 * S, 560 * S)],
              fill=white, outline=edge)
    d.ellipse([cx - 172 * S, 470 * S, cx + 172 * S, 640 * S], fill=white, outline=edge, width=3 * S)
    d.ellipse([cx - 128 * S, 498 * S, cx + 128 * S, 612 * S], fill=(234, 233, 229, 255))
    pw = 190 * S
    d.polygon([(cx - pw / 2 + 12 * S, 610 * S), (cx + pw / 2 - 12 * S, 610 * S),
               (cx + pw / 2 + 14 * S, 830 * S), (cx - pw / 2 - 14 * S, 830 * S)], fill=white, outline=edge)
    d.ellipse([cx - pw / 2 - 18 * S, 818 * S, cx + pw / 2 + 18 * S, 848 * S], fill=shade, outline=edge, width=2 * S)
    lay = lay.resize((W, H), Image.LANCZOS)
    im.paste(lay, (0, 0), lay)
    return im

def toilet_wall(W=1000, H=1000, faced=False):
    """Wall-hung / wall-faced bowl in 3/4 side profile — the view every
    sanitaryware catalogue uses; front-on reads as a floating oval."""
    import math
    S = 3
    im = studio(W, H)
    d0 = ImageDraw.Draw(im)
    floor_y, wall_x = int(H * 0.80), int(W * 0.76)
    d0.rectangle([wall_x, 0, W, floor_y], fill=(232, 232, 230))
    d0.line([(wall_x, 0), (wall_x, floor_y)], fill=(213, 213, 209), width=3)
    d0.rectangle([0, floor_y, W, H], fill=(223, 223, 220))
    d0.line([(0, floor_y), (W, floor_y)], fill=(205, 205, 201), width=3)

    lay = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    white = (253, 253, 252, 255); shade = (236, 236, 233, 255)
    edge = (168, 168, 164, 255); soft = (203, 203, 199, 255)
    def P(pts): return [(x * S, y * S) for x, y in pts]

    # แผ่นกดฝังผนัง
    d.rounded_rectangle(P([(wall_x + 36, 170), (wall_x + 150, 258)])[0] +
                        P([(wall_x + 36, 170), (wall_x + 150, 258)])[1],
                        radius=10 * S, fill=(246, 246, 244, 255), outline=soft, width=3 * S)
    d.line(P([(wall_x + 93, 182), (wall_x + 93, 246)]), fill=soft, width=3 * S)

    back, rim = wall_x + 4, 422
    ncx, ncy, nr = 396, 494, 72          # จุดศูนย์กลางปลายโถ
    arc = [(ncx - nr * math.sin(math.radians(t)), ncy - nr * math.cos(math.radians(t)))
           for t in range(0, 181, 9)]    # 0°=บน → 180°=ล่าง ผ่านด้านซ้าย
    body = [(back, rim), (ncx, rim)] + arc + [(600, 684), (back, 700)]

    if faced:                            # ชิดผนัง: ตัวต่อเนื่องลงถึงพื้น
        d.polygon(P([(back, 630), (598, 668), (624, floor_y), (back, floor_y)]), fill=white)
        d.line(P([(598, 668), (624, floor_y)]), fill=edge, width=3 * S)
        d.polygon(P([(598, 668), (624, floor_y), (back, floor_y), (back, 690)]), fill=shade)

    d.polygon(P(body), fill=white)
    d.line(P(body + [body[0]]), fill=edge, width=3 * S, joint="curve")
    # ไล่เงาใต้ท้องโถ ให้เกิดปริมาตร (ต่อเนื่องลงไปถึงฐานเมื่อเป็นแบบชิดผนัง)
    low = [(back, floor_y), (624, floor_y), (598, 668)] if faced else [(back, 700), (600, 684)]
    d.polygon(P([(ncx - 14, 546), (600, 636), (back, 652)] + low), fill=shade)

    # ฝารองนั่ง + ฝาปิดพิงผนัง
    d.rounded_rectangle(P([(338, 380), (back + 2, 424)])[0] + P([(338, 380), (back + 2, 424)])[1],
                        radius=20 * S, fill=(251, 251, 250, 255), outline=edge, width=3 * S)
    d.line(P([(362, 404), (back - 14, 404)]), fill=(237, 237, 234, 255), width=5 * S)
    d.rounded_rectangle(P([(back - 6, 292), (back + 12, 384)])[0] + P([(back - 6, 292), (back + 12, 384)])[1],
                        radius=8 * S, fill=(243, 243, 241, 255), outline=soft, width=2 * S)

    lay = lay.resize((W, H), Image.LANCZOS)
    im.paste(lay, (0, 0), lay)
    if faced:
        _shadow(im, [W * 0.32, H * 0.788, W * 0.82, H * 0.830], 15, 62)
    else:
        _shadow(im, [W * 0.30, H * 0.798, W * 0.80, H * 0.862], 24, 82)
    return im

def basin(seed=2, W=1000, H=1000, counter=True):
    S = 3
    im = studio(W, H)
    _shadow(im, [W * 0.18, H * 0.74, W * 0.84, H * 0.86], 26, 100)
    lay = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    white = (253, 253, 252, 255); edge = (176, 176, 172, 255)
    cx = W * S / 2
    d.rounded_rectangle([cx - 290 * S, 300 * S, cx + 290 * S, 360 * S], radius=12 * S,
                        fill=(246, 244, 240, 255), outline=edge, width=3 * S)
    if counter:
        d.rounded_rectangle([cx - 230 * S, 360 * S, cx + 230 * S, 600 * S], radius=70 * S, fill=white, outline=edge, width=3 * S)
        d.ellipse([cx - 190 * S, 380 * S, cx + 190 * S, 560 * S], fill=(236, 235, 231, 255))
        d.ellipse([cx - 150 * S, 396 * S, cx + 150 * S, 540 * S], fill=(246, 245, 242, 255))
    d.rounded_rectangle([cx - 16 * S, 150 * S, cx + 16 * S, 310 * S], radius=14 * S, fill=(214, 214, 210, 255), outline=(188, 188, 184, 255), width=2 * S)
    d.rounded_rectangle([cx - 16 * S, 150 * S, cx + 120 * S, 182 * S], radius=14 * S, fill=(214, 214, 210, 255), outline=(188, 188, 184, 255), width=2 * S)
    d.ellipse([cx + 96 * S, 178 * S, cx + 124 * S, 206 * S], fill=(198, 198, 194, 255))
    lay = lay.resize((W, H), Image.LANCZOS)
    im.paste(lay, (0, 0), lay)
    return im

def exploded(W=1000, H=1000):
    im = studio(W, H, (244, 244, 242))
    d = ImageDraw.Draw(im)
    parts = [(0.50, 0.17, 0.17, 0.09, "1"), (0.50, 0.34, 0.20, 0.07, "2"),
             (0.50, 0.50, 0.23, 0.10, "3"), (0.50, 0.66, 0.14, 0.05, "4"),
             (0.30, 0.80, 0.09, 0.04, "5"), (0.70, 0.80, 0.09, 0.04, "6")]
    for cx, cy, rw, rh, lab in parts:
        x0, y0 = (cx - rw / 2) * W, (cy - rh / 2) * H
        x1, y1 = (cx + rw / 2) * W, (cy + rh / 2) * H
        d.rounded_rectangle([x0, y0, x1, y1], radius=14, fill=(253, 253, 252), outline=(214, 214, 210), width=3)
        d.line([(x1 + 6, (y0 + y1) / 2), (W * 0.86, (y0 + y1) / 2)], fill=(206, 206, 202), width=2)
    return im

# ---------- catalogue ----------
TILES = {
 "soft-opera-matt":   lambda: marble(1000,1000,11,(248,248,246),(206,208,210),(172,176,182),2.1,2.1,0.42,1.05),
 "soft-opera-pol":    lambda: marble(1000,1000,11,(252,252,251),(214,216,219),(176,180,188),2.1,2.1,0.42,1.25),
 "carrara-statuario": lambda: marble(1000,1000,23,(250,250,248),(198,202,206),(140,146,154),1.7,2.3,0.38,1.2),
 "calacatta-gold":    lambda: marble(1000,1000,37,(250,248,243),(214,198,166),(176,150,104),1.6,2.2,0.40,1.15),
 "pietra-grey":       lambda: marble(1000,1000,41,(132,134,138),(196,198,202),(236,238,240),1.9,2.0,0.45,1.0),
 "travertine-beige":  lambda: concrete(1000,1000,53,(214,200,180),22),
 "arkigem-talco":     lambda: terrazzo(1000,1000,61,(236,234,228),[(196,192,184),(214,206,190),(160,158,152),(230,226,214),(120,122,124)]),
 "terrazzo-sand":     lambda: terrazzo(1000,1000,67,(232,224,210),[(198,178,146),(212,200,178),(150,140,124),(236,230,216),(122,112,96)]),
 "cement-grey":       lambda: concrete(1000,1000,71,(176,176,174),24),
 "cement-charcoal":   lambda: concrete(1000,1000,73,(92,94,96),20),
 "oak-natural":       lambda: wood(1000,1000,79,(214,180,136),(150,112,70),3,True),
 "oak-smoked":        lambda: wood(1000,1000,83,(158,126,94),(92,68,48),3,True),
 "granito-white":     lambda: granito(1000,1000,89,(232,232,230),(("#ffffff",.5),("#b4b4b2",.5)),0.03),
 "granito-sand":      lambda: granito(1000,1000,97,(216,206,190),(("#f2ece0",.5),("#a89c88",.5)),0.03),
 "gloss-white":       lambda: solid(1000,1000,101,(246,246,244),0.75),
 "gloss-ivory":       lambda: solid(1000,1000,103,(240,232,218),0.7),
 "gloss-sage":        lambda: solid(1000,1000,107,(186,198,184),0.65),
 "gloss-navy":        lambda: solid(1000,1000,109,(62,80,104),0.7),
 "aqua-sky":          lambda: marble(1000,1000,113,(246,249,252),(196,216,232),(150,180,208),1.8,2.2,0.40,1.2),
 "outdoor-stone":     lambda: concrete(1000,1000,127,(166,158,146),28),
}

ROOMS = [
 ("room-living",  "soft-opera-matt",  dict(cols=7, rows=7, wall=(238,236,231))),
 ("room-bath",    "carrara-statuario",dict(cols=8, rows=8, wall=(234,236,237), wall_tex="gloss-white")),
 ("room-kitchen", "oak-natural",      dict(cols=5, rows=9, wall=(240,236,228), wall_tex="gloss-ivory")),
 ("room-outdoor", "outdoor-stone",    dict(cols=8, rows=8, wall=(226,224,218))),
 ("room-bedroom", "terrazzo-sand",    dict(cols=7, rows=7, wall=(240,234,224))),
 ("room-hero",    "calacatta-gold",   dict(cols=7, rows=7, wall=(242,238,230), warm=1.03)),
]

if __name__ == "__main__":
    total = 0
    cache = {}
    for name, fn in TILES.items():
        im = fn(); cache[name] = im
        total += save(im, f"tile-{name}.jpg", 84, 800)
        total += save(grouted(im, 2, 2, 5, (214,211,206), 900), f"lay-{name}.jpg", 82, 700)
        print("tile", name)
    for rname, tex, kw in ROOMS:
        wt = cache[kw.pop("wall_tex")] if "wall_tex" in kw else None
        wall = kw.pop("wall", (236,233,228)); warm = kw.pop("warm", 1.0)
        im = room(cache[tex], wall=wall, wall_tex=wt, warm=warm, **kw)
        total += save(im, f"{rname}.jpg", 82, 1400)
        print("room", rname)
    for n, f in [("san-toilet-1", lambda: toilet(1, True)), ("san-toilet-2", lambda: toilet(2, False)),
                 ("san-onepiece", toilet_one), ("san-wallhung", lambda: toilet_wall(faced=False)),
                 ("san-wallfaced", lambda: toilet_wall(faced=True)),
                 ("san-basin-1", lambda: basin(3, counter=True)), ("san-basin-2", lambda: basin(4, counter=True)),
                 ("san-exploded", exploded)]:
        total += save(f(), f"{n}.jpg", 86, 800)
        print("san", n)
    print("TOTAL KB", round(total / 1024))


# ---------------------------------------------------------------- อะไหล่ในชุด
def part(kind, W=600, H=600):
    """ภาพอะไหล่แบบเรียบ สำหรับแสดงในรายการชิ้นส่วน"""
    S = 3
    im = studio(W, H)
    lay = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    white = (253, 253, 252, 255); shade = (236, 236, 233, 255)
    edge = (168, 168, 164, 255); soft = (205, 205, 201, 255)
    chrome = (214, 216, 219, 255); chrome_d = (176, 179, 184, 255)
    rubber = (92, 94, 98, 255); rubber_l = (126, 128, 132, 255)
    def R(box, r, **kw): d.rounded_rectangle([(box[0] * S, box[1] * S), (box[2] * S, box[3] * S)],
                                             radius=r * S, **kw)
    def E(box, **kw): d.ellipse([(box[0] * S, box[1] * S), (box[2] * S, box[3] * S)], **kw)
    def L(pts, **kw): d.line([(x * S, y * S) for x, y in pts], **kw)

    if kind == "cistern":                      # หม้อน้ำพร้อมฝา
        R([150, 200, 450, 430], 16, fill=white, outline=edge, width=3 * S)
        R([150, 200, 450, 248], 16, fill=(246, 246, 244, 255), outline=edge, width=3 * S)
        R([430, 248, 450, 430], 0, fill=shade)
        E([272, 282, 328, 338], fill=(240, 240, 237, 255), outline=soft, width=3 * S)
        L([(300, 292), (300, 328)], fill=soft, width=3 * S)
    elif kind == "seat":                       # ฝารองนั่ง
        E([140, 170, 460, 400], fill=white, outline=edge, width=3 * S)
        E([180, 206, 420, 366], fill=(243, 243, 241, 255), outline=soft, width=3 * S)
        R([250, 396, 350, 424], 9, fill=(246, 246, 244, 255), outline=edge, width=3 * S)
        E([262, 404, 282, 424], fill=chrome, outline=chrome_d, width=2 * S)
        E([318, 404, 338, 424], fill=chrome, outline=chrome_d, width=2 * S)
    elif kind == "valve":                      # อุปกรณ์ภายในหม้อน้ำ
        R([264, 150, 336, 400], 10, fill=(246, 246, 244, 255), outline=edge, width=3 * S)
        E([232, 300, 368, 372], fill=white, outline=edge, width=3 * S)
        R([276, 118, 324, 156], 8, fill=chrome, outline=chrome_d, width=2 * S)
        L([(300, 400), (300, 450)], fill=chrome_d, width=7 * S)
        E([256, 436, 344, 470], fill=rubber_l, outline=rubber, width=2 * S)
    elif kind == "hose":                       # สายน้ำดี
        for i in range(26):                    # ท่อถัก
            y = 190 + i * 8.6
            L([(236 + (i % 2) * 5, y), (364 - (i % 2) * 5, y)], fill=chrome if i % 2 else chrome_d,
              width=6 * S)
        R([244, 150, 356, 196], 9, fill=chrome, outline=chrome_d, width=2 * S)
        R([244, 408, 356, 454], 9, fill=chrome, outline=chrome_d, width=2 * S)
        R([262, 120, 338, 156], 6, fill=(198, 200, 204, 255), outline=chrome_d, width=2 * S)
    elif kind == "gasket":                      # ยางรอง
        E([170, 210, 430, 390], fill=rubber_l, outline=rubber, width=3 * S)
        E([232, 254, 368, 346], fill=(246, 246, 244, 255), outline=rubber, width=3 * S)
        E([170, 198, 430, 378], fill=rubber, outline=rubber, width=3 * S)
        E([232, 242, 368, 334], fill=(250, 250, 249, 255), outline=rubber, width=3 * S)
    elif kind == "bracket":                     # ชุดยึดผนัง
        R([160, 180, 206, 420], 7, fill=chrome, outline=chrome_d, width=3 * S)
        R([394, 180, 440, 420], 7, fill=chrome, outline=chrome_d, width=3 * S)
        R([160, 252, 440, 288], 7, fill=chrome, outline=chrome_d, width=3 * S)
        for x in (183, 417):
            for y in (210, 390):
                E([x - 11, y - 11, x + 11, y + 11], fill=(236, 238, 241, 255), outline=chrome_d, width=2 * S)
        R([250, 420, 350, 452], 6, fill=chrome_d)
    elif kind == "tank":                        # ถังน้ำฝังผนัง
        R([130, 170, 470, 400], 12, fill=(240, 240, 238, 255), outline=edge, width=3 * S)
        R([130, 170, 470, 206], 12, fill=(228, 228, 225, 255), outline=edge, width=3 * S)
        R([150, 400, 190, 470], 6, fill=chrome, outline=chrome_d, width=2 * S)
        R([410, 400, 450, 470], 6, fill=chrome, outline=chrome_d, width=2 * S)
        R([250, 232, 350, 316], 8, fill=white, outline=soft, width=3 * S)
        L([(300, 242), (300, 306)], fill=soft, width=3 * S)
        L([(300, 400), (300, 450)], fill=chrome_d, width=9 * S)
    elif kind == "waste":                       # สะดืออ่าง ป๊อปอัพ
        E([216, 190, 384, 258], fill=chrome, outline=chrome_d, width=3 * S)
        E([252, 206, 348, 242], fill=(236, 238, 241, 255), outline=chrome_d, width=2 * S)
        R([268, 250, 332, 392], 8, fill=chrome, outline=chrome_d, width=3 * S)
        E([240, 376, 360, 424], fill=(198, 200, 204, 255), outline=chrome_d, width=3 * S)
        R([284, 416, 316, 470], 5, fill=chrome_d)
    elif kind == "trap":                        # ท่อน้ำทิ้งกระปุก
        R([276, 130, 324, 250], 8, fill=chrome, outline=chrome_d, width=3 * S)
        E([212, 236, 388, 404], fill=chrome, outline=chrome_d, width=3 * S)
        E([244, 268, 356, 372], fill=(230, 232, 236, 255))
        R([352, 272, 470, 320], 10, fill=chrome, outline=chrome_d, width=3 * S)
        R([264, 112, 336, 142], 6, fill=(198, 200, 204, 255), outline=chrome_d, width=2 * S)
    lay = lay.resize((W, H), Image.LANCZOS)
    im.paste(lay, (0, 0), lay)
    return im


# ------------------------------------------------------- ใบรับรอง มอก. (ตัวอย่าง)
def tis_cert(no="2508-2555", kind="กระเบื้องเซรามิกปูพื้นและผนัง", W=900, H=640):
    """ภาพจำลองใบรับรองมาตรฐาน สำหรับต้นแบบเท่านั้น ไม่ใช่เอกสารจริง
    และไม่ได้ลอกเครื่องหมายรับรองของจริง"""
    import os
    F = lambda sz, b=False: ImageFont.truetype(
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "thai700.ttf" if b else "thai400.ttf"), sz)
    im = Image.new("RGB", (W, H), (228, 228, 225))
    d = ImageDraw.Draw(im)
    # เงาและแผ่นกระดาษ
    for i in range(16):
        d.rectangle([54 - i * .4, 40 + i * .9, W - 54 + i * .4, H - 34 + i * .9],
                    fill=(228 - i, 228 - i, 225 - i))
    px0, py0, px1, py1 = 56, 34, W - 56, H - 40
    d.rectangle([px0, py0, px1, py1], fill=(252, 251, 248))
    d.rectangle([px0 + 16, py0 + 16, px1 - 16, py1 - 16], outline=(188, 164, 108), width=3)
    d.rectangle([px0 + 23, py0 + 23, px1 - 23, py1 - 23], outline=(214, 198, 158), width=1)

    cx = (px0 + px1) // 2
    ink = (38, 40, 44); gray = (116, 119, 124); gold = (154, 126, 56)
    def C(y, t, f, fill=ink):
        w = d.textbbox((0, 0), t, font=f)[2]
        d.text((cx - w / 2, y), t, font=f, fill=fill)

    C(72,  "ใบรับรองมาตรฐานผลิตภัณฑ์อุตสาหกรรม", F(25, True))
    C(108, "CERTIFICATE OF PRODUCT STANDARD", F(13), gray)
    d.line([(cx - 140, 136), (cx + 140, 136)], fill=(214, 198, 158), width=2)

    # ตราประทับทรงกลม (ลายทั่วไป ไม่ใช่เครื่องหมายรับรองของจริง)
    sx, sy, r = cx, 232, 58
    d.ellipse([sx - r, sy - r, sx + r, sy + r], outline=gold, width=4)
    d.ellipse([sx - r + 9, sy - r + 9, sx + r - 9, sy + r - 9], outline=gold, width=1)
    for a in range(0, 360, 15):
        import math
        x1 = sx + (r - 13) * math.cos(math.radians(a)); y1 = sy + (r - 13) * math.sin(math.radians(a))
        x2 = sx + (r - 18) * math.cos(math.radians(a)); y2 = sy + (r - 18) * math.sin(math.radians(a))
        d.line([(x1, y1), (x2, y2)], fill=gold, width=2)
    w = d.textbbox((0, 0), "TIS", font=F(26, True))[2]
    d.text((sx - w / 2, sy - 22), "TIS", font=F(26, True), fill=gold)
    w = d.textbbox((0, 0), "CERTIFIED", font=F(10))[2]
    d.text((sx - w / 2, sy + 12), "CERTIFIED", font=F(10), fill=gold)

    C(314, "มอก. " + no, F(30, True))
    C(356, kind, F(16), gray)

    bx0, bx1, by = px0 + 70, px1 - 70, 404
    d.line([(bx0, by), (bx1, by)], fill=(228, 224, 214), width=1)
    rows = [("ผู้ได้รับใบอนุญาต", "บริษัท ตัวอย่าง จำกัด (มหาชน)"),
            ("เลขที่ใบอนุญาต", "ท 999-9/9999"),
            ("วันที่ออกให้", "1 มีนาคม 2569"),
            ("ใช้ได้ถึง", "28 กุมภาพันธ์ 2572")]
    for i, (k, v) in enumerate(rows):
        y = by + 16 + i * 30
        d.text((bx0, y), k, font=F(14), fill=gray)
        wv = d.textbbox((0, 0), v, font=F(14, True))[2]
        d.text((bx1 - wv, y), v, font=F(14, True), fill=ink)
        d.line([(bx0, y + 24), (bx1, y + 24)], fill=(238, 235, 228), width=1)

    # ลายน้ำบอกว่าเป็นภาพจำลอง
    wm = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dw = ImageDraw.Draw(wm)
    t = "ภาพจำลองสำหรับต้นแบบ"
    f = F(44, True); tw = dw.textbbox((0, 0), t, font=f)[2]
    dw.text((W / 2 - tw / 2, H / 2 - 24), t, font=f, fill=(196, 42, 48, 46))
    im = Image.alpha_composite(im.convert("RGBA"), wm.rotate(14, resample=Image.BICUBIC)).convert("RGB")
    return im


# ------------------------------------------------------- อุปกรณ์ห้องน้ำ
def accessory(kind, W=800, H=800):
    S = 3
    im = studio(W, H)
    lay = Image.new("RGBA", (W * S, H * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    cr = (216, 218, 221, 255); crd = (170, 173, 178, 255); crl = (238, 240, 243, 255)
    blk = (58, 60, 64, 255); blkd = (38, 40, 44, 255)
    wht = (250, 250, 249, 255); wgr = (176, 176, 172, 255)
    def R(b, r, **k): d.rounded_rectangle([(b[0]*S, b[1]*S), (b[2]*S, b[3]*S)], radius=r*S, **k)
    def E(b, **k): d.ellipse([(b[0]*S, b[1]*S), (b[2]*S, b[3]*S)], **k)
    def L(p, **k): d.line([(x*S, y*S) for x, y in p], **k)

    if kind == "towelbar":                    # ราวแขวนผ้า
        for x in (190, 610):
            R([x-34, 322, x+34, 390], 10, fill=cr, outline=crd, width=3*S)
            R([x-18, 356, x+18, 420], 8, fill=crl, outline=crd, width=3*S)
        R([172, 404, 628, 436], 16, fill=cr, outline=crd, width=3*S)
        L([(200, 414), (600, 414)], fill=crl, width=5*S)
    elif kind == "paperholder":               # ที่ใส่กระดาษชำระ
        R([236, 300, 300, 368], 10, fill=cr, outline=crd, width=3*S)
        R([268, 336, 560, 366], 13, fill=cr, outline=crd, width=3*S)
        R([520, 330, 566, 420], 12, fill=cr, outline=crd, width=3*S)
        E([330, 356, 530, 536], fill=wht, outline=wgr, width=3*S)
        E([398, 424, 462, 468], fill=(238, 238, 235, 255), outline=wgr, width=3*S)
        L([(330, 448), (318, 560)], fill=wgr, width=3*S)
        L([(318, 560), (420, 572)], fill=wgr, width=3*S)
    elif kind == "hook":                      # ตะขอแขวน
        E([322, 268, 478, 424], fill=cr, outline=crd, width=3*S)
        E([360, 306, 440, 386], fill=(236, 238, 241, 255))
        d.arc([(300*S, 390*S), (500*S, 560*S)], 10, 190, fill=crd, width=9*S)
        R([368, 486, 432, 556], 14, fill=cr, outline=crd, width=3*S)
    elif kind == "grabbar":                   # ราวจับนิรภัย
        for x in (206, 594):
            E([x-44, 300, x+44, 388], fill=cr, outline=crd, width=3*S)
            E([x-18, 326, x+18, 362], fill=(236, 238, 241, 255))
        R([180, 406, 620, 456], 25, fill=cr, outline=crd, width=3*S)
        for i in range(14):                   # ลายกันลื่น
            x = 280 + i*18
            L([(x, 416), (x, 446)], fill=crd, width=2*S)
    elif kind == "soapdish":                  # ที่ใส่สบู่
        R([236, 300, 300, 368], 10, fill=cr, outline=crd, width=3*S)
        R([268, 340, 420, 368], 12, fill=cr, outline=crd, width=3*S)
        E([330, 352, 580, 452], fill=wht, outline=wgr, width=3*S)
        E([366, 370, 544, 430], fill=(240, 240, 237, 255))
        for i in range(5):
            E([398+i*22, 462, 414+i*22, 476], fill=crl, outline=crd, width=2*S)
    elif kind == "mirror":                    # กระจกห้องน้ำ
        R([206, 170, 594, 630], 22, fill=cr, outline=crd, width=4*S)
        R([232, 196, 568, 604], 14, fill=(226, 232, 238, 255), outline=crd, width=2*S)
        L([(268, 560), (470, 240)], fill=(243, 247, 250, 255), width=22*S)
        L([(330, 578), (520, 280)], fill=(238, 243, 248, 255), width=11*S)
    elif kind == "faucet":                    # ก๊อกอ่างล้างหน้า
        R([346, 486, 454, 556], 14, fill=cr, outline=crd, width=3*S)
        R([378, 300, 422, 500], 16, fill=cr, outline=crd, width=3*S)
        d.arc([(392*S, 236*S), (598*S, 364*S)], 180, 352, fill=crd, width=16*S)
        R([556, 300, 598, 368], 12, fill=cr, outline=crd, width=3*S)
        R([342, 262, 470, 292], 12, fill=cr, outline=crd, width=3*S)
        L([(360, 277), (452, 277)], fill=crl, width=4*S)
    elif kind == "shower":                    # ชุดฝักบัว
        R([520, 180, 560, 250], 10, fill=cr, outline=crd, width=3*S)
        d.arc([(380*S, 196*S), (560*S, 300*S)], 190, 330, fill=crd, width=13*S)
        E([318, 236, 462, 306], fill=cr, outline=crd, width=3*S)
        E([340, 252, 440, 292], fill=(236, 238, 241, 255))
        for i in range(10):
            L([(352+i*12, 300), (348+i*12, 332)], fill=crd, width=2*S)
        R([556, 250, 588, 600], 14, fill=cr, outline=crd, width=3*S)
        R([508, 430, 596, 476], 12, fill=blk, outline=blkd, width=3*S)   # ที่จับเลื่อน
        R([512, 556, 600, 600], 10, fill=cr, outline=crd, width=3*S)     # ฐานยึดผนัง
    lay = lay.resize((W, H), Image.LANCZOS)
    im.paste(lay, (0, 0), lay)
    _shadow(im, [W*0.26, H*0.80, W*0.74, H*0.855], 20, 64)
    return im
