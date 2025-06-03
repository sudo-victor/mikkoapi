export enum TransactionType {
  WITHDRAW = 'WITHDRAW',
  DEPOSIT = 'DEPOSIT',
  CORRECTION = 'CORRECTION',
  REVERSAL = 'REVERSAL'
}

export type Transaction = {
  title: string;
  userId: number;
  createdAt: Date | string;
  value: number;
  category: string;
  type: TransactionType;
  previousTransactionId?: number;
  isSuperseded?: boolean;
	balanceBefore: number;
  balanceAfter: number; 
};