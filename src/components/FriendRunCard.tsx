import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Card, Row, Stat } from '@/components/ui';
import { baselineKudos, type FriendRun, type Runner } from '@/lib/community';
import { formatDate } from '@/lib/dates';
import { formatDuration, formatKm, formatPace } from '@/lib/pace';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import { runTypeMeta } from '@/lib/types';

export function FriendRunCard({ run, runner, index }: { run: FriendRun; runner: Runner; index: number }) {
  const router = useRouter();
  const { kudos, toggleKudos } = useStore();
  const given = kudos.includes(run.id);
  const count = baselineKudos(run.id) + (given ? 1 : 0);
  const meta = runTypeMeta(run.type);
  return (
    <Card testID={`feed-item-${index}`}>
      <Pressable onPress={() => router.push(`/friend/${runner.id}`)}>
        <Row style={{ gap: 10 }}>
          <Avatar name={runner.name} color={runner.color} size={36} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{runner.name}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12 }}>
              {formatDate(run.date)} · {runner.city}
            </Text>
          </View>
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: meta.color }} />
          <Text style={{ color: colors.textDim, fontWeight: '600' }}>{meta.label}</Text>
        </Row>
      </Pressable>
      <Row style={{ marginTop: 4 }}>
        <Stat label="Distance" value={`${formatKm(run.distanceKm)} km`} />
        <Stat label="Time" value={formatDuration(run.durationSec)} />
        <Stat label="Pace" value={`${formatPace(run.durationSec / run.distanceKm)}/km`} />
      </Row>
      <Pressable
        onPress={() => toggleKudos(run.id)}
        testID={`kudos-${index}`}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 6,
          alignSelf: 'flex-start',
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 999,
          backgroundColor: given ? colors.warning + '26' : colors.surfaceAlt,
        }}
      >
        <Text style={{ fontSize: 15 }}>👏</Text>
        <Text style={{ color: given ? colors.warning : colors.textDim, fontWeight: '700' }} testID={`kudos-count-${index}`}>
          {given ? `Kudos given · ${count}` : `Kudos · ${count}`}
        </Text>
      </Pressable>
    </Card>
  );
}
