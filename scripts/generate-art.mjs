#!/usr/bin/env node
// Generates site artwork with Google's Gemini image model, in the Plocka-derived
// Pixar style, so it doesn't all have to be made by hand. Same approach as
// Plocka's generate-steps script.
//
//   node scripts/generate-art.mjs hero-typing --count 3
//   node scripts/generate-art.mjs hero-wave --from art/generated/hero-typing-2.png
//   node scripts/generate-art.mjs hero-dark --from art/generated/hero-typing-2.png
//   node scripts/generate-art.mjs --name custom --prompt "…" [--from image.png]
//   add --size 2K (or 4K) for higher resolution, --bg green for a chroma-key
//   background (cleaner cut-outs when props are close to grey)
//
// References:
//   art/reference/style/*       approved renders that set the look (Plocka's)
//   art/reference/character/*   who the character is (the current illustration)
//   --from <image>              a picked result to keep the character, pose and
//                               light consistent with (for variations)
//
// Results land in art/generated/ (gitignored), never straight in the site.
// Look at them, keep the best, and only then bring one into public/.
//
// Needs GEMINI_API_KEY: from the environment, this project's .env.local, or
// (as a fallback) Plocka's apps/web/.env.local. The key is never printed.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { dirname, extname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { parseArgs } from "node:util"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const STYLE_DIR = join(ROOT, "art/reference/style")
const CHARACTER_DIR = join(ROOT, "art/reference/character")
const OUT_DIR = join(ROOT, "art/generated")
const MODEL = process.env.GEMINI_IMAGE_MODEL ?? "gemini-3-pro-image"

// What every picture keeps to.
const HOUSE_RULES = [
  "Match the rendering style of the style reference pictures exactly: a warm, Pixar-style 3D animated render with soft rounded forms, clean idealised matte materials with no photographic texture, soft gradient shading with gentle highlights, and warm low afternoon light from the upper left.",
  "Plain, flat, even mid-grey background filling the whole frame. No shadow on the background, no floor, no room, nothing else in the frame.",
  "No text, labels, logos or brand marks anywhere; the laptop lid is plain.",
]

const CHARACTER =
  "The character is the man in the character reference illustration, reimagined as a 3D Pixar character and still clearly recognisable as him: a cream baseball cap with no hair showing beneath it, a full, thick, rounded dark beard, light warm skin, dark eyes and strong dark eyebrows, a friendly face, and a plain white crew-neck t-shirt."

const FRAMING =
  "Waist-up, three-quarter view facing the camera. He sits at a simple warm honey-coloured timber desk with an open silver laptop to his left (on the right of the picture), angled so his face is fully visible. Landscape 16:9 framing with him centred and plenty of plain grey space all around, so he can be cut out cleanly."

const PRESETS = {
  "hero-typing": {
    prompt: [CHARACTER, FRAMING, "He's typing on the laptop, concentrating and squinting slightly at the screen."].join(" "),
  },
  "hero-wave": {
    needsFrom: true,
    prompt:
      "Keep the character, outfit, desk, laptop, framing, camera angle, lighting and background exactly as in the base picture. Change only the pose: he has looked up from the laptop at the camera, smiling warmly, and is giving a small friendly wave with his right hand, his left hand still resting on the keyboard.",
  },
  "hero-dark": {
    needsFrom: true,
    prompt:
      "Keep the character, his expression, outfit, pose, laptop, framing and camera angle exactly as in the base picture. Change only the light: it's late at night in an almost pitch-dark room. The only light is the cool blue glow of the laptop screen, which lights the front of his face, beard, hands and the front of his t-shirt; everything facing away from the screen falls off into deep shadow, close to black. The back of the laptop is a dark silhouette. Very low light overall, moody and quiet, no warm fill, no rim light. The background is plain, flat, very dark charcoal, just a touch lighter than the darkest shadows on him so he can be cut out cleanly. No desk, table, floor or room: he floats, cropped at the waist exactly as in the base picture, with nothing else in the frame.",
    // Night overrides the house light and background rules.
    rules: [HOUSE_RULES[0].replace(/, and warm low afternoon light from the upper left/, ""), HOUSE_RULES[2]],
  },
}

function loadKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY
  const candidates = [
    join(ROOT, ".env.local"),
    join(homedir(), "projects/plocka/apps/web/.env.local"),
  ]
  for (const file of candidates) {
    if (!existsSync(file)) continue
    const match = readFileSync(file, "utf8").match(/^GEMINI_API_KEY=(.+)$/m)
    if (match) return match[1].trim().replace(/^["']|["']$/g, "")
  }
  throw new Error("No GEMINI_API_KEY in the environment, .env.local, or Plocka's .env.local.")
}

const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" }

function imagesIn(dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((f) => MIME[extname(f).toLowerCase()])
    .sort()
    .map((f) => join(dir, f))
}

function inline(path) {
  return {
    inline_data: {
      mime_type: MIME[extname(path).toLowerCase()],
      data: readFileSync(path).toString("base64"),
    },
  }
}

async function generate(parts, key, aspectRatio, imageSize) {
  for (let attempt = 1; ; attempt++) {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({
          contents: [{ role: "user", parts }],
          generationConfig: {
            responseModalities: ["IMAGE"],
            imageConfig: { aspectRatio, ...(imageSize ? { imageSize } : {}) },
          },
        }),
      }
    )
    const body = await response.json()
    const data = body.candidates?.[0]?.content?.parts?.find((p) => p.inlineData)?.inlineData?.data
    if (data) return Buffer.from(data, "base64")
    if (attempt < 3 && (response.status === 429 || response.status >= 500)) {
      await new Promise((r) => setTimeout(r, 15_000 * attempt))
      continue
    }
    throw new Error(body.error ? `${body.error.status}: ${body.error.message}` : "No picture came back.")
  }
}

async function main() {
  const { values, positionals } = parseArgs({
    options: {
      count: { type: "string", default: "1" },
      from: { type: "string" },
      name: { type: "string" },
      prompt: { type: "string" },
      aspect: { type: "string", default: "16:9" },
      // "1K" (default, 1376×768 at 16:9), "2K" or "4K". Use 2K+ for anything
      // shown large on retina screens.
      size: { type: "string" },
      // "grey" (default) or "green": a flat chroma-key green background for
      // pictures with props close to grey, so they key out cleanly.
      bg: { type: "string", default: "grey" },
    },
    allowPositionals: true,
  })

  const presetName = positionals[0]
  const preset = presetName ? PRESETS[presetName] : null
  if (presetName && !preset) throw new Error(`No preset "${presetName}". Try: ${Object.keys(PRESETS).join(", ")}`)
  if (!preset && !values.prompt) throw new Error("Name a preset or pass --prompt.")
  if (preset?.needsFrom && !values.from) throw new Error(`${presetName} needs --from <picked image>.`)

  const name = values.name ?? presetName
  let rules = preset?.rules ?? HOUSE_RULES
  if (values.bg === "green") {
    rules = rules.map((rule) =>
      rule.startsWith("Plain, flat, even mid-grey background")
        ? "Plain, flat, perfectly even pure chroma-key green background (#00FF00) filling the whole frame. No green light, reflection or spill on the character or props, no shadow on the background, no floor, nothing else in the frame."
        : rule
    )
  }
  const style = imagesIn(STYLE_DIR)
  const character = imagesIn(CHARACTER_DIR)
  if (style.length === 0) throw new Error("Put approved style references in art/reference/style/.")

  // Labelled references, then the instructions.
  const parts = [{ text: "Style reference pictures (set the look only, not the subject):" }, ...style.map(inline)]
  if (character.length) parts.push({ text: "Character reference illustration (who the character is):" }, ...character.map(inline))
  if (values.from) parts.push({ text: "Base picture to keep consistent with:" }, inline(resolve(values.from)))
  parts.push({ text: [values.prompt ?? preset.prompt, ...rules].join("\n\n") })

  const key = loadKey()
  const count = Math.max(1, Number(values.count) || 1)
  mkdirSync(OUT_DIR, { recursive: true })
  const existing = readdirSync(OUT_DIR).filter((f) => f.startsWith(`${name}-`)).length

  console.log(`Generating ${count} × ${name} with ${MODEL}…`)
  const results = await Promise.allSettled(
    Array.from({ length: count }, () => generate(parts, key, values.aspect, values.size))
  )
  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      const file = join(OUT_DIR, `${name}-${existing + i + 1}.png`)
      writeFileSync(file, result.value)
      console.log(`  ✓ ${file.replace(ROOT + "/", "")}`)
    } else {
      console.log(`  ✗ ${result.reason.message}`)
    }
  })
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
