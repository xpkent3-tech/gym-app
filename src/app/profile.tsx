import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, Text } from 'react-native';

import { ConfirmButton } from '@/components/ConfirmButton';
import { Body, Card, H1, Label, Row, Screen, Stat } from '@/components/ui';
import { formatDate } from '@/lib/dates';
import { formatDuration, formatKm } from '@/lib/pace';
import { personalRecords, RECORD_DISTANCES } from '@/lib/records';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function ProfileTab() {
  const { profile, runs, reset } = useStore();
  const router = useRouter();
  const prs = useMemo(() => personalRecords(runs), [runs]);
  if (!profile) return null;
  const totalKm = runs.reduce((s, r) => s + r.distanceKm, 0);
  const totalSec = runs.reduce((s, r) => s + r.durationSec, 0);

  return (
    <Screen testID="profile-screen">
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} hitSlop={12} testID="profile-back">
        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>‹ Back</Text>
      </Pressable>
      <H1 testID="profile-name">{profile.name}</H1>
      <Body>
        {profile.sex === 'female' ? 'Female' : 'Male'} · {profile.age} · {profile.experience} · race {formatDate(profile.raceDate)}
      </Body>
      <Card>
        <Row>
          <Stat label="Total km" value={formatKm(totalKm)} testID="profile-total-km" />
          <Stat label="Runs" value={String(runs.length)} />
          <Stat label="Time" value={formatDuration(totalSec)} />
        </Row>
      </Card>
      <Card>
        <Row style={{ justifyContent: 'space-between' }}>
          <Label>Friend code</Label>
          <Text style={{ color: colors.text, fontWeight: '800', letterSpacing: 1 }} testID="profile-code">
            {profile.friendCode}
          </Text>
        </Row>
      </Card>
      <Card testID="profile-prs">
        <Label>Personal records</Label>
        {RECORD_DISTANCES.map((d) => {
          const pr = prs.find((p) => p.key === d.key);
          return (
            <Row key={d.key} style={{ justifyContent: 'space-between', paddingVertical: 6 }}>
              <Text style={{ color: colors.text, fontWeight: '700' }}>{d.label}</Text>
              <Text style={{ color: pr ? colors.gold : colors.textMuted, fontWeight: '800' }} testID={`pr-${d.key}`}>
                {pr ? formatDuration(pr.timeSec) : '—'}
              </Text>
            </Row>
          );
        })}
      </Card>
      <ConfirmButton
        title="Reset all data"
        confirmTitle="Erase everything"
        message="This permanently deletes your profile, plan and every run on this device."
        testID="profile-reset"
        onConfirm={() => {
          reset();
          router.replace('/onboarding');
        }}
      />
    </Screen>
  );
}
