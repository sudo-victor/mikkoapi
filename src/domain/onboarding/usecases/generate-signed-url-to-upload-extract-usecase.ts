import { InternalServerError } from "@/core/errors/internal-server-error";

import { env } from "@/infra/config/env";
import type { OnboardingRepository } from "@/infra/repositories/onboarding-repository";
import type { S3Service } from "@/infra/services/s3-service";
import type { SQSService } from "@/infra/services/sqs-service";
import type { CategorizeExtractRepository } from "@/infra/repositories/categorize-extract-repository";

import { OnboardingNotFoundError } from "../errors/onboarding-not-found-error";

export class GenerateSignedUrlToUploadExtractUsecase {
	constructor(
		private onboardingRepository: OnboardingRepository,
		private categorizeExtractRepository: CategorizeExtractRepository,
		private SQSService: SQSService,
		private s3Service: S3Service,
	) {}

	async execute(input: Input) {
		try {
			const { onboardingId, fileName, fileType } = input;
			const onboarding = await this.onboardingRepository.findById(onboardingId);
			if (!onboarding) throw new OnboardingNotFoundError();
			await this.onboardingRepository.update(onboarding.id, {
				extractFilename: fileName,
			});
			const categorizeExtract = await this.categorizeExtractRepository.create(onboardingId);
			const teste = await this.SQSService.sendMessage(
				env.CATEGORIZE_EXTRACT_QUEUE_URL,
				{ 
					categorizeExtractId: categorizeExtract.id,
					onboardingId 
				}
			)
			console.log(teste)
			const result = await this.s3Service.generateUploadUrl(fileName, fileType);
			return result;
		} catch (error) {
			console.error("Error generating :", error);
			throw new InternalServerError();
		}
	}
}

type Input = {
	onboardingId: number;
	fileName: string;
	fileType: string;
};
