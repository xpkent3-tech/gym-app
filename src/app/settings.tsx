import { useRouter } from 'expo-router';
import { Pressable, Text } from 'react-native';

import { ConfirmButton } from '@/components/ConfirmButton';
import { Body, Card, Chip, H1, Label, Row, Screen } from '@/components/ui';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function Settings() {
  const router = useRouter();
  const { reset, prefs, setPrefs } = useStore();
  return (
    <Screen testID="settings-screen">
      <Pressable onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} hitSlop={12} testID="settings-back">
        <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>‹ Back</Text>
      </Pressable>
      <H1>Settings</H1>
      <Card testID="settings-body-style">
        <Label>Body style</Label>
        <Body>How muscle maps look across the app.</Body>
        <Row style={{ gap: 8 }}>
          <Chip
            label="Realistic muscle"
            selected={prefs.bodyStyle === 'realistic'}
            onPress={() => setPrefs({ bodyStyle: 'realistic' })}
            testID="style-realistic"
          />
          <Chip label="Classic" selected={prefs.bodyStyle === 'classic'} onPress={() => setPrefs({ bodyStyle: 'classic' })} testID="style-classic" />
        </Row>
      </Card>
      <Card onPress={() => router.push('/body-comp')} testID="settings-health">
        <Label>Integrations</Label>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>❤️ Apple Health & body composition ›</Text>
      </Card>
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
