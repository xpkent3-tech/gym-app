import { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';
import type { BodyPart, Slug } from 'react-native-body-highlighter';
import { bodyBack } from 'react-native-body-highlighter/dist/assets/bodyBack';
import { bodyFemaleBack } from 'react-native-body-highlighter/dist/assets/bodyFemaleBack';
import { bodyFemaleFront } from 'react-native-body-highlighter/dist/assets/bodyFemaleFront';
import { bodyFront } from 'react-native-body-highlighter/dist/assets/bodyFront';
import Svg, { Defs, Ellipse, G, LinearGradient, Path, Pattern, RadialGradient, Stop } from 'react-native-svg';

import { EXTREMITIES, type Box, type ExtremitySlug } from '@/lib/bodyExtremities';
import type { MuscleId, MuscleLoad } from '@/lib/muscles';
import { colors } from '@/lib/theme';
import type { BodyStyle, Sex } from '@/lib/types';

export type { BodyStyle };

// Anatomy artwork: react-native-body-highlighter (MIT, © ELABBASSI Hicham). Only the path data is used.

export type BodyView = 'front' | 'back';

const ASSETS: Record<Sex, Record<BodyView, BodyPart[]>> = {
  male: { front: bodyFront, back: bodyBack },
  female: { front: bodyFemaleFront, back: bodyFemaleBack },
};

/** Which artwork region shows each muscle. Hip flexors are deep and have no visible region. */
export const MUSCLE_SLUG: Record<MuscleId, Slug | null> = {
  chest: 'chest',
  shoulders: 'deltoids',
  biceps: 'biceps',
  triceps: 'triceps',
  forearms: 'forearm',
  traps: 'trapezius',
  neck: 'neck',
  upperBack: 'upper-back',
  lats: 'upper-back',
  lowerBack: 'lower-back',
  abs: 'abs',
  obliques: 'obliques',
  hipFlexors: null,
  glutes: 'gluteal',
  adductors: 'adductors',
  quads: 'quadriceps',
  hamstrings: 'hamstring',
  calves: 'calves',
  tibialis: 'tibialis',
};

const SKIN: Slug[] = ['head', 'hair', 'hands', 'feet', 'knees', 'ankles'];

export const BodyStyleContext = createContext<BodyStyle>('realistic');
export const useBodyStyle = () => useContext(BodyStyleContext);

/**
 * The female artwork is drawn with a bodybuilder's frame. Narrow it about the centre line, more at the shoulders
 * than the hips, for a lean, athletic, typically female silhouette.
 */
const FEMALE_WIDTH: Partial<Record<Slug, number>> = {
  head: 0.92,
  neck: 0.9,
  trapezius: 1.0,
  deltoids: 1.04,
  chest: 0.94,
  'upper-back': 1.02,
  biceps: 1.0,
  triceps: 1.0,
  forearm: 0.96,
  hands: 0.95,
  abs: 0.86,
  obliques: 0.8,
  'lower-back': 0.84,
  gluteal: 1.02,
  adductors: 1.0,
  quadriceps: 1.04,
  hamstring: 1.04,
  knees: 1.0,
  calves: 1.04,
  tibialis: 1.0,
  ankles: 1.0,
  feet: 1.0,
};

/** Each artwork has its own frame: the library's female art is centred at x=320 (front) / 1143 (back). */
const FRAMES: Record<Sex, Record<BodyView, { vb: [number, number, number, number]; cx: number }>> = {
  male: { front: { vb: [0, 0, 724, 1448], cx: 362 }, back: { vb: [724, 0, 724, 1448], cx: 1086 } },
  female: { front: { vb: [-50, -40, 734, 1538], cx: 320 }, back: { vb: [776, -40, 734, 1538], cx: 1143 } },
};

/** Extremities render as smooth skin shapes: each path strokes itself in its own colour so fingers/toes merge. */
const SMOOTH: Slug[] = ['hands', 'feet', 'ankles', 'knees'];

type Blob = { d?: string; cx?: number; cy?: number; rx?: number; ry?: number; rot?: number };

const f = (n: number) => Math.round(n * 10) / 10;

/** Clean hand / foot / ankle / knee silhouettes drawn inside the artwork's measured boxes. */
function extremityBlobs(slug: ExtremitySlug, b: Box, innerIsRight: boolean): Blob[] {
  let [x0, y0, x1, y1] = b;
  const mx = (x0 + x1) / 2;
  // The artwork's hand boxes include spread fingers; a relaxed hand is narrower and shorter.
  const hand = slug === 'hands';
  const wide = x1 - x0 > 85; // the male artwork's hands are bigger than the female's
  const w = (x1 - x0) * (hand ? (wide ? 0.62 : 0.8) : 1);
  const h = (y1 - y0) * (hand ? (wide ? 0.74 : 0.86) : 1);
  x0 = mx - w / 2;
  x1 = mx + w / 2;
  y1 = y0 + h;
  switch (slug) {
    case 'hands': {
      const top = y0 - h * 0.1; // overlap the forearm so the wrist connects
      const hh = y1 - top;
      const thumbX = innerIsRight ? x1 - w * 0.08 : x0 + w * 0.08;
      return [
        {
          // wrist narrows to a broad palm, tapering to rounded fingertips
          d: `M${f(mx - 0.2 * w)} ${f(top)} L${f(mx + 0.2 * w)} ${f(top)} C${f(mx + 0.5 * w)} ${f(top + 0.25 * hh)} ${f(x1)} ${f(top + 0.5 * hh)} ${f(mx + 0.36 * w)} ${f(top + 0.84 * hh)} C${f(mx + 0.24 * w)} ${f(y1 + h * 0.04)} ${f(mx - 0.24 * w)} ${f(y1 + h * 0.04)} ${f(mx - 0.36 * w)} ${f(top + 0.84 * hh)} C${f(x0)} ${f(top + 0.5 * hh)} ${f(mx - 0.5 * w)} ${f(top + 0.25 * hh)} ${f(mx - 0.2 * w)} ${f(top)} Z`,
        },
        { cx: thumbX, cy: top + hh * 0.4, rx: w * 0.12, ry: hh * 0.2, rot: innerIsRight ? -16 : 16 },
      ];
    }
    case 'feet':
      return [
        {
          // narrow at the ankle, widening to the toes
          d: `M${f(mx - 0.26 * w)} ${f(y0)} L${f(mx + 0.26 * w)} ${f(y0)} C${f(mx + 0.4 * w)} ${f(y0 + 0.35 * h)} ${f(x1)} ${f(y0 + 0.5 * h)} ${f(x1)} ${f(y0 + 0.78 * h)} C${f(x1)} ${f(y1 + h * 0.05)} ${f(x0)} ${f(y1 + h * 0.05)} ${f(x0)} ${f(y0 + 0.78 * h)} C${f(x0)} ${f(y0 + 0.5 * h)} ${f(mx - 0.4 * w)} ${f(y0 + 0.35 * h)} ${f(mx - 0.26 * w)} ${f(y0)} Z`,
        },
      ];
    case 'ankles':
      return [{ cx: mx, cy: y0 + h * 0.5, rx: w * 0.36, ry: h * 0.5 }];
    case 'knees':
      return [{ cx: mx, cy: y0 + h * 0.46, rx: w * 0.4, ry: h * 0.2 }];
  }
}

function ponytail(view: BodyView, cx: number): { d: string; tie?: string }[] {
  if (view === 'front') {
    return [
      // fringe / hairline cap
      {
        d: `M${cx - 70} 150 C${cx - 82} 108 ${cx - 52} 68 ${cx} 68 C${cx + 52} 68 ${cx + 82} 108 ${cx + 70} 150 C${cx + 58} 118 ${cx + 22} 102 ${cx - 6} 106 C${cx - 40} 110 ${cx - 62} 128 ${cx - 70} 150 Z`,
      },
      // side locks
      { d: `M${cx - 70} 150 C${cx - 77} 170 ${cx - 73} 190 ${cx - 64} 198 C${cx - 62} 178 ${cx - 60} 162 ${cx - 58} 148 Z` },
      { d: `M${cx + 70} 150 C${cx + 77} 170 ${cx + 73} 190 ${cx + 64} 198 C${cx + 62} 178 ${cx + 60} 162 ${cx + 58} 148 Z` },
      // ponytail tuft rising behind the crown
      { d: `M${cx - 4} 72 C${cx - 18} 42 ${cx - 2} 8 ${cx + 30} 2 C${cx + 46} 28 ${cx + 36} 58 ${cx + 20} 74 Z` },
    ];
  }
  return [
    // back of the head
    {
      d: `M${cx - 72} 160 C${cx - 84} 100 ${cx - 52} 66 ${cx} 66 C${cx + 52} 66 ${cx + 84} 100 ${cx + 72} 160 C${cx + 70} 195 ${cx + 52} 224 ${cx} 228 C${cx - 52} 224 ${cx - 70} 195 ${cx - 72} 160 Z`,
    },
    // ponytail hanging down the back
    {
      d: `M${cx - 15} 84 C${cx - 38} 150 ${cx - 34} 270 ${cx - 18} 350 C${cx - 8} 386 ${cx + 8} 386 ${cx + 18} 350 C${cx + 34} 270 ${cx + 38} 150 ${cx + 15} 84 Z`,
      tie: `M${cx - 18} 92 L${cx + 18} 92 L${cx + 17} 106 L${cx - 17} 106 Z`,
    },
  ];
}

/** Classic style: female core and chest are flattened (no carved eight-pack). */
const FEMALE_SMOOTH: Slug[] = ['abs', 'obliques', 'chest'];

// ---------- Palettes ----------
const CLASSIC = {
  rest: '#3A404D',
  skin: '#262A33',
  heat: ['#2E5590', '#3D8BFF', '#FFB020', '#FF6B4A'],
  primary: colors.primary,
  secondary: '#2A5A9E',
};

/** Exposed-muscle (écorché) palette: dull maroon at rest, brightening to hot orange when worked. */
const REALISTIC = {
  rest: '#62212A',
  heat: ['#8F2830', '#C2353B', '#EB5536', '#FF8A3D'],
  skin: '#C99A82',
  chestSkin: '#D2AE96',
  hair: '#4A2E22',
  tendon: '#E8D3BF',
  fascia: '#24090C',
  glow: '#FFD9B0',
};

export const HEAT = CLASSIC.heat;

function band(i: number | undefined): number {
  if (!i || i <= 0.02) return -1;
  if (i < 0.25) return 0;
  if (i < 0.5) return 1;
  if (i < 0.8) return 2;
  return 3;
}

/** Heat ramp: rest → light → moderate → high → max, in the given style. */
export function heatColor(i: number | undefined, style: BodyStyle = 'realistic'): string {
  const b = band(i);
  const pal = style === 'realistic' ? REALISTIC : CLASSIC;
  return b < 0 ? pal.rest : pal.heat[b];
}

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + (amt > 0 ? (255 - c) * amt : c * amt))));
  return `#${[f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (x: number, y: number) => Math.round(x + (y - x) * t);
  const r = ch(pa >> 16, pb >> 16);
  const g = ch((pa >> 8) & 255, (pb >> 8) & 255);
  const bl = ch(pa & 255, pb & 255);
  return `#${[r, g, bl].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/** Muscle-fibre direction in degrees from vertical (mirrored for the other side). */
const FIBRE_ANGLE: Partial<Record<Slug, number>> = {
  quadriceps: 6,
  hamstring: 0,
  calves: 0,
  tibialis: 4,
  adductors: 22,
  abs: 0,
  obliques: 40,
  chest: 70,
  deltoids: 15,
  biceps: 6,
  triceps: 6,
  forearm: 10,
  trapezius: 55,
  'upper-back': 45,
  'lower-back': 0,
  gluteal: 55,
  neck: 20,
};

export type BodyMapProps = {
  view: BodyView;
  sex?: Sex;
  /** 0..1 intensities for heat mode. */
  heat?: MuscleLoad;
  /** Highlight mode: primary muscles full, secondary partial. */
  primary?: MuscleId[];
  secondary?: MuscleId[];
  selected?: MuscleId | null;
  onPressMuscle?: (m: MuscleId) => void;
  width?: number;
  /** Overrides the app-wide style (Settings → Body style). */
  bodyStyle?: BodyStyle;
};

export function BodyMap({ view, sex = 'male', heat, primary = [], secondary = [], selected, onPressMuscle, width = 160, bodyStyle }: BodyMapProps) {
  const ctxStyle = useBodyStyle();
  const style = bodyStyle ?? ctxStyle;
  const realistic = style === 'realistic';
  // Gradient/pattern ids must be unique per instance: on web, url(#id) resolves document-wide, and screens kept
  // mounted (hidden) in the navigation stack would otherwise capture the reference.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gid = (c: string) => `g${uid}${c.slice(1)}`;
  const hairId = `h${uid}`;
  const pid = (a: number) => `p${uid}${a < 0 ? 'm' : ''}${Math.abs(a)}`;
  const female = sex === 'female';

  // Intensity band per artwork slug (max when several muscles share one); highlight mode maps to bands too.
  const slugBand = new Map<Slug, number>();
  const slugMuscle = new Map<Slug, MuscleId>();
  for (const [m, slug] of Object.entries(MUSCLE_SLUG) as [MuscleId, Slug | null][]) {
    if (!slug) continue;
    let b = -1;
    if (heat) b = band(heat[m]);
    else if (primary.includes(m)) b = 3;
    else if (secondary.includes(m)) b = 1;
    slugBand.set(slug, Math.max(slugBand.get(slug) ?? -1, b));
    if (!slugMuscle.has(slug) || m === selected) slugMuscle.set(slug, m);
  }

  const fillFor = (slug: Slug): string => {
    const b = slugBand.get(slug) ?? -1;
    if (realistic) {
      if (slug === 'hair') return REALISTIC.hair;
      if (SKIN.includes(slug)) return REALISTIC.skin;
      if (female && slug === 'chest') return b < 0 ? REALISTIC.chestSkin : mix(REALISTIC.chestSkin, REALISTIC.heat[b], 0.65);
      return b < 0 ? REALISTIC.rest : REALISTIC.heat[b];
    }
    if (SKIN.includes(slug)) return CLASSIC.skin;
    if (heat) return b < 0 ? CLASSIC.rest : CLASSIC.heat[b];
    return b === 3 ? CLASSIC.primary : b === 1 ? CLASSIC.secondary : CLASSIC.rest;
  };

  const parts = ASSETS[sex][view].filter((p) => !(female && realistic && p.slug === 'hair'));
  const fills = [...new Set(parts.map((p) => fillFor(p.slug as Slug)))];
  const showFibres = realistic && width >= 70;
  const angles = showFibres ? [...new Set(Object.values(FIBRE_ANGLE).flatMap((a) => [a!, -a!]))] : [];
  const selectedSlug = selected ? MUSCLE_SLUG[selected] : null;
  const frame = FRAMES[sex][view];
  const viewBox = frame.vb.join(' ');
  const strokeW = Math.max(1.5, 400 / width);

  return (
    <Svg width={width} height={(width * frame.vb[3]) / frame.vb[2]} viewBox={viewBox}>
      <Defs>
        {fills.map((c) => (
          <RadialGradient key={c} id={gid(c)} cx="38%" cy="30%" rx="75%" ry="75%" fx="35%" fy="25%">
            <Stop offset="0" stopColor={shade(c, realistic ? 0.22 : 0.28)} />
            <Stop offset="0.55" stopColor={c} />
            <Stop offset="1" stopColor={shade(c, realistic ? -0.55 : -0.45)} />
          </RadialGradient>
        ))}
        <LinearGradient id={hairId} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#7A4B33" />
          <Stop offset="0.5" stopColor={REALISTIC.hair} />
          <Stop offset="1" stopColor="#1F120C" />
        </LinearGradient>
        {angles.map((a) => (
          <Pattern key={a} id={pid(a)} width={7} height={7} patternUnits="userSpaceOnUse" patternTransform={`rotate(${a})`}>
            <Path d="M0 0 L0 7" stroke="#FFFFFF" strokeOpacity={0.14} strokeWidth={1.3} />
            <Path d="M3.5 0 L3.5 7" stroke="#000000" strokeOpacity={0.22} strokeWidth={1.1} />
          </Pattern>
        ))}
      </Defs>
      {parts.map((part) => {
        const slug = part.slug as Slug;
        const isSkin = SKIN.includes(slug);
        const fill = fillFor(slug);
        const b = slugBand.get(slug) ?? -1;
        const muscle = slugMuscle.get(slug);
        const isSel = !!selectedSlug && selectedSlug === slug;
        const sx = female ? (FEMALE_WIDTH[slug] ?? 1) : 1;
        const cx = frame.cx;
        const smooth = !realistic && female && FEMALE_SMOOTH.includes(slug) && !isSel;
        const glow = realistic && b === 3 && !isSel;
        const angle = FIBRE_ANGLE[slug];
        const fibres = showFibres && angle !== undefined && !(female && slug === 'chest');
        if (realistic && SMOOTH.includes(slug)) {
          const boxes = EXTREMITIES[`${sex}.${view}`]?.[slug as ExtremitySlug];
          if (!boxes) return null;
          return (
            <G key={slug} transform={sx === 1 ? undefined : `translate(${cx} 0) scale(${sx} 1) translate(${-cx} 0)`}>
              {([boxes.L, boxes.R] as Box[]).flatMap((bx, side) =>
                extremityBlobs(slug as ExtremitySlug, bx, side === 0).map((o, i) =>
                  o.d ? (
                    <Path
                      key={`${side}-${i}`}
                      d={o.d}
                      fill={`url(#${gid(fill)})`}
                      stroke={shade(fill, -0.3)}
                      strokeWidth={strokeW * 0.8}
                      strokeLinejoin="round"
                    />
                  ) : (
                    <Ellipse
                      key={`${side}-${i}`}
                      cx={o.cx}
                      cy={o.cy}
                      rx={o.rx}
                      ry={o.ry}
                      rotation={o.rot}
                      originX={o.cx}
                      originY={o.cy}
                      fill={`url(#${gid(fill)})`}
                      stroke={shade(fill, -0.3)}
                      strokeWidth={strokeW * 0.8}
                    />
                  ),
                ),
              )}
            </G>
          );
        }
        const sides: [string[], 1 | -1][] = [
          [part.path?.common ?? [], 1],
          [part.path?.left ?? [], 1],
          [part.path?.right ?? [], -1],
        ];
        // Realistic: dark fascia between muscles, pale tendinous inscriptions across the abs.
        const mitten = realistic && SMOOTH.includes(slug);
        const stroke = mitten
          ? shade(fill, -0.12)
          : isSel
            ? '#FFFFFF'
            : glow
              ? REALISTIC.glow
              : realistic
                ? slug === 'abs'
                  ? REALISTIC.tendon
                  : REALISTIC.fascia
                : smooth
                  ? shade(fill, -0.08)
                  : colors.bg;
        const sw = mitten ? 9 : isSel ? strokeW * 2.2 : glow ? strokeW * 1.4 : realistic && slug === 'abs' ? strokeW * 1.6 : female ? strokeW * 0.75 : strokeW;
        return (
          <G key={slug} transform={sx === 1 ? undefined : `translate(${cx} 0) scale(${sx} 1) translate(${-cx} 0)`}>
            {sides.flatMap(([ds, dir], si) =>
              ds.map((d, i) => (
                <G key={`${si}-${i}`}>
                  <Path
                    d={d}
                    fill={smooth ? shade(fill, -0.08) : `url(#${gid(fill)})`}
                    stroke={stroke}
                    strokeWidth={sw}
                    strokeLinejoin="round"
                    onPress={onPressMuscle && muscle && !isSkin ? () => onPressMuscle(muscle) : undefined}
                  />
                  {fibres ? <Path d={d} fill={`url(#${pid(angle! * dir)})`} pointerEvents="none" /> : null}
                </G>
              )),
            )}
          </G>
        );
      })}
      {female && realistic ? (
        <G>
          {ponytail(view, frame.cx).map((h, i) => (
            <G key={i}>
              <Path d={h.d} fill={`url(#${hairId})`} stroke="#1B100B" strokeWidth={strokeW} strokeLinejoin="round" />
              {h.tie ? <Path d={h.tie} fill={colors.primary} stroke="#1B100B" strokeWidth={strokeW * 0.6} /> : null}
            </G>
          ))}
        </G>
      ) : null}
    </Svg>
  );
}

/** Front and back side by side. */
export function BodyPair(props: Omit<BodyMapProps, 'view'>) {
  const w = props.width ?? 120;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12 }}>
      {(['front', 'back'] as BodyView[]).map((v) => (
        <View key={v} style={{ alignItems: 'center', gap: 4 }}>
          <BodyMap {...props} view={v} width={w} />
          <Text style={{ color: colors.textMuted, fontSize: 11, fontWeight: '700', letterSpacing: 1 }}>{v.toUpperCase()}</Text>
        </View>
      ))}
    </View>
  );
}

/** Single large body that rotates between front and back with a turn animation. */
export function RotatingBody(props: Omit<BodyMapProps, 'view'> & { testID?: string }) {
  const [view, setView] = useState<BodyView>('front');
  const [spin] = useState(() => new Animated.Value(1));
  const busy = useRef(false);

  useEffect(() => () => spin.stopAnimation(), [spin]);

  const rotate = () => {
    if (busy.current) return;
    busy.current = true;
    const native = Platform.OS !== 'web';
    Animated.timing(spin, { toValue: 0, duration: 160, useNativeDriver: native }).start(() => {
      setView((v) => (v === 'front' ? 'back' : 'front'));
      Animated.timing(spin, { toValue: 1, duration: 160, useNativeDriver: native }).start(() => {
        busy.current = false;
      });
    });
  };

  return (
    <View style={{ alignItems: 'center', gap: 10 }} testID={props.testID}>
      <Animated.View style={{ transform: [{ perspective: 800 }, { scaleX: spin }] }}>
        <BodyMap {...props} view={view} />
      </Animated.View>
      <Pressable
        onPress={rotate}
        testID="body-rotate"
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 999,
          backgroundColor: colors.surfaceAlt,
        }}
      >
        <Text style={{ color: colors.text, fontWeight: '700' }}>↻ Rotate</Text>
        <Text style={{ color: colors.textMuted, fontWeight: '700' }} testID="body-view">
          {view === 'front' ? 'Front' : 'Back'}
        </Text>
      </Pressable>
    </View>
  );
}

export function HeatLegend() {
  const style = useBodyStyle();
  const steps = [
    { c: heatColor(0, style), l: 'Rest' },
    { c: heatColor(0.1, style), l: 'Light' },
    { c: heatColor(0.3, style), l: 'Moderate' },
    { c: heatColor(0.6, style), l: 'High' },
    { c: heatColor(1, style), l: 'Max' },
  ];
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }} testID={`legend-${style}`}>
      {steps.map((s) => (
        <View key={s.l} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: s.c }} />
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>{s.l}</Text>
        </View>
      ))}
    </View>
  );
}
