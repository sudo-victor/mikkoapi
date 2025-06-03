import moment from "moment";

import type { UserRepository } from "@/infra/repositories/user-repository";
import type { ValidationCodeRepository } from "@/infra/repositories/validation-code-repository";
import type { SecretService } from "@/infra/services/secret-service";
import type { TokenService } from "@/infra/services/token-service";

import { InvalidValidationCodeError } from "../errors/invalid-validation-code-error";
import { UserNotFoundError } from "../errors/user-not-found-error";

export class ValidateEmailCodeUsecase {
	constructor(
		private validationCodeRepository: ValidationCodeRepository,
		private userRepository: UserRepository,
		private secretService: SecretService,
		private tokenService: TokenService,
	) { }

	async execute(input: Input) {
		const { email, code } = input;
		const user = await this.userRepository.findByEmail(email);
		if (!user) throw new UserNotFoundError();
		const lastValidationCode = await this.validationCodeRepository
			.findLastCodeByUserId(user.id);
		if (!lastValidationCode) throw new InvalidValidationCodeError();
		if (moment().isAfter(lastValidationCode.expiredAt)) {
			await this.validationCodeRepository.updateStatus(
				lastValidationCode.id,
				"EXPIRED",
			);
			throw new InvalidValidationCodeError();
		}
		const isCodeValid = await this.secretService.compare(
			code,
			lastValidationCode.hashedCode,
		);
		if (!isCodeValid) throw new InvalidValidationCodeError();
		await this.validationCodeRepository.updateStatus(
			lastValidationCode.id,
			"VERIFIED",
		);
		const token = this.tokenService.generate({
			sub: String(user.id),
			email: user.email,
			name: user.name,
		});
		return { token };

	}
}

type Input = {
	email: string;
	code: string;
};
