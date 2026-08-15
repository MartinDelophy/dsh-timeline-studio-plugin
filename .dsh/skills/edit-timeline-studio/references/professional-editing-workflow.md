# Professional analysis, enhancement, and delivery

Use this reference for every completed automatic edit. Treat the seven content categories as editorial policies over one shared analysis and finishing pipeline.

## 1. Build one evidence record

Inspect images directly for subjects, faces, products, logos, readable text, composition, sharpness, resolution, crop room, depth cues, and brand-critical geometry. Decide whether each image is suitable for direct use, depth/2.5D treatment, image-to-video, image-to-image repair, or rejection.

For video, combine shot boundaries, representative frames, OCR, transcript/audio structure, semantic regions, and optical flow. Estimate global flow for camera shake and intentional camera motion; estimate region flow for people, products, screens, and other meaningful subjects. Record stable intervals, blur/occlusion/focus failures, motion changes, action/result pairs, and candidate in/out/highlight/hold times.

Never use optical flow as semantic proof. A moving region is not automatically a person, product, or important event. Bind flow to a visually or textually identified region, and combine image evidence, speech, OCR, and timing before making an editorial decision.

## 2. Classify content and editorial goal

Choose one primary category and optional secondary category: `talking-head`, `tutorial-demo`, `interview-conversation`, `vlog-event`, `marketing-commerce`, `narrative-documentary`, or `website-walkthrough-promo`. Separately classify the goal and delivery. Use the category only to select protection rules and finishing priorities; do not force the same visual recipe onto every asset in a category.

## 3. Negotiate generation only after finding a gap

Ask about image-to-video or image-to-image models only when inspected source media cannot truthfully support the requested duration, shot variety, quality, background, or transition. Combine the material choices in one question: specified model versus an available model, local download versus remote generation, cost/network permission, whether new content may be invented, and which product/person/brand details must remain invariant.

Do not start a paid or remote job, download a large model, or substitute a different generator without approval. For products and brands, lock logos, packaging copy, colors, silhouette, controls, materials, and demonstrated behavior. Reject a generated shot that changes product identity or implies an unsupported feature. Keep generated sources in the project and label them in the decision record.

## 4. Stabilize, track, then enhance

Apply operations in this order:

1. Separate global camera motion from subject motion.
2. Stabilize unintended global shake and verify the required crop or border reconstruction.
3. Track the chosen semantic subject with region flow, DOM geometry, or another verified tracker.
4. Select editorial timing from clarity, motion, speech, action/result, and product visibility.
5. Add only the effects that improve comprehension, hierarchy, material character, or continuity.

Use depth-of-field for subject separation, 2.5D parallax for images with reliable layers and crop room, outline materials for deliberate subject emphasis, spotlight/frames for evidence, and transitions for a real spatial, temporal, or semantic relationship. Use at most one primary enhancement and one supporting enhancement per shot. Do not stack every available capability.

For a product highlight, acquire the product before emphasis, hold a sharp unobstructed hero state, synchronize the claim with visible evidence, and release cleanly. Choose finishing by material and category rather than by preset popularity.

## 5. Use professional motion grammar

Build shots as `establish -> guide -> acquire -> hold -> release`. Allow at most one motivated camera move per shot. Stop camera motion while the viewer reads a product, control, result, face, or caption. Use eased fixed destinations without handheld simulation, micro-jitter, breathing scale, elastic overshoot, repeated punch-ins, or competing gestures.

Drive focus boxes, leaders, spotlights, crops, and cursor gestures from the same current subject geometry. Release or omit an effect when confidence falls; never keep following the wrong target. Retake or reject footage that cannot be stabilized to the required quality rather than hiding it with motion graphics.

Keep one primary emphasis per shot. Prefer an eased keyframed crop with a still reading hold over a persistent rectangle when the target is static and high-resolution. Use a box only for precise spatial disambiguation, and never show multiple competing boxes unless the narration explicitly compares those regions. For narrated edits, first synthesize and accept separate short breath-group audio segments, using commas as default split points, space them with the shared desktop/H5 `0.4s` gap, and lock the resulting audio spine. Time every acquire, hold, release, and picture cut from that final audio rather than stretching narration to match a prebuilt visual template.

Choose the attention treatment from the evidence type: magnify small or dense evidence, underline an exact word/label/number, and frame the verified boundary of a control, card, result, product region, or other spatial unit. Prefer one treatment. When magnification is necessary, allow one supporting underline or frame only after the crop reaches its fixed destination. Remove the supporting mark before releasing the crop or cutting away. Never underline and frame the same target, stack all three treatments, or reuse coordinates that were not transformed through the final crop and scale.

## 6. Apply category finishing priorities

- `talking-head`: protect meaning and expression; stabilize/reframe faces; use restrained depth and keyword emphasis.
- `tutorial-demo`: protect instruction/action/result; use anchored cursor, focus, magnification, and step timing.
- `interview-conversation`: protect attribution and reactions; use stable speaker framing and motivated angle changes.
- `vlog-event`: protect event arc and natural sound; use flow-informed shot selection, stabilization, speed, and motivated transitions.
- `marketing-commerce`: protect product identity, proof, and brand; use product tracking, depth, 2.5D, material-aware emphasis, and approved generated coverage.
- `narrative-documentary`: protect identity, causality, atmosphere, and emotion; keep effects subordinate to story continuity.
- `website-walkthrough-promo`: protect page/claim evidence and privacy; use stable capture, DOM-anchored gestures, and the website coverage workflow.

## 7. Deliver editable and rendered artifacts

Resolve one explicit absolute `outputDirectory` before applying a completed edit. Use the user's requested directory; otherwise infer an established project output location, and ask only when no safe durable location exists. Do not place final media, evaluation fixtures, or run logs in the product repository merely because it is the current working directory.

Write both sibling deliverables for every completed video-editing task:

- `<outputDirectory>/<projectSlug>.timeline`: portable editable project containing or correctly referencing every used and generated asset;
- `<outputDirectory>/<projectSlug>.<container>`: final rendered video, normally MP4 unless the user or capability requires another container.

Planning, diagnosis, and an explicit editor-only handoff are exempt. A completed-video request is not successful when only one artifact exists. Reopen the `.timeline`, verify media links and timeline state, decode the full video, and compare duration, dimensions, frame count, visible effects/captions, and expected audio. Return both absolute paths.

Only when captions are configured, verify one audible linked speech clip covers every visible caption interval. Existing source dialogue may serve as that speech; new Agent-written text must have generated or recorded voiceover. A caption-free edit may be silent, music-led, source-sound-led, or voiced according to the brief. Reject silent text-only captions, orphan `audioClipId` values, duplicate voiceover over source speech, or caption timing that begins before or ends after its spoken content.

## 8. Reject low-quality completion

Reject delivery for visible shake, tracking drift, subject switching, blur at delivery size, unsafe stabilization crop, generated identity changes, unsupported claims, mistimed emphasis, unreadable or silent captions, missing caption-to-speech links, decorative effect stacking, or a preview/export mismatch. Technical export success alone is not a quality pass.
