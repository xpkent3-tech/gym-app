import { useStore } from './store';
import type { Sex } from './types';

export function useBodySex(): Sex {
  return useStore().profile?.sex ?? 'male';
}
