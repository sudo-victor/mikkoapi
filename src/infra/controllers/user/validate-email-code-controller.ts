import type { Request, RequestHandler, Response } from "express";
import { z } from "zod";

import { UserRepository } from "@/infra/repositories/user-repository";
import { ValidationCodeRepository } from "@/infra/repositories/validation-code-repository";
import { SecretService } from "@/infra/services/secret-service";
import { TokenService } from "@/infra/services/token-service";

import { InvalidValidationCodeError } from "@/domain/user/errors/invalid-validation-code-error";
import { UserNotFoundError } from "@/domain/user/errors/user-not-found-error";
import { ValidateEmailCodeUsecase } from "@/domain/user/usecases/validate-email-code-usecase";

const schema = z.object({
	email: z.string().email("Invalid email format"),
	code: z.coerce
		.string()
		.min(6, "Code must be 6 digits")
		.max(6, "Code must be 6 digits")
		.regex(/^\d+$/, "Code must contain only numbers")
		.transform((val) => val.trim()),
});

const usecase = new ValidateEmailCodeUsecase(
	new ValidationCodeRepository(),
	new UserRepository(),
	new SecretService(),
	new TokenService(),
);

export const validateEmailCodeController: RequestHandler = async (
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
		const result = await usecase.execute(validatedData);
		res.status(200).json({ data: result });
		return;
	} catch (error) {
		if (error instanceof UserNotFoundError) {
			res.status(404).json({
				name: error.name,
				message: error.message,
			});
			return;
		}
		if (error instanceof InvalidValidationCodeError) {
			res.status(403).json({
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
