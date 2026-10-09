import { Redirect } from 'expo-router';

/** Placeholder for the centre "+" tab; pressing it opens the log modal instead. */
export default function NewRun() {
  return <Redirect href="/log" />;
}
