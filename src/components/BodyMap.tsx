import { useEffect, useRef, useState } from 'react';
import { Animated, Platform, Pressable, Text, View } from 'react-native';
import Svg, { Defs, Ellipse, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

import type { MuscleId, MuscleLoad } from '@/lib/muscles';
import { colors } from '@/lib/theme';

export type BodyView = 'front' | 'back';

/** Mirrors an absolute M/C/L/Z path across the body's centre line (x = 100). */
function mirror(d: string): string {
  let i = 0;
  return d.replace(/-?\d+(\.\d+)?/g, (n) => (i++ % 2 === 0 ? String(200 - Number(n)) : n));
}

const both = (d: string) => [d, mirror(d)];

// Left half of the silhouette (viewer's left), from the neck round the arm and leg back to the centre line.
const HALF_SILHOUETTE =
  'M100 60 L90 60 C82 63 72 65 64 69 C56 72 50 79 49 90 C47 104 45 118 44 130 C42 146 39 160 38 174 C37 182 36 190 38 196 C42 200 46 196 46 190 ' +
  'C48 176 51 160 54 146 C56 132 58 118 61 106 L68 104 C70 120 72 138 74 152 C72 166 70 180 70 196 C68 220 68 244 72 262 C70 280 68 300 70 318 ' +
  'C71 330 72 344 72 356 C68 364 66 372 72 378 L92 378 C94 370 90 362 88 356 C88 340 90 324 90 308 C92 290 92 276 90 262 C94 240 96 214 98 192 L100 186 Z';

type Shape = { muscle: MuscleId; d: string[] };

const FRONT: Shape[] = [
  { muscle: 'upperBack', d: both('M93 58 C88 63 80 66 70 69 C78 71 86 70 92 68 C95 66 97 63 98 60 Z') },
  { muscle: 'shoulders', d: both('M66 70 C58 72 51 79 50 90 C50 96 52 100 54 102 C58 96 64 92 70 90 C72 82 72 76 70 70 Z') },
  { muscle: 'chest', d: both('M98 70 C88 68 78 69 72 72 C70 80 70 88 72 96 C80 102 92 102 98 98 Z') },
  { muscle: 'biceps', d: both('M54 105 C50 114 48 124 48 132 C52 136 56 134 58 128 C60 120 62 112 62 105 C60 101 56 101 54 105 Z') },
  { muscle: 'forearms', d: both('M47 139 C44 150 41 162 40 174 C42 178 45 178 47 176 C50 164 53 152 56 141 C54 137 50 136 47 139 Z') },
  {
    muscle: 'abs',
    d: [
      ...both('M89 104 L98 104 L98 116 L89 116 Z'),
      ...both('M89 119 L98 119 L98 131 L89 131 Z'),
      ...both('M89 134 L98 134 L98 146 L89 146 Z'),
      ...both('M89 149 L98 149 L98 170 C94 168 91 162 89 156 Z'),
    ],
  },
  { muscle: 'obliques', d: both('M86 104 L75 100 C73 116 73 134 76 150 C79 157 83 161 86 162 Z') },
  { muscle: 'hipFlexors', d: both('M76 160 C80 167 88 174 96 180 L93 190 C86 185 80 179 74 170 Z') },
  { muscle: 'adductors', d: both('M98 190 L98 230 C94 222 90 210 88 199 L92 193 Z') },
  { muscle: 'quads', d: both('M72 176 C70 196 70 220 72 246 C76 256 84 258 90 254 C92 236 90 214 87 201 C84 190 78 182 72 176 Z') },
  { muscle: 'calves', d: both('M72 272 C70 288 70 302 72 318 L76 320 C74 302 74 288 76 272 Z') },
  { muscle: 'tibialis', d: both('M78 270 C76 288 76 306 78 324 L84 326 C86 308 86 290 84 270 Z') },
];

const BACK: Shape[] = [
  { muscle: 'lats', d: both('M72 92 C70 108 72 124 78 138 C84 142 92 140 98 134 L98 116 C92 108 84 100 76 92 Z') },
  { muscle: 'upperBack', d: both('M100 58 C94 60 86 64 74 70 C80 76 88 84 93 96 L100 110 Z') },
  { muscle: 'shoulders', d: both('M66 70 C58 72 51 79 50 90 C50 96 52 100 54 102 C58 96 64 92 70 90 C72 82 72 76 70 70 Z') },
  { muscle: 'triceps', d: both('M54 105 C50 114 48 124 48 132 C52 136 56 134 58 128 C60 120 62 112 62 105 C60 101 56 101 54 105 Z') },
  { muscle: 'forearms', d: both('M47 139 C44 150 41 162 40 174 C42 178 45 178 47 176 C50 164 53 152 56 141 C54 137 50 136 47 139 Z') },
  { muscle: 'lowerBack', d: both('M88 138 C92 141 96 143 98 143 L98 164 C94 162 90 158 86 154 Z') },
  { muscle: 'obliques', d: both('M76 140 C76 150 78 158 84 162 L86 154 C82 150 79 146 76 140 Z') },
  { muscle: 'glutes', d: both('M98 166 C90 164 80 166 74 176 C72 188 76 198 86 202 C92 202 96 200 98 196 Z') },
  { muscle: 'hamstrings', d: both('M74 205 C72 220 72 238 74 254 C80 260 86 260 90 254 C94 238 96 220 96 207 C90 207 82 207 74 205 Z') },
  { muscle: 'adductors', d: both('M97 208 L98 208 L98 236 C96 230 95 220 97 208 Z') },
  { muscle: 'calves', d: both('M72 268 C68 282 68 298 72 312 C76 318 82 316 86 306 C90 292 90 280 86 268 C82 264 76 264 72 268 Z') },
];

export const SHAPES: Record<BodyView, Shape[]> = { front: FRONT, back: BACK };

const BASE = '#353B48';

/** Heat ramp: light → blue → amber → hot. */
export function heatColor(i: number | undefined): string {
  if (!i || i <= 0.02) return BASE;
  if (i < 0.25) return '#2E5590';
  if (i < 0.5) return '#3D8BFF';
  if (i < 0.8) return '#FFB020';
  return '#FF6B4A';
}

export type BodyMapProps = {
  view: BodyView;
  /** 0..1 intensities for heat mode. */
  heat?: MuscleLoad;
  /** Highlight mode: primary muscles full, secondary partial. */
  primary?: MuscleId[];
  secondary?: MuscleId[];
  selected?: MuscleId | null;
  onPressMuscle?: (m: MuscleId) => void;
  width?: number;
};

export function BodyMap({ view, heat, primary = [], secondary = [], selected, onPressMuscle, width = 160 }: BodyMapProps) {
  const fill = (m: MuscleId) => {
    if (heat) return heatColor(heat[m]);
    if (primary.includes(m)) return colors.primary;
    if (secondary.includes(m)) return '#2A5A9E';
    return BASE;
  };
  const id = `${view}-${width}`;
  return (
    <Svg width={width} height={(width * 400) / 200} viewBox="0 0 200 400">
      <Defs>
        <RadialGradient id={`skin-${id}`} cx="50%" cy="35%" rx="60%" ry="60%">
          <Stop offset="0" stopColor="#2E3340" />
          <Stop offset="1" stopColor="#1B1E25" />
        </RadialGradient>
        <LinearGradient id={`sheen-${id}`} x1="0" y1="0" x2="1" y2="0.3">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.12} />
          <Stop offset="0.5" stopColor="#FFFFFF" stopOpacity={0} />
          <Stop offset="1" stopColor="#000000" stopOpacity={0.16} />
        </LinearGradient>
      </Defs>
      <Ellipse cx={100} cy={34} rx={17} ry={21} fill={`url(#skin-${id})`} />
      <Path d="M92 52 L92 64 L108 64 L108 52 Z" fill={`url(#skin-${id})`} />
      <Path d={HALF_SILHOUETTE} fill={`url(#skin-${id})`} />
      <Path d={mirror(HALF_SILHOUETTE)} fill={`url(#skin-${id})`} />
      {SHAPES[view].flatMap((s) =>
        s.d.map((d, i) => (
          <Path
            key={`${s.muscle}-${i}`}
            d={d}
            fill={fill(s.muscle)}
            stroke={selected === s.muscle ? '#FFFFFF' : '#0B0C0F'}
            strokeWidth={selected === s.muscle ? 1.6 : 0.9}
            strokeLinejoin="round"
            onPress={onPressMuscle ? () => onPressMuscle(s.muscle) : undefined}
          />
        )),
      )}
      {/* Volumetric lighting over the whole figure */}
      <Path d={HALF_SILHOUETTE} fill={`url(#sheen-${id})`} pointerEvents="none" />
      <Path d={mirror(HALF_SILHOUETTE)} fill={`url(#sheen-${id})`} pointerEvents="none" />
      <Ellipse cx={100} cy={34} rx={17} ry={21} fill={`url(#sheen-${id})`} pointerEvents="none" />
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
    { c: '#2E5590', l: 'Light' },
    { c: '#3D8BFF', l: 'Moderate' },
    { c: '#FFB020', l: 'High' },
    { c: '#FF6B4A', l: 'Max' },
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
