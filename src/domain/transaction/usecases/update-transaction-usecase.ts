import { InternalServerError } from "@/core/errors/internal-server-error";
import type { TransactionRepository } from "@/infra/repositories/transaction-repository";
import { WalletRepository } from "@/infra/repositories/wallet-repository";
import { WalletNotFoundError } from "../errors/wallet-not-found-error";
import { TransactionType } from "../types/transaction";

export class UpdateTransactionUsecase {
  constructor(
    private transactionRepository: TransactionRepository,
    private walletRepository: WalletRepository
  ) { }

  async execute(input: Input) {
    try {
      const { category, value, type, userId } = input;
      const wallet = await this.walletRepository.findByUserId(userId)
      if (!wallet) throw new WalletNotFoundError()
      const newBalance = type === 'DEPOSIT' ? wallet.balance + value : wallet.balance - value
      const result = await this.transactionRepository.create({
        category,
        value,
        type,
        userId,
        balanceBefore: wallet.balance,
        balanceAfter: newBalance,
      });
      await this.walletRepository.updateBalance(userId, newBalance)
      return result;
    } catch (error) {
      console.error("Error saving transactions:", error);
      throw new InternalServerError();
    }
  }
}

type Input = {
  category: string;
  value: number;
  type: TransactionType;
  userId: number;
};
