import { useState } from 'react';
import { View } from 'react-native';

import { Field } from '@/components/Field';
import { Body, Button, Card, Chip, H1, Label, Row, Screen } from '@/components/ui';
import { raceDateInWeeks, todayISO } from '@/lib/dates';
import { parseDuration } from '@/lib/pace';
import { planStartFor } from '@/lib/plan';
import { runnerById } from '@/lib/community';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';
import type { Experience, Sex } from '@/lib/types';

const RACE_OPTIONS = [12, 16, 20];
const RECENT_RACES = [
  { label: '5K', km: 5 },
  { label: '10K', km: 10 },
  { label: 'Half', km: 21.0975 },
  { label: 'Marathon', km: 42.195 },
];

export default function Onboarding() {
  const { setProfile, pendingInvite } = useStore();
  const inviter = pendingInvite ? runnerById(pendingInvite) : undefined;
  const [name, setName] = useState('');
  const [sex, setSex] = useState<Sex>('male');
  const [age, setAge] = useState('32');
  const [experience, setExperience] = useState<Experience>('intermediate');
  const [weeklyKm, setWeeklyKm] = useState('30');
  const [weeksOut, setWeeksOut] = useState(16);
  const [raceKm, setRaceKm] = useState<number | null>(null);
  const [raceTime, setRaceTime] = useState('');

  const ageNum = parseInt(age, 10);
  const kmNum = parseFloat(weeklyKm);
  const raceSec = raceKm ? parseDuration(raceTime) : null;
  const valid = name.trim().length > 0 && ageNum >= 12 && ageNum <= 99 && kmNum >= 0 && (!raceKm || !raceTime || raceSec !== null);

  const submit = () => {
    const today = todayISO();
    const raceDate = raceDateInWeeks(today, weeksOut);
    setProfile({
      name: name.trim(),
      sex,
      age: ageNum,
      experience,
      weeklyKm: kmNum || 0,
      raceDate,
      planStart: planStartFor(today, raceDate),
      raceResult: raceKm && raceSec ? { distanceKm: raceKm, durationSec: raceSec } : undefined,
      createdAt: Date.now(),
    });
  };

  return (
    <Screen testID="onboarding-screen">
      <View style={{ gap: 6, marginTop: 12 }}>
        <Label style={{ color: colors.primary }}>Stride</Label>
        <H1>Train for your marathon.{'\n'}See where you rank.</H1>
        <Body>Log runs in seconds, follow a plan built around your race, and find out what percentile you're in.</Body>
      </View>

      {inviter ? (
        <Card style={{ borderColor: colors.primary }} testID="onboarding-invite">
          <Body>
            🤝 <Body style={{ color: colors.text, fontWeight: '700' }}>{inviter.name}</Body> invited you. You'll be friends as soon as you finish setting up.
          </Body>
        </Card>
      ) : null}

      <Card>
        <Field label="Your name" value={name} onChangeText={setName} placeholder="e.g. Alex" testID="onboarding-name" autoCapitalize="words" />
        <Label>Sex (for age-graded ranking)</Label>
        <Row style={{ gap: 8 }}>
          <Chip label="Male" selected={sex === 'male'} onPress={() => setSex('male')} testID="sex-male" />
          <Chip label="Female" selected={sex === 'female'} onPress={() => setSex('female')} testID="sex-female" />
        </Row>
        <Row style={{ gap: 12 }}>
          <Field label="Age" value={age} onChangeText={setAge} keyboardType="number-pad" testID="onboarding-age" />
          <Field label="Current km / week" value={weeklyKm} onChangeText={setWeeklyKm} keyboardType="decimal-pad" testID="onboarding-weekly" />
        </Row>
      </Card>

      <Card>
        <Label>Experience</Label>
        <Row style={{ gap: 8, flexWrap: 'wrap' }}>
          {(['beginner', 'intermediate', 'advanced'] as Experience[]).map((e) => (
            <Chip key={e} label={e[0].toUpperCase() + e.slice(1)} selected={experience === e} onPress={() => setExperience(e)} testID={`exp-${e}`} />
          ))}
        </Row>
        <Label style={{ marginTop: 8 }}>Race day is in</Label>
        <Row style={{ gap: 8 }}>
          {RACE_OPTIONS.map((w) => (
            <Chip key={w} label={`${w} weeks`} selected={weeksOut === w} onPress={() => setWeeksOut(w)} testID={`race-${w}`} />
          ))}
        </Row>
      </Card>

      <Card>
        <Label>Recent race (optional)</Label>
        <Body>Gives you an instant rank before you log anything.</Body>
        <Row style={{ gap: 8, flexWrap: 'wrap' }}>
          {RECENT_RACES.map((r) => (
            <Chip
              key={r.label}
              label={r.label}
              selected={raceKm === r.km}
              onPress={() => setRaceKm(raceKm === r.km ? null : r.km)}
              testID={`recent-${r.label}`}
            />
          ))}
        </Row>
        {raceKm ? (
          <Field
            label="Finish time"
            value={raceTime}
            onChangeText={setRaceTime}
            placeholder="h:mm:ss or mm:ss"
            testID="onboarding-race-time"
            error={raceTime && raceSec === null ? 'Use mm:ss or h:mm:ss' : undefined}
          />
        ) : null}
      </Card>

      <Button title="Start training" onPress={submit} disabled={!valid} testID="onboarding-submit" />
    </Screen>
  );
}
