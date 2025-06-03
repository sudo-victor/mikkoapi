import moment from "moment";

import { InternalServerError } from "@/core/errors/internal-server-error";

import type { UserRepository } from "@/infra/repositories/user-repository";
import type { ValidationCodeRepository } from "@/infra/repositories/validation-code-repository";
import type { SecretService } from "@/infra/services/secret-service";
import type { SNSService } from "@/infra/services/sns-service";
import { WalletRepository } from "@/infra/repositories/wallet-repository";

import { GenerateVerifyCodeService } from "../services/generate-verify-code-service";

export class RegisterUserUsecase {
	constructor(
		private userRepository: UserRepository,
		private walletRepository: WalletRepository,
		private validationCodeRepository: ValidationCodeRepository,
		private secretService: SecretService,
		private snsService: SNSService,
	) {}

	async execute(input: Input) {
		try {
			const { email, name, phoneNumber } = input;
			const alreadyExists = await this.userRepository.findByEmail(email);
			let user = alreadyExists
			if (!alreadyExists) {
				user = (await this.userRepository.create({
					email,
					name,
					phoneNumber
				}));
				await this.walletRepository.create({
					balance: 0,
					userId: user.id
				})
			}
			const code = GenerateVerifyCodeService.make();
			const hashedCode = this.secretService.encrypt(code);
			const validationCode = await this.validationCodeRepository.create({
				status: "PENDING",
				userId: user.id,
				hashedCode,
				expiredAt: moment().add(10, "minutes").toDate().toISOString(),
			});
			await this.snsService.sendEmail(
				email,
				"Verificação do E-mail",
				`código: ${code}`,
			);
			return;
		} catch (error) {
			console.error("Error saving user:", error);
			throw new InternalServerError();
		}
	}
}

type Input = {
	name: string
	email: string
	phoneNumber: string
};
