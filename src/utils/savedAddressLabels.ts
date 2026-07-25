import type { SavedAddress, SavedAddressLabel } from '../types/savedAddress';

export const SAVED_ADDRESS_LABELS: Record<SavedAddressLabel, string> = {
  home: 'Casa',
  work: 'Trabajo',
  other: 'Otro',
};

export function savedAddressDisplayLabel(address: SavedAddress): string {
  if (address.label === 'other' && address.customLabel) {
    return address.customLabel;
  }
  return SAVED_ADDRESS_LABELS[address.label];
}
