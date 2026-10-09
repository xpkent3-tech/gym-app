import { useMemo } from 'react';

import { useToast } from '@/components/Toast';

import { inviteMessage, inviteUrl, shareInvite } from './invite';
import { rankRunner } from './rank';
import { useStore } from './store';

/** Returns a callback that shares the user's invite and reports the outcome in a toast. */
export function useInvite() {
  const { profile, runs, inviteSent } = useStore();
  const toast = useToast();
  const topPct = useMemo(() => (profile ? (rankRunner(profile, runs)?.topPct ?? null) : null), [profile, runs]);

  return async () => {
    if (!profile?.friendCode) return;
    const code = profile.friendCode;
    const outcome = await shareInvite(inviteMessage(profile.name, code, topPct), inviteUrl(code));
    if (outcome === 'dismissed') return;
    inviteSent();
    toast(outcome === 'copied' ? `Invite link copied · code ${code}` : 'Invite sent 🎉');
  };
}
