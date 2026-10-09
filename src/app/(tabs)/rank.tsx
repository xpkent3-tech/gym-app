import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { Body, Button, Card, H1, Label, ProgressBar, Row, Screen, Stat } from '@/components/ui';
import { todayISO } from '@/lib/dates';
import { formatDuration, formatKm } from '@/lib/pace';
import { distanceInLastDays, rankRunner, timeForTopPercent, TIERS, volumeTopPercent } from '@/lib/rank';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function Rank() {
  const { profile, runs } = useStore();
  const router = useRouter();
  const rank = useMemo(() => (profile ? rankRunner(profile, runs) : null), [profile, runs]);
  const weekKm = distanceInLastDays(runs, todayISO());
  const volPct = volumeTopPercent(weekKm);
  if (!profile) return null;
  const group = `${profile.sex === 'female' ? 'women' : 'men'} ${rank?.ageGroup ?? ''}`.trim();

  return (
    <Screen testID="rank-screen">
      <H1>Your Rank</H1>
      {!rank ? (
        <Card testID="rank-empty">
          <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>Unranked</Text>
          <Body>Log a run of 3 km or more (or add a recent race in onboarding) and we'll predict your marathon and rank you against other marathoners.</Body>
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
            <Body style={{ textAlign: 'center' }}>
              You're faster than {100 - rank.topPct}% of marathon finishers in your group.
            </Body>
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
                Run a marathon in {formatDuration(rank.nextTier.targetSec)} — that's {formatDuration(rank.nextTier.gapSec)} faster than your prediction.
              </Body>
            </Card>
          ) : (
            <Card>
              <Text style={{ color: colors.gold, fontSize: 18, fontWeight: '800' }}>You're at the top tier. Legendary.</Text>
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
                  <Text style={{ color: colors.textDim }}>
                    {time}
                  </Text>
                </Row>
              );
            })}
          </Card>
        </>
      )}

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
      <Body style={{ fontSize: 12, color: colors.textMuted }}>
        Rankings compare your Riegel-predicted marathon to a model of marathon finish times by sex and age. They're estimates, not official results.
      </Body>
    </Screen>
  );
}
