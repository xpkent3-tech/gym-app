import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { colors, radius, space } from '@/lib/theme';

export function Field({ label, hint, error, testID, ...props }: TextInputProps & { label: string; hint?: string; error?: string }) {
  return (
    <View style={{ gap: space(1.5), flex: 1 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        testID={testID}
        // A unique DOM id on web: Maestro re-finds the focused input by XPath, which otherwise falls back to
        // (shared) class names and types into the first input on the page.
        nativeID={testID}
        placeholderTextColor={colors.textMuted}
        {...props}
        style={[s.input, error ? { borderColor: colors.danger } : null, props.style]}
      />
      {error ? <Text style={[s.hint, { color: colors.danger }]}>{error}</Text> : hint ? <Text style={s.hint}>{hint}</Text> : null}
    </View>
  );
}

const s = StyleSheet.create({
  label: { color: colors.textDim, fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 17,
    paddingHorizontal: space(3.5),
    paddingVertical: space(3),
    fontWeight: '600',
  },
  hint: { color: colors.textMuted, fontSize: 12 },
});
