# Experiment gallery captures

Captured on 2026-10-13 from the deployed applications using Chromium and
Playwright. These are real UI recordings and screenshots, without generated
imagery or changes to the game state through JavaScript.

## Moloch Arena

- [Race 7cc66b7d7309](https://moloch-frontend.sliplane.app/arena/7cc66b7d7309):
  `replay-five-labs.gif`, `replay-five-labs.webp` and `replay-outcome.webp`.
- [Race bef4ec757a2d](https://moloch-frontend.sliplane.app/arena/bef4ec757a2d):
  `replay-second-race.gif` and `replay-second-race.webp`. The still shows the
  updated balance in round 3; the other race still shows the round 1 reveal.
- Recorded the existing races in the replay's fullscreen view at 2× playback;
  used its timeline control to capture the terminal outcome. No new provider
  calls or paid model runs were needed.
- GIFs: 800 × 450, 10 fps, 12 seconds, looping, 128-colour palette.

## Metamorfosis

- [El Valle de los Colosos](https://ai-game-test.sliplane.app/?level=valle):
  `valley-gameplay.gif` and `valley-gameplay.webp`.
- [Catedral de Vitral](https://ai-game-test.sliplane.app/?level=vitral):
  `stained-glass-gameplay.gif` and `stained-glass-gameplay.webp`.
- [Teatro de Papel](https://ai-game-test.sliplane.app/?level=papel):
  `paper-world.webp`.
- Started each level, then used movement and jump keys. Verified the title menu
  was hidden and the gameplay HUD was visible before the final recordings.
- GIFs: 640 × 360, 6 fps, 10 seconds, looping, 64-colour palette. The Valley
  clip includes the timed change from werewolf to yeti.

## Delivery checks

- Converted 1280 × 720 screenshots to WebP. The GIF palettes and resolution
  reduce transfer size while keeping actual motion.
- Decoded all four GIFs with FFmpeg and checked distinct first, middle and last
  frames, frame counts and durations.
- Updated both MDX galleries, cover images and corresponding timeline entries.
  Removed the superseded menu/dashboard covers.
- Checked all five slides per gallery at desktop and mobile widths, image
  loading, timeline GIF references and horizontal overflow.
- Ran web tests, production build, API index-invalidation and retrieval tests;
  restarted the local API and checked retrieval of both experiments.
- Production publication must deploy the web and API from the merged commit,
  as documented in the root README. This PR does not change Sliplane settings.
