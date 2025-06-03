import { InternalServerError } from "@/core/errors/internal-server-error";

import { openai } from "@/infra/libs/openai";
import type { OnboardingRepository } from "@/infra/repositories/onboarding-repository";
import type { TransactionRepository } from "@/infra/repositories/transaction-repository";
import type { CategorizeExtractRepository } from "@/infra/repositories/categorize-extract-repository";
import type { S3Service } from "@/infra/services/s3-service";

import { ExtractFilenameIsMissingError } from "../errors/extract-filename-is-missing-error";
import { OnboardingNotFoundError } from "../errors/onboarding-not-found-error";
import { CategorizeExtractPromptService } from "../services/categorize-extract-prompt-service";
import { CategorizeExtractNotFoundError } from "../errors/categorize-extract-not-found-error";

export class CategorizeExtractUsecase {
	constructor(
		private onboardingRepository: OnboardingRepository,
		private transactionRepository: TransactionRepository,
		private categorizeExtractRepository: CategorizeExtractRepository,
		private s3Service: S3Service,
	) {}

	async execute(input: Input) {
		try {
			const { onboardingId } = input;
			const onboarding = await this.onboardingRepository.findById(onboardingId);
			if (!onboarding) throw new OnboardingNotFoundError();
			if (!onboarding.extractFilename) throw new ExtractFilenameIsMissingError();
			const fileContent = await this.s3Service.getFileContent(
				onboarding.extractFilename,
			);
			const prompt = CategorizeExtractPromptService.make();
			const completion = await openai.chat.completions.create({
				messages: [
					{
						role: "system",
						content: prompt,
					},
					{
						role: "user",
						content: fileContent,
					},
				],
				model: "gpt-4o",
				response_format: { type: "json_object" },
			});
			const response = completion.choices[0].message.content;
			if (!response) throw new InternalServerError();
			const categorizedTransactions = JSON.parse(response);
			const transactions = await this.transactionRepository.createBatch(
				categorizedTransactions.transactions.map((transaction) => ({
					...transaction,
					userId: onboarding.userId,
				})),
			);
			const categorizeExtract = await this.categorizeExtractRepository.findByOnboardingId(onboardingId)
			if (!categorizeExtract) throw new CategorizeExtractNotFoundError()
			await this.categorizeExtractRepository.update(
				categorizeExtract.id,
				{
					status: 'PROCESSED'
				}
			)
			return transactions;
		} catch (error) {
			console.error("Error saving transactions:", error);
			throw new InternalServerError();
		}
	}
}

type Input = {
	onboardingId: number;
};
