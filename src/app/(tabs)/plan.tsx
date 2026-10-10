import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { TodayCard } from '@/components/TodayCard';
import { Body, Button, Card, Chip, H1, Label, Pill, ProgressBar, Row, Screen } from '@/components/ui';
import { addDays, diffDays, formatDate, startOfWeek, todayISO, weekdayShort } from '@/lib/dates';
import { currentWeekIndex, isSessionDone, weekProgress, weekVolume, type PlanWeek } from '@/lib/plan';
import { SESSION_SPORTS, sportMeta, weeklySuggestions, type SessionSport } from '@/lib/sports';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import { runTypeMeta, type Run } from '@/lib/types';

const PHASE_COLOR: Record<string, string> = { Base: '#3DDC97', Build: '#4C9EFF', Peak: '#FF5C7A', Taper: '#FFB020', Race: '#B37BFF' };

function WeekCard({ week, runs, today }: { week: PlanWeek; runs: Run[]; today: string }) {
  const router = useRouter();
  const { done, total } = weekProgress(week, runs);
  const isCurrent = today >= week.start && today < addDays(week.start, 7);
  return (
    <Card style={isCurrent ? { borderColor: colors.primary } : undefined} testID={`plan-week-${week.index + 1}`}>
      <View>
        <Row style={{ justifyContent: 'space-between' }}>
          <Row style={{ gap: 8 }}>
            <Text style={{ color: colors.text, fontWeight: '800', fontSize: 17 }}>Week {week.index + 1}</Text>
            <Pill text={week.phase.toUpperCase()} color={PHASE_COLOR[week.phase]} />
          </Row>
          <Text style={{ color: colors.textDim, fontWeight: '700' }}>
            {Math.round(weekVolume(week))} km · {done}/{total}
          </Text>
        </Row>
        <View style={{ marginTop: 8 }}>
          <ProgressBar value={total ? done / total : 0} color={PHASE_COLOR[week.phase]} height={6} />
        </View>
      </View>
      {week.sessions.map((s) => {
        const meta = runTypeMeta(s.type);
        const sDone = isSessionDone(s, runs);
        const canLog = !sDone && s.date <= today;
        return (
          <Pressable
            key={s.date}
            disabled={!canLog}
            testID={`session-${s.date}`}
            onPress={() => router.push({ pathname: '/log', params: { type: s.type, distance: String(s.distanceKm) } })}
            style={{ flexDirection: 'row', gap: 12, alignItems: 'center', paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.border }}
          >
            <Text style={{ color: s.date === today ? colors.primary : colors.textMuted, width: 34, fontWeight: '700' }}>{weekdayShort(s.date)}</Text>
            <View style={{ width: 4, alignSelf: 'stretch', borderRadius: 2, backgroundColor: meta.color }} />
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>
                {s.title} · {s.distanceKm} km
              </Text>
              <Text style={{ color: colors.textDim, fontSize: 13 }} numberOfLines={2}>
                {s.description}
              </Text>
            </View>
            <Text style={{ fontSize: 18, color: sDone ? colors.success : colors.textMuted }}>{sDone ? '✓' : s.date < today ? '–' : '○'}</Text>
          </Pressable>
        );
      })}
    </Card>
  );
}

function MarathonPlan() {
  const { plan, runs, profile } = useStore();
  const today = todayISO();
  const current = currentWeekIndex(plan, today);
  const [shown, setShown] = useState<number>(current);
  if (!profile || !plan.length) return null;
  const idx = Math.min(Math.max(shown, 0), plan.length - 1);
  const week = plan[idx];
  const totalDone = plan.reduce((s, w) => s + weekProgress(w, runs).done, 0);
  const total = plan.reduce((s, w) => s + w.sessions.length, 0);
  const maxKm = Math.max(...plan.map(weekVolume));

  return (
    <>
      <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>🏃 Marathon plan</Text>
      <Body testID="plan-summary">
        {plan.length} weeks · race day {formatDate(profile.raceDate, today)} · {totalDone}/{total} sessions done
      </Body>
      <TodayCard plan={plan} runs={runs} today={today} />

      <Card>
        <Label>Volume by week</Label>
        <Row style={{ alignItems: 'flex-end', gap: 3, height: 72 }}>
          {plan.map((w) => (
            <Pressable
              key={w.index}
              onPress={() => setShown(w.index)}
              testID={`plan-bar-${w.index + 1}`}
              style={{ flex: 1, height: '100%', justifyContent: 'flex-end' }}
            >
              <View
                style={{
                  height: `${Math.max(8, (weekVolume(w) / maxKm) * 100)}%`,
                  borderRadius: 3,
                  backgroundColor: PHASE_COLOR[w.phase],
                  opacity: w.index === idx ? 1 : w.index === current ? 0.7 : 0.35,
                }}
              />
            </Pressable>
          ))}
        </Row>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>W1</Text>
          <Text style={{ color: colors.textMuted, fontSize: 11 }}>Race</Text>
        </Row>
      </Card>

      <Row style={{ justifyContent: 'space-between' }}>
        <Pressable onPress={() => setShown(idx - 1)} disabled={idx === 0} hitSlop={10} testID="plan-prev">
          <Text style={{ color: idx === 0 ? colors.textMuted : colors.primary, fontSize: 16, fontWeight: '700' }}>‹ Prev</Text>
        </Pressable>
        <Row style={{ gap: 8 }}>
          <Chip label="This week" selected={idx === current} onPress={() => setShown(current)} testID="plan-this-week" />
          <Chip label="Race week" selected={idx === plan.length - 1} onPress={() => setShown(plan.length - 1)} testID="plan-race-week" />
        </Row>
        <Pressable onPress={() => setShown(idx + 1)} disabled={idx === plan.length - 1} hitSlop={10} testID="plan-next">
          <Text style={{ color: idx === plan.length - 1 ? colors.textMuted : colors.primary, fontSize: 16, fontWeight: '700' }}>Next ›</Text>
        </Pressable>
      </Row>

      <WeekCard week={week} runs={runs} today={today} />
    </>
  );
}

function SportWeek({ sport, weekIndex }: { sport: SessionSport; weekIndex: number }) {
  const router = useRouter();
  const meta = sportMeta(sport);
  return (
    <Card testID={`plan-sport-${sport}`} style={{ borderLeftWidth: 3, borderLeftColor: meta.color }}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>
          {meta.emoji} {meta.label} · this week
        </Text>
        <Pressable onPress={() => router.push({ pathname: '/sport/[sport]', params: { sport } })} hitSlop={8} testID={`plan-sport-${sport}-all`}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>All ›</Text>
        </Pressable>
      </Row>
      {weeklySuggestions(sport, weekIndex).map((w) => (
        <Row key={w.id} style={{ gap: 10, paddingVertical: 6, borderTopWidth: 1, borderTopColor: colors.border }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>{w.name}</Text>
            <Text style={{ color: colors.textDim, fontSize: 13 }} numberOfLines={2}>
              {w.description}
            </Text>
          </View>
          <Pressable
            onPress={() => router.push({ pathname: '/sport/log', params: { workout: w.id } })}
            testID={`plan-log-${w.id}`}
            style={{ backgroundColor: meta.color, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 }}
          >
            <Text style={{ color: '#111', fontWeight: '800' }}>Log</Text>
          </Pressable>
        </Row>
      ))}
    </Card>
  );
}

export default function Plan() {
  const { profile } = useStore();
  const router = useRouter();
  if (!profile) return null;
  const sports = profile.sports ?? ['running'];
  const weekIndex = Math.floor(diffDays('2026-01-05', startOfWeek(todayISO())) / 7);
  return (
    <Screen testID="plan-screen">
      <H1>Training Plan</H1>
      <Body>{sports.length > 1 ? 'Your hybrid week — one plan per sport.' : 'Your week, built around your goal.'}</Body>
      {sports.includes('running') ? <MarathonPlan /> : null}
      {SESSION_SPORTS.filter((s) => sports.includes(s)).map((s) => (
        <SportWeek key={s} sport={s} weekIndex={weekIndex} />
      ))}
      {sports.includes('strength') ? (
        <Card testID="plan-sport-strength" style={{ borderLeftWidth: 3, borderLeftColor: sportMeta('strength').color }}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>🏋️ Strength · this week</Text>
          <Body>Two 40-minute sessions. Start from what your muscle map says you’ve neglected.</Body>
          <Button title="Start strength workout" variant="secondary" onPress={() => router.push('/workouts')} testID="plan-strength" />
        </Card>
      ) : null}
    </Screen>
  );
}
