import { Pressable, Text, Vibration, View } from 'react-native';
import { useEffect } from 'react';

import { formatDuration } from '@/lib/pace';
import { colors } from '@/lib/theme';

/** Sticky rest countdown shown after a set is ticked done. Vibrates (native) when it reaches zero. */
export function RestBar({ remaining, total, onAdjust, onSkip }: { remaining: number; total: number; onAdjust: (delta: number) => void; onSkip: () => void }) {
  useEffect(() => {
    if (remaining === 0) Vibration.vibrate(400);
  }, [remaining]);
  const pct = total > 0 ? Math.min(1, remaining / total) : 0;
  return (
    <View
      testID="rest-bar"
      style={{ backgroundColor: colors.surface, borderColor: colors.primary, borderWidth: 1, borderRadius: 14, padding: 12, gap: 8 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ color: colors.textDim, fontWeight: '700' }}>{remaining > 0 ? 'Rest' : 'Rest over — go!'}</Text>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800' }} testID="rest-time">
          {formatDuration(remaining)}
        </Text>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <Pressable onPress={() => onAdjust(-15)} hitSlop={8} testID="rest-minus">
            <Text style={{ color: colors.primary, fontWeight: '800' }}>−15</Text>
          </Pressable>
          <Pressable onPress={() => onAdjust(15)} hitSlop={8} testID="rest-plus">
            <Text style={{ color: colors.primary, fontWeight: '800' }}>+15</Text>
          </Pressable>
          <Pressable onPress={onSkip} hitSlop={8} testID="rest-skip">
            <Text style={{ color: colors.danger, fontWeight: '800' }}>Skip</Text>
          </Pressable>
        </View>
      </View>
      <View style={{ height: 4, backgroundColor: colors.surfaceAlt, borderRadius: 2 }}>
        <View style={{ height: 4, width: `${pct * 100}%`, backgroundColor: colors.primary, borderRadius: 2 }} />
      </View>
    </View>
  );
}
