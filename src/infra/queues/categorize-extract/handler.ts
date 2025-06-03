import type { SQSEvent, SQSHandler } from "aws-lambda";

import { CategorizeExtractUsecase } from "@/domain/onboarding/usecases/categorize-extract-usecase";
import { OnboardingRepository } from "@/infra/repositories/onboarding-repository";
import { TransactionRepository } from "@/infra/repositories/transaction-repository";
import { CategorizeExtractRepository } from "@/infra/repositories/categorize-extract-repository";
import { S3Service } from "@/infra/services/s3-service";
import { SQSService } from "@/infra/services/sqs-service";
import { env } from "@/infra/config/env";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5 * 60 * 1000; // 5 minutes

interface ExtractMessage {
	categorizeExtractId: string;
	onboardingId: string;
}

const usecase = new CategorizeExtractUsecase(
	new OnboardingRepository(),
	new TransactionRepository(),
	new S3Service(),
);

const categorizeExtractRepository = new CategorizeExtractRepository();
const sqsService = new SQSService();

export const handler: SQSHandler = async (event: SQSEvent) => {
	for (const record of event.Records) {
		const message: ExtractMessage = JSON.parse(record.body);
		const { categorizeExtractId, onboardingId } = message;
		console.log(categorizeExtractId, onboardingId)
		try {
			const categorizeExtract = await categorizeExtractRepository.findById(categorizeExtractId);
			if (!categorizeExtract) {
				console.error(`CategorizeExtract not found: ${categorizeExtractId}`);
				continue;
			}

			if (categorizeExtract.status === 'PROCESSED') {
				console.info(`CategorizeExtract already processed: ${categorizeExtractId}`);
				continue;
			}

			await categorizeExtractRepository.update(categorizeExtractId, {
				status: 'PROCESSING',
			});

			await usecase.execute({ onboardingId });

			await categorizeExtractRepository.update(categorizeExtractId, {
				status: 'PROCESSED',
				lastProcessedAt: new Date().toISOString(),
			});

		} catch (error) {
			console.error("Error processing message", error);

			const categorizeExtract = await categorizeExtractRepository.findById(categorizeExtractId);
			if (!categorizeExtract) return;

			const newRetryCount = (categorizeExtract.retryCount || 0) + 1;

			if (newRetryCount >= MAX_RETRIES) {
				await categorizeExtractRepository.update(categorizeExtractId, {
					status: 'FAILED',
					retryCount: newRetryCount,
					error: error.message,
				});
				return;
			}

			await categorizeExtractRepository.update(categorizeExtractId, {
				status: 'PENDING',
				retryCount: newRetryCount,
			});

			await sqsService.sendMessage(env.CATEGORIZE_EXTRACT_QUEUE_URL, {
				categorizeExtractId,
				onboardingId,
			}, RETRY_DELAY_MS);
		}
	}
};
