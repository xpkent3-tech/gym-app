import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { ConfirmButton } from '@/components/ConfirmButton';
import { useToast } from '@/components/Toast';
import { Body, Button, Card, H1, Label, Row, Screen, Stat } from '@/components/ui';
import { runnerActivity, runnerById, runnerTopPct } from '@/lib/community';
import { formatDate, todayISO } from '@/lib/dates';
import { formatDuration, formatKm, formatPace } from '@/lib/pace';
import { ageGroupLabel, tierFor } from '@/lib/rank';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import { runTypeMeta } from '@/lib/types';

export default function FriendProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const toast = useToast();
  const { friends, addFriend, removeFriend } = useStore();
  const runner = runnerById(id);
  const today = todayISO();
  const activity = useMemo(() => (runner ? runnerActivity(runner, today, 14) : []), [runner, today]);
  const back = () => (router.canGoBack() ? router.back() : router.replace('/friends'));

  if (!runner) {
    return (
      <Screen>
        <Body>Runner not found.</Body>
        <Button title="Back" onPress={back} />
      </Screen>
    );
  }
  const isFriend = friends.includes(runner.id);
  const pct = runnerTopPct(runner);
  const tier = tierFor(pct);
  const weekKm = runnerActivity(runner, today, 7).reduce((s, a) => s + a.distanceKm, 0);

  return (
    <Screen testID="friend-screen">
      <Pressable onPress={back} hitSlop={12} testID="friend-back">
        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>‹ Back</Text>
      </Pressable>
      <Row style={{ gap: 14 }}>
        <Avatar name={runner.name} color={runner.color} size={64} />
        <View style={{ flex: 1 }}>
          <H1 testID="friend-name">{runner.name}</H1>
          <Body>
            @{runner.handle} · {runner.city}
          </Body>
        </View>
      </Row>
      <Card style={{ borderColor: tier.color + '66' }}>
        <Row>
          <Stat
            label={`${tier.name} · ${runner.sex === 'female' ? 'women' : 'men'} ${ageGroupLabel(runner.age)}`}
            value={`Top ${pct}%`}
            testID="friend-top-pct"
          />
          <Stat label="Marathon" value={formatDuration(runner.marathonSec)} />
          <Stat label="Last 7 days" value={`${formatKm(weekKm)} km`} />
        </Row>
      </Card>
      {!isFriend ? (
        <Button
          title={`Add ${runner.name.split(' ')[0]}`}
          testID="friend-add"
          onPress={() => {
            addFriend(runner.id);
            toast(`Added ${runner.name.split(' ')[0]} 🤝`);
          }}
        />
      ) : null}
      <Label>Recent runs</Label>
      {activity.slice(0, 8).map((a) => {
        const meta = runTypeMeta(a.type);
        return (
          <Card key={a.id}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Row style={{ gap: 8 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: meta.color }} />
                <Text style={{ color: colors.text, fontWeight: '700' }}>{meta.label} Run</Text>
              </Row>
              <Text style={{ color: colors.textMuted }}>{formatDate(a.date, today)}</Text>
            </Row>
            <Text style={{ color: colors.textDim }}>
              {formatKm(a.distanceKm)} km · {formatDuration(a.durationSec)} · {formatPace(a.durationSec / a.distanceKm)}/km
            </Text>
          </Card>
        );
      })}
      {isFriend ? (
        <ConfirmButton
          title="Remove friend"
          confirmTitle="Remove"
          message={`Remove ${runner.name} from your friends? Their runs will leave your feed and leaderboard.`}
          testID="friend-remove"
          onConfirm={() => {
            removeFriend(runner.id);
            toast(`Removed ${runner.name.split(' ')[0]}`);
            back();
          }}
        />
      ) : null}
    </Screen>
  );
}
