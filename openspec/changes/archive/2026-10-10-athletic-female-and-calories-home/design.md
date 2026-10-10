# Design

## Decisions

- **Per-artwork viewBoxes.** Male: front `0 0 724 1448` (centre 362), back `724 0 724 1448` (centre 1086). Female: front `-50 -40 734 1538` (centre 320), back widened to `776 -40 734 1538` (centre 1143) so both views share one scale. Female per-region narrowing scales about the correct centre.
- **Smooth extremities.** For hands, feet, ankles and knees, the fingers/toes merge by stroking each path with its own skin colour (round joins); no fibre overlay, no dark outline.
- **Hair is drawn, not the asset's.** Ponytail paths are positioned from the measured head box (front head x 248–393, y 85–243).
- **Athletic V-taper.** Narrowing factors: deltoids/traps/lats 0.93–0.95, arms 0.9, waist (abs/obliques/lower back) 0.84, glutes/quads/hamstrings 0.96.
- **Calories card** reuses the Food tab's target calculation and `CalorieRing`.

## Iteration review (after build)

- **Root cause found:** the library's female artwork has its own viewBoxes and centre lines (front `-50 -40 734 1538`, centre 320; back centre 1143). We were rendering it in the male box, so the female was cropped and off-centre, which is why her hair and feet looked wrong. Female back is widened to the front's scale so Rotate keeps the figure the same size.
- Hair is now drawn on top (high ponytail: fringe, side locks and a tuft from the front, a ponytail with a tie down the back).
- The artwork's separate fingers/toes could not be merged cleanly with strokes, so hands, feet, ankles and knees are redrawn as tapered shapes inside boxes measured from the artwork (wrist overlaps the forearm; foot widens toward the toes). Male hands needed a stronger size reduction (0.62) than female (0.8).
- Athletic build: shoulders, lats, glutes and legs at or slightly above full width with a narrow waist (0.8–0.86), so the figure has a V-taper instead of uniform slimming.
- The calorie counter already existed as the Food tab, but nothing on Home pointed to it → a Calories card now leads Home (ring, macros, "+ Log food · N kcal left", or a set-up prompt). The ring text scales with ring size.
