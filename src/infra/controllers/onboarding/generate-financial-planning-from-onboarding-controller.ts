import type { Request, RequestHandler, Response } from "express";

import { InternalServerError } from "@/core/errors/internal-server-error";

import { GenerateFinancialPlanningUsecase } from "@/domain/financial-planning/usecases/generate-financial-planning-usecase";

import { TransactionRepository } from "@/infra/repositories/transaction-repository";
import { FinancialPlanningRepository } from "@/infra/repositories/financial-planning-repository";
import { OnboardingRepository } from "@/infra/repositories/onboarding-repository";
import { OpenAIGPTService } from "@/infra/services/openai-service";

const usecase = new GenerateFinancialPlanningUsecase(
	new FinancialPlanningRepository(),
	new OnboardingRepository(),
	new TransactionRepository(),
	new OpenAIGPTService()
);

export const generateFinancialPlanningFromOnboardingController: RequestHandler = async (
	req: Request,
	res: Response,
) => {
	try {
		const { params } = req;
		const result = await usecase.execute({
			onboardingId: Number(params.onboardingId)
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
