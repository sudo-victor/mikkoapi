import { InternalServerError } from "@/core/errors/internal-server-error";

import type { UserRepository } from "@/infra/repositories/user-repository";
import { UserNotFoundError } from "../errors/user-not-found-error";

export class GetMeByPhoneNumberUsecase {
	constructor(
		private userRepository: UserRepository,
	) {}

	async execute(input: Input) {
		try {
			const { phoneNumber } = input;
			const user = await this.userRepository.findByPhoneNumber(phoneNumber)
			if (!user) throw new UserNotFoundError()
			return user;
		} catch (error) {
			console.error("Error fetching user:", error);
			throw new InternalServerError();
		}
	}
}

type Input = { phoneNumber: string };
