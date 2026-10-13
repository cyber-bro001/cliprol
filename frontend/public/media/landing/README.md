# Hero media mapping

The hero uses three supplied scenarios in this order: Gaming → Podcast → Coaching. Each has two portrait images and one landscape original. The original source element itself becomes the landscape result; there is no fourth image or duplicate landscape asset.

Original PNGs remain in `src/assets/reference/`. Production WebP derivatives preserve their full dimensions and framing. Replace media through `src/components/landing/heroScenarios.ts`; update intrinsic dimensions and descriptions with any replacement. Do not restructure the presentation components.

| Supplied file | Production path under this folder | Dimensions | Role |
| --- | --- | --- | --- |
| game-original.png | gaming/source.webp | 1671 × 941 | Source and landscape result |
| game-clip1.png | gaming/clip-1.webp | 941 × 1672 | Double Kill portrait |
| game-clip2.png | gaming/clip-2.webp | 941 × 1672 | Triple Kill portrait |
| podcast-original.png | podcast/source.webp | 1672 × 941 | Source and landscape result |
| podcast-clip1.png | podcast/clip-1.webp | 941 × 1672 | Black-shirt speaker portrait |
| podcast-clip2.png | podcast/clip-2.webp | 941 × 1672 | Light-hoodie speaker portrait |
| coach-session-original.png | coaching/source.webp | 1672 × 941 | Source and landscape result |
| coach-session-clip1.png | coaching/clip-1.webp | 941 × 1672 | First coaching portrait |
| coach-session-clip2.png | coaching/clip-2.webp | 941 × 1672 | Second coaching portrait |

Public URLs start `/media/landing/`. Originals are approximately 16:9; portraits are approximately 9:16. Keep those ratios and at least the supplied dimensions for future full-resolution replacements; optimized derivatives may use smaller dimensions when their display sizes justify it.

Owner confirmed: leave game-clip3.png unused and retain game-original.png unchanged in composition, including its embedded player controls. No crop, fabricated person, or third-party asset was added. These are owner-supplied media; additional ownership/license provenance has not been established by this task.

Encoding: FFmpeg libwebp, quality 84, no resize or crop. The nine files total 883,680 bytes. Originals remain available for replacement/re-encoding. The Opus recording is interaction reference only and is never imported into the application.

The first scenario's three images load eagerly. The animation starts after its images are prepared; the next scenario prepares during the hold. Reduced motion shows one completed result without loading future scenarios. Errors display an accessible unavailable-preview fallback.

Moment positions are illustrative, not verified clip timestamps. The marketing composition introduces no functional resizing, publishing, or platform-format controls.
