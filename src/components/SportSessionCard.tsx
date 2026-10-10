import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { BodyMap } from '@/components/BodyMap';
import { Card, Row, Stat } from '@/components/ui';
import { formatDate } from '@/lib/dates';
import { intensities } from '@/lib/muscles';
import { resultLabel, sessionMuscleLoad, sportMeta, workoutById, type SportSession } from '@/lib/sports';
import { colors } from '@/lib/theme';
import { useBodySex } from '@/lib/useBodySex';

export function SportSessionCard({ session, index }: { session: SportSession; index: number }) {
  const router = useRouter();
  const sex = useBodySex();
  const w = workoutById(session.workoutId);
  const meta = sportMeta(session.sport);
  const heat = intensities(sessionMuscleLoad(session));
  return (
    <Card
      onPress={() => router.push(`/sport/session/${session.id}`)}
      testID={`sport-card-${index}`}
      style={{ borderLeftWidth: 3, borderLeftColor: meta.color }}
    >
      <Row style={{ justifyContent: 'space-between' }}>
        <Row style={{ gap: 8, flex: 1 }}>
          <Text style={{ fontSize: 16 }}>{meta.emoji}</Text>
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700', flexShrink: 1 }} numberOfLines={1} testID={`sport-card-title-${index}`}>
            {w?.name ?? meta.label} · {resultLabel(session)}
          </Text>
        </Row>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>{formatDate(session.date)}</Text>
      </Row>
      <Row style={{ alignItems: 'center' }}>
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <Stat label="Duration" value={`${session.durationMin}m`} />
          <Stat label="RPE" value={String(session.rpe)} />
          {session.goals !== undefined ? <Stat label="Goals" value={String(session.goals)} /> : null}
        </View>
        <BodyMap sex={sex} view="front" heat={heat} width={40} />
        <BodyMap sex={sex} view="back" heat={heat} width={40} />
      </Row>
    </Card>
  );
}
