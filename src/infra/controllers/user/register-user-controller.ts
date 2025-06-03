import type { Request, RequestHandler, Response } from "express";
import { z } from "zod";

import { UserRepository } from "@/infra/repositories/user-repository";
import { ValidationCodeRepository } from "@/infra/repositories/validation-code-repository";
import { SecretService } from "@/infra/services/secret-service";
import { SNSService } from "@/infra/services/sns-service";

import { UserAlreadyExistsError } from "@/domain/user/errors/user-already-exists-error";
import { RegisterUserUsecase } from "@/domain/user/usecases/register-user-usecase";
import { WalletRepository } from "@/infra/repositories/wallet-repository";

const schema = z.object({
	email: z.string().email("Invalid email format"),
	name: z.string().min(1, "name field is required"),
	phoneNumber: z.string(),
});

const usecase = new RegisterUserUsecase(
	new UserRepository(),
	new WalletRepository(),
	new ValidationCodeRepository(),
	new SecretService(),
	new SNSService(),
);

export const registerUserController: RequestHandler = async (
	req: Request,
	res: Response,
) => {
	try {
		const { body } = req;
		const bodyParsed = schema.safeParse(body);
		if (!bodyParsed.success) {
			res.status(400).json({
				name: "InvalidBody",
				errors: bodyParsed.error.errors.map((error) => ({
					field: error.path[0],
					message: error.message,
				})),
			});
			return;
		}
		const validatedData = bodyParsed.data;
		await usecase.execute(validatedData);
		res.status(201).json();
	} catch (error) {
		if (error instanceof UserAlreadyExistsError) {
			res.status(409).json({
				name: error.name,
				message: error.message,
			});
			return;
		}
		res.status(500).json({
			name: error.name,
			message: error.message,
		});
	}
};
