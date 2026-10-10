import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { HeatLegend, heatColor, RotatingBody } from '@/components/BodyMap';
import { Body, Button, Card, H1, Label, Row, Screen } from '@/components/ui';
import { formatDate } from '@/lib/dates';
import { balanceInsight, intensities, MUSCLES, type MuscleId } from '@/lib/muscles';
import { colors } from '@/lib/theme';
import { useWeeklyMuscles } from '@/lib/useMuscles';
import { useBodySex } from '@/lib/useBodySex';

export default function BodyScreen() {
  const sex = useBodySex();
  const router = useRouter();
  const week = useWeeklyMuscles();
  const heat = useMemo(() => intensities(week.load), [week]);
  const insight = useMemo(() => balanceInsight(week.strengthLoad), [week]);
  const [selected, setSelected] = useState<MuscleId | null>(null);
  const ranked = MUSCLES.filter((m) => (week.load[m.id] ?? 0) > 0).sort((a, b) => (week.load[b.id] ?? 0) - (week.load[a.id] ?? 0));
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <Screen testID="body-screen">
      <Pressable onPress={back} hitSlop={12} testID="body-back">
        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>‹ Back</Text>
      </Pressable>
      <H1>Muscles trained</H1>
      <Body>Last 7 days · runs and strength. Tap a muscle to see what worked it.</Body>

      <Card style={{ alignItems: 'center', paddingVertical: 20 }}>
        <RotatingBody sex={sex} heat={heat} selected={selected} onPressMuscle={setSelected} width={200} testID="body-map" />
        <HeatLegend />
      </Card>

      {selected ? (
        <Card testID="muscle-detail" style={{ borderColor: heatColor(heat[selected]) }}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }} testID="muscle-detail-name">
              {MUSCLES.find((m) => m.id === selected)?.label}
            </Text>
            <Text style={{ color: colors.textDim, fontWeight: '700' }}>{Math.round((heat[selected] ?? 0) * 100)}% of max</Text>
          </Row>
          {(week.contributors[selected] ?? []).length === 0 ? (
            <Body>Not trained in the last 7 days.</Body>
          ) : (
            (week.contributors[selected] ?? []).map((c, i) => (
              <Row key={`${c.id}-${i}`} style={{ justifyContent: 'space-between' }}>
                <Text style={{ color: colors.text }} testID={`muscle-contributor-${i}`}>
                  {c.kind === 'run' ? '🏃' : '🏋️'} {c.label}
                </Text>
                <Text style={{ color: colors.textMuted }}>{formatDate(c.date)}</Text>
              </Row>
            ))
          )}
        </Card>
      ) : null}

      <Card testID="balance-insight" style={{ borderColor: insight.missing.length ? colors.warning + '88' : colors.success }}>
        <Label>Runner strength balance</Label>
        {insight.missing.length === 0 ? (
          <Text style={{ color: colors.success, fontSize: 16, fontWeight: '800' }} testID="balance-ok">
            ✓ All key runner muscles got strength work this week
          </Text>
        ) : (
          <>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }} testID="balance-missing">
              No strength work this week: {insight.missing.map((m) => m.label).join(', ')}
            </Text>
            <Body>Two short sessions a week cut running injuries. Try:</Body>
            {insight.suggestions.map((e) => (
              <Pressable key={e.id} onPress={() => router.push(`/exercise/${e.id}`)} testID={`suggest-${e.id}`}>
                <Text style={{ color: colors.primary, fontWeight: '700', paddingVertical: 2 }}>→ {e.name}</Text>
              </Pressable>
            ))}
          </>
        )}
        <Button
          title="🏋️  Start strength workout"
          onPress={() =>
            router.push({ pathname: '/strength', params: insight.suggestions.length ? { add: insight.suggestions.map((e) => e.id).join(',') } : {} })
          }
          testID="body-start-strength"
        />
      </Card>

      <Card>
        <Label>Ranking · tap to inspect</Label>
        {ranked.length === 0 ? <Body testID="body-empty">Log a run or strength workout to light up the map.</Body> : null}
        {ranked.map((m) => (
          <Pressable key={m.id} onPress={() => setSelected(m.id)} testID={`muscle-row-${m.id}`}>
            <Row style={{ gap: 10, paddingVertical: 6 }}>
              <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: heatColor(heat[m.id]) }} />
              <Text style={{ color: selected === m.id ? colors.primary : colors.text, fontWeight: '700', width: 100 }}>
                {m.deep ? `${m.label} (deep)` : m.label}
              </Text>
              <View style={{ flex: 1, height: 6, backgroundColor: colors.surfaceAlt, borderRadius: 3 }}>
                <View style={{ width: `${(heat[m.id] ?? 0) * 100}%`, height: 6, backgroundColor: heatColor(heat[m.id]), borderRadius: 3 }} />
              </View>
            </Row>
          </Pressable>
        ))}
      </Card>
      <Body style={{ fontSize: 12, color: colors.textMuted }}>Muscle loads are estimates based on run type, distance and strength sets.</Body>
    </Screen>
  );
}
