# Curves, color, and subject effects

Use this reference when planning or executing a shot that could benefit from speed shaping, color separation, foreground isolation, subject emphasis, or an authorized identity replacement. Treat these tools as editorial building blocks, not a checklist to apply to every video.

## Route the intent

| Editorial need | Preferred capability | Avoid |
| --- | --- | --- |
| Build anticipation, accent an impact, or create a readable ramp | Source-time speed curve | Random pulsing speed or a curve on dialogue that damages intelligibility |
| Match adjacent shots or shape a deliberate visual mood | Color Wheels | A one-click cast that damages skin, product colors, black detail, or highlights |
| Move a person into a new background or place graphics behind them | Person cutout | Manual coarse masking when the analyzed alpha is available |
| Isolate a product or prop for a hero composition | Product/object cutout | Treating a detection box as the final silhouette |
| Emphasize a subject while retaining the original environment | Person or object outline | Removing the background when context carries meaning |
| Replace a face for an explicitly authorized creative use | Face swap | Implicit consent, identity ambiguity, or undisclosed substitution |

Use one primary treatment per beat. Add another only when it has a separate job—for example, a product cutout changes the background while a restrained outline preserves edge contrast.

## Design speed curves in source time

Timeline Studio's Curve tab is a speed curve, not an RGB or color-grading curve. Do not promise tone-curve controls unless the live capability map later confirms them.

1. Identify source-time anchors before retiming: action onset, anticipation, contact or reveal, readable result, and release.
2. Keep the clearest consequence at normal or slightly reduced speed. Use faster motion to cross low-information travel, not to hide the product action or decisive frame.
3. Add only the nodes required by the beat. Prefer a simple `normal -> build -> peak/hold -> normal` shape over many small oscillations.
4. Keep smooth joins enabled for organic motion. Use a harder join only for an intentional mechanical or rhythmic snap that survives frame-by-frame review.
5. Recheck embedded dialogue, source sound, captions, transitions, tracked masks, and clip boundaries after retiming. Preserve the original source-time mapping in the project record.

Useful patterns:

- **Product reveal:** compress approach, settle at the first unobstructed hero frame, then release at normal speed.
- **Action impact:** preserve anticipation, accelerate the final approach, hold or slow the contact/result, then recover.
- **Tutorial evidence:** accelerate cursor travel only; return to normal before the click, state change, number, or result the viewer must read.
- **Repeated motif:** vary curves only to escalate an explicit editorial function. Do not make every recurrence faster by habit.

Reject a curve when it creates an unreadable action, stutter, frozen optical flow, lip-sync damage, broken source-audio continuity, duplicated boundary frames, or a weaker primary payoff.

## Shape and match color with Color Wheels

Use the four wheels for distinct tonal regions: shadows, midtones, highlights, and global offset. Use temperature and tint to establish neutral balance, saturation to control overall color intensity, and each wheel's hue, strength, and luminance for targeted shaping. These controls are keyframeable, but a static correction is the default; animate a grade only when the source lighting or intended look actually changes.

Work in this order:

1. Inspect representative native frames and identify the shot's black point, white point, exposure, neutral surfaces, skin, product or costume identity colors, and intended background mood.
2. Correct temperature and tint before creative color separation. Remove an accidental cast without erasing motivated warm or cool light.
3. Set global offset and tonal luminance so blacks retain texture, midtones remain readable, and highlights do not clip.
4. Shape shadows, midtones, and highlights independently. Keep skin and branded products plausible unless the brief explicitly calls for a stylized departure.
5. Adjust saturation last, then compare adjacent shots at their actual cut boundary rather than in isolation.

Useful patterns:

- **Shot matching:** neutralize exposure and white-balance differences first, then match shadow density, midtone skin or product color, highlight warmth, and saturation.
- **Product hero:** preserve the exact package and logo colors; use background or shadow color separation to increase focus instead of recoloring the product.
- **Portrait:** keep skin in a plausible midtone range, restrain complementary shadow/highlight separation, and check lips, teeth, eyes, and hair under the final output transform.
- **Day-to-night or motivated transition:** keyframe only around a real lighting or narrative change. Use the fewest grade keyframes that produce a stable transition.

Reject crushed blacks, clipped or gray highlights, hue discontinuities at cuts, flicker from dense grade keyframes, implausible skin, altered brand colors, broken costume identity, banding, or a grade that changes merely because the subject moves between tonal regions. Compare preview and export on the same frames; never approve a look from inspector values alone.

## Build cutouts from analysis

Analyze before styling. Stabilize visibly shaky footage first, then detect the intended person or object, generate the matte in source time, and track it across the shot. A product/object detection box is only a region proposal; require a silhouette alpha before calling the result a cutout.

For person cutout:

- Inspect hair, fingers, semitransparent fabric, motion blur, gaps between limbs, and contact with held objects.
- Keep objects that are clearly being worn or intentionally held when excluding them would damage the action or identity of the shot.
- Prefer a short natural edge transition over a hard halo. Preserve intentional motion blur rather than sharpening the alpha into a vibrating edge.

For product/object cutout:

- Confirm the selected instance when multiple similar objects appear.
- Preserve handles, straps, stems, spokes, transparent packaging, reflective edges, and holes in the object geometry.
- Judge the matte against both light and dark checker or contrast backgrounds before compositing.
- Do not distort branding, labels, controls, proportions, or material reflections merely to simplify the silhouette.

For video, inspect the matte at the first frame, every occlusion or fast-motion interval, every shot boundary, and the last frame. Reject target switching, missing limbs or product parts, edge chatter, stale masks after the subject exits, and a matte that lags the source.

## Apply person and object outlines

Derive the outline from the verified subject alpha. Use an outline when the surrounding scene still matters but the viewer needs faster subject acquisition.

- Match width to delivery size; inspect at the actual mobile or desktop output scale rather than only in a zoomed preview.
- Keep opacity, softness, glow, material, and shadow subordinate to the subject. Preserve facial features, product labels, and fine geometry.
- Use the person route for people and the object route for products or props; do not accept a person detector's incidental box around a product.
- Reanalyze after a trim, source replacement, crop, stabilization change, or any edit that invalidates the stored frame/mask mapping.

Good uses include creator-style speaker emphasis, product callouts, freeze-frame introductions, before/after comparisons, and a short handoff between live footage and graphic composition. Avoid a persistent thick outline across a long emotional or documentary passage unless the visual language explicitly requires it.

## Use face swap only with authorization

Require explicit permission for both the source face and people in the target media before enrollment or generation. Use a clear, front-facing, unobstructed source portrait. Record the authorization decision in the edit brief and preserve provenance for the source, target, model identity, mode, and generated asset.

Treat the current local face-swap route as a browser/WebGPU editor capability using research-model weights. Respect the license warning shown by the editor; do not present an output as cleared for direct commercial publication without separately verifying rights. Keep the result as a new My asset until the user explicitly places or replaces it on the timeline.

For video, lock one target identity and verify every face entry, exit, occlusion, profile turn, expression change, hand-to-face overlap, and shot cut. Reject target switching, identity flicker, doubled facial features, unstable skin boundaries, implausible lighting, frozen expression, altered head geometry, or frames silently changed to a different person. Prefer retaining the original frame when target confidence is insufficient.

Never use face swap to impersonate a real person deceptively, evade consent, fabricate evidence, or conceal a legally relevant identity. If intent or authorization is unclear, preserve the project and ask before generation.

## Compose effects into shots

- **Product hero:** technical Color Wheels match -> object cutout -> new but evidence-compatible background -> restrained shadow/outline -> speed curve around the reveal -> readable result hold.
- **Presenter explainer:** person cutout -> supporting graphics behind the presenter -> subtle outline only where contrast requires it -> normal speed for speech.
- **Feature proof:** retain the original screen or product context, use outline for the exact subject, and curve only low-information travel before the visible state change.
- **Authorized character transformation:** complete face swap first -> inspect identity continuity -> add the result as a new asset -> apply later timing, captions, and finishing without obscuring the disclosure or story logic.

Do not stack cutout, outline, parallax, depth, glow, and speed ramp merely because they are available. Each layer must serve subject separation, evidence clarity, rhythm, or narrative transformation.

## Execution order and verification

1. Preserve the raw source and record the intended target subject.
2. Stabilize when needed.
3. Analyze detection, segmentation/matting, tracking, or identity in source time.
4. Establish the technical Color Wheels balance and verify identity-bearing colors.
5. Review the raw mask or face result before decorative effects.
6. Apply cutout, outline, or face-swap composition, then refine the foreground/background grade only as needed.
7. Add the minimum speed-curve nodes around verified source-time anchors.
8. Preview continuously through color changes, entries, exits, occlusions, curve nodes, transitions, and the final frame.
9. Export and compare the same frames against preview. Reject grade drift, missing alpha, changed edge treatment, timing drift, or effect loss.

The current headless `project.render` subset does not provide parity for Color Wheels, speed curves, vision-derived masks, outlines, or face swap. Use the editor/browser path when these effects are required, disclose that compatibility path, preserve the editable `.timeline`, and verify the rendered video by decoding it rather than trusting UI state alone.
