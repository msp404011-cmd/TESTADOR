import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, drawFn) {
  const bytesPerPixel = 4;
  const rawRowLen = width * bytesPerPixel;
  const rawBuffer = Buffer.alloc((rawRowLen + 1) * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rawRowLen + 1);
    rawBuffer[rowOffset] = 0; // Filter type 0 (None)
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawFn(x, y, width, height);
      const pxOffset = rowOffset + 1 + x * bytesPerPixel;
      rawBuffer[pxOffset] = r;
      rawBuffer[pxOffset + 1] = g;
      rawBuffer[pxOffset + 2] = b;
      rawBuffer[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawBuffer);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: 6 (RGBA)
  ihdr[10] = 0; // Compression: Deflate
  ihdr[11] = 0; // Filter: 0
  ihdr[12] = 0; // Interlace: 0
  const ihdrChunk = createChunk('IHDR', ihdr);

  // IDAT chunk
  const idatChunk = createChunk('IDAT', compressedData);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(4 + 4 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);

  const crcData = chunk.subarray(4, 8 + length);
  const crcValue = calculateCrc32(crcData);
  chunk.writeUInt32BE(crcValue, 8 + length);
  return chunk;
}

function calculateCrc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    const byte = buf[i];
    crc ^= byte;
    for (let j = 0; j < 8; j++) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function drawTechCheckIcon(x, y, w, h, isMaskable = false) {
  const nx = (x / w) * 2 - 1; // -1 to 1
  const ny = (y / h) * 2 - 1;
  const dist = Math.sqrt(nx * nx + ny * ny);

  // Background
  let r = 15;
  let g = 23;
  let b = 42; // #0f172a
  let a = 255;

  if (isMaskable) {
    // Solid background for full-bleed maskable
    r = 2;
    g = 6;
    b = 23; // #020617
  }

  // Rounded squircle boundary check if not maskable
  if (!isMaskable) {
    const p = 4;
    const cornerDist = Math.pow(Math.abs(nx), p) + Math.pow(Math.abs(ny), p);
    if (cornerDist > 0.95) {
      return [0, 0, 0, 0]; // Transparent outside
    }
  }

  // Emerald accent gradient
  const grad = (ny + 1) * 0.5;
  r = Math.floor(r * (1 - grad * 0.4) + 6 * grad * 0.4);
  g = Math.floor(g * (1 - grad * 0.4) + 78 * grad * 0.4);
  b = Math.floor(b * (1 - grad * 0.4) + 59 * grad * 0.4);

  // Phone body shape
  const scale = isMaskable ? 0.7 : 0.82;
  const px = nx / scale;
  const py = ny / scale;

  if (Math.abs(px) < 0.55 && Math.abs(py) < 0.78) {
    // Phone outline
    r = 30;
    g = 41;
    b = 59; // slate-800
    // Phone inner screen
    if (Math.abs(px) < 0.48 && Math.abs(py) < 0.68) {
      r = 2;
      g = 6;
      b = 23; // slate-950

      // Center glowing circle
      const circleDist = Math.sqrt(px * px + py * py);
      if (circleDist < 0.35) {
        // Emerald circle badge
        r = 16;
        g = 185;
        b = 129; // #10b981

        // Checkmark drawing
        const cx = px / 0.35;
        const cy = py / 0.35;

        // Checkmark stroke check
        const inLine1 = Math.abs(cy - (cx * 1.0 + 0.1)) < 0.12 && cx >= -0.4 && cx <= 0.0;
        const inLine2 = Math.abs(cy - (-cx * 1.1 - 0.0)) < 0.12 && cx >= 0.0 && cx <= 0.45;

        if (inLine1 || inLine2) {
          r = 255;
          g = 255;
          b = 255; // White checkmark
        }
      }
    }
  }

  return [r, g, b, a];
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate 192x192
const pwa192 = createPng(192, 192, (x, y, w, h) => drawTechCheckIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), pwa192);

// Generate 512x512
const pwa512 = createPng(512, 512, (x, y, w, h) => drawTechCheckIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), pwa512);

// Generate Maskable 512x512
const pwaMaskable512 = createPng(512, 512, (x, y, w, h) => drawTechCheckIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pwaMaskable512);

// Generate apple-touch-icon 180x180
const appleTouch = createPng(180, 180, (x, y, w, h) => drawTechCheckIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch);

console.log('PWA PNG icons generated successfully!');
