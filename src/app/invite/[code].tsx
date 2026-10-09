import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Avatar } from '@/components/Avatar';
import { useToast } from '@/components/Toast';
import { Body, Button, Card, H1, Label, Row, Screen, Stat } from '@/components/ui';
import { runnerByCode, runnerTopPct } from '@/lib/community';
import { formatDuration } from '@/lib/pace';
import { tierFor } from '@/lib/rank';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function Invite() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const router = useRouter();
  const toast = useToast();
  const { profile, friends, addFriend, setPendingInvite } = useStore();
  const inviter = code ? runnerByCode(code) : undefined;

  if (!inviter) {
    return (
      <Screen testID="invite-screen">
        <View style={{ marginTop: 40, gap: 8 }}>
          <Text style={{ fontSize: 44 }}>🤔</Text>
          <H1 testID="invite-invalid">This invite isn't valid</H1>
          <Body>The code “{code}” doesn't match any runner. Ask your friend to send it again.</Body>
        </View>
        <Button title={profile ? 'Go home' : 'Get started'} onPress={() => router.replace(profile ? '/' : '/onboarding')} testID="invite-home" />
      </Screen>
    );
  }

  const first = inviter.name.split(' ')[0];
  const pct = runnerTopPct(inviter);
  const alreadyFriends = friends.includes(inviter.id);

  const accept = () => {
    if (profile) {
      addFriend(inviter.id);
      toast(`You and ${first} are now friends 🤝`);
      router.replace('/friends');
    } else {
      setPendingInvite(inviter.id);
      router.replace('/onboarding');
    }
  };

  return (
    <Screen testID="invite-screen">
      <View style={{ alignItems: 'center', gap: 10, marginTop: 32 }}>
        <Avatar name={inviter.name} color={inviter.color} size={88} />
        <Label style={{ color: colors.primary }}>You're invited</Label>
        <H1 style={{ textAlign: 'center' }} testID="invite-title">
          {first} wants to train with you
        </H1>
        <Body style={{ textAlign: 'center' }}>Follow each other's marathon training, trade kudos, and see who climbs the rankings faster.</Body>
      </View>
      <Card style={{ borderColor: tierFor(pct).color + '66' }}>
        <Row>
          <Stat label={`${first}'s rank`} value={`Top ${pct}%`} />
          <Stat label="Marathon" value={formatDuration(inviter.marathonSec)} />
          <Stat label="Weekly" value={`${inviter.weeklyKm} km`} />
        </Row>
      </Card>
      {alreadyFriends ? (
        <Button title={`You're already friends · Open`} onPress={() => router.replace('/friends')} testID="invite-open" />
      ) : (
        <Button title={profile ? `Accept & add ${first}` : `Join ${first} on Stride`} onPress={accept} testID="invite-accept" />
      )}
      <Button title="Not now" variant="ghost" onPress={() => router.replace(profile ? '/' : '/onboarding')} testID="invite-decline" />
    </Screen>
  );
}
