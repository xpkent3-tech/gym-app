import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Body, Button, Card, Label, Pill, Row } from '@/components/ui';
import { formatDate } from '@/lib/dates';
import { isSessionDone, todayStatus, type PlanWeek } from '@/lib/plan';
import { colors } from '@/lib/theme';
import { runTypeMeta, type Run } from '@/lib/types';

export function TodayCard({ plan, runs, today }: { plan: PlanWeek[]; runs: Run[]; today: string }) {
  const router = useRouter();
  const st = todayStatus(plan, today);

  if (st.kind === 'before-plan') {
    return (
      <Card testID="today-card">
        <Label>Today</Label>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>Base building</Text>
        <Body>Your plan starts in {st.daysUntilStart} days. Keep running easy and log everything.</Body>
      </Card>
    );
  }
  if (st.kind === 'after-race') {
    return (
      <Card testID="today-card">
        <Label>Today</Label>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>Race complete 🎉</Text>
        <Body>Set a new race date in Profile to start your next block.</Body>
      </Card>
    );
  }
  if (st.kind === 'rest') {
    return (
      <Card testID="today-card">
        <Label>
          Today · Week {st.week.index + 1} · {st.week.phase}
        </Label>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>Rest day</Text>
        <Body>
          Recovery is training too.
          {st.next ? ` Next up: ${st.next.title} (${st.next.distanceKm} km) · ${formatDate(st.next.date, today)}.` : ''}
        </Body>
      </Card>
    );
  }

  const { session, week } = st;
  const meta = runTypeMeta(session.type);
  const done = isSessionDone(session, runs);
  return (
    <Card testID="today-card" style={{ borderColor: meta.color + '66' }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Label>
          Today · Week {week.index + 1} · {week.phase}
        </Label>
        {done ? <Pill text="DONE ✓" color={colors.success} testID="today-done" /> : null}
      </Row>
      <Row style={{ gap: 10 }}>
        <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: meta.color }} />
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }} testID="today-title">
          {session.title} · {session.distanceKm} km
        </Text>
      </Row>
      <Body>{session.description}</Body>
      {!done ? (
        <Row style={{ gap: 8 }}>
          <Button
            title="▶  Start run"
            testID="today-start"
            style={{ flex: 1 }}
            onPress={() => router.push({ pathname: '/live', params: { type: session.type, distance: String(session.distanceKm) } })}
          />
          <Button
            title="Log manually"
            variant="secondary"
            testID="today-log"
            style={{ flex: 1 }}
            onPress={() => router.push({ pathname: '/log', params: { type: session.type, distance: String(session.distanceKm) } })}
          />
        </Row>
      ) : null}
    </Card>
  );
}
