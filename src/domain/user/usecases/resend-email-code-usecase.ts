import moment from "moment";

import { InternalServerError } from "@/core/errors/internal-server-error";

import type { UserRepository } from "@/infra/repositories/user-repository";
import type { ValidationCodeRepository } from "@/infra/repositories/validation-code-repository";
import type { SecretService } from "@/infra/services/secret-service";
import type { SNSService } from "@/infra/services/sns-service";

import { UserNotFoundError } from "../errors/user-not-found-error";
import { GenerateVerifyCodeService } from "../services/generate-verify-code-service";

export class ResendEmailCodeUsecase {
	constructor(
		private userRepository: UserRepository,
		private validationCodeRepository: ValidationCodeRepository,
		private secretService: SecretService,
		private snsService: SNSService,
	) {}

	async execute(input: Input) {
		try {
			const { email } = input;
			const user = await this.userRepository.findByEmail(email);
			if (!user) throw new UserNotFoundError();
			const code = GenerateVerifyCodeService.make();
			const hashedCode = this.secretService.encrypt(code);
			await this.validationCodeRepository.create({
				status: "PENDING",
				userId: user.userId,
				hashedCode,
				expiredAt: moment().add(10, "minutes").toDate(),
			});
			await this.snsService.sendEmail(
				email,
				"Verificação do E-mail",
				`código: ${code}`,
			);
			return;
		} catch (error) {
			console.error("Error resend email code:", error);
			throw new InternalServerError();
		}
	}
}

type Input = {
	email: string;
};
