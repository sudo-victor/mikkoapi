import { UserNotFoundError } from "@/domain/user/errors/user-not-found-error";
import type { UserModel } from "@/domain/user/types/user";
import type { OnboardingRepository } from "@/infra/repositories/onboarding-repository";
import type { UserRepository } from "@/infra/repositories/user-repository";
import { OnboardingNotFoundError } from "../errors/onboarding-not-found-error";

export class GetOnboardingUsecase {
	constructor(
		private onboardingRepository: OnboardingRepository,
		private userRepository: UserRepository,
	) {}

	async execute(input: Input) {
		const { userEmail } = input;
		const user = (await this.userRepository.findByEmail(userEmail)) as
			| UserModel
			| undefined;
		if (!user) throw new UserNotFoundError();
		const onboarding = await this.onboardingRepository.findByUserId(
			user.userId,
		);
		if (!onboarding) throw new OnboardingNotFoundError();
		return onboarding;
	}
}

type Input = {
	userEmail: string;
};
