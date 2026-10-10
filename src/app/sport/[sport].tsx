import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { BodyMap } from '@/components/BodyMap';
import { Body, Button, Card, H1, Label, Pill, Row, Screen } from '@/components/ui';
import type { MuscleId } from '@/lib/muscles';
import { SESSION_SPORTS, sportMeta, workoutsFor, type SessionSport } from '@/lib/sports';
import { colors } from '@/lib/theme';
import { useBodySex } from '@/lib/useBodySex';

const FORMAT_LABEL = { time: 'FOR TIME', amrap: 'AMRAP', duration: 'SESSION' } as const;

export default function SportLibrary() {
  const { sport } = useLocalSearchParams<{ sport: string }>();
  const router = useRouter();
  const sex = useBodySex();
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));
  if (!SESSION_SPORTS.includes(sport as SessionSport)) {
    return (
      <Screen>
        <Body>Unknown sport.</Body>
        <Button title="Back" onPress={back} />
      </Screen>
    );
  }
  const meta = sportMeta(sport as SessionSport);
  const list = workoutsFor(sport as SessionSport);
  return (
    <Screen testID="sport-library">
      <Pressable onPress={back} hitSlop={12} testID="sport-back">
        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>‹ Back</Text>
      </Pressable>
      <H1 testID="sport-title">
        {meta.emoji} {meta.label} workouts
      </H1>
      <Body>{meta.tagline}. Pick a workout to log it — each one shows the muscles it trains.</Body>
      {list.map((w, i) => {
        const top = (Object.entries(w.muscles) as [MuscleId, number][]).sort((a, b) => b[1] - a[1]);
        const primary = top.filter(([, v]) => v >= 0.75).map(([m]) => m);
        const secondary = top.filter(([, v]) => v < 0.75).map(([m]) => m);
        return (
          <Card key={w.id} onPress={() => router.push({ pathname: '/sport/log', params: { workout: w.id } })} testID={`workout-${i}`}>
            <Row style={{ gap: 12, alignItems: 'flex-start' }}>
              <View style={{ flex: 1, gap: 6 }}>
                <Row style={{ gap: 8, flexWrap: 'wrap' }}>
                  <Text style={{ color: colors.text, fontSize: 17, fontWeight: '800' }} testID={`workout-name-${i}`}>
                    {w.name}
                  </Text>
                </Row>
                <Row style={{ gap: 6 }}>
                  <Pill text={FORMAT_LABEL[w.format]} color={meta.color} />
                  <Pill text={`~${w.defaultMin} MIN`} color={colors.textDim} />
                  {w.benchmark && w.benchmark !== 'hyrox-race' ? <Pill text="BENCHMARK" color={colors.gold} /> : null}
                </Row>
                <Body style={{ fontSize: 14 }}>{w.description}</Body>
              </View>
              <BodyMap sex={sex} view="front" primary={primary} secondary={secondary} width={46} />
              <BodyMap sex={sex} view="back" primary={primary} secondary={secondary} width={46} />
            </Row>
          </Card>
        );
      })}
      <Label style={{ textAlign: 'center' }}>Tap a workout to log it</Label>
    </Screen>
  );
}
