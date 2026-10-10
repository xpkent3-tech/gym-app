# Design

## Decisions

- The silhouette paths are extracted from the library's wrapper components (the body `border` path) into `lib/bodyOutline.ts`. They share the muscle artwork's coordinates, so no alignment is needed.
- Hands and feet: a `ClipPath` of rectangles (from measured hand/foot/ankle boxes) over a skin-filled copy of the silhouette.
- Base and skin fills are flat colours. A bounding-box radial gradient over the whole silhouette darkened the legs and feet to near-black.
- Female head is drawn only for the female realistic figure (the silhouette has no head). The base silhouette is clipped below the chin so the library's head contour doesn't show as a halo. Male keeps the artwork's head and hair.
