import { useEffect, useId, useRef, useState } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';
import type { BodyPart, Slug } from 'react-native-body-highlighter';
import { bodyBack } from 'react-native-body-highlighter/dist/assets/bodyBack';
import { bodyFemaleBack } from 'react-native-body-highlighter/dist/assets/bodyFemaleBack';
import { bodyFemaleFront } from 'react-native-body-highlighter/dist/assets/bodyFemaleFront';
import { bodyFront } from 'react-native-body-highlighter/dist/assets/bodyFront';
import Svg, { Defs, G, Path, RadialGradient, Stop } from 'react-native-svg';

import type { MuscleId, MuscleLoad } from '@/lib/muscles';
import { colors } from '@/lib/theme';
import type { Sex } from '@/lib/types';

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

/**
 * The female artwork is drawn with a bodybuilder's frame. Narrow it about the centre line, more at the shoulders
 * than the hips, for a leaner, more typically female silhouette.
 */
const FEMALE_WIDTH: Partial<Record<Slug, number>> = {
  head: 0.9,
  hair: 0.9,
  neck: 0.82,
  trapezius: 0.8,
  deltoids: 0.8,
  chest: 0.82,
  'upper-back': 0.82,
  biceps: 0.82,
  triceps: 0.82,
  forearm: 0.82,
  hands: 0.82,
  abs: 0.86,
  obliques: 0.86,
  'lower-back': 0.86,
  gluteal: 0.92,
  adductors: 0.9,
  quadriceps: 0.88,
  hamstring: 0.88,
  knees: 0.9,
  calves: 0.9,
  tibialis: 0.9,
  ankles: 0.9,
  feet: 0.9,
};
/** Slugs whose internal separation lines are softened on the female body (no carved eight-pack). */
const FEMALE_SMOOTH: Slug[] = ['abs', 'obliques', 'chest'];

const BASE = '#3A404D';
const SKIN_FILL = '#262A33';

export const HEAT = ['#2E5590', '#3D8BFF', '#FFB020', '#FF6B4A'] as const;

/** Heat ramp: rest → light → moderate → high → max. */
export function heatColor(i: number | undefined): string {
  if (!i || i <= 0.02) return BASE;
  if (i < 0.25) return HEAT[0];
  if (i < 0.5) return HEAT[1];
  if (i < 0.8) return HEAT[2];
  return HEAT[3];
}

const SECONDARY = '#2A5A9E';

function shade(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.max(0, Math.min(255, Math.round(c + (amt > 0 ? (255 - c) * amt : c * amt))));
  return `#${[f(n >> 16), f((n >> 8) & 255), f(n & 255)].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

const GRADIENT_COLORS = [BASE, SKIN_FILL, SECONDARY, colors.primary, ...HEAT];

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
};

export function BodyMap({ view, sex = 'male', heat, primary = [], secondary = [], selected, onPressMuscle, width = 160 }: BodyMapProps) {
  // Gradient ids must be unique per instance: on web, url(#id) resolves document-wide, and screens kept
  // mounted (hidden) in the navigation stack would otherwise capture the reference.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const gid = (c: string) => `g${uid}${c.slice(1)}`;
  // Resolve a fill per artwork slug (max intensity when several muscles share one).
  const slugFill = new Map<Slug, string>();
  const slugMuscle = new Map<Slug, MuscleId>();
  for (const [m, slug] of Object.entries(MUSCLE_SLUG) as [MuscleId, Slug | null][]) {
    if (!slug) continue;
    let color = BASE;
    if (heat) {
      const current = [...Object.entries(MUSCLE_SLUG)].filter(([, s]) => s === slug).map(([mm]) => heat[mm as MuscleId] ?? 0);
      color = heatColor(Math.max(0, ...current));
    } else if ([...Object.entries(MUSCLE_SLUG)].some(([mm, s]) => s === slug && primary.includes(mm as MuscleId))) color = colors.primary;
    else if ([...Object.entries(MUSCLE_SLUG)].some(([mm, s]) => s === slug && secondary.includes(mm as MuscleId))) color = SECONDARY;
    slugFill.set(slug, color);
    if (!slugMuscle.has(slug) || m === selected) slugMuscle.set(slug, m);
  }
  const selectedSlug = selected ? MUSCLE_SLUG[selected] : null;
  const viewBox = view === 'front' ? '0 0 724 1448' : '724 0 724 1448';
  const strokeW = Math.max(1.5, 400 / width);

  return (
    <Svg width={width} height={width * 2} viewBox={viewBox}>
      <Defs>
        {GRADIENT_COLORS.map((c) => (
          <RadialGradient key={c} id={gid(c)} cx="38%" cy="30%" rx="75%" ry="75%" fx="35%" fy="25%">
            <Stop offset="0" stopColor={shade(c, 0.28)} />
            <Stop offset="0.55" stopColor={c} />
            <Stop offset="1" stopColor={shade(c, -0.45)} />
          </RadialGradient>
        ))}
      </Defs>
      {ASSETS[sex][view].map((part) => {
        const slug = part.slug as Slug;
        const isSkin = SKIN.includes(slug);
        const fill = isSkin ? SKIN_FILL : (slugFill.get(slug) ?? BASE);
        const muscle = slugMuscle.get(slug);
        const isSel = !!selectedSlug && selectedSlug === slug;
        const female = sex === 'female';
        const sx = female ? (FEMALE_WIDTH[slug] ?? 1) : 1;
        const cx = view === 'front' ? 362 : 1086;
        const smooth = female && FEMALE_SMOOTH.includes(slug) && !isSel;
        const paths = [...(part.path?.common ?? []), ...(part.path?.left ?? []), ...(part.path?.right ?? [])];
        return (
          <G key={slug} transform={sx === 1 ? undefined : `translate(${cx} 0) scale(${sx} 1) translate(${-cx} 0)`}>
            {paths.map((d, i) => (
              <Path
                key={i}
                d={d}
                fill={smooth ? shade(fill, -0.08) : `url(#${gid(fill)})`}
                stroke={isSel ? '#FFFFFF' : smooth ? shade(fill, -0.08) : colors.bg}
                strokeWidth={isSel ? strokeW * 2.2 : female ? strokeW * 0.75 : strokeW}
                strokeLinejoin="round"
                onPress={onPressMuscle && muscle && !isSkin ? () => onPressMuscle(muscle) : undefined}
              />
            ))}
          </G>
        );
      })}
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
  const steps = [
    { c: BASE, l: 'Rest' },
    { c: HEAT[0], l: 'Light' },
    { c: HEAT[1], l: 'Moderate' },
    { c: HEAT[2], l: 'High' },
    { c: HEAT[3], l: 'Max' },
  ];
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, flexWrap: 'wrap' }}>
      {steps.map((s) => (
        <View key={s.l} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: s.c }} />
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>{s.l}</Text>
        </View>
      ))}
    </View>
  );
}
