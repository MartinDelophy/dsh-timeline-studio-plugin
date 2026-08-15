#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import path from 'node:path';

const defaults = {
  target: -18,
  targetTolerance: 1,
  maxSpread: 1,
  maxTruePeak: -2,
  maxLra: 5,
  ffmpeg: 'ffmpeg',
};

function usage() {
  return [
    'Usage: node scripts/validate-voiceover-loudness.mjs [options] <clip.wav>...',
    '',
    'Options:',
    '  --target <LUFS>             Integrated loudness target (default: -18)',
    '  --target-tolerance <LU>     Allowed distance from target (default: 1)',
    '  --max-spread <LU>           Loudest-to-quietest clip spread (default: 1)',
    '  --max-true-peak <dBTP>      Highest allowed true peak (default: -2)',
    '  --max-lra <LU>              Highest allowed per-clip LRA (default: 5)',
    '  --ffmpeg <path>             FFmpeg executable (default: ffmpeg)',
  ].join('\n');
}

function parseArgs(argv) {
  const options = { ...defaults };
  const files = [];
  const numeric = new Map([
    ['--target', 'target'],
    ['--target-tolerance', 'targetTolerance'],
    ['--max-spread', 'maxSpread'],
    ['--max-true-peak', 'maxTruePeak'],
    ['--max-lra', 'maxLra'],
  ]);
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === '--help' || token === '-h') {
      console.log(usage());
      process.exit(0);
    }
    if (token === '--ffmpeg') {
      options.ffmpeg = argv[++index];
      continue;
    }
    if (numeric.has(token)) {
      const value = Number(argv[++index]);
      if (!Number.isFinite(value)) throw new Error(`Invalid value for ${token}`);
      options[numeric.get(token)] = value;
      continue;
    }
    if (token.startsWith('--')) throw new Error(`Unknown option: ${token}`);
    files.push(path.resolve(token));
  }
  if (!files.length) throw new Error('At least one sentence-scoped audio clip is required.');
  return { options, files };
}

function measure(file, options) {
  const filter = `loudnorm=I=${options.target}:LRA=${options.maxLra}:TP=${options.maxTruePeak}:print_format=json`;
  const result = spawnSync(options.ffmpeg, [
    '-hide_banner', '-nostats', '-i', file, '-map', '0:a:0', '-af', filter, '-f', 'null', '-',
  ], { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`FFmpeg could not measure ${file}:\n${result.stderr.trim()}`);
  const match = result.stderr.match(/\{\s*"input_i"[\s\S]*?\}/g)?.at(-1);
  if (!match) throw new Error(`FFmpeg returned no loudness measurement for ${file}.`);
  const data = JSON.parse(match);
  const integrated = Number(data.input_i);
  const truePeak = Number(data.input_tp);
  const lra = Number(data.input_lra);
  if (![integrated, truePeak, lra].every(Number.isFinite)) {
    throw new Error(`Non-finite loudness measurement for ${file}; the clip may be silent.`);
  }
  return { file, integrated, truePeak, lra };
}

function main() {
  const { options, files } = parseArgs(process.argv.slice(2));
  const clips = files.map((file) => measure(file, options));
  const integratedValues = clips.map((clip) => clip.integrated);
  const spread = Math.max(...integratedValues) - Math.min(...integratedValues);
  const failures = [];
  for (const clip of clips) {
    if (Math.abs(clip.integrated - options.target) > options.targetTolerance) {
      failures.push(`${path.basename(clip.file)} integrated loudness ${clip.integrated} LUFS misses target ${options.target} ±${options.targetTolerance} LU`);
    }
    if (clip.truePeak > options.maxTruePeak) {
      failures.push(`${path.basename(clip.file)} true peak ${clip.truePeak} dBTP exceeds ${options.maxTruePeak} dBTP`);
    }
    if (clip.lra > options.maxLra) {
      failures.push(`${path.basename(clip.file)} LRA ${clip.lra} LU exceeds ${options.maxLra} LU`);
    }
  }
  if (spread > options.maxSpread) {
    failures.push(`Sentence loudness spread ${spread.toFixed(2)} LU exceeds ${options.maxSpread} LU`);
  }
  console.log(JSON.stringify({ ok: failures.length === 0, options, spread, clips, failures }, null, 2));
  if (failures.length) process.exit(1);
}

try {
  main();
} catch (error) {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  process.exit(2);
}
