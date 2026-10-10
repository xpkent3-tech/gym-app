import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { ConfirmButton } from '@/components/ConfirmButton';
import { Body, Card, H1, Label, Screen } from '@/components/ui';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function Settings() {
  const router = useRouter();
  const { reset } = useStore();
  return (
    <Screen testID="settings-screen">
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} hitSlop={12} testID="settings-back">
        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>‹ Back</Text>
      </Pressable>
      <H1>Settings</H1>
      <Card>
        <Label>Data</Label>
        <Body>Everything is stored on this device.</Body>
        <ConfirmButton
          title="Reset all data"
          confirmTitle="Erase everything"
          message="This permanently deletes your profile, plans and every workout on this device."
          testID="settings-reset"
          onConfirm={() => {
            reset();
            router.replace('/onboarding');
          }}
        />
      </Card>
    </Screen>
  );
}
