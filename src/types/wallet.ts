export type WalletTransactionType =
  | 'paypal_topup'
  | 'trip_charge'
  | 'trip_payout'
  | 'withdrawal_adjustment';

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: WalletTransactionType;
  amount: number;
  tripReferenceId: string | null;
  paypalReferenceId: string | null;
  createdAt: string;
}
