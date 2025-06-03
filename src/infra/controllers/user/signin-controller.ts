import type { Request, RequestHandler, Response } from "express";
import { z } from "zod";

import { UserRepository } from "@/infra/repositories/user-repository";
import { ValidationCodeRepository } from "@/infra/repositories/validation-code-repository";
import { SecretService } from "@/infra/services/secret-service";
import { SNSService } from "@/infra/services/sns-service";

import { UserNotFoundError } from "@/domain/user/errors/user-not-found-error";
import { SigninUsecase } from "@/domain/user/usecases/signin-usecase";

const schema = z.object({
	email: z.string().email("Invalid email format"),
});

const usecase = new SigninUsecase(
	new UserRepository(),
	new ValidationCodeRepository(),
	new SecretService(),
	new SNSService(),
);

export const signinController: RequestHandler = async (
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
		return;
	} catch (error) {
		if (error instanceof UserNotFoundError) {
			res.status(404).json({
				name: error.name,
				message: error.message,
			});
			return;
		}
		res.status(500).json({
			name: error.name,
			message: error.message,
		});
		return;
	}
};
