// Removes the background from a generated picture using macOS's built-in subject
// lifting (Vision), so nothing gets uploaded anywhere. Keeps every foreground
// subject (person, laptop).
//
//   swift scripts/cutout.swift input.png output.png
//   swift scripts/cutout.swift input.png output.png --keep-frame
//
// Edges: renders are made on a flat background. Vision's matte is soft and
// spreads several pixels past the real edge, so on its own it leaves a halo
// of background around the figure. In that soft band the alpha is instead
// taken from how far each pixel's colour is from the background (a colour
// key, KEY_LOW..KEY_HIGH), capped by the matte; Vision only decides what is
// subject at all, except that on light backgrounds anything clearly not
// background is kept too (Vision tends to drop small floating props). Then
// the background is removed from each edge pixel:
//   true = (seen − (1 − alpha) × background) / alpha   (boost capped)
// On a chroma-green background, green spill is clamped as well.
// Dark backgrounds skip this: a near-black halo is invisible on a dark page,
// and the maths would amplify noise into bright fringes.
//
// Without --keep-frame the result is cropped to the subject. With it, the full
// canvas is kept and the subject's box is printed as "bbox x y w h", so several
// variants of one shot can be cropped to the same box
// (sips -c h w --cropOffset y x) and stay aligned.
//
// Needs macOS 14 or later.

import AppKit
import CoreImage
import ImageIO
import UniformTypeIdentifiers
import Vision

// Colour-key range (max channel difference from the background, 0–255):
// at or below KEY_LOW is background, at or above KEY_HIGH is fully subject.
let KEY_LOW = 8.0
let KEY_HIGH = 34.0
// Stricter lower bound for pixels Vision missed entirely (floating props).
let KEY_PROP_LOW = 16.0
// Radius (px) of the hole-filling close on light backgrounds.
let CLOSE_PX: Double = 4
// Prop key on dark backgrounds (distance from the background colour).
let DARK_PROP_LOW = 30.0
let DARK_PROP_HIGH = 70.0
// Wider hole-filling on dark backgrounds: shaded sides of props sit close
// to the background colour.
let DARK_CLOSE_PX: Double = 14
// Green-screen key: green excess (g − max(r, b)) at or below GREEN_LOW is
// subject, at or above GREEN_HIGH is background.
let GREEN_LOW = 40.0
let GREEN_HIGH = 190.0
let CHOKE_PX: Double = 1.5

let args = CommandLine.arguments
guard args.count == 3 || (args.count == 4 && args[3] == "--keep-frame") else {
  print("Usage: swift scripts/cutout.swift <input> <output.png> [--keep-frame]")
  exit(1)
}
let keepFrame = args.count == 4
let input = URL(fileURLWithPath: args[1])
let output = URL(fileURLWithPath: args[2])

guard let image = CIImage(contentsOf: input) else {
  print("Couldn't read \(input.path)")
  exit(1)
}

let srgb = CGColorSpace(name: CGColorSpace.sRGB)!
let context = CIContext(options: [.workingColorSpace: srgb])
let extent = image.extent
let width = Int(extent.width)
let height = Int(extent.height)

do {
  let request = VNGenerateForegroundInstanceMaskRequest()
  let handler = VNImageRequestHandler(ciImage: image)
  try handler.perform([request])
  guard let result = request.results?.first else {
    print("No foreground subject found.")
    exit(1)
  }

  // Soft matte at full resolution.
  let maskBuffer = try result.generateScaledMaskForImage(
    forInstances: result.allInstances, from: handler)
  let mask = CIImage(cvPixelBuffer: maskBuffer).cropped(to: extent)

  // Pixels: original colours (RGBA8) and matte (one channel).
  var rgba = [UInt8](repeating: 0, count: width * height * 4)
  context.render(
    image, toBitmap: &rgba, rowBytes: width * 4, bounds: extent, format: .RGBA8,
    colorSpace: srgb)
  var alpha = [UInt8](repeating: 0, count: width * height)
  context.render(
    mask, toBitmap: &alpha, rowBytes: width, bounds: extent, format: .R8, colorSpace: nil)

  // Background colour: average of the four 16×16 corners.
  var bg = [0.0, 0.0, 0.0]
  var samples = 0.0
  for (cx, cy) in [(0, 0), (width - 16, 0), (0, height - 16), (width - 16, height - 16)] {
    for y in cy..<(cy + 16) {
      for x in cx..<(cx + 16) {
        let i = (y * width + x) * 4
        for c in 0..<3 { bg[c] += Double(rgba[i + c]) }
        samples += 1
      }
    }
  }
  bg = bg.map { $0 / samples }
  // On a dark background (dark-mode renders) a soft halo of near-black is
  // invisible on a dark page, and keying/decontaminating amplifies noise into
  // bright fringes, so the edges keep Vision's matte as is.
  let refineEdges = (0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2]) > 48
  // Chroma-green background (generate-art --bg green): also despill, i.e.
  // clamp green to the max of red/blue so no green tint survives. Safe
  // because nothing in the artwork is meant to be green.
  let greenScreen = bg[1] > bg[0] + 60 && bg[1] > bg[2] + 60

  // Pass 1: final alpha per pixel.
  var finalAlpha = [UInt8](repeating: 0, count: width * height)
  for p in 0..<(width * height) {
    let matte = Double(alpha[p]) / 255
    let i = p * 4
    var diff = 0.0
    for c in 0..<3 { diff = max(diff, abs(Double(rgba[i + c]) - bg[c])) }
    let propKey = max(0, min(1, (diff - KEY_PROP_LOW) / (KEY_HIGH - KEY_PROP_LOW)))
    var a: Double
    if greenScreen {
      // Green-screen key on "green excess" (how much greener than red/blue):
      // the background scores ~235, green reflections on the subject score
      // low (kept opaque, then despilled), half-green edge pixels score
      // in between. Vision isn't needed.
      let excess = Double(rgba[i + 1]) - max(Double(rgba[i]), Double(rgba[i + 2]))
      // Thresholds scale with how green this background actually is (Gemini
      // doesn't always give pure #00FF00).
      let bgExcess = bg[1] - max(bg[0], bg[2])
      let low = min(GREEN_LOW, bgExcess * 0.25)
      let high = min(GREEN_HIGH, bgExcess * 0.8)
      a = 1 - max(0, min(1, (excess - low) / (high - low)))
    } else if matte < 0.02 {
      // Outside Vision's subject: Vision often drops small floating props,
      // so on a light flat background keep anything clearly not background
      // (a stricter key, so JPEG noise doesn't leave specks).
      // On dark backgrounds use a much stricter key: props there are lit
      // and clearly lighter, while near-black noise must stay out.
      a = refineEdges
        ? propKey
        : max(0, min(1, (diff - DARK_PROP_LOW) / (DARK_PROP_HIGH - DARK_PROP_LOW)))
    } else if refineEdges && matte < 0.98 {
      // Soft band: key on colour, capped by the matte.
      let key = max(0, min(1, (diff - KEY_LOW) / (KEY_HIGH - KEY_LOW)))
      a = max(min(matte * 1.5, key), propKey)
    } else {
      a = matte
    }
    finalAlpha[p] = a < 0.02 ? 0 : UInt8((a * 255).rounded())
  }

  // Green screen: choke the edge by CHOKE_PX to drop the last ring of
  // green-tinged pixels (despill alone turns them olive).
  if greenScreen {
    let alphaImage = CIImage(
      bitmapData: Data(finalAlpha), bytesPerRow: width,
      size: CGSize(width: width, height: height), format: .R8, colorSpace: nil)
    let choked = alphaImage
      .applyingFilter("CIMorphologyMinimum", parameters: ["inputRadius": CHOKE_PX])
      .cropped(to: alphaImage.extent)
    context.render(
      choked, toBitmap: &finalAlpha, rowBytes: width, bounds: alphaImage.extent,
      format: .R8, colorSpace: nil)
  }

  // Close small holes (grow then shrink) where a prop's colour sits close to
  // the background, e.g. grey metal; the outline itself doesn't grow.
  if !greenScreen {
    let alphaImage = CIImage(
      bitmapData: Data(finalAlpha), bytesPerRow: width,
      size: CGSize(width: width, height: height), format: .R8, colorSpace: nil)
    let closed = alphaImage
      .applyingFilter("CIMorphologyMaximum", parameters: ["inputRadius": refineEdges ? CLOSE_PX : DARK_CLOSE_PX])
      .applyingFilter("CIMorphologyMinimum", parameters: ["inputRadius": refineEdges ? CLOSE_PX : DARK_CLOSE_PX])
      .cropped(to: alphaImage.extent)
    var closedAlpha = [UInt8](repeating: 0, count: width * height)
    context.render(
      closed, toBitmap: &closedAlpha, rowBytes: width, bounds: alphaImage.extent,
      format: .R8, colorSpace: nil)
    for p in 0..<(width * height) { finalAlpha[p] = max(finalAlpha[p], closedAlpha[p]) }
  }

  // Fill enclosed holes: transparent regions that can't be reached from the
  // image border are inside the subject (e.g. a prop's shaded side that
  // matches the background colour), so make them opaque.
  if !greenScreen {
    var outside = [Bool](repeating: false, count: width * height)
    var stack: [Int] = []
    func push(_ p: Int) {
      if !outside[p] && finalAlpha[p] < 128 { outside[p] = true; stack.append(p) }
    }
    for x in 0..<width { push(x); push((height - 1) * width + x) }
    for y in 0..<height { push(y * width); push(y * width + width - 1) }
    while let p = stack.popLast() {
      let x = p % width, y = p / width
      if x > 0 { push(p - 1) }
      if x < width - 1 { push(p + 1) }
      if y > 0 { push(p - width) }
      if y < height - 1 { push(p + width) }
    }
    for p in 0..<(width * height) where !outside[p] && finalAlpha[p] < 128 {
      finalAlpha[p] = 255
    }
  }

  // Pass 2: colours (background removed from edge pixels) and subject box.
  var out = [UInt8](repeating: 0, count: width * height * 4)
  var minX = width, minY = height, maxX = -1, maxY = -1
  for y in 0..<height {
    for x in 0..<width {
      let p = y * width + x
      let a8 = finalAlpha[p]
      if a8 == 0 { continue }
      let a = Double(a8) / 255
      let i = p * 4
      for c in 0..<3 {
        let seen = Double(rgba[i + c])
        // Remove the background's share; cap the boost so faint edge
        // pixels can't be pushed into bright fringes.
        // On green the alpha comes from the green-excess key, which is
        // accurate, so a stronger boost is safe; despill tidies up after.
        let boost = min((1 - a) / a, greenScreen ? 4 : 1.5)
        let value = (!refineEdges || a >= 0.98) ? seen : seen + (seen - bg[c]) * boost
        out[i + c] = UInt8(max(0, min(255, value.rounded())))
      }
      if greenScreen { out[i + 1] = min(out[i + 1], max(out[i], out[i + 2])) }
      out[i + 3] = a8
      if a8 > 8 {
        minX = min(minX, x); maxX = max(maxX, x)
        minY = min(minY, y); maxY = max(maxY, y)
      }
    }
  }
  guard maxX >= 0 else {
    print("Subject mask is empty.")
    exit(1)
  }

  // Crop unless keeping the frame.
  let crop =
    keepFrame
    ? CGRect(x: 0, y: 0, width: width, height: height)
    : CGRect(x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1)
  let provider = CGDataProvider(data: Data(out) as CFData)!
  let full = CGImage(
    width: width, height: height, bitsPerComponent: 8, bitsPerPixel: 32,
    bytesPerRow: width * 4, space: srgb,
    bitmapInfo: CGBitmapInfo(rawValue: CGImageAlphaInfo.last.rawValue),
    provider: provider, decode: nil, shouldInterpolate: false, intent: .defaultIntent)!
  let final = full.cropping(to: crop)!

  try FileManager.default.createDirectory(
    at: output.deletingLastPathComponent(), withIntermediateDirectories: true)
  let dest = CGImageDestinationCreateWithURL(
    output as CFURL, UTType.png.identifier as CFString, 1, nil)!
  CGImageDestinationAddImage(dest, final, nil)
  guard CGImageDestinationFinalize(dest) else {
    print("Couldn't write \(output.path)")
    exit(1)
  }

  if keepFrame {
    print("bbox \(minX) \(minY) \(maxX - minX + 1) \(maxY - minY + 1)")
  }
  print(
    "Saved \(output.path) (\(final.width)×\(final.height)), background rgb(\(bg.map { Int($0) }))"
  )
} catch {
  print("Cutout failed: \(error.localizedDescription)")
  exit(1)
}
