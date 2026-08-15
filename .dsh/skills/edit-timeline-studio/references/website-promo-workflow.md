# Website promotion capture and motion workflow

Use this reference for `website-walkthrough-promo`. Treat capture quality, editorial emphasis, and visual design as separate requirements.

## 1. Audit page coverage and authentication

Build a page/flow coverage manifest before writing conclusions or narration. Discover the primary product surface from visible navigation, footer links, sitemap/routes when available, and the authorized application shell. Cover every primary page and state relevant to the requested product story; sample representative detail pages rather than pretending to exhaust unbounded user-generated content.

Record for each page or flow: URL/route, purpose, access state (`public`, `login-required`, `external`, or `consequential`), inspection status, key evidence, privacy risk, and capture eligibility. Classify every material statement as `verified-public`, `verified-authenticated`, `official-marketing-claim`, or `not-verified`. Landing-page copy alone does not verify logged-in behavior.

When a required page is login-gated, ask the user to sign in themselves in the selected browser and tell the Agent when the session is ready. Never ask for a password, one-time code, recovery secret, cookie, or token; never inspect credential storage, bypass access controls, or create an account without explicit approval. Prefer a dedicated non-production account. A signed-in session authorizes observation only within the agreed scope; it does not authorize purchases, publishing, messages, account changes, legal acceptance, or other consequential actions.

If the user cannot or does not want to sign in, continue only with the public surface, mark gated capabilities `not-verified`, and constrain the promo claims accordingly. Rehearse all covered primary pages and the chosen end-to-end journey before capture; do not inspect only the hero page and infer the product experience.

## 2. Choose the capture path per scene

Classify every scene before capture:

- `live-dom`: A public or authorized page can be driven in a real browser. Prefer this for navigation, search, filters, hover states, scrolling, and visible results.
- `embedded-video`: The page contains relevant moving footage or a product demo. Capture the approved segment directly and preserve its original cadence.
- `high-resolution-snapshot`: Live capture is unavailable, unstable, or intentionally replaced by a graphic composition. This is a designed fallback, not a fake recording.

A single promo may mix all three. Do not force one weak capture mode across the whole video.

## 3. Script-driven live capture

Inspect the page first and identify semantic targets, expected visual states, and privacy exclusions. Rehearse before recording. A capture script may temporarily drive scroll, pointer movement, focus, hover, playback, and reversible input on the authorized page. It may add an ephemeral presentation layer for a cursor halo or capture-safe focus marker when that layer does not change application data or misrepresent the product.

Do not inject code that submits forms, changes account or application state, intercepts credentials, reads unrelated private data, bypasses access controls, suppresses material disclosures, or alters the product result. Remove temporary presentation styles after capture. Record the real visible browser output; a sequence of screenshots is not a live recording.

Prefer semantic selectors and observed element bounds over hard-coded screen coordinates. Wait for meaningful states such as a result list, active tab, loaded player frame, or completed animation. Use deterministic scroll curves and cursor paths, but keep natural pauses long enough for comprehension.

Every live website scene must contain a meaningful visible interaction or state change unless it is deliberately serving as an establishing or closing shot. Valid interaction cues include a real hover state, cursor approach, click ripple, controlled scroll, search/filter response, tab change, media playback, loading-to-result transition, or reversible form preview. Do not add a fake click or fabricated result merely to make a static page appear interactive.

## 4. Stable gesture and camera grammar

Keep the viewport and page plane stable by default. Design each explanatory beat as: establish context, guide attention, acquire focus, hold the evidence still, then release. Use cursor approaches, hover states, click ripples, controlled scrolls, underlines/brackets, spotlight masks, callout leaders, or anchored focus frames as the primary gestures.

Allow at most one motivated camera move in a shot. Use eased keyframes to a fixed destination, stop all camera motion while the viewer reads, and hold the result long enough for narration and captions to land. Bind the cursor, leader, and focus frame to current DOM bounds or a verified tracked region. Prefer opacity, mask, and short position transitions over perpetual scale drift.

Reject handheld simulation, micro-jitter, repeated punch-ins, elastic overshoot, competing gestures, unanchored boxes, scroll-and-zoom combinations that fight each other, or constant Ken Burns movement. A gesture must point to evidence or explain a relationship; decorative motion alone is not a valid interaction cue.

Use one primary attention target per shot. Do not draw several focus boxes at once or outline a broad page region when the narration names one control, result, score, or card. Prefer a stable keyframed crop when magnification alone can explain the target: establish the full page, ease to one fixed crop, stop completely for reading, then ease back to context or cut. A useful default is a 0.5–0.9 second push, a 2–5 second motionless hold sized to the spoken phrase, and a 0.5–0.9 second release. Do not keep a box visible for the entire scene or the entire video.

Use a focus box only when it adds information that magnification, cursor approach, spotlight, underline, or page state does not. Bind it to verified DOM bounds or a frame-specific measured region, use modest padding, and inspect the rendered frame at delivery size. Reject boxes that include neighboring cards, miss the target edge, obscure text, compete with captions, or remain after the narration has moved on.

### Choose magnification, underline, or framing deliberately

Classify the evidence before styling it:

- Use `magnify` when the target is correct but too small or dense to read at delivery size. Ease to one fixed crop, normally about 1.05–1.20× for a high-resolution website capture, then stop completely. Increase beyond that only when the source remains sharp and sufficient context survives.
- Use `underline` for an exact title, label, menu item, number, score, status, or short phrase. Measure the visible text bounds, animate the line left-to-right after the camera settles, offset it below the glyphs without striking through them, and match one established brand accent.
- Use `frame` for the exact spatial boundary of a control, field, button, card, chart, selected result, or grouped region whose enclosure matters. Derive the rectangle from current DOM geometry or a verified frame-specific region, add restrained padding, and keep the stroke clear of the content.

Combine treatments only when they solve different problems. Prefer `magnify`, `underline`, or `frame` alone. Allow `magnify + underline` for small textual evidence and `magnify + frame` for a small bounded control or result. Do not underline and frame the same target, and do not stack all three. For a comparison, emphasize targets sequentially; show two simultaneous frames only when the narration explicitly compares both at that moment.

Sequence a combined beat as `establish -> magnify -> stop -> reveal underline/frame -> hold -> remove underline/frame -> release/cut`. Never animate a line or frame while the camera is still moving. The secondary treatment should acquire just before the corresponding spoken phrase, remain motionless while it is read, and disappear when the narration leaves the evidence.

At 1080p, start with a 2–4 px underline or frame stroke and roughly 6–14 px of frame padding, then adjust from the real target size and brand style. Preserve rounded corners when they communicate the underlying component boundary. Verify geometry on the rendered delivery frame; source coordinates are invalid after crop, scale, responsive reflow, or zoom unless they are transformed through the same composition.

## 5. Moving footage, focus boxes, and zooms

Use DOM geometry when the target remains a page element. Use the editor's optical-flow capability when the target moves inside video or canvas content. Initialize from a high-confidence keyframe or semantic region, then propagate the region through the shot.

The tracked focus treatment must:

- acquire before the narration names the target;
- remain visually locked without jitter, drift, or size pumping;
- include padding so the box does not touch text or faces;
- avoid covering the target with labels;
- ease into and out of zooms rather than snapping;
- release the track when confidence falls instead of following the wrong object.

Keep a wider context before the punch-in, hold the focused result, then return or cut with a motivated transition. Optical flow reduces manual labor; it does not lower the visual acceptance bar.

## 6. Snapshot reconstruction and owned assets

Capture snapshots above the delivery resolution, ideally at a device-pixel ratio or tiled resolution that preserves small UI text after the planned crop. Never repair a visibly soft capture by enlarging and sharpening it. Re-capture, crop from a higher-resolution source, or replace unreadable micro-detail with an honest simplified graphic.

Use owned library assets to add meaning, not clutter. Match page concepts to relevant brand marks, product-category icons, interface symbols, arrows, particles, or abstract depth layers. Prefer vector assets and transparent high-resolution rasters. Animate only a few hierarchy-bearing elements per scene with consistent entrance, emphasis, and exit behavior.

Useful treatments include shallow parallax between well-separated page, icon, and label layers; a short icon reveal tied to narration; masked light sweeps; anchored position transitions; and depth-of-field separation. Stop the treatment while evidence is read. Avoid decorative stickers that do not explain the product, continuous scale drift, constant bouncing, excessive glow, repeated preset motion, or asset styles that conflict with the site's brand.

If the owned library lacks brand/service taxonomy, vector masters, palette metadata, motion families, or licensing/source metadata, record that as a capability gap rather than silently using low-quality substitutes.

## 7. Voiceover intake and owned models

Before generating narration, ask one compact combined question for the desired narration language, voice gender or presentation, and delivery style when the user has not already specified them. Do not infer narration language from the website language alone. Offer only voices that the available owned model actually supports, and identify a voice by its model/speaker identity rather than presenting a system voice as an owned model.

Prefer the editor's owned browser voice models and their pinned provider mirrors over operating-system speech. Use ModelScope first for Chinese or domestic sessions and the equivalent Hugging Face mirror as fallback, preserving one provider-independent cache identity. Never silently substitute another language, speaker, remote service, or system voice when the selected model is unavailable.

For Chinese or mixed Chinese/English narration, cast 晴岚 / `zh_f_qinglan` or 若溪 / `zh_f_ruoxi` from the owned Hojo TTS Light 80M FP16 WebGPU bundle and keep one stable speaker per narrator or character. Use the shared headless adapter when current capability inspection confirms it exists. Until that adapter is implemented, TTS is a verified UI-only operation: start the local editor, use AI Voice, export the generated clips and portable project, and validate them. Never substitute MeloTTS, the retired Kokoro Chinese bundle, an operating-system voice, or another unowned runtime merely to avoid the browser step. Reuse the same pinned mirrors, cache identity, text preparation, speaker ID, and output validation across future direct and current UI paths.

Normalize the voice brief as:

- narration language and locale;
- voice gender/presentation or explicit speaker;
- age impression when supported;
- tone, pace, energy, and pronunciation notes;
- required names, brand terms, URLs, and number readings;
- caption language and whether it matches narration.

Generate narration before final motion timing. Align cursor arrival, interaction, focus-box acquisition, zoom hold, and visible result to the corresponding spoken phrase. Verify names and product terms by listening to the rendered audio, not only by inspecting text.

Treat voice generation as the timing master. Generate the intended speaker at a natural model pace first, preserve sentence and paragraph pauses, then measure the final audio and derive scene boundaries from spoken clauses. For professional English narration, prefer a calm conversational cadence around 125–155 words per minute unless the user requests another style. Treat the resulting runtime only as a measurement: do not globally accelerate, stretch, pad, shorten, or rewrite a finished voice merely to approach an estimated duration. A longer or shorter result is acceptable. If the user explicitly identifies a non-negotiable platform upload cap, report the mismatch and obtain direction before changing the script or voice.

Listen to the full result before editing picture. Reject a voice for rushed delivery, uniform sentence rhythm, missing breaths or pauses, clipped word endings, unstable loudness, incorrect product pronunciation, or synthetic discontinuities between chunks. Use short punctuation-aware breath groups with consistent speaker state: sentence endings always split, and commas are default synthesis boundaries unless splitting would create a meaningless fragment or break an indivisible expression. Use the shared desktop/H5 `0.4s` timeline gap between accepted voice clips. Let the picture run longer than the initial estimate when the user's duration is approximate and natural delivery needs it.

## 8. Visual direction and rhythm

Write a scene-level hierarchy before editing: primary subject, supporting evidence, motion cue, narration claim, and exit motivation. Establish a coherent palette from the site and one accent system for callouts. Vary shot scale and motion purpose; do not place the same rectangle and zoom on every scene.

Use an intentional rhythm: establish, guide, prove, release. The viewer should always know where to look, but should not feel constantly pushed. Preserve enough time to read product names, key controls, and results. Let narration and motion land together.

## 9. Hard quality gates

Reject and redo a scene when any of these fails:

- source text, logos, or UI details are visibly soft at delivery size;
- the coverage manifest omits a primary page or required flow without disclosing the limitation;
- narration presents a marketing claim or inaccessible logged-in behavior as personally verified;
- a crop exposes insufficient source resolution;
- the page plane, cursor, focus frame, or callout visibly shakes, drifts, overshoots, or keeps moving while evidence should be read;
- pointer, scroll, playback, box, or zoom timing contradicts the narration;
- more than one primary focus target competes in a shot, or a focus box is broader than the named evidence;
- an underline misses its text, crosses glyphs, spans unrelated words, or animates while the camera moves;
- a frame uses stale pre-crop coordinates, encloses neighboring UI, or combines redundantly with an underline on the same target;
- magnification makes the source soft, removes necessary context, or is paired with more than one secondary attention treatment;
- narration was globally sped up to meet an approximate duration, sounds rushed, or lacks natural phrase and sentence pauses;
- optical-flow tracking jitters, drifts, switches identity, or loses the target;
- overlays obscure the active control, result, face, or caption safe area;
- iconography is generic, irrelevant, inconsistent, or visibly lower quality than the page;
- the scene lacks a clear visual hierarchy or looks like an unmodified screenshot;
- motion feels like a repeated preset rather than a deliberate explanation;
- an interactive scene contains no meaningful interaction or visible state change without a clear editorial reason;
- the narration uses an unconfirmed language or voice profile, an unapproved fallback, or visibly mismatched caption language;
- brand names, URLs, numbers, or product terms are pronounced incorrectly;
- a brand or product claim is unsupported by the inspected page or user-provided facts.

Review at actual delivery size, not only zoomed in. Score sharpness, hierarchy, brand coherence, motion quality, tracking stability, pacing, and claim-to-evidence alignment separately from technical export validity.
