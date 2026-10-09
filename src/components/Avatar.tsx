import { Text, View } from 'react-native';

export function Avatar({ name, color, size = 40 }: { name: string; color: string; size?: number }) {
  const initials = name
    .replace(/[^\p{L}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color + '33',
        borderWidth: 1.5,
        borderColor: color,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text style={{ color, fontWeight: '800', fontSize: size * 0.38 }}>{initials}</Text>
    </View>
  );
}
