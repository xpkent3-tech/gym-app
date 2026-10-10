import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { BodyPair } from '@/components/BodyMap';
import { ConfirmButton } from '@/components/ConfirmButton';
import { intensities, runLoad } from '@/lib/muscles';

import { Body, Button, Card, H1, Label, Pill, Row, Screen, Stat } from '@/components/ui';
import { formatDate, todayISO } from '@/lib/dates';
import { formatDuration, formatKm, formatPace } from '@/lib/pace';
import { rankRunner } from '@/lib/rank';
import { prsSetBy } from '@/lib/records';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import { useInvite } from '@/lib/useInvite';
import { celebrationFor } from '@/lib/progression';
import { runTypeMeta } from '@/lib/types';

export default function RunDetail() {
  const { id, fresh } = useLocalSearchParams<{ id: string; fresh?: string }>();
  const router = useRouter();
  const { runs, profile, deleteRun, plan, friends, invitesSent } = useStore();
  const run = runs.find((r) => r.id === id);
  const prs = useMemo(() => (run ? prsSetBy(run, runs) : []), [run, runs]);
  const rank = useMemo(() => (profile ? rankRunner(profile, runs) : null), [profile, runs]);
  const invite = useInvite();
  const celebration = useMemo(
    () => (run && profile && fresh === '1' ? celebrationFor({ profile, runs, plan, friends, invitesSent }, run.id, todayISO()) : null),
    [run, profile, runs, plan, friends, invitesSent, fresh],
  );
  const done = () => (router.canGoBack() ? router.back() : router.replace('/'));

  if (!run) {
    return (
      <Screen>
        <Body>Run not found.</Body>
        <Button title="Back" onPress={() => router.replace('/')} />
      </Screen>
    );
  }
  const meta = runTypeMeta(run.type);
  const isFresh = fresh === '1';

  return (
    <Screen testID="run-detail">
      <Row style={{ justifyContent: 'space-between' }}>
        <Pressable onPress={done} hitSlop={12} testID="run-back">
          <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>{isFresh ? 'Done' : '‹ Back'}</Text>
        </Pressable>
        <Text style={{ color: colors.textMuted }}>{formatDate(run.date)}</Text>
      </Row>

      {isFresh ? (
        <View style={{ alignItems: 'center', gap: 4, paddingVertical: 8 }}>
          <Text style={{ fontSize: 44 }}>{prs.length ? '🏆' : '✅'}</Text>
          <H1 testID="run-saved-title">{prs.length ? 'New personal record!' : 'Run saved'}</H1>
          <Body>{prs.length ? `Fastest ${prs.join(', ')} yet. Keep it up.` : 'Another brick in the wall. Nice work.'}</Body>
        </View>
      ) : (
        <H1>{meta.label} Run</H1>
      )}

      {celebration ? (
        <Card testID="celebration" style={{ borderColor: colors.primary + '88' }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text style={{ color: colors.primary, fontSize: 24, fontWeight: '900' }} testID="celebration-xp">
              +{celebration.xpGained} XP
            </Text>
            {celebration.levelUp ? <Pill text={`LEVEL ${celebration.levelUp} ⬆`} color={colors.success} testID="celebration-level" /> : null}
          </Row>
          {celebration.tierUp ? (
            <Text style={{ color: colors.gold, fontWeight: '800', fontSize: 16 }} testID="celebration-tier">
              📈 Rank up! You’re now {celebration.tierUp}
            </Text>
          ) : null}
          {celebration.newBadges.length ? (
            <View style={{ gap: 6 }}>
              <Label>Badges unlocked</Label>
              <Row style={{ gap: 8, flexWrap: 'wrap' }}>
                {celebration.newBadges.map((b) => (
                  <Pill key={b.id} text={`${b.emoji} ${b.title}`} color={colors.gold} testID={`celebration-badge-${b.id}`} />
                ))}
              </Row>
            </View>
          ) : null}
        </Card>
      ) : null}

      <Card style={{ borderColor: meta.color + '66' }}>
        <Pill text={meta.label.toUpperCase()} color={meta.color} />
        <Row style={{ marginTop: 6 }}>
          <Stat label="Distance" value={`${formatKm(run.distanceKm)} km`} testID="detail-distance" />
          <Stat label="Time" value={formatDuration(run.durationSec)} />
          <Stat label="Pace" value={`${formatPace(run.durationSec / run.distanceKm)}`} sub="per km" testID="detail-pace" />
        </Row>
        <Row style={{ marginTop: 6 }}>
          <Stat label="Effort" value={`${run.effort}/10`} />
          <Stat label="Est. marathon" value={run.distanceKm >= 3 ? formatDuration(run.durationSec * Math.pow(42.195 / run.distanceKm, 1.06)) : '—'} />
        </Row>
        {prs.length ? (
          <Row style={{ gap: 6 }}>
            {prs.map((p) => (
              <Pill key={p} text={`🏆 ${p} PR`} color={colors.gold} testID={`detail-pr-${p}`} />
            ))}
          </Row>
        ) : null}
        {run.notes ? <Body>“{run.notes}”</Body> : null}
      </Card>

      <Card testID="run-muscles">
        <Label>Muscles worked</Label>
        <BodyPair heat={intensities(runLoad(run))} width={84} />
      </Card>

      {isFresh && rank ? (
        <Card onPress={() => router.push('/rank')} testID="detail-rank" style={{ borderColor: rank.tier.color + '66' }}>
          <Label>Your rank</Label>
          <Text style={{ color: rank.tier.color, fontSize: 26, fontWeight: '900' }}>Top {rank.topPct}%</Text>
          <Body>
            {rank.tier.name} · {profile?.sex === 'female' ? 'women' : 'men'} {rank.ageGroup}
          </Body>
        </Card>
      ) : null}

      {isFresh && prs.length ? <Button title="⚔️  Challenge a friend to beat it" variant="secondary" onPress={invite} testID="run-challenge" /> : null}
      {isFresh ? (
        <Button title="Done" onPress={done} testID="run-done" />
      ) : (
        <ConfirmButton
          title="Delete run"
          confirmTitle="Delete"
          message="This removes the run from your history, stats and records."
          testID="run-delete"
          onConfirm={() => {
            deleteRun(run.id);
            done();
          }}
        />
      )}
    </Screen>
  );
}
