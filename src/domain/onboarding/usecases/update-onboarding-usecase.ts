import { InternalServerError } from "@/core/errors/internal-server-error";
import { env } from "@/infra/config/env";
import type { OnboardingRepository } from "@/infra/repositories/onboarding-repository";
import type { SQSService } from "@/infra/services/sqs-service";
import type { CategorizeExtractRepository } from "@/infra/repositories/categorize-extract-repository";
import type { Onboarding } from "../types/onboarding";
import { OnboardingNotFoundError } from "../errors/onboarding-not-found-error";

export class UpdateOnboardingUsecase {
	constructor(
		private onboardingRepository: OnboardingRepository,
	) { }

	async execute(input: Input) {
		try {
			const { onboardingId, ...data } = input;
			const onboarding = await this.onboardingRepository.findById(onboardingId);
			if (!onboarding) throw new OnboardingNotFoundError();
			const result = await this.onboardingRepository.update(onboardingId, data);
			return result;
		} catch (error) {
			console.error("Error saving onboarding:", error);
			throw new InternalServerError();
		}
	}
}

type Input = Partial<Onboarding> & {
	onboardingId: string;
};
