#!/usr/bin/env python3
"""Generate first-pass evidence for reference-video replication.

The output is diagnostic, not an automatic edit decision. Review every reported
boundary and repeat candidate against native frames before building a timeline.
"""

from __future__ import annotations

import argparse
import json
import math
import subprocess
from pathlib import Path

import cv2
import numpy as np


def robust_threshold(values: np.ndarray, percentile: float, scale: float) -> float:
    median = float(np.median(values))
    mad = float(np.median(np.abs(values - median)))
    return max(float(np.percentile(values, percentile)), median + scale * max(mad, 1e-6))


def separated_peaks(values: np.ndarray, threshold: float, radius: int) -> list[int]:
    candidates = np.flatnonzero(values >= threshold)
    ordered = sorted(candidates, key=lambda index: float(values[index]), reverse=True)
    selected: list[int] = []
    for index in ordered:
        if all(abs(index - other) > radius for other in selected):
            selected.append(int(index))
    return sorted(selected)


def dhash(gray: np.ndarray) -> np.ndarray:
    small = cv2.resize(gray, (17, 16), interpolation=cv2.INTER_AREA)
    return (small[:, 1:] > small[:, :-1]).reshape(-1)


def audio_onsets(path: Path) -> list[float]:
    command = [
        "ffmpeg", "-v", "error", "-i", str(path), "-vn", "-ac", "1",
        "-ar", "22050", "-f", "f32le", "pipe:1",
    ]
    audio = np.frombuffer(subprocess.check_output(command), dtype=np.float32)
    if len(audio) < 2048:
        return []
    window, hop = 1024, 256
    spectra = []
    taper = np.hanning(window)
    for start in range(0, len(audio) - window, hop):
        spectra.append(np.log1p(np.abs(np.fft.rfft(audio[start:start + window] * taper))))
    flux = np.maximum(0, np.diff(np.asarray(spectra), axis=0)).sum(axis=1)
    flux = np.convolve(flux, np.ones(5) / 5, mode="same")
    threshold = robust_threshold(flux, 72, 2.5)
    peaks = separated_peaks(flux, threshold, max(1, round(0.14 * 22050 / hop)))
    return [round((index + 1) * hop / 22050, 4) for index in peaks]


def robust_unit(values: np.ndarray, lower: float = 5, upper: float = 95) -> np.ndarray:
    """Robustly map one evidence component to [0, 1]."""
    values = np.asarray(values, dtype=np.float64)
    if not len(values):
        return values
    low = float(np.percentile(values, lower))
    high = float(np.percentile(values, upper))
    if high <= low + 1e-9:
        return np.zeros_like(values)
    return np.clip((values - low) / (high - low), 0, 1)


def audio_energy_changes(path: Path, times: np.ndarray) -> np.ndarray:
    """Measure local RMS-energy change on the same timebase as video samples."""
    sample_rate = 22050
    command = [
        "ffmpeg", "-v", "error", "-i", str(path), "-vn", "-ac", "1",
        "-ar", str(sample_rate), "-f", "f32le", "pipe:1",
    ]
    audio = np.frombuffer(subprocess.check_output(command), dtype=np.float32)
    if not len(audio) or not len(times):
        return np.zeros(len(times), dtype=np.float64)
    radius = round(0.045 * sample_rate)
    energy = []
    for time in times:
        center = round(float(time) * sample_rate)
        start = max(0, center - radius)
        end = min(len(audio), center + radius)
        window = audio[start:end]
        energy.append(float(np.sqrt(np.mean(window * window))) if len(window) else 0.0)
    energy = np.asarray(energy, dtype=np.float64)
    change = np.zeros_like(energy)
    if len(energy) > 1:
        change[1:] = np.abs(np.diff(np.log1p(energy * 100)))
    return change


def analyze_video(path: Path) -> tuple[dict, list[np.ndarray], list[float]]:
    capture = cv2.VideoCapture(str(path))
    if not capture.isOpened():
        raise SystemExit(f"Unable to open video: {path}")
    fps = float(capture.get(cv2.CAP_PROP_FPS) or 30)
    frame_count = int(capture.get(cv2.CAP_PROP_FRAME_COUNT) or 0)
    width = int(capture.get(cv2.CAP_PROP_FRAME_WIDTH) or 0)
    height = int(capture.get(cv2.CAP_PROP_FRAME_HEIGHT) or 0)
    sample_step = max(1, round(fps / 12))
    contact_step = max(1, round(fps / 4))

    times, frames, hashes = [], [], []
    features, cut_scores, motion = [], [], []
    contact_frames, contact_times = [], []
    previous_gray = None
    previous_hist = None
    frame_index = 0

    while True:
        ok, frame = capture.read()
        if not ok:
            break
        if frame_index % contact_step == 0:
            contact_frames.append(frame.copy())
            contact_times.append(frame_index / fps)
        if frame_index % sample_step != 0:
            frame_index += 1
            continue
        scaled = cv2.resize(frame, (96, 160), interpolation=cv2.INTER_AREA)
        gray = cv2.cvtColor(scaled, cv2.COLOR_BGR2GRAY)
        hsv = cv2.cvtColor(scaled, cv2.COLOR_BGR2HSV)
        bgr_mean = scaled.reshape(-1, 3).mean(axis=0)
        luma_mean = float(gray.mean())
        contrast = float(gray.std())
        saturation = float(hsv[..., 1].mean())
        channel_spread = float(np.mean(np.max(scaled, axis=2) - np.min(scaled, axis=2)))
        sharpness = float(cv2.Laplacian(gray, cv2.CV_32F).var())
        hist = cv2.calcHist([gray], [0], None, [32], [0, 256])
        cv2.normalize(hist, hist)
        if previous_gray is None:
            cut_scores.append(0.0)
            motion.append(0.0)
        else:
            pixel_delta = float(cv2.absdiff(previous_gray, gray).mean()) / 255
            hist_delta = float(cv2.compareHist(previous_hist, hist, cv2.HISTCMP_BHATTACHARYYA))
            cut_scores.append(pixel_delta * 0.55 + hist_delta * 0.45)
            flow = cv2.calcOpticalFlowFarneback(previous_gray, gray, None, 0.5, 3, 15, 3, 5, 1.2, 0)
            motion.append(float(np.percentile(np.linalg.norm(flow, axis=2), 80)))
        times.append(frame_index / fps)
        frames.append(gray)
        hashes.append(dhash(gray))
        features.append([luma_mean, contrast, saturation, channel_spread, sharpness, *bgr_mean.tolist()])
        previous_gray, previous_hist = gray, hist
        frame_index += 1
    capture.release()

    times_array = np.asarray(times)
    cut_array = np.asarray(cut_scores)
    feature_array = np.asarray(features)
    motion_array = np.asarray(motion)
    cut_indices = separated_peaks(cut_array, robust_threshold(cut_array, 88, 3.0), max(1, round(0.12 * fps / sample_step)))

    normalized = (feature_array - np.median(feature_array, axis=0)) / np.maximum(np.median(np.abs(feature_array - np.median(feature_array, axis=0)), axis=0), 1e-3)
    look_delta = np.linalg.norm(np.diff(normalized[:, :5], axis=0), axis=1)
    look_indices = separated_peaks(look_delta, robust_threshold(look_delta, 88, 3.0), max(1, round(0.16 * fps / sample_step)))

    repeat_candidates = []
    minimum_separation = max(1, round(0.75 * fps / sample_step))
    for left in range(len(hashes)):
        best = None
        for right in range(left + minimum_separation, len(hashes)):
            distance = int(np.count_nonzero(hashes[left] != hashes[right]))
            if distance <= 12 and (best is None or distance < best[0]):
                best = (distance, right)
        if best:
            repeat_candidates.append({
                "first": round(float(times_array[left]), 4),
                "again": round(float(times_array[best[1]]), 4),
                "hashDistance": best[0],
            })
    repeat_candidates = repeat_candidates[:80]

    nonzero_motion = motion_array[motion_array > 0]
    motion_low = float(np.percentile(nonzero_motion, 12)) if len(nonzero_motion) else 0
    motion_high = float(np.percentile(nonzero_motion, 88)) if len(nonzero_motion) else 0
    motion_change = np.abs(np.diff(np.log1p(motion_array)))
    motion_indices = separated_peaks(motion_change, robust_threshold(motion_change, 90, 3.0), max(1, round(0.16 * fps / sample_step)))

    audio_change = audio_energy_changes(path, times_array)
    highlight_components = {
        "audioEnergyChange": robust_unit(audio_change),
        "motionIntensity": robust_unit(motion_array),
        "shotChange": robust_unit(cut_array),
        "clarity": robust_unit(feature_array[:, 4]),
    }
    available_weights = {
        "audioEnergyChange": 0.30,
        "motionIntensity": 0.25,
        "shotChange": 0.20,
        "clarity": 0.10,
    }
    available_weight_total = sum(available_weights.values())
    available_score = sum(
        highlight_components[name] * weight
        for name, weight in available_weights.items()
    ) / available_weight_total
    highlight_samples = []
    for index, time in enumerate(times_array):
        normalized = {
            name: round(float(values[index]), 6)
            for name, values in highlight_components.items()
        }
        contributions = {
            name: round(normalized[name] * weight, 6)
            for name, weight in available_weights.items()
        }
        highlight_samples.append({
            "time": round(float(time), 4),
            "raw": {
                "audioEnergyChange": round(float(audio_change[index]), 6),
                "motionIntensity": round(float(motion_array[index]), 6),
                "shotChange": round(float(cut_array[index]), 6),
                "faceExpressionChange": None,
                "clarity": round(float(feature_array[index, 4]), 6),
            },
            "normalized": {**normalized, "faceExpressionChange": None},
            "weightedContributions": {**contributions, "faceExpressionChange": None},
            "highlightScore": None,
            "availableEvidenceScore": round(float(available_score[index]), 6),
            "complete": False,
            "unavailable": ["faceExpressionChange"],
        })

    report = {
        "media": {"fps": fps, "frameCount": frame_count, "width": width, "height": height, "duration": frame_count / fps if fps else 0},
        "audioOnsets": audio_onsets(path),
        "cutCandidates": [{"time": round(float(times_array[index]), 4), "score": round(float(cut_array[index]), 5)} for index in cut_indices],
        "lookChangeCandidates": [{"time": round(float(times_array[index + 1]), 4), "score": round(float(look_delta[index]), 4)} for index in look_indices],
        "motionRateChangeCandidates": [{"time": round(float(times_array[index + 1]), 4), "score": round(float(motion_change[index]), 4)} for index in motion_indices],
        "motionSummary": {"low": motion_low, "high": motion_high, "warning": "Motion magnitude is not an exact playback-rate estimate."},
        "repeatCandidates": repeat_candidates,
        "highlightEvaluation": {
            "formula": "0.30*audioEnergyChange + 0.25*motionIntensity + 0.20*shotChange + 0.15*faceExpressionChange + 0.10*clarity",
            "componentRange": [0, 1],
            "complete": False,
            "unavailable": ["faceExpressionChange"],
            "availableWeight": available_weight_total,
            "warning": "availableEvidenceScore is renormalized over available components and is not the strict five-component highlightScore.",
            "samples": highlight_samples,
        },
        "sampledFeatures": [
            {"time": round(float(time), 4), "luma": round(float(row[0]), 3), "contrast": round(float(row[1]), 3), "saturation": round(float(row[2]), 3), "channelSpread": round(float(row[3]), 3), "sharpness": round(float(row[4]), 3), "motion": round(float(motion_array[index]), 4)}
            for index, (time, row) in enumerate(zip(times_array, feature_array))
        ],
    }
    return report, contact_frames, contact_times


def write_contact_sheet(frames: list[np.ndarray], times: list[float], output: Path) -> None:
    cell_width = 180
    cells = []
    for frame, time in zip(frames, times):
        ratio = cell_width / frame.shape[1]
        cell = cv2.resize(frame, (cell_width, max(1, round(frame.shape[0] * ratio))))
        cv2.rectangle(cell, (0, 0), (88, 24), (0, 0, 0), -1)
        cv2.putText(cell, f"{time:06.2f}s", (5, 17), cv2.FONT_HERSHEY_SIMPLEX, 0.48, (255, 255, 255), 1, cv2.LINE_AA)
        cells.append(cell)
    columns = 8
    rows = math.ceil(len(cells) / columns)
    cell_height = max(cell.shape[0] for cell in cells)
    sheet = np.zeros((rows * cell_height, columns * cell_width, 3), dtype=np.uint8)
    for index, cell in enumerate(cells):
        row, column = divmod(index, columns)
        sheet[row * cell_height:row * cell_height + cell.shape[0], column * cell_width:(column + 1) * cell_width] = cell
    cv2.imwrite(str(output), sheet)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("reference", type=Path)
    parser.add_argument("--output-dir", required=True, type=Path)
    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)
    report, frames, times = analyze_video(args.reference)
    report_path = args.output_dir / "replication-analysis.json"
    report_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    write_contact_sheet(frames, times, args.output_dir / "replication-contact-sheet.jpg")
    print(report_path)


if __name__ == "__main__":
    main()
