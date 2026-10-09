import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import { Platform, Share } from 'react-native';

export function inviteUrl(code: string): string {
  return Linking.createURL(`/invite/${code}`);
}

export function inviteMessage(name: string, code: string, topPct: number | null): string {
  const brag = topPct ? ` I'm in the top ${topPct}% of marathoners so far.` : '';
  return `${name} invited you to train for a marathon together on Stride.${brag} Add me with code ${code} or tap: ${inviteUrl(code)}`;
}

export type ShareOutcome = 'shared' | 'copied' | 'dismissed';

/** System share sheet when available, otherwise copy the link to the clipboard. */
export async function shareInvite(message: string, url: string): Promise<ShareOutcome> {
  try {
    if (Platform.OS !== 'web') {
      const res = await Share.share({ message });
      return res.action === Share.dismissedAction ? 'dismissed' : 'shared';
    }
    const nav = globalThis.navigator as Navigator | undefined;
    if (nav?.share && nav.maxTouchPoints > 0) {
      await nav.share({ title: 'Join me on Stride', text: message, url });
      return 'shared';
    }
  } catch {
    // Fall through to clipboard (e.g. share cancelled or unsupported).
  }
  try {
    await Clipboard.setStringAsync(url);
  } catch {
    // Clipboard may be unavailable in insecure contexts; the toast still shows the code.
  }
  return 'copied';
}
