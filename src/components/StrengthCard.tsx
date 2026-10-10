import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { BodyMap } from '@/components/BodyMap';
import { Card, Row } from '@/components/ui';
import { formatDate } from '@/lib/dates';
import { exerciseById } from '@/lib/exercises';
import type { StrengthSession } from '@/lib/muscles';
import { colors } from '@/lib/theme';

export function StrengthCard({ session, index }: { session: StrengthSession; index: number }) {
  const router = useRouter();
  const exs = session.exercises.map((e) => ({ ex: exerciseById(e.exerciseId), sets: e.sets }));
  const primary = [...new Set(exs.flatMap((e) => e.ex?.primary ?? []))];
  const totalSets = exs.reduce((s, e) => s + e.sets.length, 0);
  const volume = exs.reduce((s, e) => s + e.sets.reduce((v, x) => v + (x.kg ?? 0) * x.reps, 0), 0);
  return (
    <Card onPress={() => router.push('/body')} testID={`strength-card-${index}`}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row style={{ gap: 10 }}>
          <Text style={{ fontSize: 16 }}>🏋️</Text>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>Strength Workout</Text>
        </Row>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>{formatDate(session.date)}</Text>
      </Row>
      <Row style={{ gap: 12, alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 3 }}>
          {exs.map(({ ex, sets }) => (
            <Text key={ex?.id} style={{ color: colors.textDim }}>
              {sets.length} × {ex?.name}
            </Text>
          ))}
          <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
            {totalSets} sets{volume ? ` · ${Math.round(volume)} kg volume` : ''}
          </Text>
        </View>
        <BodyMap view="back" primary={primary} width={44} />
        <BodyMap view="front" primary={primary} width={44} />
      </Row>
    </Card>
  );
}
