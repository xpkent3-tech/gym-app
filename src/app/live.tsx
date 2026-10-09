import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import { ConfirmButton } from '@/components/ConfirmButton';
import { Body, Button, Card, Label, Row, Screen } from '@/components/ui';
import { formatDuration } from '@/lib/pace';
import { elapsed, IDLE, isRunning, lap, pause, resume, splits, start, type Stopwatch } from '@/lib/stopwatch';
import { colors } from '@/lib/theme';
import { runTypeMeta, type RunType } from '@/lib/types';

const fmt = (ms: number) => formatDuration(Math.floor(ms / 1000));

export default function LiveRun() {
  const params = useLocalSearchParams<{ type?: RunType; distance?: string }>();
  const router = useRouter();
  const [sw, setSw] = useState<Stopwatch>(() => start(IDLE, Date.now()));
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(t);
  }, []);

  const running = isRunning(sw);
  const ms = elapsed(sw, now);
  const laps = splits(sw);
  const meta = params.type ? runTypeMeta(params.type) : null;
  const close = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const finish = () => {
    const total = Math.max(1, Math.floor(elapsed(sw, Date.now()) / 1000));
    const notes = laps.length ? `Laps: ${laps.map((l, i) => `${i + 1}) ${fmt(l)}`).join(', ')}` : '';
    router.replace({
      pathname: '/log',
      params: {
        duration: formatDuration(total),
        notes,
        ...(params.type ? { type: params.type } : {}),
        ...(params.distance ? { distance: params.distance } : {}),
      },
    });
  };

  return (
    <Screen testID="live-screen">
      <Row style={{ justifyContent: 'space-between' }}>
        <Label style={{ color: running ? colors.success : colors.warning }}>{running ? '● Recording' : '❚❚ Paused'}</Label>
        {meta ? (
          <Text style={{ color: meta.color, fontWeight: '700' }}>
            {meta.label}
            {params.distance ? ` · ${params.distance} km planned` : ''}
          </Text>
        ) : null}
      </Row>
      <View style={{ alignItems: 'center', paddingVertical: 32 }}>
        <Text style={{ color: colors.text, fontSize: 76, fontWeight: '900', fontVariant: ['tabular-nums'], letterSpacing: -2 }} testID="live-elapsed">
          {fmt(ms)}
        </Text>
        <Label>elapsed</Label>
      </View>
      <Row style={{ gap: 10 }}>
        <Button
          title={running ? 'Pause' : 'Resume'}
          variant="secondary"
          style={{ flex: 1 }}
          testID="live-toggle"
          onPress={() => setSw((s) => (isRunning(s) ? pause(s, Date.now()) : resume(s, Date.now())))}
        />
        <Button title="Lap" variant="secondary" style={{ flex: 1 }} disabled={!running} testID="live-lap" onPress={() => setSw((s) => lap(s, Date.now()))} />
      </Row>
      <Button title="Finish & log" onPress={finish} testID="live-finish" />
      {laps.length ? (
        <Card testID="live-laps">
          {[...laps]
            .map((l, i) => ({ l, i }))
            .reverse()
            .map(({ l, i }) => (
              <Row key={i} style={{ justifyContent: 'space-between', paddingVertical: 4 }}>
                <Text style={{ color: colors.textDim, fontWeight: '700' }}>Lap {i + 1}</Text>
                <Text style={{ color: colors.text, fontWeight: '800', fontVariant: ['tabular-nums'] }}>{fmt(l)}</Text>
              </Row>
            ))}
        </Card>
      ) : (
        <Body style={{ textAlign: 'center' }}>Tap Lap at each km marker (or interval rep) to record splits.</Body>
      )}
      <ConfirmButton title="Discard run" confirmTitle="Discard" message="Stop timing and throw this run away?" testID="live-discard" onConfirm={close} />
    </Screen>
  );
}
