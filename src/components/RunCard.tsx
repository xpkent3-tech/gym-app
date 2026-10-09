import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Card, Pill, Row, Stat } from '@/components/ui';
import { formatDate } from '@/lib/dates';
import { formatDuration, formatKm, formatPace } from '@/lib/pace';
import { colors } from '@/lib/theme';
import { runTypeMeta, type Run } from '@/lib/types';

export function RunCard({ run, prs = [], index }: { run: Run; prs?: string[]; index: number }) {
  const router = useRouter();
  const meta = runTypeMeta(run.type);
  return (
    <Card onPress={() => router.push(`/run/${run.id}`)} testID={`run-card-${index}`}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row style={{ gap: 10 }}>
          <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: meta.color }} />
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>{meta.label} Run</Text>
        </Row>
        <Text style={{ color: colors.textMuted, fontSize: 13 }}>{formatDate(run.date)}</Text>
      </Row>
      <Row style={{ marginTop: 4 }}>
        <Stat label="Distance" value={`${formatKm(run.distanceKm)} km`} />
        <Stat label="Time" value={formatDuration(run.durationSec)} />
        <Stat label="Pace" value={`${formatPace(run.durationSec / run.distanceKm)}/km`} />
      </Row>
      {prs.length > 0 || run.notes ? (
        <Row style={{ gap: 6, flexWrap: 'wrap' }}>
          {prs.map((p) => (
            <Pill key={p} text={`🏆 ${p} PR`} color={colors.gold} />
          ))}
          {run.notes ? (
            <Text style={{ color: colors.textDim, fontSize: 14 }} numberOfLines={2}>
              {run.notes}
            </Text>
          ) : null}
        </Row>
      ) : null}
    </Card>
  );
}
