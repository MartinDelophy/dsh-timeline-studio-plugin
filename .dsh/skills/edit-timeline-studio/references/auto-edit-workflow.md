# Automatic-editing workflow

Use this workflow when the user asks the Agent to decide what to cut, condense, highlight, caption, or reframe rather than specifying every edit.

## 1. Inspect, then classify

Inspect explicit input media before asking creative questions and follow [professional-editing-workflow.md](professional-editing-workflow.md). Determine all discoverable facts yourself: file count, media types, durations, dimensions, orientation, audio presence, likely language, rough speaker count, existing captions, shot density, and whether screen content or product actions are present. Analyze images directly. For video, combine representative frames, speech/OCR, semantic regions, global optical flow, and subject-region flow; do not infer importance from motion alone.

Classify on three independent axes:

- `category`: `talking-head`, `tutorial-demo`, `interview-conversation`, `vlog-event`, `marketing-commerce`, `narrative-documentary`, or `website-walkthrough-promo`
- `goal`: `cleanup`, `condense`, `highlights`, `summary`, `promotion`, `reframe`, or a user-defined goal
- `delivery`: platform, audience, aspect ratio, caption/audio requirements, and only genuinely hard platform limits

Record classification confidence as `high`, `medium`, or `low`. Do not pretend that a goal or audience can be discovered from pixels alone.

## 2. Ask only decisions that change the cut

Never ask for facts already available from the media. Do not ask every question in a template.

Ask at most three concise questions in the first round, combining related choices where useful:

1. Ask for the intended result when `goal` is unresolved: faithful cleanup, condensed explanation, highlights, summary, or promotional cut.
2. Ask for the delivery platform only when it materially changes selection, framing, or export compatibility. Do not ask for or infer a target runtime for narrated work; its duration emerges from the accepted audio spine.
3. Ask for must-keep, must-avoid, consent, claims, required steps, featured people, or story-order constraints when the category makes them important.

Default `tutorial-demo`, `vlog-event`, `marketing-commerce`, and `narrative-documentary` to a narrated treatment. Do not spend a clarification question asking whether to add narration unless the user has requested source-only, music-only, or silent delivery. First reuse authorized source speech that already communicates the required beat; synthesize only the missing Agent-authored narration, and never duplicate spoken source content.

Then ask no more than two category-specific follow-ups. State the proposed defaults in the same message. Continue with safe defaults if the user does not answer a preference question; stop only for a genuinely blocking decision.

Use these category-specific questions selectively:

- `talking-head`: How aggressively may pauses, filler words, false starts, and repeated ideas be removed? May complete statements be reordered?
- `tutorial-demo`: What must the viewer be able to complete? Which steps must remain, and may waiting/loading sections be shortened or accelerated?
- `interview-conversation`: Which speaker, question, or thesis should lead? May answers from different moments be combined while preserving truthful context?
- `vlog-event`: Should chronology or energy/emotion lead? Which people, places, moments, or privacy exclusions are mandatory?
- `marketing-commerce`: What audience, substantiated claims, proof, offer, brand requirements, and call to action must appear?
- `narrative-documentary`: Who or what is the story focus? May chronology change, may the result reveal outcomes, and which causal events are indispensable?
- `website-walkthrough-promo`: What public or authorized URL and user journey should be recorded? Which audience, value proposition, pages/actions, privacy exclusions, and call to action are required? Determine whether the requested product surface is login-gated; if it is, ask the user to sign in themselves in the selected browser before authenticated inspection, without requesting credentials. If generated narration is desired, ask one combined voice question covering language, voice gender/presentation or speaker, and delivery style.

After inspection, ask one additional combined generation question only when source coverage is insufficient and image-to-video or image-to-image would materially improve the requested result. Confirm the model/source, download or remote execution, possible cost, permission to invent new pixels or scenes, and identity-locked product/person/brand details. Do not ask this when direct editing and built-in effects are sufficient.

## 3. Normalize an editable brief

Preserve the original prompt and normalize inferred, confirmed, and defaulted decisions separately. Use this conceptual shape; it is an editorial record, not a claim that every field is currently accepted by the command runner:

```json
{
  "category": "tutorial-demo",
  "classificationConfidence": "high",
  "goal": "condense",
  "audience": "first-time users",
  "platform": "short-video",
  "targetDurationSeconds": 60,
  "aspectRatio": "9:16",
  "pace": "compact",
  "tone": "clear",
  "narrationLanguage": "zh-CN",
  "voiceProfile": {
    "genderPresentation": "female",
    "speakerId": "owned-voice-id",
    "style": "confident-warm"
  },
  "outputDirectory": "/absolute/path/to/delivery",
  "generationPolicy": { "needed": false, "approvedModel": null, "identityLocks": [] },
  "enhancementPolicy": {
    "stabilize": "when-needed",
    "primaryEffectPerShot": 1,
    "supportingEffectPerShot": 1
  },
  "websiteCoverage": {
    "manifestStatus": "complete",
    "authenticationScope": "user-signed-in",
    "claimEvidencePolicy": "verified-or-labeled"
  },
  "mustKeep": ["upload", "edit", "export result"],
  "mustAvoid": ["private account details"],
  "captionPolicy": "complete-language-aware",
  "audioPolicy": "preserve instruction audio",
  "musicPolicy": "quiet-background",
  "categoryConstraints": {
    "preserveActionResultPairs": true,
    "shortenWaiting": true
  },
  "confirmed": ["goal", "mustKeep"],
  "defaulted": ["targetDurationSeconds", "aspectRatio"],
  "unresolved": []
}
```

Show the user any consequential default before applying it. Never encode unsupported operations in a command plan.

## 4. Build a decision record before editing

Produce a source-time decision record containing:

- semantic sections and shot boundaries when observable;
- transcript spans, speakers, silence, repeated ideas, and confidence where available;
- visual or audio quality risks;
- global-shake estimates, stable intervals, semantic subject tracks, and optical-flow confidence where video is present;
- image resolution, crop room, depth-layer confidence, and generation suitability where stills are present;
- proposed keep, remove, shorten, reorder, or speed-change decisions;
- a concise reason and confidence for each consequential decision;
- caption segmentation and audio-continuity expectations;
- unsupported analyses or ambiguous decisions requiring human review.

Do not treat silence removal as automatic approval to cut. Protect breaths that carry emotion, pauses needed for comprehension, action/result timing, sentence boundaries, musical phrases, and conversational turn-taking.

## 5. Apply the category policy

- `talking-head`: Preserve factual meaning and natural delivery. Prefer removing false starts, duplicate thoughts, and excessive dead air over sentence-level rearrangement.
- `tutorial-demo`: Treat instruction, visible action, and visible result as one protected unit. Never create an efficient but impossible tutorial.
- `interview-conversation`: Preserve speaker identity, question-answer relationships, attribution, and truthful context. Reject edits that manufacture a claim.
- `vlog-event`: Prefer varied, technically usable shots with a clear opening, progression, and ending. Avoid repetitive coverage and music-only rhythm that erases meaningful natural sound.
- `marketing-commerce`: Lead with the agreed audience problem or product value, retain proof for claims, respect brand constraints, and end with the agreed call to action. Track and hold products at their sharpest useful moments; use approved depth, 2.5D, outline, material emphasis, transitions, or generated coverage only when they improve evidence and preserve exact product identity. Never invent claims or offers.
- `narrative-documentary`: Preserve character identity, causality, spatial/temporal comprehensibility, and the agreed spoiler/order policy.
- `website-walkthrough-promo`: Inspect the live website before scripting and follow [website-promo-workflow.md](website-promo-workflow.md). Complete a page/flow coverage manifest, separate verified public or authenticated evidence from marketing claims, and ask the user to sign in themselves when required pages are gated. Prefer a script-driven real browser capture for interactive or video-rich pages, and require meaningful real interaction or visible state change in each non-establishing scene. Use static snapshots only when live capture is unavailable or a deliberate graphic treatment is requested; snapshots must be high-resolution, visually reconstructed with owned vector/icon assets where useful, and never enlarged past visible sharpness. Build a short truthful interaction path around the agreed audience outcome, capture only authorized pages and actions, hide personal or secret information, and preserve enough cursor/navigation context for viewers to understand each step. Keep the page plane stable and use deliberate cursor, bracket, spotlight, anchored frame, and controlled-scroll gestures; stop motion while evidence is being read and reject jitter, drift, repeated punch-ins, or decorative movement. Confirm narration language, voice gender/presentation or speaker, and delivery style before generation; prefer owned pinned voice models and never silently fall back to an operating-system voice. Do not submit purchases, publish content, send messages, change account data, accept legal terms, or perform another consequential action merely to obtain footage. Never present screenshots as a real-time recording without the user's agreement.

## 6. Caption as an editorial pass

Generate or revise captions only from the final spoken edit. For Agent-authored narration, synthesize separate short breath-group audio files first: sentence endings always split, and a comma is enough to create a new synthesis segment unless that would produce a meaningless fragment or break a proper name, number, URL, fixed expression, or bilingual phrase. Prefer the editor's owned, pinned browser-local voice for the requested language; use a remote service, operating-system voice, or unowned runtime only after local synthesis is unavailable and the user explicitly approves the fallback. Arrange the accepted clips with the shared desktop/H5 default `0.4s` gap and lock that audio spine before cutting or timing the picture. Let the measured audio duration and pauses determine scene lengths, visual changes, and caption boundaries; never force accepted narration to follow a prebuilt picture timeline. When captions are configured, none may be a silent text layer. When captions are absent, narration still defaults on for `tutorial-demo`, `vlog-event`, `marketing-commerce`, and `narrative-documentary`, while other categories follow the brief and content. Transcription captions must bind to their existing source-speech clip, while every Agent-authored narration, explanatory, promotional, or text-led caption requires generated or recorded voiceover first. Do not synthesize a second voice over already-spoken source dialogue. When no authorized speech route is available, do not create the caption.

Lock the speech performance before caption segmentation. Split captions by meaning, syntax, breath, and shot context rather than fixed character counts. Keep captions readable, avoid very brief flashes, use at most two lines unless the user's format requires otherwise, and flag reading-rate outliers instead of silently dropping words. Preserve names, numbers, product terms, and uncertainty from low-confidence transcription for review.

Verify caption timing after every source-time edit. Require exactly one matching audible speech clip and `audioClipId` for each visible caption, with the caption interval contained by the spoken interval. Check safe placement against faces, hands, product controls, screen UI, and existing overlays.

## 7. Verify the finished edit

Verify both structural correctness and editorial quality. Preview every cut, caption boundary, protected action/result pair, speaker transition, music edit, tracked emphasis, stabilization result, effect transition, and final frame. Reject visible shake, drift, subject switching, generated identity changes, effect stacking, or motion that continues while evidence must be read. For every completed edit, write and reopen the `.timeline` project and fully decode the sibling result video in the resolved output directory; completion requires both artifacts.

For a repeated evaluation run, use [auto-edit-scenarios.md](auto-edit-scenarios.md) and [e2e-evaluation.md](e2e-evaluation.md). Keep fixture media, renders, screenshots, scorecards, and run logs outside the product repository.
