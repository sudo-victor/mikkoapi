import type { Request, RequestHandler, Response } from "express";
import { z } from "zod";

import { InternalServerError } from "@/core/errors/internal-server-error";
import { OnboardingNotFoundError } from "@/domain/onboarding/errors/onboarding-not-found-error";
import { GetOnboardingUsecase } from "@/domain/onboarding/usecases/get-onboarding-usecase";
import { OnboardingRepository } from "@/infra/repositories/onboarding-repository";
import { UserRepository } from "@/infra/repositories/user-repository";

const schema = z.object({
	email: z.string().email("Invalid email format"),
});

const usecase = new GetOnboardingUsecase(
	new OnboardingRepository(),
	new UserRepository(),
);

export const getOnboardingController: RequestHandler = async (
	req: Request,
	res: Response,
) => {
	try {
		const { query } = req;

		const queryParsed = schema.safeParse(query);

		if (!queryParsed.success) {
			res.status(400).json({
				errors: queryParsed.error.errors.map((error) => ({
					field: error.path[0],
					message: error.message,
				})),
			});
			return;
		}

		const { email } = queryParsed.data;
		const result = await usecase.execute({ userEmail: email });

		res.status(200).json({ data: result });
		return;
	} catch (error) {
		if (error instanceof OnboardingNotFoundError) {
			res.status(404).json({
				name: error.name,
				message: error.message,
			});
			return;
		}

		const internalError = new InternalServerError();
		res.status(500).json({
			name: internalError.name,
			message: internalError.message,
		});
		return;
	}
};
