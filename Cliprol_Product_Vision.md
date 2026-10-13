# Cliprol Product Vision

Revised 2026-10-06. This is the product source of truth. It supersedes the previous general editing-workspace and open-source direction. Implementation details belong in PROJECT_TECHNICAL_REPORT.md; historical media lifecycle notes remain in PROJECT_MEDIA_MILESTONE.md.

## 1. Positioning

Cliprol is a **content repurposing platform for creators**. Intelligent clipping is its first and core capability.

> You create once. Cliprol finds more content inside it.

The product starts with content a creator has already made and helps discover what useful content it can become. Its central question is: "You already created something. What useful content can we turn it into?"

## 2. Creators and their problem

Cliprol serves podcasters, YouTubers, gamers and streamers, coaches, educators, interview creators, talking-head creators, social media creators, and other people repurposing longer recordings.

Finding useful moments, cutting them out, and adapting them for different destinations can take time away from creating. Cliprol should reduce that repeated work while leaving creative judgment with the creator. Consumer messaging should describe these outcomes in familiar language, rather than engineering, APIs, models, databases, or processing architecture.

## 3. Core experience

1. Add existing content through a supported URL or upload.
2. Cliprol analyzes the content and finds valuable moments.
3. Turn those moments into standalone clips.
4. Review the suggestions and decide what to use.
5. As capabilities mature, refine and adapt clips for different formats and destinations.
6. Eventually support creator-directed publishing and distribution.

The initial workflow remains focused and understandable: add a video, find moments, review and download clips.

## 4. Current capability versus direction

The following reflects source inspection on 2026-10-06, not a new live-service verification.

| Capability | Current implementation / direction |
| --- | --- |
| YouTube URL input | Implemented validation and authenticated project-backed processing. Other URL providers are not currently supported by the frontend validator. |
| Video upload | Implemented input and authenticated project-backed upload endpoint. The file is held in browser memory. Upload intent survives sign-in/reload; a missing file is explicitly requested again. |
| Moment detection and clipping | Implemented analysis and time-range clip extraction. |
| Review, download, saved projects | Implemented results and persisted completed-project library; deployment depends on backend and storage configuration. |
| Captions, creator-adjustable trimming, branding | Product direction, not working landing-page controls. |
| Reframing, resizing, platform-specific formatting | Product direction. Current extraction preserves source framing; it does not provide selectable social aspect ratios. |
| Publishing / distribution | Longer-term direction, not currently available. |

Do not represent future functionality as shipped through copy, interactive controls, or illustrations. Conceptual mixed-format outputs must be explicitly presented as product direction until supported. Do not promise processing times, upload limits, privacy policies, or category performance without validation.

## 5. Creator control

Automation assists the creator. It must not silently make irreversible creative decisions or publish on the creator's behalf.

Suggestions should be visible and understandable. The current review/download flow lets creators choose what they use. As refinement capabilities are introduced, changes should be editable, rejectable, and reversible: clip boundaries, caption corrections, framing, and branding remain under creator control. These are design requirements for future capabilities, not claims that an undoable editor exists today.

## 6. Product boundary and evolution

Every new capability should serve repurposing existing content. Relevant directions include intelligent moment detection, clipping, captions, trimming, reframing, aspect-ratio adaptation, branding, destination-specific formatting, and eventually distribution.

A timeline can help creators understand detected moments or refine clips. It is a supporting tool, not the center of a general-purpose professional editor. Cliprol is not pursuing feature parity with Premiere Pro or a generic manual editing workspace. Natural-language assistance is optional future interaction design, not a required product stage.

Evolve from reliable clipping and review, through clip refinement and multi-platform adaptation, toward distribution only as creator needs and implementation readiness justify it. These are directions, not release commitments.

## 7. Positioning and business constraints

Cliprol is no longer positioned as an open-source product. Do not promote GitHub, repositories, developer contribution, or an open-source core in consumer marketing. This does not instruct removal of Git, development infrastructure, dependencies, or license notices.

Monetization and product economics are not finalized. There is no landing-page Pricing section yet. Keep the page composition modular so pricing can be inserted later without redesigning the hero or product flow. Do not imply a permanent free plan or finalized commercial terms.

Do not invent testimonials, customer logos, creator counts, usage statistics, revenue, or other social proof.

## 8. Landing-page strategy

The first impression should make a creator understand: "I can give Cliprol content I already created, and Cliprol can find more useful content inside it."

Proposed story: hero, creator payoff, how it works, creator/content use cases, multi-platform output direction, FAQ, final CTA, footer. Reuse existing section owners where appropriate. Copy below is direction, not approved final strings.

- Approved hero headline: "Drop your video. Cliprol finds the moments." Subhead: "Turn your podcasts, gaming videos, coaching sessions and more into clips worth sharing." Keep neutral headline typography and let the transformation carry the communication.
- Benefits: less searching, more useful content from one recording, creator control, and future adaptation to publishing destinations. Possible headline: "Create more. Edit less."
- How it works: add your video; Cliprol finds the moments; review/use your clips. Use purpose-built visuals.
- Use cases: explain what different creators might extract, rather than repeating the hero animation.
- Outputs: "One video. More places to show up." Distinguish planned adaptation from currently generated clips.
- FAQ: supported videos, YouTube versus upload, variable processing expectations, account requirements, verified ownership/privacy information, and actual output support. Processing currently requires authentication.
- Final CTA: "Your next clip is already in your video. Let Cliprol find it." Return to the real input workflow.
- Footer: real Product, Help, Privacy, Terms, Contact, and relevant social destinations when available. No GitHub/open-source promotion or dead placeholder links presented as finished navigation.

### Two separate hero responsibilities

The functional video input must preserve URL/upload validation, authentication handoff, project creation, and processing navigation through existing owners. It can be visually refined without moving business logic into marketing components.

The marketing transformation is integrated into the hero composition and remains separate from real input/processing state. It automatically cycles Gaming ? Podcast ? Coaching using supplied images. Two detected-moment markers precede two emerging 9:16 clips; the same original 16:9 source element moves into the landscape result. There is no framed demo card, stage-label grid, fabricated timestamp, scenario selector, platform-logo wall, or visible capability note. A pause/resume control serves accessibility; reduced motion displays a completed static composition. Multi-format imagery expresses the product direction without adding functional format controls.

Scenarios must be typed data consumed by reusable presentation components, not duplicated hero implementations. Adding a category or replacing media should require configuration changes only.

### Visual and interaction principles

Preserve Cliprol's identity: dark neutral surfaces, clear typography, strong hierarchy, restrained warm orange/peach accents, subtle depth, and purposeful motion. Use accent for selection, moments, markers, and meaningful attention rather than large decorative areas. Extend existing centralized tokens and Tailwind conventions; do not add a second styling system or clone another site.

Design desktop, tablet, and mobile together. Provide semantic structure, keyboard controls, labels, contrast, visible focus, a pause control for continuous animation, and a useful static reduced-motion presentation without automatic cycling. Marketing animation must not distract from entering a real video.

### Asset and performance principles

Use creator-provided or appropriately licensed media. Do not generate random creator imagery or borrow third-party creator footage. Missing assets should use intentional, visibly labeled development placeholders.

Each asset slot must document purpose, aspect ratio, recommended dimensions, replacement path, and accessible description. Media should be replaceable through scenario configuration without restructuring components. Keep initial rendering poster-first, reserve layout dimensions, and avoid downloading every scenario video on first load. Load media only as needed and stop animation when offscreen or the page is hidden.

## 9. Engineering guardrails

Keep LandingPage as composition. Reuse existing responsibility owners before adding components, use data for repeated UI, and avoid speculative generic abstractions. Marketing components must not own authentication internals, Supabase access, project persistence, or processing orchestration.

Preserve authentication, URL/upload input, project creation, processing, persisted results, dashboard behavior, and responsive layouts. Restrict refactoring to what the redesign requires. Document meaningful responsibility changes in the technical guide when implemented.

The owner approved a focused Header + Hero + functional input + transformation pass, refined through 2026-10-08. The first viewport is a product demonstration: the source, detected moments, and emerging clips should communicate the product within 2?3 seconds even with the headline hidden. Lower-page redesign is deferred. Existing authentication/project behavior is outside this pass.

## 10. Product decision filter

Before adding a capability, ask:

1. Does it turn existing creator content into something useful?
2. Does it reduce meaningful discovery or repurposing work?
3. Does the creator understand and control the result?
4. Does it fit this focused workflow without requiring a professional editor?
5. Is it implemented and verified, or must it be described as future direction?

The north star is helping creators find more useful content inside what they already created, while keeping the final creative decisions theirs.
