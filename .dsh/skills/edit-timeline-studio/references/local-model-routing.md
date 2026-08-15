# Local model routing for editing and replication

Use this reference whenever local models can reduce guesswork in media analysis, reframing, masking, speech timing, depth, repair, or enhancement. A model is an evidence tool, not permission to skip editorial inspection.

## 1. Inventory before inference

Before loading or downloading anything, inspect the active repository and local project environment for:

- model manifests, licenses, checksums, immutable revisions, and owned mirrors;
- existing worker or library entrypoints and their expected runtime: native, Python, Node, ONNX Runtime, WASM, WebGPU, or MediaPipe;
- existing Cache Storage, service-worker, or provider-independent cache identities;
- already materialized local artifacts and whether they match the pinned checksum;
- the exact evidence layer still missing from the edit blueprint.

Write a capability inventory into the analysis record. For every candidate, record `task`, `modelId`, `revision`, `artifactPath`, `runtime`, `provider/cacheIdentity`, `localAvailability`, `license`, `entrypoint`, and `selected`. Do not treat a UI label as proof that the model is locally executable.

Prefer an already cached or locally present immutable artifact. If a download is required, reuse the application's owned mirror, pinned revision, checksum verification, and shared cache identity. Do not fetch an unpinned upstream copy, write a second full model cache, or silently substitute a different model.

## 2. Select the minimum chain

Route by the unanswered question, not by the number of models available:

| Evidence need | Preferred local route | Use in replication | Guardrail |
| --- | --- | --- | --- |
| Person or object location | Existing NanoDet proposal pipeline; MediaPipe person segmentation or YOLOS as bounded fallbacks | principal-subject box, center, scale, completeness, shot subject count | Detection must be inspected at anchors and reacquired after identity loss. |
| Person alpha or prompted instance | Existing MODNet or MediaPipe/MagicTouch path; guarded SlimSAM only when the fast mask fails its quality gate | subject-region motion, foreground isolation, crop safety, occlusion evidence | Never accept a face/head-only, merged-person, crop-boundary, or identity-jumping mask. |
| Temporal motion and tracking | Semantic detector or valid instance mask followed by local OpenCV/Farneback optical flow | subject path, camera/subject motion separation, stabilization evidence, transition motion, drift detection | Never infer the editing subject from background-vector clustering. Optical flow alone cannot identify a filter or exact speed. |
| Relative scene depth | Existing Depth Anything V2 Small Q4F16 route | foreground/background separation, depth-aware blur or 2.5D evidence, crop safety | Depth is relative and must not replace semantic subject detection. |
| Speech and language timing | Existing local Whisper small ASR route plus local waveform/onset analysis | phrase boundaries, lyrics/dialogue timing, caption evidence, retained-audio clock | Keep waveform timing authoritative; ASR words are hypotheses until checked against audio. |
| Face expression change | Existing local face detector/landmark or expression-capable route discovered in the repository | expression peaks, reaction beats, face-region motion evidence | Compare only the same tracked face; a cut, identity switch, missed face, or pose change is not automatically an expression change. |
| Object/watermark repair | Existing MI-GAN route with an explicit authorized mask | repair a selected source defect after edit analysis | Never repair the reference before evidence extraction; generated pixels are not source evidence. |
| Resolution restoration | Existing NanoVSR image/video route | improve selected replacement footage after cuts, retiming, crop, and tracking are locked | Enhancement cannot rescue a wrong shot, wrong identity, or bad framing and must not precede reference analysis. |
| Local image generation | Existing accepted MaskGen route when a still, plate, or controlled graphic is genuinely missing | fill an approved coverage gap or generate an auxiliary asset | Preserve generation provenance and do not present generated imagery as real footage. |

Examples currently present in Timeline Studio repositories may include NanoDet-Plus, MediaPipe MagicTouch or person segmentation, YOLOS tiny, MODNet, SlimSAM, OpenCV Farneback, Depth Anything V2 Small, Whisper small, MI-GAN, NanoVSR, and MaskGen. Treat this list as discovery hints, not hard-coded availability. The live repository manifests and pinned configuration are authoritative.

Do not initialize all models for every job. A centered-subject crop may require detection plus tracking, not depth, matting, repair, restoration, and ASR. Add another model only when a named evidence gap remains or the previous route fails a documented gate.

## 3. Score highlight candidates

For automatic highlights and for locating emphasis beats inside a reference, compute a time-aligned candidate score:

`highlightScore = 0.30 × audioEnergyChange + 0.25 × motionIntensity + 0.20 × shotChange + 0.15 × faceExpressionChange + 0.10 × clarity`

Treat every term as a positive contribution and normalize it robustly to `[0, 1]` within the active source or comparable scene group before applying the weights:

- `audioEnergyChange`: local short-time energy or loudness delta around the sample, with transient/onset evidence retained separately;
- `motionIntensity`: subject-region optical-flow magnitude plus bounded global frame difference, separating subject motion from camera motion when possible;
- `shotChange`: combined histogram, structural, and frame-difference boundary confidence rather than one threshold alone;
- `faceExpressionChange`: landmark, expression, or face-region change for the same tracked face only; reject identity switches and detector gaps;
- `clarity`: subject-region sharpness when a subject exists, otherwise robust global sharpness, with compression noise and artificial sharpening guarded against.

Write the raw values, normalization range, normalized components, weighted contributions, total score, active face identity, and model provenance for each sample. Smooth only enough to suppress single-frame noise, then use temporal non-maximum suppression and a configurable minimum spacing to form candidates. Preserve nearby candidates when they represent different evidence such as an audio hit followed by a motion peak.

If one component is genuinely unavailable, mark it `unavailable`; do not silently write zero. Produce both the strict five-component score as incomplete and a separately labeled `availableEvidenceScore` renormalized over only available weights. Never compare incomplete and complete scores as though they share the same confidence.

This is a saliency ranking, not an editorial verdict or replication-fidelity score. Do not delete a low-scoring setup, reaction, pause, continuity bridge, required dialogue, product proof, or intentional stillness solely because of this value. For reference replication, use peaks to help locate sub-shot boundaries and emphasis points, then verify them against native frames, audio, repetition, speed, look, transition, and subject-geometry evidence.

Never convert `highlightScore` directly into a keep list or tension curve. After candidate extraction, use [highlight-tension-workflow.md](highlight-tension-workflow.md) to judge subject dominance, action legibility, meaning/stakes, novelty, audio relationship, apex clarity, and setup/result integrity. Preserve low-score contrast beats when they make a later peak stronger, and reject high-score chaos when the intended subject or action cannot be read.

## 4. Run locally without visible UI automation

Use the model's existing local library or worker entrypoint when it can be called outside the editor UI. If the artifact is WebGPU- or browser-worker-specific, use a local non-visible runtime adapter such as a repository-owned headless worker harness; do not click through the visible editor to perform routine analysis. Keep inputs and outputs on the user's machine.

Do not claim that a model ran merely because the source file imports it. Confirm artifact availability, runtime initialization, inference completion, and a usable output. If no non-visible local entrypoint exists, record the runtime gap and implement the smallest reusable adapter for repository-development work before editing. Do not replace the model silently with an unrelated heuristic.

Store derived evidence outside the production repository unless it is a deliberate project asset. Use stable, inspectable files such as JSON tracks, masks, depth samples, transcripts, or flow summaries, with timestamps on the reference/source timebase.

## 5. Subject-aware replication chain

For each reference shot and candidate replacement shot:

1. Detect the principal semantic subject at the shot anchor. Prefer a centered, fully visible person when that matches the reference; otherwise follow the reference's stated subject-selection rule.
2. Track the same identity through the shot using semantic re-detection at bounded anchors plus subject-region optical flow between anchors.
3. Record normalized center x/y, box width/height, headroom, visible body/object completeness, confidence, occlusion, and identity state at each sample.
4. Smooth detector noise without erasing intentional motion. Mark lost or rejected samples; never interpolate through a real identity switch as if it were stable tracking.
5. Solve crop/scale/position keyframes from the difference between the reference and replacement subject tracks. Constrain crop bounds so required head, hands, feet, costume, and product geometry remain visible.
6. Re-run tracking on the transformed preview and measure residual center, scale, and path error. A centered reference requires an explicit center tolerance and drift score, not a subjective glance.

For multi-person footage, lock one editing subject and preserve temporal identity. Bystanders and background people must not be allowed to pull the crop or alpha away from the intended subject.

## 6. Evidence provenance and failure handling

For every inference result, record:

- input asset identity and exact source timestamps;
- model ID, immutable revision, checksum when known, runtime and device;
- owned mirror or local artifact path and shared cache identity;
- preprocessing size/color order and sampling interval;
- thresholds, prompts, smoothing, anchor cadence, and fallback order;
- confidence, rejected intervals, identity-loss intervals, and human-review status;
- output file identities used by the edit plan.

A fallback is acceptable only when it answers the same question and its use is visible in the record. A centered semantic prior may prevent a complete stop when all detectors fail, but it is low-confidence evidence and cannot by itself pass a framing-fidelity gate.

Keep raw reference analysis immutable. Run repair, denoise, restoration, frame interpolation, or aggressive stabilization only on a separate derivative after the edit blueprint is established. Compare the final render against the unmodified reference and the original replacement sources.
