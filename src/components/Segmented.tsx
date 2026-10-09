import { Pressable, Text, View } from 'react-native';

import { colors } from '@/lib/theme';

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  testID,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  testID: string;
}) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 12, padding: 3, borderWidth: 1, borderColor: colors.border }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            onPress={() => onChange(o.value)}
            testID={`${testID}-${o.value}`}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            style={{ flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center', backgroundColor: active ? colors.surfaceAlt : 'transparent' }}
          >
            <Text style={{ color: active ? colors.text : colors.textMuted, fontWeight: '700' }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
