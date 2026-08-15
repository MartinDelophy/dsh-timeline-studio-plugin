# Highlight hierarchy and tension design

Use this workflow for highlight edits and reference replications whose impact, emphasis, or dramatic shape matters. Fast cutting and a high average saliency score do not by themselves create tension.

## 1. Separate detection from editorial selection

Use `highlightScore` only to locate candidate moments for native-frame inspection. For each candidate, record a separate editorial assessment:

- `subjectDominance`: the intended subject is immediately identifiable and compositionally dominant;
- `actionLegibility`: anticipation, decisive motion, and result can be understood at delivery size;
- `stakesOrMeaning`: the moment changes danger, emotion, information, status, or visual scale;
- `visualNovelty`: framing, movement, environment, silhouette, or effect is meaningfully distinct from nearby shots;
- `audioAlignment`: the visible impact has a motivated relationship to an onset, accent, phrase, silence, or sound effect;
- `clarityAtApex`: the decisive frame is sharp enough and not hidden by blur, flash, crop, occlusion, or transition;
- `continuityPayoff`: the cut includes enough setup or aftermath for the viewer to understand what happened.

Do not collapse these fields into the diagnostic `highlightScore`. A high-motion, high-frame-difference interval may still be unusable when the subject is tiny, the action is unreadable, or the result is missing.

## 2. Build a role-based beat map

Assign every retained sub-shot exactly one primary role:

- `setup`: establishes subject, space, direction, or danger;
- `rise`: increases motion, proximity, scale, or consequence;
- `preImpact`: creates contrast immediately before a peak through a hold, cleaner frame, reduced motion, silence, or wider context;
- `primaryPeak`: the strongest hero action or decisive image;
- `secondaryPeak`: a supporting high point that must not equal or obscure the primary peak;
- `aftershock`: shows the result, reaction, landing, destruction, or release;
- `bridge`: preserves continuity or resets direction without competing for emphasis.

Reject a beat map in which most shots are peaks, no shot prepares the primary peak, or the strongest source moment is used as an unmotivated bridge. Choose a small peak budget appropriate to duration; for a 10–20 second short, normally use one primary peak and one or two secondary peaks unless the reference clearly proves another hierarchy.

## 3. Design the tension envelope

Create a time-aligned `tensionTarget` in `[0, 1]` before editing. Define it from beat roles and the reference's audio phrases, not from a generic rising preset. Preserve intentional valleys. A usable short-form envelope usually contains:

1. readable opening acquisition;
2. first rise and a limited secondary payoff;
3. contrast or compression before the main event;
4. a clearly dominant primary peak;
5. a visible or audible aftershock and controlled release.

Record per beat the intended tension, actual tension evidence, distance from the nearest peak, and contribution to the next payoff. Reject uniformly high intensity, metronomic same-duration cuts, and continuous effects that remove contrast. Tension requires difference: stillness makes motion stronger, a wider shot makes a close hero frame larger, and reduced density makes the next accent land.

## 4. Protect the hero frame

For every peak, identify the exact anticipation frame, action apex, hero frame, and result frame at native frame rate. Place the cut and time warp so the action remains readable:

- enter early enough to acquire the subject and direction;
- accelerate through expendable travel, not through the decisive pose;
- keep the hero frame visible for a deliberate hold appropriate to the source cadence and delivery frame rate;
- cut on motivated motion or after the result becomes legible;
- do not place maximum blur, flash opacity, zoom discontinuity, or a look switch over the only clear apex frame.

Use flash, shake, blur, speed ramps, monochrome, and punch-ins to point toward a peak. Effects must not become the peak when the source action is the intended focus.

## 5. Escalate repetition

When the reference repeats a source moment, assign an explicit repetition function: reminder, anticipation, acceleration, comparison, or climax. Preserve exact repetition when fidelity requires it. Otherwise make each recurrence editorially progressive through a justified change in duration, crop, scale, direction, rate curve, grade, entry frame, or audio relationship.

Reject filler repetition, back-to-back reuse with no new function, or a recurrence that is weaker yet placed later as though it were a climax. The final recurrence should pay off the established motif or deliberately subvert it.

## 6. Match replacement footage by dramatic function

Do not map replacement clips only by action category or average motion. Match the reference beat's role, subject scale, action phase, camera energy, clarity, novelty, and consequence. Reserve the clearest, largest, most complete action for the primary peak. Avoid spending the best shot in the opening unless the reference uses a deliberate cold open and still rebuilds a later peak.

For subject-centered edits, measure subject occupancy and center error at the anticipation, hero, and result frames. A technically centered crop is still weak when the subject is too small or the decisive silhouette is clipped.

## 7. Validate emphasis and tension separately

Compare the render and reference on the same timebase. In addition to timing and look checks, report:

- `peakRecall`: whether every reference primary/secondary peak has a mapped replacement payoff;
- `peakDominance`: whether the primary peak is measurably and perceptually stronger than adjacent beats;
- `heroFrameLegibility`: subject visibility, sharpness, silhouette completeness, and unobscured duration at each peak;
- `setupPayoffIntegrity`: whether anticipation and result frames survive the edit;
- `tensionShape`: role order, local rises/valleys, main-peak location, and release behavior;
- `repetitionEscalation`: whether repeated motifs retain their intended function and progression;
- `attentionCompetition`: whether another subject, effect, caption, or transition steals focus from the intended peak.

Reject completion when the edit is rhythmically accurate but emotionally flat, the strongest shot is not the primary peak, multiple shots compete at equal weight, the action result is missing, or effects obscure the hero frame. Do not average these failures into a general fidelity score.
