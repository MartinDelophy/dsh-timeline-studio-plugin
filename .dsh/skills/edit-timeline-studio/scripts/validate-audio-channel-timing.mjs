#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import path from 'node:path';

const defaults = {
  ffmpeg: 'ffmpeg',
  ffprobe: 'ffprobe',
  maxOpeningDelta: 12,
  windows: [{ start: 0, duration: 0.25 }],
};

function usage() {
  return [
    'Usage: node scripts/validate-audio-channel-timing.mjs [options] <mix.wav|mix.mp4>',
    '',
    'Options:',
    '  --window <start>:<duration>  Window to compare; may be repeated (default: 0:0.25)',
    '  --max-opening-delta <dB>     Maximum allowed L/R mean or peak delta (default: 12)',
    '  --ffmpeg <path>               FFmpeg executable (default: ffmpeg)',
    '  --ffprobe <path>              FFprobe executable (default: ffprobe)',
  ].join('\n');
}

function parseWindow(value) {
  const [start, duration] = String(value).split(':').map(Number);
  if (!Number.isFinite(start) || start < 0 || !Number.isFinite(duration) || duration <= 0) {
    throw new Error(`Invalid --window value: ${value}`);
  }
  return { start, duration };
}

function parseArgs(argv) {
  const options = { ...defaults, windows: [] };
  let file = '';
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--help' || token === '-h') {
      console.log(usage());
      process.exit(0);
    }
    if (token === '--window') {
      options.windows.push(parseWindow(argv[++index]));
      continue;
    }
    if (token === '--max-opening-delta') {
      options.maxOpeningDelta = Number(argv[++index]);
      if (!Number.isFinite(options.maxOpeningDelta) || options.maxOpeningDelta < 0) throw new Error('Invalid --max-opening-delta value.');
      continue;
    }
    if (token === '--ffmpeg' || token === '--ffprobe') {
      options[token.slice(2)] = argv[++index];
      continue;
    }
    if (token.startsWith('--')) throw new Error(`Unknown option: ${token}`);
    if (file) throw new Error('Exactly one rendered mix is required.');
    file = path.resolve(token);
  }
  if (!file) throw new Error('A rendered mix is required.');
  if (!options.windows.length) options.windows = defaults.windows;
  return { options, file };
}

function probeChannels(file, options) {
  const result = spawnSync(options.ffprobe, [
    '-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=channels', '-of', 'default=nw=1:nk=1', file,
  ], { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`FFprobe could not inspect ${file}:\n${result.stderr.trim()}`);
  return Number(result.stdout.trim());
}

function measureChannel(file, channel, window, options) {
  const result = spawnSync(options.ffmpeg, [
    '-hide_banner', '-nostats', '-ss', String(window.start), '-t', String(window.duration), '-i', file,
    '-map', '0:a:0', '-af', `pan=mono|c0=c${channel},volumedetect`, '-f', 'null', '-',
  ], { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`FFmpeg could not measure channel ${channel} in ${file}:\n${result.stderr.trim()}`);
  const mean = Number(result.stderr.match(/mean_volume:\s*(-?\d+(?:\.\d+)?|-inf) dB/)?.[1]);
  const peak = Number(result.stderr.match(/max_volume:\s*(-?\d+(?:\.\d+)?|-inf) dB/)?.[1]);
  return { mean, peak };
}

function finiteDelta(left, right) {
  if (Number.isFinite(left) && Number.isFinite(right)) return Math.abs(left - right);
  if (left === -Infinity && right === -Infinity) return 0;
  return Infinity;
}

function main() {
  const { options, file } = parseArgs(process.argv.slice(2));
  const channels = probeChannels(file, options);
  if (channels < 2) {
    console.log(JSON.stringify({ ok: true, file, channels, skipped: 'Audio is mono.' }, null, 2));
    return;
  }
  const windows = options.windows.map((window) => {
    const left = measureChannel(file, 0, window, options);
    const right = measureChannel(file, 1, window, options);
    return {
      ...window,
      left,
      right,
      meanDelta: finiteDelta(left.mean, right.mean),
      peakDelta: finiteDelta(left.peak, right.peak),
    };
  });
  const failures = windows.flatMap((window) => {
    const largest = Math.max(window.meanDelta, window.peakDelta);
    return largest > options.maxOpeningDelta
      ? [`L/R level delta ${largest.toFixed(2)} dB exceeds ${options.maxOpeningDelta} dB in ${window.start}:${window.duration}`]
      : [];
  });
  console.log(JSON.stringify({ ok: failures.length === 0, file, channels, options, windows, failures }, null, 2));
  if (failures.length) process.exit(1);
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(2);
}
