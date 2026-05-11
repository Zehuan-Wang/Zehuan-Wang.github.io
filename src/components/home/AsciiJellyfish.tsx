'use client';

import { useEffect, useMemo, useState } from 'react';
import { decompressFrames, parseGIF } from 'gifuct-js';
import waterUltravioletGif from '@/assets/water-ultraviolet.gif';

const ASCII_RAMP = " .'`^\",:;Il!i~+_-?][}{1)(|\\/*tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const TARGET_COLUMNS = 72;
const MIN_FRAME_DELAY_MS = 24;
const MAX_FRAME_DELAY_MS = 80;
const BACKGROUND_ALPHA_THRESHOLD = 0.1;
const BACKGROUND_LUMA_THRESHOLD = 30;

interface DecompressedGifFrame {
  delay?: number;
  dims: {
    width: number;
    height: number;
  };
  patch: Uint8ClampedArray;
}

interface Bounds {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

function clampFrameDelay(delay?: number): number {
  const safeDelay = delay && Number.isFinite(delay) ? delay : 40;
  return Math.min(MAX_FRAME_DELAY_MS, Math.max(MIN_FRAME_DELAY_MS, safeDelay));
}

function toAsciiFrame(frame: DecompressedGifFrame, columns: number): string {
  const width = frame.dims.width;
  const height = frame.dims.height;
  const patch = frame.patch;

  if (!width || !height || !patch?.length) {
    return '';
  }

  const cellWidth = Math.max(1, Math.floor(width / columns));
  const cellHeight = Math.max(2, Math.floor(cellWidth * 1.9));
  const rows = Math.max(1, Math.floor(height / cellHeight));
  const realColumns = Math.max(1, Math.floor(width / cellWidth));
  const asciiRows: string[] = [];

  for (let row = 0; row < rows; row += 1) {
    let line = '';
    const y = Math.min(height - 1, row * cellHeight);
    for (let col = 0; col < realColumns; col += 1) {
      const x = Math.min(width - 1, col * cellWidth);
      const idx = (y * width + x) * 4;
      const r = patch[idx];
      const g = patch[idx + 1];
      const b = patch[idx + 2];
      const alpha = patch[idx + 3] / 255;
      const luma = (0.2126 * r + 0.7152 * g + 0.0722 * b) * alpha;
      if (alpha < BACKGROUND_ALPHA_THRESHOLD || luma < BACKGROUND_LUMA_THRESHOLD) {
        line += ' ';
        continue;
      }
      const rampIndex = Math.min(
        ASCII_RAMP.length - 1,
        Math.floor((luma / 255) * (ASCII_RAMP.length - 1))
      );
      line += ASCII_RAMP[rampIndex];
    }
    asciiRows.push(line);
  }

  return asciiRows.join('\n');
}

function computeGlobalBounds(asciiFrames: string[]): Bounds | null {
  let top = Number.POSITIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  let left = Number.POSITIVE_INFINITY;
  let right = Number.NEGATIVE_INFINITY;

  for (const frame of asciiFrames) {
    const lines = frame.split('\n');
    for (let row = 0; row < lines.length; row += 1) {
      const line = lines[row];
      for (let col = 0; col < line.length; col += 1) {
        if (line[col] !== ' ') {
          top = Math.min(top, row);
          bottom = Math.max(bottom, row);
          left = Math.min(left, col);
          right = Math.max(right, col);
        }
      }
    }
  }

  if (!Number.isFinite(top) || !Number.isFinite(left)) {
    return null;
  }

  return { top, bottom, left, right };
}

function cropAsciiFrames(asciiFrames: string[]): string[] {
  const bounds = computeGlobalBounds(asciiFrames);
  if (!bounds) {
    return asciiFrames;
  }

  const padding = 1;
  return asciiFrames.map((frame) => {
    const lines = frame.split('\n');
    const maxRows = lines.length;
    const maxCols = lines.reduce((max, line) => Math.max(max, line.length), 0);
    const top = Math.max(0, bounds.top - padding);
    const bottom = Math.min(maxRows - 1, bounds.bottom + padding);
    const left = Math.max(0, bounds.left - padding);
    const right = Math.min(maxCols - 1, bounds.right + padding);
    const croppedLines: string[] = [];

    for (let row = top; row <= bottom; row += 1) {
      const line = lines[row] ?? '';
      const padded = line.padEnd(maxCols, ' ');
      croppedLines.push(padded.slice(left, right + 1).replace(/\s+$/g, ''));
    }

    return croppedLines.join('\n');
  });
}

export default function AsciiJellyfish() {
  const [frames, setFrames] = useState<string[]>([]);
  const [frameDelays, setFrameDelays] = useState<number[]>([]);
  const [currentFrame, setCurrentFrame] = useState(0);

  const gifUrl = useMemo(
    () => (typeof waterUltravioletGif === 'string' ? waterUltravioletGif : waterUltravioletGif.src),
    []
  );

  useEffect(() => {
    let cancelled = false;

    async function loadGifFrames() {
      try {
        const response = await fetch(gifUrl);
        const buffer = await response.arrayBuffer();
        const gif = parseGIF(buffer);
        const parsedFrames = decompressFrames(gif, true) as DecompressedGifFrame[];

        if (!cancelled && parsedFrames.length > 0) {
          const asciiFrames = parsedFrames.map((frame) => toAsciiFrame(frame, TARGET_COLUMNS));
          setFrames(cropAsciiFrames(asciiFrames));
          setFrameDelays(parsedFrames.map((frame) => clampFrameDelay(frame.delay)));
        }
      } catch {
        if (!cancelled) {
          setFrames(['Failed to load jellyfish animation.']);
          setFrameDelays([60]);
        }
      }
    }

    loadGifFrames();

    return () => {
      cancelled = true;
    };
  }, [gifUrl]);

  useEffect(() => {
    if (frames.length <= 1 || frameDelays.length === 0) {
      return undefined;
    }

    let timeoutId: number;
    let cancelled = false;
    let frameIndex = 0;

    const tick = () => {
      timeoutId = window.setTimeout(() => {
        if (cancelled) {
          return;
        }
        frameIndex = (frameIndex + 1) % frames.length;
        setCurrentFrame(frameIndex);
        tick();
      }, frameDelays[frameIndex] ?? 40);
    };

    setCurrentFrame(0);
    tick();

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, [frameDelays, frames]);

  if (frames.length === 0) {
    return (
      <section className="bg-background py-2">
        <pre className="font-mono text-[8px] leading-[8px] text-accent opacity-80 whitespace-pre overflow-hidden">
          Rendering jellyfish...
        </pre>
      </section>
    );
  }

  return (
    <section className="bg-background py-2">
      <pre className="mx-auto w-fit font-mono text-[8px] leading-[8px] text-accent opacity-90 whitespace-pre overflow-hidden select-none">
        {frames[currentFrame] || frames[0]}
      </pre>
    </section>
  );
}
