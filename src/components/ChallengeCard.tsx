import { Text } from 'react-native';

import { Body, Card, Label, ProgressBar, Row } from '@/components/ui';
import { formatKm } from '@/lib/pace';
import { XP, type Challenge } from '@/lib/progression';
import { colors } from '@/lib/theme';

export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const { targetKm, doneKm, remainingKm, complete } = challenge;
  return (
    <Card testID="challenge-card" style={complete ? { borderColor: colors.success } : undefined}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Label>Weekly challenge</Label>
        <Text style={{ color: complete ? colors.success : colors.warning, fontWeight: '800', fontSize: 12 }}>
          {complete ? 'COMPLETE ✓' : `+${XP.challenge} XP`}
        </Text>
      </Row>
      <Text style={{ color: colors.text, fontSize: 18, fontWeight: '800' }}>Run {targetKm} km this week</Text>
      <ProgressBar value={doneKm / targetKm} color={complete ? colors.success : colors.warning} />
      <Body testID="challenge-progress">
        {formatKm(doneKm)} / {targetKm} km · {complete ? 'Challenge complete! 🎉' : `${formatKm(remainingKm)} km to go`}
      </Body>
    </Card>
  );
}
