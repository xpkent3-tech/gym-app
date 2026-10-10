import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/lib/theme';

export function CalorieRing({ eaten, target, size = 168 }: { eaten: number; target: number; size?: number }) {
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = target > 0 ? Math.min(1, eaten / target) : 0;
  const over = eaten > target;
  const left = Math.round(target - eaten);
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={colors.surfaceAlt} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={over ? colors.danger : colors.primary}
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={`${c * pct} ${c}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={{ color: colors.text, fontSize: 34, fontWeight: '900' }} testID="food-kcal-left">
        {Math.abs(left)}
      </Text>
      <Text style={{ color: over ? colors.danger : colors.textDim, fontWeight: '700', fontSize: 13 }}>{over ? 'kcal over' : 'kcal left'}</Text>
    </View>
  );
}
