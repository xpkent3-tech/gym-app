import { Text, View } from 'react-native';

import { colors } from '@/lib/theme';

export function LevelChip({ level, streak }: { level: number; streak: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
      <View style={{ backgroundColor: colors.primaryDim, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
        <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12 }} testID="level-chip">
          Lv {level}
        </Text>
      </View>
      <View style={{ backgroundColor: streak ? '#3A2410' : colors.surfaceAlt, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 }}>
        <Text style={{ color: streak ? colors.warning : colors.textMuted, fontWeight: '800', fontSize: 12 }} testID="streak-chip">
          {streak ? `🔥 ${streak}-week streak` : 'Run 3× this week to start a streak'}
        </Text>
      </View>
    </View>
  );
}
