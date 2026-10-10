import { useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline, Text as SvgText } from 'react-native-svg';

import { formatDate } from '@/lib/dates';
import type { ChartPoint } from '@/lib/strength';
import { colors } from '@/lib/theme';

const H = 150;
const PAD = { l: 8, r: 36, t: 14, b: 14 };

/** Hevy-style progress line: latest value and date on top, y-axis labels on the right. */
export function LineChart({ points, unit = 'kg', testID }: { points: ChartPoint[]; unit?: string; testID?: string }) {
  const [w, setW] = useState(0);
  if (points.length === 0) {
    return (
      <Text style={{ color: colors.textMuted, paddingVertical: 24, textAlign: 'center' }} testID={testID ? `${testID}-empty` : undefined}>
        Log this exercise to see your progress.
      </Text>
    );
  }
  const latest = points[points.length - 1];
  const vals = points.map((p) => p.value);
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  const span = hi - lo || Math.max(hi * 0.2, 1);
  const min = hi === lo ? lo - span / 2 : lo;
  const max = hi === lo ? hi + span / 2 : hi;
  const iw = Math.max(w - PAD.l - PAD.r, 1);
  const x = (i: number) => PAD.l + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const y = (v: number) => PAD.t + (1 - (v - min) / (max - min)) * (H - PAD.t - PAD.b);
  const fmt = (v: number) => `${Math.round(v * 10) / 10}`;
  return (
    <View testID={testID} style={{ gap: 6 }}>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }} testID={testID ? `${testID}-latest` : undefined}>
        {`${fmt(latest.value)}${unit}`}
      </Text>
      <Text style={{ color: colors.textMuted, fontSize: 12 }}>{formatDate(latest.date)}</Text>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)}>
        {w > 0 ? (
          <Svg width={w} height={H}>
            {[min, (min + max) / 2, max].map((v) => (
              <Line key={v} x1={PAD.l} x2={PAD.l + iw} y1={y(v)} y2={y(v)} stroke={colors.border} strokeWidth={1} strokeDasharray="3 4" />
            ))}
            {[min, max].map((v) => (
              <SvgText key={`t${v}`} x={PAD.l + iw + 6} y={y(v) + 4} fill={colors.textMuted} fontSize={10}>
                {fmt(v)}
              </SvgText>
            ))}
            {points.length > 1 ? <Polyline points={points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ')} fill="none" stroke={colors.primary} strokeWidth={2.5} /> : null}
            {points.map((p, i) => (
              <Circle key={i} cx={x(i)} cy={y(p.value)} r={i === points.length - 1 ? 5 : 3.5} fill={i === points.length - 1 ? colors.gold : colors.primary} />
            ))}
          </Svg>
        ) : (
          <View style={{ height: H }} />
        )}
      </View>
    </View>
  );
}
