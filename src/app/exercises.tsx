import { useRouter } from 'expo-router';

import { ExercisePicker } from '@/components/ExercisePicker';
import { Screen } from '@/components/ui';

export default function ExerciseLibrary() {
  const router = useRouter();
  return (
    <Screen testID="exercises-screen">
      <ExercisePicker title="Exercises" closeLabel="Back" onClose={() => (router.canGoBack() ? router.back() : router.replace('/'))} />
    </Screen>
  );
}
