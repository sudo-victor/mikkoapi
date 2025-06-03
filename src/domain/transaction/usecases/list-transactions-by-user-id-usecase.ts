import { InternalServerError } from "@/core/errors/internal-server-error";
import type { TransactionRepository } from "@/infra/repositories/transaction-repository";

export class ListTransactionByUserIdUsecase {
	constructor(
		private transactionRepository: TransactionRepository,
	) { }

	async execute(input: Input) {
		try {
			const { userId } = input;
			const transactions = await this.transactionRepository.findByUserId(userId);
			return transactions;
		} catch (error) {
			console.error("Error saving onboarding:", error);
			throw new InternalServerError();
		}
	}
}

type Input = {
	userId: string;
};
