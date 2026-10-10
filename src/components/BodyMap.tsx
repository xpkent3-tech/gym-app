import { createContext, useContext, useEffect, useId, useRef, useState } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';
import type { BodyPart, Slug } from 'react-native-body-highlighter';
import { bodyBack } from 'react-native-body-highlighter/dist/assets/bodyBack';
import { bodyFemaleBack } from 'react-native-body-highlighter/dist/assets/bodyFemaleBack';
import { bodyFemaleFront } from 'react-native-body-highlighter/dist/assets/bodyFemaleFront';
import { bodyFront } from 'react-native-body-highlighter/dist/assets/bodyFront';
import Svg, { ClipPath, Defs, Ellipse, G, LinearGradient, Path, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

import { EXTREMITIES } from '@/lib/bodyExtremities';
import { OUTLINE } from '@/lib/bodyOutline';
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

/** Each artwork has its own frame: the library's female art is centred at x=320 (front) / 1143 (back). */
const FRAMES: Record<Sex, Record<BodyView, { vb: [number, number, number, number]; cx: number }>> = {
  male: { front: { vb: [0, 0, 724, 1448], cx: 362 }, back: { vb: [724, 0, 724, 1448], cx: 1086 } },
  female: { front: { vb: [-50, -40, 734, 1538], cx: 320 }, back: { vb: [776, -40, 734, 1538], cx: 1143 } },
};

const f = (n: number) => Math.round(n * 10) / 10;

/** Regions of the silhouette that show as skin: hands and feet (from the artwork's measured boxes). */
function skinRects(key: string): { x: number; y: number; w: number; h: number }[] {
  const ex = EXTREMITIES[key] ?? {};
  const rects: { x: number; y: number; w: number; h: number }[] = [];
  for (const side of ['L', 'R'] as const) {
    const hand = ex.hands?.[side];
    if (hand) rects.push({ x: hand[0] - 16, y: hand[1] - 2, w: hand[2] - hand[0] + 32, h: hand[3] - hand[1] + 24 });
    const foot = ex.feet?.[side];
    const ankle = ex.ankles?.[side];
    if (foot) {
      const top = ankle ? ankle[1] + (ankle[3] - ankle[1]) * 0.42 : foot[1] - 34;
      const x0 = Math.min(foot[0], ankle?.[0] ?? foot[0]) - 10;
      const x1 = Math.max(foot[2], ankle?.[2] ?? foot[2]) + 10;
      rects.push({ x: x0, y: top, w: x1 - x0, h: foot[3] + 14 - top });
    }
  }
  return rects;
}

/** Female head and neck, drawn to sit on the silhouette. `cx` is the figure's centre line. */
function femaleHead(cx: number) {
  return {
    neck: `M${f(cx - 27)} 205 L${f(cx + 27)} 205 L${f(cx + 30)} 252 L${f(cx - 30)} 252 Z`,
    face: `M${f(cx - 55)} 150 C${f(cx - 55)} 108 ${f(cx - 30)} 86 ${f(cx)} 86 C${f(cx + 30)} 86 ${f(cx + 55)} 108 ${f(cx + 55)} 150 C${f(cx + 55)} 196 ${f(cx + 34)} 234 ${f(cx)} 238 C${f(cx - 34)} 234 ${f(cx - 55)} 196 ${f(cx - 55)} 150 Z`,
    ears: [
      { cx: cx - 57, cy: 162, rx: 7, ry: 15 },
      { cx: cx + 57, cy: 162, rx: 7, ry: 15 },
    ],
  };
}

/** Female hair: pulled back from the face, with a high ponytail. */
function femaleHair(view: BodyView, cx: number): { behind: string[]; over: string[]; tie?: string } {
  if (view === 'front') {
    return {
      // ponytail swinging out from behind the crown and falling past the shoulder
      behind: [
        `M${f(cx + 2)} 98 C${f(cx + 44)} 46 ${f(cx + 116)} 58 ${f(cx + 126)} 130 C${f(cx + 134)} 192 ${f(cx + 116)} 238 ${f(cx + 102)} 282 C${f(cx + 92)} 248 ${f(cx + 94)} 200 ${f(cx + 90)} 160 C${f(cx + 86)} 120 ${f(cx + 62)} 100 ${f(cx + 28)} 110 Z`,
      ],
      // hair swept back over the skull, forehead and ears clear
      over: [
        `M${f(cx - 60)} 152 C${f(cx - 66)} 100 ${f(cx - 36)} 76 ${f(cx)} 76 C${f(cx + 36)} 76 ${f(cx + 66)} 100 ${f(cx + 60)} 152 C${f(cx + 56)} 130 ${f(cx + 46)} 114 ${f(cx + 26)} 106 C${f(cx + 6)} 99 ${f(cx - 16)} 101 ${f(cx - 32)} 109 C${f(cx - 50)} 118 ${f(cx - 57)} 133 ${f(cx - 60)} 152 Z`,
      ],
    };
  }
  return {
    behind: [],
    over: [
      // back of the head, hair gathered up to the crown
      `M${f(cx - 60)} 160 C${f(cx - 68)} 100 ${f(cx - 38)} 76 ${f(cx)} 76 C${f(cx + 38)} 76 ${f(cx + 68)} 100 ${f(cx + 60)} 160 C${f(cx + 58)} 198 ${f(cx + 40)} 226 ${f(cx)} 230 C${f(cx - 40)} 226 ${f(cx - 58)} 198 ${f(cx - 60)} 160 Z`,
      // ponytail hanging down the back
      `M${f(cx - 15)} 98 C${f(cx - 40)} 160 ${f(cx - 36)} 280 ${f(cx - 18)} 360 C${f(cx - 8)} 396 ${f(cx + 8)} 396 ${f(cx + 18)} 360 C${f(cx + 36)} 280 ${f(cx + 40)} 160 ${f(cx + 15)} 98 Z`,
    ],
    tie: `M${f(cx - 19)} 100 L${f(cx + 19)} 100 L${f(cx + 18)} 116 L${f(cx - 18)} 116 Z`,
  };
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
  base: '#431419',
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
  const clipId = `c${uid}`;
  const baseClipId = `b${uid}`;
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

  // Realistic: the silhouette provides head-to-toe continuity, hands/feet come from it as skin, and (for the
  // female) the head and hair are drawn here. Everything else is the muscle artwork.
  const customHead = female && realistic;
  const skipSlug = (slug: Slug) => realistic && (['hands', 'feet', 'ankles', 'knees'].includes(slug) || (customHead && (slug === 'head' || slug === 'hair')));
  const parts = ASSETS[sex][view].filter((p) => !skipSlug(p.slug as Slug));
  const fills = [...new Set([...parts.map((p) => fillFor(p.slug as Slug)), ...(realistic ? [REALISTIC.skin] : [])])];
  const showFibres = realistic && width >= 70;
  const angles = showFibres ? [...new Set(Object.values(FIBRE_ANGLE).flatMap((a) => [a!, -a!]))] : [];
  const selectedSlug = selected ? MUSCLE_SLUG[selected] : null;
  const frame = FRAMES[sex][view];
  const viewBox = frame.vb.join(' ');
  const strokeW = Math.max(1.5, 400 / width);
  const outline = OUTLINE[`${sex}.${view}`];
  const rects = realistic ? skinRects(`${sex}.${view}`) : [];
  const head = customHead && view === 'front' ? femaleHead(frame.cx) : null;
  const hair = customHead ? femaleHair(view, frame.cx) : null;
  const hairStroke = '#1B100B';

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
        {realistic && customHead && view === 'front' ? (
          <ClipPath id={baseClipId}>
            <Rect x={-400} y={226} width={3000} height={2000} />
          </ClipPath>
        ) : null}
        {realistic ? (
          <ClipPath id={clipId}>
            {rects.map((r, i) => (
              <Rect key={i} x={r.x} y={r.y} width={r.w} height={r.h} />
            ))}
          </ClipPath>
        ) : null}
      </Defs>
      {/* ponytail swinging out behind the figure (front view) */}
      {hair?.behind.map((d, i) => (
        <Path key={`pb${i}`} d={d} fill={`url(#${hairId})`} stroke={hairStroke} strokeWidth={strokeW} strokeLinejoin="round" />
      ))}
      {realistic && outline ? (
        <G clipPath={customHead && view === 'front' ? `url(#${baseClipId})` : undefined}>
          <Path d={outline} fill={REALISTIC.base} stroke={REALISTIC.fascia} strokeWidth={strokeW} strokeLinejoin="round" />
        </G>
      ) : null}
      {parts.map((part) => {
        const slug = part.slug as Slug;
        const isSkin = SKIN.includes(slug);
        const fill = fillFor(slug);
        const b = slugBand.get(slug) ?? -1;
        const muscle = slugMuscle.get(slug);
        const isSel = !!selectedSlug && selectedSlug === slug;
        const smooth = !realistic && female && FEMALE_SMOOTH.includes(slug) && !isSel;
        const glow = realistic && b === 3 && !isSel;
        const angle = FIBRE_ANGLE[slug];
        const fibres = showFibres && angle !== undefined && !(female && slug === 'chest');
        const sides: [string[], 1 | -1][] = [
          [part.path?.common ?? [], 1],
          [part.path?.left ?? [], 1],
          [part.path?.right ?? [], -1],
        ];
        // Realistic: dark fascia between muscles, pale tendinous inscriptions across the abs.
        const stroke = isSel
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
        const sw = isSel ? strokeW * 2.2 : glow ? strokeW * 1.4 : realistic && slug === 'abs' ? strokeW * 1.6 : strokeW;
        return (
          <G key={slug}>
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
      {/* hands and feet: the silhouette itself, clipped to those regions and filled as skin */}
      {realistic && outline ? (
        <G clipPath={`url(#${clipId})`}>
          <Path d={outline} fill={REALISTIC.skin} stroke={shade(REALISTIC.skin, -0.3)} strokeWidth={strokeW * 0.8} strokeLinejoin="round" />
        </G>
      ) : null}
      {head ? (
        <G>
          <Path d={head.neck} fill={`url(#${gid(REALISTIC.skin)})`} />
          {head.ears.map((e, i) => (
            <Ellipse
              key={i}
              cx={e.cx}
              cy={e.cy}
              rx={e.rx}
              ry={e.ry}
              fill={`url(#${gid(REALISTIC.skin)})`}
              stroke={shade(REALISTIC.skin, -0.3)}
              strokeWidth={strokeW * 0.7}
            />
          ))}
          <Path d={head.face} fill={`url(#${gid(REALISTIC.skin)})`} stroke={shade(REALISTIC.skin, -0.3)} strokeWidth={strokeW * 0.8} strokeLinejoin="round" />
        </G>
      ) : null}
      {hair?.over.map((d, i) => (
        <Path key={`po${i}`} d={d} fill={`url(#${hairId})`} stroke={hairStroke} strokeWidth={strokeW} strokeLinejoin="round" />
      ))}
      {hair?.tie ? <Path d={hair.tie} fill={colors.primary} stroke={hairStroke} strokeWidth={strokeW * 0.6} /> : null}
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
