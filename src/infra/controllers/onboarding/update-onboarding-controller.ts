import type { Request, RequestHandler, Response } from "express";
import { z } from "zod";

import { InternalServerError } from "@/core/errors/internal-server-error";
import { UpdateOnboardingUsecase } from "@/domain/onboarding/usecases/update-onboarding-usecase";
import { OnboardingRepository } from "@/infra/repositories/onboarding-repository";

const schema = z.object({
	details: z.string().optional(),
	goalAmount: z.coerce
		.number()
		.min(1, "Amount must be greater than zero")
		.optional(),
	goalCategory: z.string().optional(),
	months: z.coerce
		.number()
		.min(1, "Number of months must be greater than zero")
		.optional(),
	income: z.number().optional(),
	savings: z.number().optional(),
	investments: z.number().optional(),
});

const usecase = new UpdateOnboardingUsecase(
	new OnboardingRepository(),
);

export const updateOnboardingController: RequestHandler = async (
	req: Request,
	res: Response,
) => {
	try {
		const { body, params } = req;
		const dataParsed = schema.safeParse(body);
		if (!dataParsed.success) {
			res.status(400).json({
				errors: dataParsed.error.errors.map((error) => ({
					field: error.path[0],
					message: error.message,
				})),
			});
			return;
		}
		const validatedData = dataParsed.data;
		const result = await usecase.execute({
			...validatedData,
			onboardingId: params.onboardingId,
		});
		res.status(200).json({ data: result });
		return;
	} catch (error) {
		if (error instanceof InternalServerError) {
			res.status(500).json({
				name: error.name,
				message: error.message,
			});
			return;
		}
	}
};
