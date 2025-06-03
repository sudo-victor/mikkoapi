import { InternalServerError } from "@/core/errors/internal-server-error";
import type { TransactionRepository } from "@/infra/repositories/transaction-repository";
import type { Transaction } from "../types/transaction";

export class UpdateManyTransactionsUsecase {
	constructor(
		private transactionRepository: TransactionRepository,
	) { }

	async execute(input: Input) {
		try {
			const { transactions } = input;
			console.log(transactions)
			const result = await this.transactionRepository.updateBatch(transactions);
			return result;
		} catch (error) {
			console.error("Error saving transactions:", error);
			throw new InternalServerError();
		}
	}
}

type Input = {
	transactions: Transaction[];
};
