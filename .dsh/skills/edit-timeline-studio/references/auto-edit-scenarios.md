# Automatic-editing scenario matrix

Use these scenario cards to improve the Skill through repeatable real-media runs. Do not store evaluation media, rendered outputs, screenshots, run logs, or a QA workspace in the product repository.

## Run protocol

For every run:

1. Start from a fresh project and an explicit fixture manifest; never sweep an unapproved directory.
2. Preserve the user's prompt verbatim.
3. Save the inferred classification, confidence, questions, answers, defaults, normalized brief, and source-time decision record.
4. Save the editable `.timeline`, final render when requested, media probes, and a scorecard outside the repository.
5. Record the first failure before using a fallback.
6. Classify each finding as `skill`, `product`, `browser-control`, or `environment`.
7. Change one smallest relevant instruction or product behavior, validate, rerun the failed scenario, and run one adjacent scenario.

Apply hard gates before subjective scoring:

- Every completed editing run writes a reopenable `.timeline` project and a fully decodable result video to the declared output directory; neither artifact substitutes for the other.
- The project reopens with the intended media identity, timing, track state, and captions.
- No required statement, step, person, claim, action result, or causal event is lost.
- No cut lands inside a protected word, action/result unit, conversational turn, or musical dependency.
- Caption content and timing match the final audio; no caption is silently omitted because recognition confidence is low.
- The decoded export has the requested dimensions and duration, visible intended content, and the expected non-silent audio.
- Image decisions record sharpness, crop room, subject/product identity, and whether direct use, depth/2.5D, image-to-image, image-to-video, or rejection was selected.
- Video decisions combine semantics with global and region optical flow, stabilize unintended shake before tracking, and reject drift, subject switching, unsafe crops, or motion-only importance guesses.
- Each shot uses no more than one primary and one supporting enhancement; generated shots preserve approved identity locks and effects stop moving while evidence is read.

After hard gates pass, score each area from 1–5: content understanding, selection decisions, temporal coherence, pacing, caption editorial quality, audio continuity, visual composition, request adherence, editability, and verification evidence. Keep the per-area scores; do not hide a weak area behind one aggregate number.

## Scenario 1: Chinese talking-head cleanup and condensation

**Fixture:** One 3–10 minute Chinese talking-head video with clean speech, natural pauses, at least two false starts, one repeated idea, one intentional rhetorical pause, names or domain terms, and usable embedded audio.

**Canonical request:** `把这段口播自动剪成一条适合发布的短视频，去掉口误和冗余，配上完整中文字幕。`

**Expected classification:** `talking-head`; unresolved goal strength and delivery length must not be guessed silently.

**Ask only if missing:** Target platform/duration; cleanup strength; whether complete statements may be reordered; must-keep claims or terms.

**Default:** Preserve order, remove only obvious false starts/repetition and excessive dead air, retain rhetorical pauses, keep source voice, use language-aware complete captions, and avoid decorative effects.

**Acceptance focus:** No manufactured sentence, mid-word cut, clipped breath, repeated-frame flash, subtitle mismatch, or removal of the designated must-keep point. Opening reaches the topic promptly without sounding unnaturally rushed.

**Adjacent stress variant:** Add mild room noise, one low-confidence name, and a sentence where removing a pause changes emphasis.

## Scenario 2: Product or software tutorial

**Fixture:** A 4–12 minute narrated screen recording or physical product demonstration containing setup, three required actions, visible results, loading/waiting time, one failed attempt, and one privacy-sensitive region.

**Canonical request:** `把这个教程自动精简，保留必要步骤和结果，配字幕，做成新手能跟着完成的版本。`

**Expected classification:** `tutorial-demo`.

**Ask only if missing:** The viewer's required outcome; mandatory steps; treatment of failed attempts; permission to speed up waiting; delivery platform.

**Default:** Preserve action/result pairs and original order, remove the failed attempt only when it teaches nothing, shorten waiting with a truthful visual indication, mask or omit private information, and keep instructional audio intelligible above music.

**Acceptance focus:** A new viewer can reproduce the task. No spoken instruction precedes or follows the wrong visual action, no required click/result is omitted, and captions do not cover the active control.

**Adjacent stress variant:** Include a long progress bar, repeated clicks, small UI text, and a narrator correction that changes the correct action.

## Scenario 3: Multi-speaker interview or podcast

**Fixture:** A 10–25 minute two-person conversation with identifiable turns, one interruption, one follow-up question, one repeated answer, natural reaction pauses, and at least one statement that would become misleading out of context.

**Canonical request:** `提炼这段访谈的核心观点，保留问答关系并生成字幕。`

**Expected classification:** `interview-conversation`.

**Ask only if missing:** Featured speaker or thesis; target duration; whether separate answers may be combined; topics that must remain or be excluded.

**Default:** Preserve chronology and attribution, keep the minimum question context needed to understand each answer, retain meaningful reactions, and do not combine nonadjacent statements into a new claim.

**Acceptance focus:** Speaker identity and question-answer relationships remain clear. No interruption is mistaken for filler, no quote changes meaning, and captions follow the correct speaker where speaker data is available.

**Adjacent stress variant:** Add overlapping speech, off-camera questions, similar voices, and a pronoun whose meaning depends on the prior question.

## Scenario 4: Vlog, travel, or event highlight

**Fixture:** Fifteen to thirty explicit clips with mixed durations, redundant coverage, natural sound, a few weak or shaky shots, a beginning/middle/end event structure, and optional licensed music.

**Canonical request:** `把这些活动素材自动剪成一条有节奏的精彩回顾，保留现场感并配必要字幕。`

**Expected classification:** `vlog-event`.

**Ask only if missing:** Chronology versus energy; featured people/places/moments; target duration/platform; music direction and privacy exclusions.

**Default:** Preserve a comprehensible event arc, use varied technically acceptable shots, retain selected natural-sound moments, avoid repeating the same action, and use music only when authorized.

**Acceptance focus:** The cut has an opening, progression, and ending; shot selection is diverse; no essential person or moment is omitted; music edits do not erase meaningful natural sound or end abruptly.

**Adjacent stress variant:** Mix landscape and portrait clips, silent B-roll, inconsistent frame rates, one duplicate file, and one private bystander exclusion.

## Scenario 5: Product marketing or commerce short

**Fixture:** Product footage, demonstration/proof shots, approved product facts, brand assets, one offer or call to action, and optional presenter audio. Include one visually attractive shot that does not support the main claim.

**Canonical request:** `把这些素材自动剪成一条产品推广短视频，突出核心卖点，配字幕和结尾行动提示。`

**Expected classification:** `marketing-commerce`.

**Ask only if missing:** Target audience; one primary value proposition; approved claims/proof; offer and call to action; brand and platform requirements.

**Default:** Do not invent claims, prices, urgency, testimonials, or offers. Prefer problem/value, proof, then call to action; omit unsupported beauty shots when they weaken clarity.

**Acceptance focus:** Every material claim is supplied and supported, the product shown matches the spoken claim, required brand elements are legible, and the agreed call to action is present without obscuring the product.

**Adjacent stress variant:** Include conflicting draft prices, an unapproved superlative in speech, and brand text near the caption safe area.

## Scenario 6: Narrative or documentary condensation

**Fixture:** A 5–20 minute scene sequence with named people, setup, causal events, an emotional beat, outcome, ambient sound, and at least one visually strong but causally confusing shot.

**Canonical request:** `把这段内容精简成一个完整的小故事，保留人物关系和情绪。`

**Expected classification:** `narrative-documentary`.

**Ask only if missing:** Story focus; target duration; chronology/reordering permission; spoiler policy; indispensable events or people.

**Default:** Preserve chronology, causality, identity, and the core emotional turn. Prefer removing redundant coverage over restructuring the story.

**Acceptance focus:** A first-time viewer can explain who acted, what changed, and why. No continuity edit reverses causality, no emotional pause is removed as dead air, and captions or music do not flatten the key emotional beat.

**Adjacent stress variant:** Add a flashback-like shot without metadata, an off-screen narrator, two similar-looking people, and an ending whose interpretation depends on ambient sound.

## Scenario 7: Website walkthrough and promotional recording

**Fixture:** One public or user-authorized website with multiple primary marketing pages, at least one login-gated product page or state, a meaningful two-to-five-step journey, at least one loading or animated state, responsive behavior, and a clear user benefit. Use a dedicated non-production account when authentication is necessary; never store credentials in the fixture or run record.

**Canonical request:** `访问这个网站，了解它的主要功能，录制一段操作过程，再剪成一条带字幕和推广说明的视频。`

**Expected classification:** `website-walkthrough-promo`. Treat website inspection/capture and editorial assembly as separate phases.

**Ask only if missing:** Authorized URL and whether sign-in is required; target audience and primary value proposition; exact journey or outcome to demonstrate; prohibited pages/data/actions; target platform/duration; live narration, generated voiceover, or text-led presentation; approved call to action. For generated voiceover, combine narration language, voice gender/presentation or explicit speaker, and delivery style into one question.

**Default:** Build a manifest of every primary page and requested product flow, inspect without mutating external state, and classify each material statement as verified public, verified authenticated, official marketing claim, or not verified. When authentication is required, ask the user to sign in themselves in the selected browser and never request credentials; if they decline, limit the video to the public surface. Use only public or explicitly authorized pages, demonstrate one coherent value path, avoid purchases/submissions/messages/account changes, omit personal data and secrets, preserve readable cursor and page context, use concise explanatory captions, and make no unsupported product claim. Prefer script-driven live capture with a real hover, cursor, click, scroll, filter, tab, playback, or result transition in every non-establishing scene. Keep the page plane stable and guide attention with anchored cursor, bracket, spotlight, callout, and focus-frame gestures; allow no more than one motivated camera move per shot and hold the evidence still. When only snapshots are possible, capture above delivery resolution, use crops rather than raster enlargement, and add restrained owned icon/vector motion, depth, and callouts so the result is intentionally graphic rather than a lifeless slideshow. If the available browser surface cannot create a real recording, report that exact limitation and obtain agreement before using this snapshot treatment. Do not guess a voice profile: obtain language, voice gender/presentation or speaker, and delivery style before generation, and use an owned pinned model unless the user approves another source.

**Capture plan:** Record a clean initial state, each navigation/action, the visible response or result, and a stable ending. Rehearse the path before capture. Close unrelated tabs and overlays when permitted, use a consistent viewport, wait for meaningful states instead of arbitrary delays, and retake rather than hiding a broken interaction with deceptive editing. For moving footage, bind focus boxes and zooms to semantic DOM targets or stable optical-flow tracks; reject jitter, drift, late acquisition, and boxes that cover the evidence they are meant to emphasize.

**Acceptance focus:** The coverage manifest accounts for every primary page and required flow, including gated or intentionally excluded areas. No inaccessible capability is described as verified, the user performs any required sign-in without sharing credentials, and the viewer can distinguish observed behavior from official claims. The viewer can understand what the site does, who benefits, and how the demonstrated journey works. The recording contains no private information, accidental notifications, misleading loading cuts, destructive actions, invented claims, or cursor movements that contradict the narration. Captions and callouts do not hide the active control or result. Small text and brand marks remain sharp at delivery size; the page plane does not shake; camera moves are singular and motivated; motion stops for reading; overlays match the brand palette; tracked callouts remain stable; every non-establishing scene shows a truthful interaction or state change; narration uses the confirmed language and voice profile; names, URLs, numbers, and product terms sound correct; no shot passes merely because it is technically visible.

**Adjacent stress variant:** Require sign-in, include a cookie banner, delayed loading, an animation, responsive mobile capture, a sensitive account area that must not be shown, and one external-state-changing button that must be demonstrated without activation.

## Clarification-quality checks

For every scenario, separately record:

- `unnecessaryQuestions`: discoverable facts or preferences that did not affect the cut;
- `missedQuestions`: unresolved decisions that materially changed the result;
- `answerUse`: whether confirmed answers actually changed the plan and timeline;
- `defaultSafety`: whether unanswered preferences used the stated safe defaults;
- `classificationChange`: whether new evidence caused the category or confidence to update truthfully.

An Agent does not pass merely because the render completes. It must ask the right minimum questions, make category-appropriate decisions, and preserve a reviewable editable result.
