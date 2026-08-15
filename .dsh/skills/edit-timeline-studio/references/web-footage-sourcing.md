# Provider-neutral web footage sourcing

Use this workflow when the user has insufficient source footage or asks for suggestions about places to find downloadable video. Keep recommendations current and task-specific; do not make any platform, provider, or brand a permanent skill dependency.

## 1. Suggest categories before providers

Choose the most relevant source categories for the job:

- rights-holder, studio, publisher, organization, or creator-owned channels;
- official press, electronic press-kit, publicity, or media-library portals;
- stock footage libraries with explicit license terms;
- creator and short-video platforms where the uploader enables a platform-provided save or download;
- public or institutional archives with item-level rights statements;
- the user's owned, licensed, purchased, commissioned, or previously downloaded media library.

Use current web search to discover viable providers in the user's region and for the requested subject. Recommend only a small set that is materially different in availability, licensing, cost, sign-in requirements, quality, or content fit. Do not make the skill's wording or workflow depend on a named provider.

## 2. Evaluate every candidate separately

For each platform or asset candidate, record:

- publisher identity and whether the account or domain is the original rights holder, an authorized distributor, a creator, a stock provider, or an unverified repost;
- asset URL, title, publisher/account, access date, and exact content represented;
- whether download is explicitly provided by the platform or publisher, requires sign-in, purchase, subscription, or approval, or is streaming-only;
- item-level license or permitted-use statement, commercial-use status, attribution requirement, modification limits, territory, and uncertainty;
- dimensions, frame rate, duration, audio, watermark/provenance marks, compression quality, and available variants;
- shot-function fit, subject visibility, action, framing, aspect ratio, source-time range, and expected crop loss;
- whether the asset contains third-party music, logos, faces, performances, or other rights that the download permission does not automatically resolve.

Keep `downloadability`, `source authenticity`, and `reuse rights` as separate fields. A downloadable file is not automatically licensed for editing, publication, advertising, or commercial use. A verified account is not automatically a grant of reuse rights.

## 3. Use short-video platforms safely

Short-video and social platforms may be suggested when they offer current, relevant footage and a creator- or platform-provided save/download action. Prefer the original publisher or authorized account over reposts. Retain the platform watermark, account identity, disclosure, and other provenance unless the rights holder provides a clean authorized master.

Do not use third-party downloaders, unofficial parsing services, credential forwarding, DRM bypass, private endpoints, watermark removal, or methods that defeat a disabled download control. Do not treat an app cache or offline-viewing copy as an editable media file unless the platform explicitly permits export.

If a suitable streaming post is not exportable, recommend it as a visual reference and ask the user to provide an authorized local copy or use the platform's own save/download control. Never claim that a streaming-only post has entered the local project.

## 4. Rank suggestions for the current edit

Rank candidates using the user's actual constraints rather than a universal provider order:

1. required subject, action, shot function, and authenticity;
2. explicit download path and rights clarity;
3. composition, subject geometry, duration, and motion compatibility with the reference;
4. resolution, frame cadence, compression, and crop headroom;
5. watermark, attribution, sign-in, payment, region, and publication constraints.

Present the best few options with tradeoffs. Ask the user only when choosing between them changes cost, account access, privacy, rights, or creative direction. If the user requests local execution, perform downloaded-asset inspection, tracking, editing, rendering, and validation locally; sourcing advice does not justify visible browser automation for the edit itself.

## 5. Preserve a source ledger

For every selected asset, retain a source ledger beside the project containing the publisher, source URL, access date, platform-provided download evidence, license/permission evidence, original filename and checksum, exact intervals used, transformations, attribution/disclosure, and unresolved rights. Preserve the unmodified download separately from transcoded, cropped, graded, repaired, or enhanced derivatives.
