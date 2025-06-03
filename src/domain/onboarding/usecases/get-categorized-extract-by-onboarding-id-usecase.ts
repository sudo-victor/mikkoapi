import { InternalServerError } from "@/core/errors/internal-server-error";

import type { OnboardingRepository } from "@/infra/repositories/onboarding-repository";
import type { CategorizeExtractRepository } from "@/infra/repositories/categorize-extract-repository";

import { OnboardingNotFoundError } from "../errors/onboarding-not-found-error";
import { CategorizeExtractNotFoundError } from "../errors/categorize-extract-not-found-error";

export class GetCategorizedExtractByOnboardingIdUsecase {
	constructor(
		private categorizeExtractRepository: CategorizeExtractRepository,
		private onboardingRepository: OnboardingRepository,
	) {}

	async execute(input: Input) {
		try {
			const { onboardingId } = input;
			const onboarding = await this.onboardingRepository.findById(onboardingId);
			if (!onboarding) throw new OnboardingNotFoundError();
			const categorizeExtract = await this.categorizeExtractRepository.findByOnboardingId(onboardingId);
			if (!categorizeExtract) throw new CategorizeExtractNotFoundError()
			return categorizeExtract;
		} catch (error) {
			console.error("Error getting categorizeExtract:", error);
			throw new InternalServerError();
		}
	}
}

type Input = {
	onboardingId: string;
};
