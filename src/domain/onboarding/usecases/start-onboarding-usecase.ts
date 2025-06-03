import { InternalServerError } from "@/core/errors/internal-server-error";

import type { OnboardingRepository } from "@/infra/repositories/onboarding-repository";
import type { UserRepository } from "@/infra/repositories/user-repository";

export class StartOnboardingUsecase {
	constructor(
		private onboardingRepository: OnboardingRepository,
		private userRepository: UserRepository,
	) {}

	async execute(input: Input) {
		try {
			const { email, details, goalAmount, months, goalCategory } = input;
			let user = await this.userRepository.findByEmail(email)
			if (!user) {
				user = await this.userRepository.create({ email });
			}
			const payload = {
				userId: user.id,
				userEmail: user.email,
				details,
				goalAmount,
				months,
				goalCategory,
			};
			const alreadyExists = await this.onboardingRepository.findById(
				user.id,
			);
			if (alreadyExists) {
				Reflect.deleteProperty(payload, "userId");
				const result = await this.onboardingRepository.update(
					alreadyExists.id,
					payload,
				);
				return result;
			}
			const result = await this.onboardingRepository.create({
				...payload,
			});
			return result;
		} catch (error) {
			console.error("Error saving onboarding:", error);
			throw new InternalServerError();
		}
	}
}

type Input = {
	email: string;
	details: string;
	goalAmount: number;
	months: number;
	goalCategory: string;
};
