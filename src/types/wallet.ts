export type WalletTransactionType =
  | 'paypal_topup'
  | 'trip_charge'
  | 'trip_payout'
  | 'withdrawal_adjustment'
  | 'platform_commission'
  | 'cancellation_fee'
  | 'cancellation_payout';

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: WalletTransactionType;
  amount: number;
  tripReferenceId: string | null;
  paypalReferenceId: string | null;
  createdAt: string;
}
