import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const TARGET_SIZE_BYTES = 300 * 1024; // 300KB

async function compressToTarget(inputBuffer: Buffer): Promise<{
  buffer: Buffer;
  format: string;
  width: number;
  height: number;
}> {
  const image = sharp(inputBuffer);
  const metadata = await image.metadata();
  const { width = 0, height = 0 } = metadata;

  // Step 1: Try lossless PNG with maximum compression
  const pngLossless = await sharp(inputBuffer)
    .png({ compressionLevel: 9, adaptiveFiltering: true, effort: 10 })
    .toBuffer();

  if (pngLossless.length <= TARGET_SIZE_BYTES) {
    return { buffer: pngLossless, format: "png", width, height };
  }

  // Step 2: Try WebP at decreasing quality levels (visually near-lossless)
  // Start at quality 95 and step down in small increments
  for (let quality = 95; quality >= 60; quality -= 5) {
    const webpBuffer = await sharp(inputBuffer)
      .webp({ quality, effort: 6, lossless: quality >= 90 })
      .toBuffer();

    if (webpBuffer.length <= TARGET_SIZE_BYTES) {
      return { buffer: webpBuffer, format: "webp", width, height };
    }
  }

  // Step 3: Fall back to WebP at quality 60 — best effort
  const webpFallback = await sharp(inputBuffer)
    .webp({ quality: 60, effort: 6 })
    .toBuffer();

  return { buffer: webpFallback, format: "webp", width, height };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    // Validate all files are PNGs
    for (const file of files) {
      if (!file.type.includes("png") && !file.name.toLowerCase().endsWith(".png")) {
        return NextResponse.json(
          { error: `File "${file.name}" is not a PNG` },
          { status: 400 }
        );
      }
    }

    // Process all files simultaneously
    const results = await Promise.all(
      files.map(async (file) => {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const inputBuffer = Buffer.from(arrayBuffer);
          const originalSize = inputBuffer.length;

          const { buffer, format, width, height } = await compressToTarget(inputBuffer);

          return {
            name: file.name,
            originalSize,
            compressedSize: buffer.length,
            format,
            width,
            height,
            data: buffer.toString("base64"),
            error: null,
          };
        } catch (err) {
          return {
            name: file.name,
            originalSize: 0,
            compressedSize: 0,
            format: null,
            width: 0,
            height: 0,
            data: null,
            error: err instanceof Error ? err.message : "Compression failed",
          };
        }
      })
    );

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Server error" },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};
