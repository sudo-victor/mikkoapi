import { z } from "zod";
import type { Request, RequestHandler, Response } from "express";

import { InternalServerError } from "@/core/errors/internal-server-error";

import { GenerateFinancialPlanningUsecase } from "@/domain/financial-planning/usecases/generate-financial-planning-usecase";

import { TransactionRepository } from "@/infra/repositories/transaction-repository";
import { FinancialPlanningRepository } from "@/infra/repositories/financial-planning-repository";
import { OnboardingRepository } from "@/infra/repositories/onboarding-repository";
import { OpenAIGPTService } from "@/infra/services/openai-service";

const schema = z.object({
	onboardingId: z.string(),
});

const usecase = new GenerateFinancialPlanningUsecase(
	new FinancialPlanningRepository(),
	new OnboardingRepository(),
	new TransactionRepository(),
	new OpenAIGPTService()
);

export const generateFinancialPlanningController: RequestHandler = async (
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
		const result = await usecase.execute({
			onboardingId: Number(bodyParsed.data.onboardingId)
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
