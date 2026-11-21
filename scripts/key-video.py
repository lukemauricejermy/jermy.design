#!/usr/bin/env python3
"""Key a set of green-screen video takes into transparent web video.

    python3 scripts/key-video.py --out public/videos --name hero-loop-v4 \
        art/generated/pair-day-3.mp4:light art/generated/pair-night-2.mp4:dark

All inputs share one crop box (the union of every frame's subject, plus
padding), so a day take and its relit night take stay perfectly aligned.

A third field takes the matte from another input: `night.mp4:dark:light`
cuts the night video with the light take's alpha, frame by frame. Use it
when a relit take follows the original exactly but its background is no
longer clean green (relighting tends to dim the backdrop too).

Per input it writes <name>-<label>.webm (VP9 + alpha: Chrome, Firefox,
Edge), <name>-<label>.mov (HEVC + alpha: Safari) and
<name>-<label>-poster.png (first frame) into --poster-dir.

The key mirrors scripts/cutout.swift: alpha from "green excess"
(g − max(r, b)) scaled to the sampled background green, despill
(g = min(g, max(r, b))), fully transparent pixels set to neutral grey so
chroma subsampling can't bleed dark into edges, and a 1px choke.
Needs ffmpeg with libvpx-vp9 and hevc_videotoolbox (macOS).
"""

import argparse
import subprocess
import sys

PAD = 8


def run(cmd, **kw):
    return subprocess.run(cmd, check=True, **kw)


def probe_size(path):
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0",
         "-show_entries", "stream=width,height", "-of", "csv=p=0", path],
        check=True, capture_output=True, text=True).stdout.strip()
    w, h = out.split(",")
    return int(w), int(h)


def sample_green(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-frames:v", "1",
         "-vf", "crop=40:40:10:10", "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        check=True, capture_output=True).stdout
    n = len(raw) // 3
    return [sum(raw[i::3]) / n for i in range(3)]


def key_expr(bg):
    """Alpha from green dominance relative to brightness:
    (g − max(r, b)) / g. Bright and shadowed green both score high, while
    skin, white and blue-lit cloth score at or below zero. Thresholds are
    scaled to the sampled background's own score."""
    score = (bg[1] - max(bg[0], bg[2])) / max(bg[1], 1)
    low, high = score * 0.18, score * 0.62
    e = "((g(X,Y)-max(r(X,Y),b(X,Y)))/max(g(X,Y),1))"
    return f"clip(255*(1-({e}-{low:.3f})/{high - low:.3f}),0,255)"


def key_filter(alpha, bg):
    """Key + edge recovery, as in cutout.swift: for partly transparent pixels
    remove the background's share (seen + (seen - bg) * boost, boost capped),
    then despill and choke 2px, so edges carry no green or olive fringe."""
    boost = f"min((255-({alpha}))/max({alpha},1),4)"

    def chan(c, b):
        return (
            f"if(lt({alpha},8),128,if(gt({alpha},247),{c}(X,Y),"
            f"clip({c}(X,Y)+({c}(X,Y)-{b:.0f})*{boost},0,255)))"
        )

    r, g, b = chan("r", bg[0]), chan("g", bg[1]), chan("b", bg[2])
    return (
        "format=gbrap,"
        f"geq=r='{r}':g='{g}':b='{b}':a='{alpha}',"
        # despill on the recovered colours
        "geq=r='r(X,Y)':g='min(g(X,Y),max(r(X,Y),b(X,Y)))':b='b(X,Y)':a='alpha(X,Y)',"
        "split[c][m];[m]alphaextract,erosion,erosion[a];[c][a]alphamerge"
    )


def subject_box(path, alpha, w, h):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", path, "-vf",
         f"format=gbrap,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='{alpha}',alphaextract",
         "-f", "rawvideo", "-pix_fmt", "gray", "-"],
        check=True, capture_output=True).stdout
    f = w * h
    x0, y0, x1, y1 = w, h, -1, -1
    for k in range(len(raw) // f):
        frame = raw[k * f:(k + 1) * f]
        for y in range(h):
            row = frame[y * w:(y + 1) * w]
            if max(row) > 10:
                xs = [i for i, v in enumerate(row) if v > 10]
                x0, x1 = min(x0, xs[0]), max(x1, xs[-1])
                y0, y1 = min(y0, y), max(y1, y)
    return x0, y0, x1, y1


def main():
    p = argparse.ArgumentParser()
    p.add_argument("inputs", nargs="+", help="path:label pairs")
    p.add_argument("--name", required=True)
    p.add_argument("--out", default="public/videos")
    p.add_argument("--poster-dir", default="public/images/hero")
    args = p.parse_args()

    takes, matte_from = [], {}
    for spec in args.inputs:
        parts = spec.split(":")
        takes.append((parts[0], parts[1]))
        if len(parts) > 2:
            matte_from[parts[1]] = parts[2]
    paths = dict((label, path) for path, label in takes)
    w, h = probe_size(takes[0][0])

    alphas, greens, box = {}, {}, [w, h, -1, -1]
    for path, label in takes:
        greens[label] = sample_green(path)
        alphas[label] = key_expr(greens[label])
        if label in matte_from:
            continue
        b = subject_box(path, alphas[label], w, h)
        print(f"{label}: subject box {b}", file=sys.stderr)
        box = [min(box[0], b[0]), min(box[1], b[1]), max(box[2], b[2]), max(box[3], b[3])]

    # Shared crop: union of all takes plus padding, even dimensions for yuv420.
    x0, y0 = max(0, box[0] - PAD), max(0, box[1] - PAD)
    x1, y1 = min(w - 1, box[2] + PAD), min(h - 1, box[3] + PAD)
    cw, ch = (x1 - x0 + 1) // 2 * 2, (y1 - y0 + 1) // 2 * 2
    crop = f"crop={cw}:{ch}:{x0}:{y0}"
    print(f"shared crop {cw}x{ch} at {x0},{y0}", file=sys.stderr)

    for path, label in takes:
        src = matte_from.get(label)
        if src:
            # Colour from this take (green despilled), alpha from the source take.
            a = alphas[src]
            f = (
                f"[0:v]format=gbrap,geq=r='r(X,Y)':g='min(g(X,Y),max(r(X,Y),b(X,Y)))':b='b(X,Y)':a='255'[c];"
                f"[1:v]format=gbrap,geq=r='0':g='0':b='0':a='{a}',alphaextract,erosion,erosion[m];"
                f"[c][m]alphamerge,{crop}"
            )
            inputs = ["-i", path, "-i", paths[src]]
        else:
            f = f"{key_filter(alphas[label], greens[label])},{crop}"
            inputs = ["-i", path]
        base = f"{args.out}/{args.name}-{label}"
        run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", f,
             "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-crf", "33", "-b:v", "0",
             "-row-mt", "1", "-deadline", "good", "-cpu-used", "2", "-an", f"{base}.webm"])
        run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", f"{f},format=bgra",
             "-c:v", "hevc_videotoolbox", "-alpha_quality", "0.85", "-allow_sw", "1",
             "-b:v", "2500k", "-tag:v", "hvc1", "-an", f"{base}.mov"])
        run(["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", f,
             "-frames:v", "1", f"{args.poster_dir}/{args.name}-{label}-poster.png"])
        print(f"{label}: wrote {base}.webm / .mov", file=sys.stderr)

    print(f"{cw} {ch}")


if __name__ == "__main__":
    main()
