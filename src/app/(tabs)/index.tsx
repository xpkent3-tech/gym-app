import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { RunCard } from '@/components/RunCard';
import { TodayCard } from '@/components/TodayCard';
import { Body, Button, Card, H1, H2, Label, Row, Screen, Stat } from '@/components/ui';
import { addDays, diffDays, todayISO } from '@/lib/dates';
import { formatKm } from '@/lib/pace';
import { prsSetBy } from '@/lib/records';
import { rankRunner } from '@/lib/rank';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

function greeting() {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
}

export default function Home() {
  const { profile, runs, plan } = useStore();
  const router = useRouter();
  const today = todayISO();
  const weekFrom = addDays(today, -6);
  const weekRuns = runs.filter((r) => r.date >= weekFrom);
  const weekKm = weekRuns.reduce((s, r) => s + r.distanceKm, 0);
  const rank = useMemo(() => (profile ? rankRunner(profile, runs) : null), [profile, runs]);
  const daysToRace = profile ? diffDays(today, profile.raceDate) : 0;

  if (!profile) return null;
  return (
    <Screen testID="home-screen">
      <View style={{ gap: 2 }}>
        <Body>{greeting()},</Body>
        <H1 testID="home-greeting">{profile.name} 👟</H1>
      </View>

      <Card>
        <Row>
          <Stat label="Last 7 days" value={`${formatKm(weekKm)} km`} testID="home-week-km" />
          <Stat label="Runs" value={String(weekRuns.length)} />
          <Stat label="Race day" value={daysToRace >= 0 ? `${daysToRace}d` : 'Done'} />
        </Row>
      </Card>

      <TodayCard plan={plan} runs={runs} today={today} />

      {rank ? (
        <Card onPress={() => router.push('/rank')} testID="home-rank-card" style={{ borderColor: rank.tier.color + '66' }}>
          <Label>Your rank</Label>
          <Text style={{ color: rank.tier.color, fontSize: 26, fontWeight: '900' }}>Top {rank.topPct}%</Text>
          <Body>{rank.tier.name} marathoner · tap for details</Body>
        </Card>
      ) : null}

      <H2>History</H2>
      {runs.length === 0 ? (
        <Card testID="history-empty">
          <Text style={{ color: colors.text, fontSize: 17, fontWeight: '700' }}>No runs yet</Text>
          <Body>Log your first run to unlock your rank and start your streak.</Body>
          <Button title="Log your first run" onPress={() => router.push('/log')} testID="empty-log" />
        </Card>
      ) : (
        runs.map((r, i) => <RunCard key={r.id} run={r} index={i} prs={prsSetBy(r, runs)} />)
      )}
    </Screen>
  );
}
