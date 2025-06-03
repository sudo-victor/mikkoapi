import type { Request, Response } from "express";
import { z } from "zod";

import { StartOnboardingUsecase } from "@/domain/onboarding/usecases/start-onboarding-usecase";

import { OnboardingRepository } from "@/infra/repositories/onboarding-repository";
import { UserRepository } from "@/infra/repositories/user-repository";

const schema = z.object({
	email: z.string().email("Invalid email format"),
	details: z.string().min(1, "details field is required"),
	goalAmount: z.coerce.number().min(1, "Amount must be greater than zero"),
	goalCategory: z.string().min(1, "goalCategory field is required"),
	months: z.coerce
		.number()
		.min(1, "Number of months must be greater than zero"),
});

const usecase = new StartOnboardingUsecase(
	new OnboardingRepository(),
	new UserRepository(),
);

export const startOnboardingController = async (
	req: Request,
	res: Response,
) => {
	try {
		const { body } = req;

		const bodyParsed = schema.safeParse(body);

		if (!bodyParsed.success) {
			res.status(400).json({
				errors: bodyParsed.error.errors.map((error) => ({
					field: error.path[0],
					message: error.message,
				})),
			});
			return;
		}

		const validatedData = bodyParsed.data;
		const result = await usecase.execute(validatedData);

		res.status(201).json({ data: result });
		return;
	} catch (error) {
		res.status(500).json({
			name: error.name,
			message: error.message,
		});
		return;
	}
};
