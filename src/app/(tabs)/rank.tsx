import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { Segmented } from '@/components/Segmented';

import { Body, Button, Card, Chip, H1, Label, ProgressBar, Row, Screen, Stat } from '@/components/ui';
import { runnerActivity, runnerById, type Runner } from '@/lib/community';
import { buildBoard, type BoardMetric } from '@/lib/leaderboard';
import { todayISO } from '@/lib/dates';
import { formatDuration, formatKm } from '@/lib/pace';
import { distanceInLastDays, rankRunner, timeForTopPercent, TIERS, volumeTopPercent } from '@/lib/rank';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import { useInvite } from '@/lib/useInvite';

export default function Rank() {
  const { profile, runs, friends } = useStore();
  const router = useRouter();
  const invite = useInvite();
  const [view, setView] = useState<'everyone' | 'friends'>('everyone');
  const [metric, setMetric] = useState<BoardMetric>('week');
  const rank = useMemo(() => (profile ? rankRunner(profile, runs) : null), [profile, runs]);
  const weekKm = distanceInLastDays(runs, todayISO());
  const volPct = volumeTopPercent(weekKm);
  if (!profile) return null;
  const group = `${profile.sex === 'female' ? 'women' : 'men'} ${rank?.ageGroup ?? ''}`.trim();
  const today = todayISO();
  const board = buildBoard(
    [
      { id: 'you', name: profile.name, isYou: true, weekKm, marathonSec: rank?.prediction.timeSec ?? null },
      ...friends
        .map(runnerById)
        .filter((r): r is Runner => !!r)
        .map((r) => ({
          id: r.id,
          name: r.name,
          isYou: false,
          weekKm: runnerActivity(r, today, 7).reduce((s, a) => s + a.distanceKm, 0),
          marathonSec: r.marathonSec,
        })),
    ],
    metric,
  );

  return (
    <Screen testID="rank-screen">
      <H1>Your Rank</H1>
      <Segmented
        testID="rank-view"
        value={view}
        onChange={setView}
        options={[
          { value: 'everyone', label: 'Everyone' },
          { value: 'friends', label: 'Friends' },
        ]}
      />
      {view === 'friends' ? (
        <>
          <Row style={{ gap: 8 }}>
            <Chip label="This week" selected={metric === 'week'} onPress={() => setMetric('week')} testID="board-week" />
            <Chip label="Marathon" selected={metric === 'marathon'} onPress={() => setMetric('marathon')} testID="board-marathon" />
          </Row>
          {board.friendCount === 0 ? (
            <Card testID="board-empty">
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>Race your friends</Text>
              <Body>Add friends to see who’s putting in the miles and who’s fastest.</Body>
              <Row style={{ gap: 8 }}>
                <Button title="Find friends" variant="secondary" onPress={() => router.push('/friends')} style={{ flex: 1 }} testID="board-find" />
                <Button title="Invite" onPress={invite} style={{ flex: 1 }} testID="board-invite" />
              </Row>
            </Card>
          ) : (
            <Card testID="board">
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }} testID="board-summary">
                {board.aheadOf === board.friendCount
                  ? `You're #1 of ${board.friendCount + 1} 👑`
                  : board.aheadOf === 0
                    ? `Chasing ${board.friendCount} friend${board.friendCount === 1 ? '' : 's'}`
                    : `You're ahead of ${board.aheadOf} of ${board.friendCount} friends`}
              </Text>
              {board.next ? (
                <Body testID="board-next">
                  {metric === 'week'
                    ? `🎯 ${formatKm(board.next.gap + 0.1)} km to pass ${board.next.name.split(' ')[0]} this week`
                    : Number.isFinite(board.next.gap)
                      ? `🎯 ${formatDuration(board.next.gap)} faster to pass ${board.next.name.split(' ')[0]}`
                      : '🎯 Log a 3 km+ run to get a predicted time'}
                </Body>
              ) : null}
              {board.rows.map((r) => {
                const runner = runnerById(r.id);
                return (
                  <Row
                    key={r.id}
                    style={{
                      gap: 12,
                      paddingVertical: 8,
                      paddingHorizontal: 8,
                      borderRadius: 10,
                      backgroundColor: r.isYou ? colors.primaryDim : 'transparent',
                    }}
                  >
                    <Text
                      style={{ color: r.place <= 3 ? colors.gold : colors.textDim, width: 24, fontWeight: '900' }}
                      testID={r.isYou ? 'board-you-place' : undefined}
                    >
                      {r.place}
                    </Text>
                    <Avatar name={r.name} color={runner?.color ?? colors.primary} size={32} />
                    <Text style={{ color: colors.text, fontWeight: r.isYou ? '900' : '600', flex: 1 }} numberOfLines={1}>
                      {r.isYou ? `${r.name} (you)` : r.name}
                    </Text>
                    <Text style={{ color: colors.text, fontWeight: '800' }}>
                      {metric === 'week' ? `${formatKm(r.weekKm)} km` : r.marathonSec ? formatDuration(r.marathonSec) : '—'}
                    </Text>
                  </Row>
                );
              })}
              <Button title="Invite more friends" variant="secondary" onPress={invite} testID="board-invite-more" />
            </Card>
          )}
        </>
      ) : !rank ? (
        <Card testID="rank-empty">
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>Unranked</Text>
          <Body>Log a run of 3 km or more (or add a recent race in onboarding) and we’ll predict your marathon and rank you against other marathoners.</Body>
          <Button title="Log a run" onPress={() => router.push('/log')} testID="rank-log" />
        </Card>
      ) : (
        <>
          <Card style={{ borderColor: rank.tier.color, alignItems: 'center', paddingVertical: 24 }} testID="rank-hero">
            <Label>Marathon performance · {group}</Label>
            <Text style={{ color: rank.tier.color, fontSize: 56, fontWeight: '900', letterSpacing: -1 }} testID="rank-top-pct">
              Top {rank.topPct}%
            </Text>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }} testID="rank-tier">
              {rank.tier.name}
            </Text>
            <Body style={{ textAlign: 'center' }}>You’re faster than {100 - rank.topPct}% of marathon finishers in your group.</Body>
            <Row style={{ marginTop: 12, gap: 24, alignSelf: 'stretch' }}>
              <Stat label="Predicted marathon" value={formatDuration(rank.prediction.timeSec)} testID="rank-predicted" />
              <Stat label="Based on" value={`${formatKm(rank.prediction.basis.distanceKm)} km`} sub={formatDuration(rank.prediction.basis.durationSec)} />
            </Row>
          </Card>

          {rank.nextTier ? (
            <Card testID="rank-next">
              <Label>Next tier</Label>
              <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>
                {rank.nextTier.tier.name} · top {rank.nextTier.tier.maxTop}%
              </Text>
              <Body>
                Run a marathon in {formatDuration(rank.nextTier.targetSec)} — that’s {formatDuration(rank.nextTier.gapSec)} faster than your prediction.
              </Body>
            </Card>
          ) : (
            <Card>
              <Text style={{ color: colors.gold, fontSize: 18, fontWeight: '800' }}>You’re at the top tier. Legendary.</Text>
            </Card>
          )}

          <Card>
            <Label>Tier ladder</Label>
            {TIERS.map((t) => {
              const active = t.name === rank.tier.name;
              const time = t.maxTop < 100 ? `top ${t.maxTop}% · < ${formatDuration(timeForTopPercent(t.maxTop, profile.sex, profile.age))}` : 'everyone else';
              return (
                <Row key={t.name} style={{ justifyContent: 'space-between', paddingVertical: 6, opacity: active ? 1 : 0.6 }}>
                  <Row style={{ gap: 10 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: t.color }} />
                    <Text style={{ color: active ? t.color : colors.text, fontWeight: active ? '900' : '600' }}>
                      {t.name}
                      {active ? '  ← you' : ''}
                    </Text>
                  </Row>
                  <Text style={{ color: colors.textDim }}>{time}</Text>
                </Row>
              );
            })}
          </Card>
        </>
      )}

      {view === 'everyone' ? (
        <Card testID="rank-volume">
          <Label>Training volume · last 7 days</Label>
          {volPct === null ? (
            <Body>No runs in the last 7 days — log one to see how your mileage compares.</Body>
          ) : (
            <>
              <Text style={{ color: colors.text, fontSize: 24, fontWeight: '900' }} testID="rank-volume-pct">
                Top {volPct}%
              </Text>
              <Body>{formatKm(weekKm)} km this week vs. other marathon trainees.</Body>
              <ProgressBar value={(100 - volPct) / 100} color={colors.primary} />
            </>
          )}
        </Card>
      ) : null}
      <Body style={{ fontSize: 12, color: colors.textMuted }}>
        Rankings compare your Riegel-predicted marathon to a model of marathon finish times by sex and age. They’re estimates, not official results.
      </Body>
    </Screen>
  );
}
